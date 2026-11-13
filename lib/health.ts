import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/lovely-store";

/**
 * Lightweight Supabase health probe.
 *
 * The endpoint exists so an external scheduler (cron-job.org) can touch the
 * database on a regular cadence and keep a free Supabase project from being
 * marked inactive after seven days. Every call runs real queries, and the
 * counts double as a quick "is the content still there?" signal.
 */

const AUTH_PAGE_SIZE = 1000;
const AUTH_MAX_PAGES = 10;

export type HealthCounts = {
  totalUsers: number | null;
  registeredUsers: number | null;
  guestUsers: number | null;
  customPages: number | null;
  uploadedImages: number | null;
  activityRecords: number | null;
};

export type HealthReport = {
  status: "ok";
  checkedAt: string;
  latencyMs: number;
  database: {
    connected: true;
    usersTruncated: boolean;
    counts: HealthCounts;
  };
};

export class HealthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HealthConfigurationError";
  }
}

export class HealthCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HealthCheckError";
  }
}

function isMissingSchema(error: { code?: string } | null | undefined) {
  return error?.code === "42P01" || error?.code === "42703";
}

async function countRows(
  supabase: SupabaseClient,
  table: string,
): Promise<number | null> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    // Optional tables (for example an unapplied migration) should not make the
    // whole health check fail; report an unknown count instead.
    if (isMissingSchema(error)) return null;
    throw new HealthCheckError(
      `Could not count rows in ${table}: ${error.message}`,
    );
  }

  return count ?? 0;
}

async function countAuthUsers(supabase: SupabaseClient) {
  let total: number | null = null;
  let registered = 0;
  let guests = 0;
  let examined = 0;

  for (let page = 1; page <= AUTH_MAX_PAGES; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: AUTH_PAGE_SIZE,
    });

    if (error) {
      throw new HealthCheckError(
        `Could not list Supabase Auth users: ${error.message}`,
      );
    }

    if (total === null && "total" in data && typeof data.total === "number") {
      total = data.total;
    }

    examined += data.users.length;

    for (const user of data.users) {
      if (user.is_anonymous === true) guests += 1;
      else registered += 1;
    }

    if (data.users.length < AUTH_PAGE_SIZE) break;
    if (total !== null && examined >= total) break;
  }

  if (total === null) total = examined;

  // A very large user base is counted in full only up to the page cap. Report
  // the total we know, but leave the registered/guest split unknown rather
  // than return a partial number that looks exact.
  const truncated = examined < total;

  return {
    totalUsers: total,
    registeredUsers: truncated ? null : registered,
    guestUsers: truncated ? null : guests,
    truncated,
  };
}

export async function runHealthCheck(): Promise<HealthReport> {
  const startedAt = Date.now();

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new HealthConfigurationError(
      "Supabase is not configured. Add SUPABASE_SECRET_KEY on the server.",
    );
  }

  const [customPages, uploadedImages, activityRecords, auth] =
    await Promise.all([
      countRows(supabase, "lovely_pages"),
      countRows(supabase, "lovely_images"),
      countRows(supabase, "lovely_user_activity"),
      countAuthUsers(supabase),
    ]);

  return {
    status: "ok",
    checkedAt: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
    database: {
      connected: true,
      usersTruncated: auth.truncated,
      counts: {
        totalUsers: auth.totalUsers,
        registeredUsers: auth.registeredUsers,
        guestUsers: auth.guestUsers,
        customPages,
        uploadedImages,
        activityRecords,
      },
    },
  };
}
