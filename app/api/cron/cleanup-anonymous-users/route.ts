import { NextResponse } from "next/server";
import {
  CleanupConfigurationError,
  runAnonymousUserCleanup,
} from "@/lib/anonymous-cleanup";
import { CLEANUP_MAX_CANDIDATES } from "@/lib/anonymous-cleanup-rules";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const maxDuration = 60;

function getDefaultMaxCandidates() {
  const raw = Number(process.env.ANONYMOUS_CLEANUP_MAX_CANDIDATES ?? "");
  if (Number.isInteger(raw) && raw > 0) return Math.min(raw, 2000);
  return CLEANUP_MAX_CANDIDATES;
}

function getMaxCandidates(request: Request) {
  const raw = new URL(request.url).searchParams.get("limit");
  if (!raw) return getDefaultMaxCandidates();

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return getDefaultMaxCandidates();
  return Math.min(parsed, 2000);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const dryRunParam = url.searchParams.get("dryRun");
  const forceDryRun = dryRunParam === "1" || dryRunParam === "true";
  const deletionEnabled =
    process.env.ANONYMOUS_CLEANUP_DELETE_ENABLED === "true";
  const dryRun = forceDryRun || !deletionEnabled;

  try {
    const report = await runAnonymousUserCleanup({
      dryRun,
      maxCandidates: getMaxCandidates(request),
    });

    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    if (error instanceof CleanupConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error(
      "Lovely anonymous user cleanup failed",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "Cleanup could not complete. Check the server logs." },
      { status: 500 },
    );
  }
}
