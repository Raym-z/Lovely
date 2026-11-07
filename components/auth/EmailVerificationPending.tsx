"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Heart, Mail, RefreshCw } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { TurnstileWidget } from "./TurnstileWidget";
import { friendlyAuthError } from "@/lib/auth-errors";
import {
  getResendAvailableAt,
  markVerificationSent,
  readPendingVerification,
  RESEND_COOLDOWN_MS,
  resendVerificationEmail,
} from "@/lib/auth-email";
import { safeAuthNext, withAuthNext } from "@/lib/auth-redirect";
import { isEmailVerified } from "@/lib/auth-verification";
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

  function resetCaptcha() {
    setCaptchaToken(null);
    setCaptchaKey((current) => current + 1);
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
          The link expires after a while, so open it when you can. You can ask
          for a fresh one below.
        </p>

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

        <div className="flex items-center justify-center gap-1.5 font-hand text-base text-ink-soft/60">
          <Heart className="h-3.5 w-3.5 text-strawberry" />
          nothing is lost while you check
        </div>
      </div>
    </AuthShell>
  );
}
