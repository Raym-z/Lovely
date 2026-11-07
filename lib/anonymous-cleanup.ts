import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  CLEANUP_MAX_CANDIDATES,
  CLEANUP_PAGE_SIZE,
  CLEANUP_QUERY_CHUNK,
  assessAnonymousCleanupCandidate,
  getCleanupCutoff,
  type AnonymousCleanupOutcome,
  type AnonymousUserFacts,
} from "@/lib/anonymous-cleanup-rules";
import { getSupabaseAdminClient } from "@/lib/lovely-store";

export type CleanupErrorRecord = {
  userId: string | null;
  message: string;
};

export type CleanupDetail = {
  userId: string;
  outcome: AnonymousCleanupOutcome;
  lastActivityAt: string | null;
};

export type AnonymousCleanupReport = {
  executedAt: string;
  dryRun: boolean;
  examined: number;
  candidates: number;
  eligible: number;
  deleted: number;
  skippedOwnContent: number;
  skippedActive: number;
  skippedUnverified: number;
  skippedTransfer: number;
  registeredSkipped: number;
  truncated: boolean;
  errors: CleanupErrorRecord[];
  details: CleanupDetail[];
};

export class CleanupConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CleanupConfigurationError";
  }
}

type AuthCandidate = {
  id: string;
  createdAt: string | null;
  lastSignInAt: string | null;
};

type ContentFacts = {
  ownersOfPages: Set<string>;
  ownersOfImages: Set<string>;
};

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function isMissingSchema(error: { code?: string } | null | undefined) {
  return error?.code === "42P01" || error?.code === "42703";
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

async function listCandidates(
  supabase: SupabaseClient,
  now: Date,
  maxCandidates: number,
) {
  const cutoff = getCleanupCutoff(now).getTime();
  const candidates: AuthCandidate[] = [];
  let examined = 0;
  let registeredSkipped = 0;
  let recentlyActive = 0;
  let truncated = false;

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: CLEANUP_PAGE_SIZE,
    });

    if (error) {
      throw new CleanupConfigurationError(
        `Could not list Supabase Auth users: ${error.message}`,
      );
    }

    const users = (data?.users ?? []) as User[];
    if (users.length === 0) break;

    examined += users.length;

    for (const user of users) {
      if (user.is_anonymous !== true) {
        registeredSkipped += 1;
        continue;
      }

      const lastSignIn = Date.parse(user.last_sign_in_at ?? "");
      const createdAt = Date.parse(user.created_at ?? "");
      const newestKnownAuthTime = Math.max(
        Number.isFinite(lastSignIn) ? lastSignIn : -Infinity,
        Number.isFinite(createdAt) ? createdAt : -Infinity,
      );

      // Cheap early exit: a recent sign-in or creation is proof of activity.
      if (
        Number.isFinite(newestKnownAuthTime) &&
        newestKnownAuthTime > cutoff
      ) {
        recentlyActive += 1;
        continue;
      }

      candidates.push({
        id: user.id,
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      });

      if (candidates.length >= maxCandidates) {
        truncated = true;
        break;
      }
    }

    if (truncated) break;
    if (users.length < CLEANUP_PAGE_SIZE) break;
  }

  return {
    candidates,
    examined,
    registeredSkipped,
    recentlyActive,
    truncated,
  };
}

