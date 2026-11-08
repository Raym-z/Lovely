"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Heart, Mail, RefreshCw } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { TurnstileWidget } from "./TurnstileWidget";
import { friendlyAuthError } from "@/lib/auth-errors";
import {
  clearPasswordPending,
  clearPendingVerification,
  getResendAvailableAt,
  markVerificationSent,
  readPendingVerification,
  RESEND_COOLDOWN_MS,
  resendVerificationEmail,
} from "@/lib/auth-email";
import { safeAuthNext, withAuthNext } from "@/lib/auth-redirect";
import { isEmailVerified } from "@/lib/auth-verification";
import {
  clearPendingSignupCredentials,
  readPendingSignupCredentials,
} from "@/lib/pending-signup-credentials";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import { useHydrated } from "@/lib/use-hydrated";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function EmailVerificationPending({
  supabaseUrl,
  supabaseKey,
  turnstileSiteKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
  turnstileSiteKey: string;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const searchParams = useSearchParams();
  const [pending] = useState(() => readPendingVerification());
  const resendType = pending?.resendType ?? "signup";
  const [email, setEmail] = useState(pending?.email ?? "");
  const nextPath =
    safeAuthNext(searchParams.get("next")) ?? pending?.nextPath ?? null;
  const [availableAt, setAvailableAt] = useState(() =>
    getResendAvailableAt(),
  );
  const [now, setNow] = useState(() => Date.now());
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishMessage, setFinishMessage] = useState<string | null>(null);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [manualChecking, setManualChecking] = useState(false);
  const [manualStatus, setManualStatus] = useState<string | null>(null);
  const [authSignedOut, setAuthSignedOut] = useState(false);
  const finishingRef = useRef(false);
  const statusCheckRef = useRef(false);
  const watchUserId = pending?.watchUserId ?? null;
  const watchToken = pending?.watchToken ?? null;

  useEffect(() => {
    const remaining = availableAt - now;
    if (remaining <= 0) return;

    const timeout = window.setTimeout(() => setNow(Date.now()), 1000);
    return () => window.clearTimeout(timeout);
  }, [availableAt, now]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient({
      url: supabaseUrl,
      key: supabaseKey,
    });
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user;

      if (user && !user.is_anonymous && isEmailVerified(user)) {
        router.replace(nextPath ?? "/account");
        return;
      }

      const pendingEmail = user?.email ?? user?.new_email;
      if (pendingEmail) {
        setEmail(pendingEmail);
      }
    });

    return () => {
      active = false;
    };
  }, [nextPath, router, supabaseKey, supabaseUrl]);

  const waitSeconds = Math.max(0, Math.ceil((availableAt - now) / 1000));

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaKey((current) => current + 1);
  }, []);

  const queryVerificationStatus = useCallback(async () => {
    if (statusCheckRef.current) {
      return { verified: false, unsupported: false };
    }

    statusCheckRef.current = true;

    try {
      const supabase = getSupabaseBrowserClient({
        url: supabaseUrl,
        key: supabaseKey,
      });

      if (!supabase) {
        return { verified: false, unsupported: true };
      }

      if (watchUserId && watchToken) {
        try {
          const response = await fetch("/api/auth/verification-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: watchUserId, watchToken }),
            cache: "no-store",
          });

          if (!response.ok) {
            return { verified: false, unsupported: response.status === 404 };
          }

          const data = (await response.json().catch(() => ({}))) as {
            verified?: unknown;
          };
          return { verified: data.verified === true, unsupported: false };
        } catch {
          return { verified: false, unsupported: false };
        }
      }

      const { data, error } = await supabase.auth.getUser();
      const user = data.user;

      if (error || !user) {
        return { verified: false, unsupported: true };
      }

      return {
        verified: Boolean(!user.is_anonymous && isEmailVerified(user)),
        unsupported: false,
      };
    } finally {
      statusCheckRef.current = false;
    }
  }, [supabaseKey, supabaseUrl, watchToken, watchUserId]);

  const finishVerified = useCallback(async () => {
    if (finishingRef.current || authSignedOut) return;

    const supabase = getSupabaseBrowserClient({
      url: supabaseUrl,
      key: supabaseKey,
    });
    if (!supabase) {
      setFinishError("Accounts are not configured right now.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session) {
      const { data: refreshed, error: refreshError } =
        await supabase.auth.refreshSession();
      const refreshedUser = refreshed.user ?? refreshed.session?.user;

      if (
        !refreshError &&
        refreshedUser &&
        !refreshedUser.is_anonymous &&
        isEmailVerified(refreshedUser)
      ) {
        clearPendingVerification();
        clearPasswordPending();
        clearPendingSignupCredentials();
        router.replace(nextPath ?? "/account");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (
        userData.user &&
        !userData.user.is_anonymous &&
        isEmailVerified(userData.user)
      ) {
        clearPendingVerification();
        clearPasswordPending();
        clearPendingSignupCredentials();
        router.replace(nextPath ?? "/account");
        return;
      }
    }

    const credentials = readPendingSignupCredentials();
    if (!credentials) {
      setFinishError(
        "Your email is verified. Log in with your email and password to continue.",
      );
      return;
    }

    if (turnstileSiteKey && !captchaToken) {
      setFinishMessage(
        "Email verified! Complete the verification check to finish automatically.",
      );
      return;
    }

    finishingRef.current = true;
    setFinishing(true);
    setFinishError(null);
    setFinishMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
        options:
          turnstileSiteKey && captchaToken
            ? { captchaToken }
            : undefined,
      });

      resetCaptcha();

      if (!error) {
        clearPendingVerification();
        clearPasswordPending();
        clearPendingSignupCredentials();
        router.replace(nextPath ?? "/account");
        return;
      }

      const normalized = error.message.toLowerCase();

      if (normalized.includes("captcha")) {
        resetCaptcha();
        setFinishMessage(
          "Email verified! Complete the verification check to finish automatically.",
        );
        return;
      }

      if (normalized.includes("email not confirmed")) {
        setVerified(false);
        setFinishMessage(
          "Email verified! Supabase is still catching up, so we'll keep checking automatically.",
        );
        return;
      }

      setFinishError(friendlyAuthError(error.message));
    } finally {
      finishingRef.current = false;
      setFinishing(false);
    }
  }, [
    authSignedOut,
    captchaToken,
    nextPath,
    resetCaptcha,
    router,
    supabaseKey,
    supabaseUrl,
    turnstileSiteKey,
  ]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient({
      url: supabaseUrl,
      key: supabaseKey,
    });
    if (!supabase) return;

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setAuthSignedOut(true);
    });

    return () => data.subscription.unsubscribe();
  }, [supabaseKey, supabaseUrl]);

  useEffect(() => {
    if (!hydrated || verified || authSignedOut) return;

    let active = true;
    const interval = window.setInterval(() => {
      void queryVerificationStatus().then((result) => {
        if (!active || !result.verified) return;
        active = false;
        setVerified(true);
      });
    }, 5000);

    void queryVerificationStatus().then((result) => {
      if (!active || !result.verified) return;
      active = false;
      setVerified(true);
    });

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [authSignedOut, hydrated, queryVerificationStatus, verified]);

  useEffect(() => {
    if (!verified || authSignedOut) return;

    const timeout = window.setTimeout(() => {
      void finishVerified();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [authSignedOut, finishVerified, verified]);

  async function manualVerificationCheck() {
    if (manualChecking) return;

    setManualChecking(true);
    setManualStatus(null);

    const result = await queryVerificationStatus();

    if (result.verified) {
      setVerified(true);
    } else if (result.unsupported) {
      setManualStatus(
        "We couldn't check this one automatically. Log in to continue once it's verified.",
      );
    } else {
      setManualStatus(
        "Not verified yet. This page will keep checking automatically.",
      );
    }

    setManualChecking(false);
  }

  async function resend() {
    if (
      resending ||
      !email ||
      waitSeconds > 0 ||
      (turnstileSiteKey && !captchaToken)
    ) {
      return;
    }

    const supabase = getSupabaseBrowserClient({
      url: supabaseUrl,
      key: supabaseKey,
    });
    if (!supabase) {
      setResendError("Accounts are not configured right now.");
      return;
    }

    setResending(true);
    setResendError(null);
    setResendSuccess(null);

    const result = await resendVerificationEmail(
      supabase,
      email,
      nextPath,
      resendType,
      captchaToken,
    );

    resetCaptcha();

    if (result.ok) {
      const nextAvailableAt = Date.now() + RESEND_COOLDOWN_MS;
      markVerificationSent();
      setAvailableAt(nextAvailableAt);
      setNow(Date.now());
      setResendSuccess(
        "A fresh confirmation link is on its way. It can take a minute to arrive.",
      );
    } else {
      const message = result.message ?? friendlyAuthError(undefined);
      setResendError(message);

      if (result.captchaFailed) {
        setCaptchaError(
          "Complete the verification check again, then retry the resend.",
        );
      }

      if (result.rateLimited) {
        const nextAvailableAt = Date.now() + RESEND_COOLDOWN_MS;
        setAvailableAt(nextAvailableAt);
        setNow(Date.now());
      }
    }

    setResending(false);
  }

  if (!hydrated) {
    return <LoadingScreen message="Checking your confirmation..." />;
  }

  return (
    <AuthShell
      eyebrow="Check your inbox"
      title={
        <>
          One little step before we begin{" "}
          <span className="text-strawberry">💗</span>
        </>
      }
      description="We've sent a confirmation link to your email address. Open it to verify your email and make your Lovely account official."
      footer={
        <>
          Wrong email?{" "}
          <Link
            href={withAuthNext("/login", nextPath)}
            className="font-semibold text-strawberry transition-colors hover:text-strawberry-deep"
          >
            Back to login
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-pink-soft bg-blush/55 p-4 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-strawberry shadow-sm">
            <Mail className="h-5 w-5" />
          </span>
          <p className="mt-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.14em] text-ink-soft/60">
            Confirmation sent to
          </p>
          <p className="mt-1 break-all font-display text-sm font-semibold text-ink">
            {email || "your email address"}
          </p>
        </div>

        <p className="text-center font-hand text-lg leading-tight text-ink-soft/70">
          Opening Gmail on another device? That&apos;s okay — this page checks
          automatically and will continue as soon as your email is verified.
        </p>

        {verified ? (
          <div
            role="status"
            className="rounded-2xl border-2 border-mint bg-mint-soft px-4 py-3 text-center text-[#3d8a6d]"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Check className="h-4 w-4 shrink-0" />
              <p className="font-display text-sm font-semibold">
                {finishing
                  ? "Email verified! Opening your account..."
                  : finishError
                    ? "Email verified!"
                    : "Email verified!"}
              </p>
            </div>
            <p className="mt-1 font-body text-xs leading-relaxed">
              {finishError ??
                finishMessage ??
                "Finishing your Lovely account now..."}
            </p>
            {finishError ? (
              <Link
                href={withAuthNext("/login", nextPath)}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-strawberry px-4 py-2 font-display text-xs font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
              >
                Log in to continue
              </Link>
            ) : null}
          </div>
        ) : null}

        {resendSuccess ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border-2 border-mint bg-mint-soft px-3.5 py-2.5 font-body text-xs leading-relaxed text-[#3d8a6d]"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>{resendSuccess}</p>
          </div>
        ) : null}

        {resendError ? (
          <p
            role="alert"
            className="rounded-xl border-2 border-strawberry/25 bg-blush/70 px-3.5 py-2.5 font-body text-xs leading-relaxed text-[#7d4250]"
          >
            {resendError}
          </p>
        ) : null}

        {turnstileSiteKey ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <TurnstileWidget
                key={captchaKey}
                siteKey={turnstileSiteKey}
                appearance="always"
                onToken={(token) => {
                  setCaptchaToken(token);
                  setCaptchaError(null);
                }}
                onExpire={() => {
                  setCaptchaToken(null);
                  setCaptchaKey((current) => current + 1);
                }}
                onError={() => {
                  setCaptchaToken(null);
                  setCaptchaError(
                    "Cloudflare verification could not load. Try the check again.",
                  );
                }}
              />
            </div>

            {!captchaToken && !captchaError ? (
              <p className="text-center font-hand text-base leading-tight text-ink-soft/60">
                Complete the verification check to enable resending.
              </p>
            ) : null}

            {captchaError ? (
              <div className="space-y-2 text-center">
                <p
                  role="alert"
                  className="font-body text-xs leading-relaxed text-[#7d4250]"
                >
                  {captchaError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCaptchaError(null);
                    resetCaptcha();
                  }}
                  className="rounded-full border-2 border-pink-soft bg-white px-4 py-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.12em] text-strawberry transition-colors hover:border-pink hover:bg-blush"
                >
                  Try verification again
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void resend()}
          disabled={
            resending ||
            waitSeconds > 0 ||
            !email ||
            Boolean(captchaError) ||
            Boolean(turnstileSiteKey && !captchaToken)
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resending ? (
            "Sending..."
          ) : waitSeconds > 0 ? (
            `Resend in ${waitSeconds}s`
          ) : (
            <>
              Resend confirmation email
              <RefreshCw className="h-4 w-4" />
            </>
          )}
        </button>

        {!verified ? (
          <>
            <button
              type="button"
              onClick={() => void manualVerificationCheck()}
              disabled={manualChecking}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-pink-soft bg-white px-6 py-2.5 font-display text-sm font-semibold text-strawberry transition-colors hover:border-pink hover:bg-blush disabled:cursor-wait disabled:opacity-60"
            >
              {manualChecking ? "Checking..." : "I've verified my email"}
            </button>
            {manualStatus ? (
              <p className="text-center font-body text-xs leading-relaxed text-ink-soft/70">
                {manualStatus}
              </p>
            ) : null}
          </>
        ) : null}

        <div className="flex items-center justify-center gap-1.5 font-hand text-base text-ink-soft/60">
          <Heart className="h-3.5 w-3.5 text-strawberry" />
          nothing is lost while you check
        </div>
      </div>
    </AuthShell>
  );
}
