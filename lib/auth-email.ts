import type { SupabaseClient } from "@supabase/supabase-js";
import { friendlyAuthError } from "@/lib/auth-errors";

const PENDING_VERIFICATION_KEY = "lovely.verify-email.pending.v1";
const PENDING_PASSWORD_KEY = "lovely.verify-email.password-pending.v1";
const SENT_AT_KEY = "lovely.verify-email.sent-at.v1";

export const RESEND_COOLDOWN_MS = 60_000;

export type PendingVerification = {
  email: string;
  nextPath: string | null;
};

export function rememberPendingVerification(
  email: string,
  nextPath: string | null,
) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      PENDING_VERIFICATION_KEY,
      JSON.stringify({ email, nextPath } satisfies PendingVerification),
    );
  } catch {
    // The verification screen can still work from the URL or current session.
  }
}

export function readPendingVerification(): PendingVerification | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_VERIFICATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingVerification>;
    if (typeof parsed.email !== "string" || !parsed.email.trim()) return null;
    return {
      email: parsed.email.trim(),
      nextPath:
        typeof parsed.nextPath === "string" && parsed.nextPath.startsWith("/")
          ? parsed.nextPath
          : null,
    };
  } catch {
    return null;
  }
}

export function clearPendingVerification() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
  } catch {
    // Ignore.
  }
}

export function markPasswordPending() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(PENDING_PASSWORD_KEY, "1");
  } catch {
    // The confirmation screen can still continue to the account.
  }
}

export function isPasswordPending() {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(PENDING_PASSWORD_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearPasswordPending() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(PENDING_PASSWORD_KEY);
  } catch {
    // Ignore.
  }
}

export function markVerificationSent() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(SENT_AT_KEY, String(Date.now()));
  } catch {
    // Cooldown is a convenience; Supabase still enforces its own limits.
  }
}

export function getResendAvailableAt() {
  if (typeof window === "undefined") return 0;

  try {
    const parsed = Number(window.sessionStorage.getItem(SENT_AT_KEY));
    return Number.isFinite(parsed) ? parsed + RESEND_COOLDOWN_MS : 0;
  } catch {
    return 0;
  }
}

export function buildAuthRedirectUrl(nextPath: string | null) {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  const browserOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  let url: URL;

  try {
    url = new URL("/auth/confirm", configuredOrigin || browserOrigin);
  } catch {
    url = new URL("/auth/confirm", browserOrigin);
  }

  if (nextPath) {
    url.searchParams.set("next", nextPath);
  }

  return url.toString();
}

function isRateLimitError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("rate limit") || normalized.includes("too many");
}

export async function resendVerificationEmail(
  supabase: SupabaseClient,
  email: string,
  nextPath: string | null,
) {
  const emailRedirectTo = buildAuthRedirectUrl(nextPath);

  const emailChange = await supabase.auth.resend({
    type: "email_change",
    email,
    options: { emailRedirectTo },
  });

  if (!emailChange.error) {
    return { ok: true as const };
  }

  if (isRateLimitError(emailChange.error.message)) {
    return {
      ok: false as const,
      message: friendlyAuthError(emailChange.error.message),
    };
  }

  const signup = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo },
  });

  if (!signup.error) {
    return { ok: true as const };
  }

  return {
    ok: false as const,
    message: isRateLimitError(signup.error.message)
      ? friendlyAuthError(signup.error.message)
      : "We couldn't resend the confirmation email right now. Wait a moment and try again.",
  };
}
