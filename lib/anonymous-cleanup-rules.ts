export const ANONYMOUS_INACTIVITY_DAYS = 30;
export const CLEANUP_PAGE_SIZE = 200;
export const CLEANUP_MAX_CANDIDATES = 500;
export const CLEANUP_QUERY_CHUNK = 100;

export type AnonymousCleanupOutcome =
  | "eligible"
  | "keep_registered"
  | "keep_active"
  | "keep_owns_content"
  | "keep_transfer_in_progress"
  | "keep_unverified";

export type AnonymousUserFacts = {
  id: string;
  isAnonymous: boolean | null | undefined;
  createdAt: string | null | undefined;
  lastSignInAt: string | null | undefined;
  trackedActivityAt: string | null | undefined;
  ownsPage: boolean;
  ownsImage: boolean;
  hasIncompleteTransfer: boolean;
};

export type AnonymousCleanupDecision = {
  outcome: AnonymousCleanupOutcome;
  lastActivityAt: string | null;
};

export function getCleanupCutoff(
  now: Date,
  days = ANONYMOUS_INACTIVITY_DAYS,
): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function toTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function toIsoString(timestamp: number | null): string | null {
  return timestamp === null ? null : new Date(timestamp).toISOString();
}

/**
 * Pure eligibility check. Anything uncertain resolves to a "keep" outcome so
 * cleanup can never delete an account whose state we cannot verify.
 */
export function assessAnonymousCleanupCandidate(
  facts: AnonymousUserFacts,
  now: Date = new Date(),
): AnonymousCleanupDecision {
  if (facts.isAnonymous !== true) {
    return { outcome: "keep_registered", lastActivityAt: null };
  }

  const cutoff = getCleanupCutoff(now).getTime();
  const trackedActivity = toTimestamp(facts.trackedActivityAt);
  const lastSignIn = toTimestamp(facts.lastSignInAt);
  const createdAt = toTimestamp(facts.createdAt);

  const knownActivity = [trackedActivity, lastSignIn].filter(
    (value): value is number => value !== null,
  );
  const lastActivity = knownActivity.length
    ? Math.max(...knownActivity)
    : null;

  if (lastActivity !== null) {
    if (lastActivity > cutoff) {
      return {
        outcome: "keep_active",
        lastActivityAt: toIsoString(lastActivity),
      };
    }
  } else if (createdAt !== null && createdAt > cutoff) {
    // A brand-new account may not have an activity row yet. Treat it as active.
    return {
      outcome: "keep_active",
      lastActivityAt: toIsoString(createdAt),
    };
  } else {
    // Old account with no trustworthy activity timestamp. Never assume
    // abandonment just because the timestamp is missing.
    return { outcome: "keep_unverified", lastActivityAt: null };
  }

  if (facts.hasIncompleteTransfer) {
    return {
      outcome: "keep_transfer_in_progress",
      lastActivityAt: toIsoString(lastActivity),
    };
  }

  if (facts.ownsPage || facts.ownsImage) {
    return {
      outcome: "keep_owns_content",
      lastActivityAt: toIsoString(lastActivity),
    };
  }

  return {
    outcome: "eligible",
    lastActivityAt: toIsoString(lastActivity),
  };
}

export function isDeletionOutcome(outcome: AnonymousCleanupOutcome) {
  return outcome === "eligible";
}