async function loadActivityMap(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, string | null>> {
  const activity = new Map<string, string | null>();

  for (const chunk of chunks(userIds, CLEANUP_QUERY_CHUNK)) {
    const { data, error } = await supabase
      .from("lovely_user_activity")
      .select("user_id, last_activity_at")
      .in("user_id", chunk);

    if (error) {
      if (isMissingSchema(error)) {
        throw new CleanupConfigurationError(
          "Activity tracking is not installed. Run supabase/migrations/20261108000000_anonymous_user_cleanup.sql in Supabase.",
        );
      }
      throw new CleanupConfigurationError(
        `Could not read activity timestamps: ${error.message}`,
      );
    }

    for (const row of (data ?? []) as Array<{
      user_id: string;
      last_activity_at: string | null;
    }>) {
      activity.set(row.user_id, row.last_activity_at);
    }
  }

  return activity;
}

async function loadContentFacts(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<ContentFacts> {
  const ownersOfPages = new Set<string>();
  const ownersOfImages = new Set<string>();

  for (const chunk of chunks(userIds, CLEANUP_QUERY_CHUNK)) {
    const { data: pages, error: pagesError } = await supabase
      .from("lovely_pages")
      .select("owner_id")
      .in("owner_id", chunk);

    if (pagesError) {
      if (isMissingSchema(pagesError)) {
        throw new CleanupConfigurationError(
          "Page ownership cannot be verified. Run the latest supabase/schema.sql or migrations.",
        );
      }
      throw new CleanupConfigurationError(
        `Could not verify page ownership: ${pagesError.message}`,
      );
    }

    for (const row of (pages ?? []) as Array<{ owner_id: string | null }>) {
      if (row.owner_id) ownersOfPages.add(row.owner_id);
    }

    const { data: images, error: imagesError } = await supabase
      .from("lovely_images")
      .select("owner_id")
      .in("owner_id", chunk);

    if (imagesError) {
      if (isMissingSchema(imagesError)) {
        throw new CleanupConfigurationError(
          "Image ownership cannot be verified. Run the latest supabase/schema.sql or migrations.",
        );
      }
      throw new CleanupConfigurationError(
        `Could not verify image ownership: ${imagesError.message}`,
      );
    }

    for (const row of (images ?? []) as Array<{ owner_id: string | null }>) {
      if (row.owner_id) ownersOfImages.add(row.owner_id);
    }

    const { data: uploads, error: uploadsError } = await supabase
      .from("lovely_images")
      .select("uploaded_by_user_id")
      .in("uploaded_by_user_id", chunk);

    if (uploadsError) {
      if (isMissingSchema(uploadsError)) {
        throw new CleanupConfigurationError(
          "Image upload ownership cannot be verified. Run the latest supabase/schema.sql or migrations.",
        );
      }
      throw new CleanupConfigurationError(
        `Could not verify image uploads: ${uploadsError.message}`,
      );
    }

    for (const row of (uploads ?? []) as Array<{
      uploaded_by_user_id: string | null;
    }>) {
      if (row.uploaded_by_user_id) {
        ownersOfImages.add(row.uploaded_by_user_id);
      }
    }
  }

  return { ownersOfPages, ownersOfImages };
}

async function loadIncompleteTransfers(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Set<string>> {
  const incomplete = new Set<string>();

  for (const chunk of chunks(userIds, CLEANUP_QUERY_CHUNK)) {
    const { data, error } = await supabase
      .from("lovely_account_transfers")
      .select("source_guest_uid, status, completed_at")
      .in("source_guest_uid", chunk);

    if (error) {
      if (error.code === "42P01") {
        // The transfer feature is not installed, so no transfers can exist.
        continue;
      }
      if (isMissingSchema(error)) {
        throw new CleanupConfigurationError(
          "Ownership transfer state cannot be verified. Run the latest supabase/schema.sql or migrations.",
        );
      }
      throw new CleanupConfigurationError(
        `Could not verify ownership transfers: ${error.message}`,
      );
    }

    for (const row of (data ?? []) as Array<{
      source_guest_uid: string;
      status: string;
      completed_at: string | null;
    }>) {
      if (row.status !== "completed" || !row.completed_at) {
        incomplete.add(row.source_guest_uid);
      }
    }
  }

  return incomplete;
}

function buildFacts(
  candidate: AuthCandidate,
  activity: Map<string, string | null>,
  content: ContentFacts,
  incompleteTransfers: Set<string>,
): AnonymousUserFacts {
  return {
    id: candidate.id,
    isAnonymous: true,
    createdAt: candidate.createdAt,
    lastSignInAt: candidate.lastSignInAt,
    trackedActivityAt: activity.get(candidate.id) ?? null,
    ownsPage: content.ownersOfPages.has(candidate.id),
    ownsImage: content.ownersOfImages.has(candidate.id),
    hasIncompleteTransfer: incompleteTransfers.has(candidate.id),
  };
}

async function persistRun(
  supabase: SupabaseClient,
  report: AnonymousCleanupReport,
) {
  try {
    const { error } = await supabase.from("lovely_cleanup_runs").insert({
      executed_at: report.executedAt,
      dry_run: report.dryRun,
      examined: report.examined,
      eligible: report.eligible,
      deleted: report.deleted,
      skipped_own_content: report.skippedOwnContent,
      skipped_active: report.skippedActive,
      skipped_unverified: report.skippedUnverified,
      skipped_transfer: report.skippedTransfer,
      truncated: report.truncated,
      errors: report.errors,
      details: report.details,
    });

    if (error && !isMissingSchema(error)) {
      console.error("Failed to save Lovely cleanup run", error.message);
    }
  } catch (error) {
    console.error("Failed to save Lovely cleanup run", errorMessage(error));
  }
}

export async function runAnonymousUserCleanup({
  dryRun,
  maxCandidates = CLEANUP_MAX_CANDIDATES,
}: {
  dryRun: boolean;
  maxCandidates?: number;
}): Promise<AnonymousCleanupReport> {
  const executedAt = new Date().toISOString();
  const now = new Date(executedAt);

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new CleanupConfigurationError(
      "Supabase is not configured. Add SUPABASE_SECRET_KEY on the server.",
    );
  }

  const listed = await listCandidates(supabase, now, Math.max(1, maxCandidates));
  const candidateIds = listed.candidates.map((candidate) => candidate.id);

  let activity = new Map<string, string | null>();
  let content: ContentFacts = {
    ownersOfPages: new Set(),
    ownersOfImages: new Set(),
  };
  let incompleteTransfers = new Set<string>();

  if (candidateIds.length > 0) {
    activity = await loadActivityMap(supabase, candidateIds);
    content = await loadContentFacts(supabase, candidateIds);
    incompleteTransfers = await loadIncompleteTransfers(supabase, candidateIds);
  }

  const details: CleanupDetail[] = [];
  const eligibleCandidates: AuthCandidate[] = [];
  let skippedOwnContent = 0;
  let skippedActive = listed.recentlyActive;
  let skippedUnverified = 0;
  let skippedTransfer = 0;

  for (const candidate of listed.candidates) {
    const decision = assessAnonymousCleanupCandidate(
      buildFacts(candidate, activity, content, incompleteTransfers),
      now,
    );

    details.push({
      userId: candidate.id,
      outcome: decision.outcome,
      lastActivityAt: decision.lastActivityAt,
    });

    switch (decision.outcome) {
      case "eligible":
        eligibleCandidates.push(candidate);
        break;
      case "keep_owns_content":
        skippedOwnContent += 1;
        break;
      case "keep_active":
        skippedActive += 1;
        break;
      case "keep_unverified":
        skippedUnverified += 1;
        break;
      case "keep_transfer_in_progress":
        skippedTransfer += 1;
        break;
      default:
        skippedUnverified += 1;
        break;
    }
  }

  let finalEligible = eligibleCandidates;

  if (!dryRun && eligibleCandidates.length > 0) {
    // Re-check immediately before deleting. A guest could have created content
    // after the first pass, and this keeps the window for a race very small.
    const eligibleIds = eligibleCandidates.map((candidate) => candidate.id);
    const freshActivity = await loadActivityMap(supabase, eligibleIds);
    const freshContent = await loadContentFacts(supabase, eligibleIds);
    const freshTransfers = await loadIncompleteTransfers(
      supabase,
      eligibleIds,
    );
    finalEligible = [];

    for (const candidate of eligibleCandidates) {
      const decision = assessAnonymousCleanupCandidate(
        buildFacts(candidate, freshActivity, freshContent, freshTransfers),
        new Date(),
      );

      if (decision.outcome === "eligible") {
        finalEligible.push(candidate);
        continue;
      }

      const detail = details.find((item) => item.userId === candidate.id);
      if (detail) {
        detail.outcome = decision.outcome;
        detail.lastActivityAt = decision.lastActivityAt;
      }

      if (decision.outcome === "keep_owns_content") skippedOwnContent += 1;
      else if (decision.outcome === "keep_active") skippedActive += 1;
      else if (decision.outcome === "keep_transfer_in_progress")
        skippedTransfer += 1;
      else skippedUnverified += 1;
    }
  }

  const errors: CleanupErrorRecord[] = [];
  let deleted = 0;

  if (!dryRun) {
    for (const candidate of finalEligible) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(
          candidate.id,
          false,
        );

        if (error) {
          throw new Error(error.message);
        }

        deleted += 1;
      } catch (error) {
        errors.push({
          userId: candidate.id,
          message: errorMessage(error),
        });
      }
    }
  }

  const report: AnonymousCleanupReport = {
    executedAt,
    dryRun,
    examined: listed.examined,
    candidates: listed.candidates.length,
    eligible: finalEligible.length,
    deleted,
    skippedOwnContent,
    skippedActive,
    skippedUnverified,
    skippedTransfer,
    registeredSkipped: listed.registeredSkipped,
    truncated: listed.truncated,
    errors,
    details,
  };

  await persistRun(supabase, report);

  console.log(
    "Lovely anonymous user cleanup",
    JSON.stringify({
      executedAt: report.executedAt,
      dryRun: report.dryRun,
      examined: report.examined,
      candidates: report.candidates,
      eligible: report.eligible,
      deleted: report.deleted,
      skippedOwnContent: report.skippedOwnContent,
      skippedActive: report.skippedActive,
      skippedUnverified: report.skippedUnverified,
      skippedTransfer: report.skippedTransfer,
      registeredSkipped: report.registeredSkipped,
      truncated: report.truncated,
      errorCount: report.errors.length,
    }),
  );

  return report;
}
