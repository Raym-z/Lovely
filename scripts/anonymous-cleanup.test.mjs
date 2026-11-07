import assert from "node:assert/strict";
import test from "node:test";
import {
  assessAnonymousCleanupCandidate,
  getCleanupCutoff,
} from "../lib/anonymous-cleanup-rules.ts";

const NOW = new Date("2026-11-08T12:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days) {
  return new Date(NOW.getTime() - days * DAY_MS).toISOString();
}

function facts(overrides = {}) {
  return {
    id: "00000000-0000-4000-8000-000000000000",
    isAnonymous: true,
    createdAt: daysAgo(90),
    lastSignInAt: daysAgo(90),
    trackedActivityAt: daysAgo(90),
    ownsPage: false,
    ownsImage: false,
    hasIncompleteTransfer: false,
    ...overrides,
  };
}

function outcome(overrides) {
  return assessAnonymousCleanupCandidate(facts(overrides), NOW).outcome;
}

test("anonymous user created 10 days ago is kept", () => {
  assert.equal(
    outcome({ createdAt: daysAgo(10), lastSignInAt: daysAgo(10) }),
    "keep_active",
  );
});

test("anonymous user inactive for 45 days with no content is eligible", () => {
  assert.equal(outcome({ trackedActivityAt: daysAgo(45) }), "eligible");
});

test("anonymous user inactive for 60 days with a Lovely page is kept", () => {
  assert.equal(
    outcome({
      trackedActivityAt: daysAgo(60),
      lastSignInAt: daysAgo(60),
      ownsPage: true,
    }),
    "keep_owns_content",
  );
});

test("anonymous user inactive for 60 days with an uploaded image is kept", () => {
  assert.equal(
    outcome({
      trackedActivityAt: daysAgo(60),
      lastSignInAt: daysAgo(60),
      ownsImage: true,
    }),
    "keep_owns_content",
  );
});

test("registered account inactive for 90 days is kept", () => {
  assert.equal(outcome({ isAnonymous: false }), "keep_registered");
});

test("anonymous user with an incomplete ownership transfer is kept", () => {
  assert.equal(
    outcome({
      trackedActivityAt: daysAgo(60),
      lastSignInAt: daysAgo(60),
      hasIncompleteTransfer: true,
    }),
    "keep_transfer_in_progress",
  );
});

test("unknown activity status is kept", () => {
  assert.equal(
    outcome({
      createdAt: daysAgo(90),
      lastSignInAt: null,
      trackedActivityAt: null,
    }),
    "keep_unverified",
  );
});

test("a new account without an activity row is treated as active", () => {
  assert.equal(
    outcome({
      createdAt: daysAgo(5),
      lastSignInAt: null,
      trackedActivityAt: null,
    }),
    "keep_active",
  );
});

test("recent tracked activity beats an old sign-in", () => {
  assert.equal(
    outcome({
      lastSignInAt: daysAgo(90),
      trackedActivityAt: daysAgo(2),
    }),
    "keep_active",
  );
});

test("recent sign-in beats an old tracked activity", () => {
  assert.equal(
    outcome({
      lastSignInAt: daysAgo(2),
      trackedActivityAt: daysAgo(90),
    }),
    "keep_active",
  );
});

test("exactly 30 days of inactivity is eligible", () => {
  assert.equal(
    outcome({
      trackedActivityAt: daysAgo(30),
      lastSignInAt: daysAgo(30),
    }),
    "eligible",
  );
});

test("just under 30 days of inactivity is kept", () => {
  assert.equal(
    outcome({
      trackedActivityAt: daysAgo(29.9),
      lastSignInAt: daysAgo(29.9),
    }),
    "keep_active",
  );
});

test("eligibility is deterministic across repeated evaluations", () => {
  const input = facts({ trackedActivityAt: daysAgo(45) });
  const first = assessAnonymousCleanupCandidate(input, NOW);
  const second = assessAnonymousCleanupCandidate(input, NOW);
  assert.deepEqual(first, second);
});

test("cutoff is exactly 30 days before now", () => {
  assert.equal(
    getCleanupCutoff(NOW).toISOString(),
    new Date(NOW.getTime() - 30 * DAY_MS).toISOString(),
  );
});
