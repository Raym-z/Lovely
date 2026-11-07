"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Heart, Mail } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { AuthShell } from "./AuthShell";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import {
  clearPendingVerification,
  isPasswordPending,
} from "@/lib/auth-email";
import { safeAuthNext, withAuthNext } from "@/lib/auth-redirect";
import {
  isEmailVerified,
  isRegisteredUnverified,
} from "@/lib/auth-verification";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Phase = "checking" | "success" | "pending" | "error";

function cleanupCallbackUrl(nextPath: string | null) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  if (nextPath) url.searchParams.set("next", nextPath);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

async function hasUsableSession(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return true;
    await new Promise((resolve) => window.setTimeout(resolve, 200));
  }

  return false;
}

function callbackErrorMessage(message: string | null) {
  const normalized = (message ?? "").toLowerCase();

  if (
    normalized.includes("code verifier") ||
    normalized.includes("different browser")
  ) {
    return "Open this confirmation link in the same browser you used to sign up, or request a fresh link from the verification screen.";
  }

  if (
    normalized.includes("expired") ||
    normalized.includes("invalid") ||
    normalized.includes("already") ||
    normalized.includes("used")
  ) {
    return "This confirmation link has expired or has already been used. Request a fresh link and try again.";
  }

  return "We couldn't confirm this email link. Request a fresh link or log in to try again.";
}

export function EmailConfirmation({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeAuthNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");
  const queryError =
    searchParams.get("error_description") ?? searchParams.get("error");
  const [phase, setPhase] = useState<Phase>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [continuePath, setContinuePath] = useState(
    nextPath ?? "/account",
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function confirm() {
      const supabase = getSupabaseBrowserClient({
        url: supabaseUrl,
        key: supabaseKey,
      });

      if (!supabase) {
        setPhase("error");
        setMessage("Accounts are not configured right now.");
        return;
      }

      try {
        if (queryError) {
          setPhase("error");
          setMessage(callbackErrorMessage(queryError));
          cleanupCallbackUrl(nextPath);
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error && !(await hasUsableSession(supabase))) {
            setPhase("error");
            setMessage(callbackErrorMessage(error.message));
            cleanupCallbackUrl(nextPath);
            return;
          }
        } else if (tokenHash && otpType) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType as EmailOtpType,
          });

          if (error) {
            setPhase("error");
            setMessage(callbackErrorMessage(error.message));
            cleanupCallbackUrl(nextPath);
            return;
          }
        } else {
          const hash = new URLSearchParams(
            window.location.hash.replace(/^#/, ""),
          );
          const accessToken = hash.get("access_token");
          const refreshToken = hash.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              setPhase("error");
              setMessage(callbackErrorMessage(error.message));
              cleanupCallbackUrl(nextPath);
              return;
            }
          }
        }

        const { data, error } = await supabase.auth.getUser();
        const user = data.user;

        cleanupCallbackUrl(nextPath);

        if (error || !user) {
          setPhase("error");
          setMessage(
            "We couldn't verify this session. Log in to check whether your email is confirmed.",
          );
          return;
        }

        if (
          user.is_anonymous ||
          isRegisteredUnverified(user) ||
          !isEmailVerified(user)
        ) {
          setPhase("pending");
          setMessage(
            "Your link was opened, but Supabase has not marked this email as confirmed yet. Request a fresh confirmation link and try once more.",
          );
          return;
        }

        clearPendingVerification();
        const destination = isPasswordPending()
          ? withAuthNext("/signup?complete=1", nextPath)
          : nextPath ?? "/account";
        setContinuePath(destination);
        setPhase("success");
      } catch {
        cleanupCallbackUrl(nextPath);
        setPhase("error");
        setMessage(
          "Something interrupted the confirmation. Request a fresh link or log in to try again.",
        );
      }
    }

    void confirm();
  }, [
    code,
    nextPath,
    otpType,
    queryError,
    supabaseKey,
    supabaseUrl,
    tokenHash,
  ]);

  useEffect(() => {
    if (phase !== "success") return;

    const timeout = window.setTimeout(() => router.replace(continuePath), 1800);
    return () => window.clearTimeout(timeout);
  }, [continuePath, phase, router]);

  if (phase === "checking") {
    return <LoadingScreen message="Confirming your email..." />;
  }

  if (phase === "success") {
    return (
      <AuthShell
        eyebrow="Email verified"
        title={
          <>
            You&apos;re officially Lovely!{" "}
            <span className="text-strawberry">💗</span>
          </>
        }
        description="Your email is verified. Your little corner of Lovely is ready whenever you are."
      >
        <div className="space-y-4 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint-soft text-[#3d8a6d]">
            <Check className="h-6 w-6" strokeWidth={3} />
          </span>
          <p className="font-hand text-lg leading-tight text-ink-soft/75">
            {isPasswordPending()
              ? "One tiny password step remains before we open your account."
              : "Taking you back to Lovely..."}
          </p>
          <Link
            href={continuePath}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
          >
            {isPasswordPending() ? "Finish your account" : "Continue to Lovely"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center justify-center gap-1.5 font-hand text-base text-ink-soft/60">
            <Heart className="h-3.5 w-3.5 text-strawberry" />
            everything is saved
          </div>
        </div>
      </AuthShell>
    );
  }

  if (phase === "pending") {
    return (
      <AuthShell
        eyebrow="One more check"
        title={
          <>
            One little step before we begin{" "}
            <span className="text-strawberry">💗</span>
          </>
        }
        description="Supabase needs one more confirmation before this email is marked as verified."
      >
        <div className="space-y-4 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-butter-soft text-[#a5771c]">
            <Mail className="h-6 w-6" />
          </span>
          <p className="font-body text-xs leading-relaxed text-ink-soft">
            {message}
          </p>
          <Link
            href={withAuthNext("/verify-email", nextPath)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
          >
            Open the verification screen
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Link problem"
      title={
        <>
          That link has gone a little{" "}
          <span className="text-strawberry">sideways.</span>
        </>
      }
      description="Confirmation links are single-use and expire after a while. You can request a fresh one."
      footer={
        <>
          Already confirmed?{" "}
          <Link
            href={withAuthNext("/login", nextPath)}
            className="font-semibold text-strawberry transition-colors hover:text-strawberry-deep"
          >
            Log in
          </Link>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush text-strawberry">
          <Mail className="h-6 w-6" />
        </span>
        <p className="font-body text-xs leading-relaxed text-[#7d4250]">
          {message}
        </p>
        <Link
          href={withAuthNext("/verify-email", nextPath)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
        >
          Request a new link
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </AuthShell>
  );
}
