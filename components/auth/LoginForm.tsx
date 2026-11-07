"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Heart, RefreshCw } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { TurnstileWidget } from "./TurnstileWidget";
import { Field, TextInput } from "@/components/create/fields";
import { friendlyAuthError } from "@/lib/auth-errors";
import { rememberPendingVerification } from "@/lib/auth-email";
import { safeAuthNext, withAuthNext } from "@/lib/auth-redirect";
import { isRegisteredUnverified } from "@/lib/auth-verification";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type GuestProof = {
  accessToken: string;
  userId: string;
};

type TransferStatus = "idle" | "transferring" | "success" | "error";

type TransferResponse = {
  status:
    | "completed"
    | "already_completed"
    | "nothing_to_transfer"
    | "noop";
  pages: number;
  images: number;
  error?: string;
};

export function LoginForm({
  supabaseUrl,
  supabaseKey,
  turnstileSiteKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
  turnstileSiteKey: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeAuthNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const guestProofRef = useRef<GuestProof | null>(null);
  const [transferStatus, setTransferStatus] =
    useState<TransferStatus>("idle");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSummary, setTransferSummary] = useState<{
    pages: number;
    images: number;
  } | null>(null);

  useEffect(() => {
    if (transferStatus !== "success") return;

    const timeout = window.setTimeout(() => {
      router.replace(nextPath ?? "/account");
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [nextPath, router, transferStatus]);

  function getClient() {
    return getSupabaseBrowserClient({
      url: supabaseUrl,
      key: supabaseKey,
    });
  }

  async function runTransfer(accountAccessToken: string) {
    const guestProof = guestProofRef.current;

    if (!guestProof) {
      setTransferStatus("error");
      setTransferError(
        "The original guest session is no longer available. You are signed in; use the Lovely page's edit key to open it.",
      );
      return;
    }

    setTransferStatus("transferring");
    setTransferError(null);

    try {
      const response = await fetch("/api/account/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accountAccessToken}`,
        },
        body: JSON.stringify({ guestAccessToken: guestProof.accessToken }),
      });
      const data = (await response.json().catch(() => ({}))) as TransferResponse;

      if (!response.ok) {
        throw new Error(
          data.error ??
            "You're signed in, but we couldn't move your Lovely pages to this account yet.",
        );
      }

      if (
        data.status === "completed" ||
        data.status === "already_completed"
      ) {
        guestProofRef.current = null;
        setTransferSummary({
          pages: data.pages ?? 0,
          images: data.images ?? 0,
        });
        setTransferStatus("success");
        return;
      }

      guestProofRef.current = null;
      router.replace(nextPath ?? "/account");
    } catch (transferFailure) {
      setTransferStatus("error");
      setTransferError(
        transferFailure instanceof Error
          ? transferFailure.message
          : "You're signed in, but we couldn't move your Lovely pages to this account yet. Your original pages are safe. Please try again.",
      );
    }
  }

  async function retryTransfer() {
    const supabase = getClient();
    if (!supabase) {
      setTransferError("Accounts are not configured right now.");
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setTransferError(
        "Your account session has expired. Log in again to retry the transfer.",
      );
      setTransferStatus("error");
      return;
    }

    await runTransfer(data.session.access_token);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    setTransferError(null);
    setTransferSummary(null);
    setTransferStatus("idle");

    const cleanedEmail = email.trim();

    if (!emailPattern.test(cleanedEmail)) {
      setError("Add a valid email address.");
      return;
    }

    if (!password) {
      setError("Add your password.");
      return;
    }

    if (turnstileSiteKey && !captchaToken) {
      setError("Complete the verification check before signing in.");
      return;
    }

    const supabase = getClient();

    if (!supabase) {
      setError("Accounts are not configured right now.");
      return;
    }

    setLoading(true);

    try {
      const { data: currentData } = await supabase.auth.getSession();
      const currentSession = currentData.session;
      guestProofRef.current =
        currentSession?.user?.is_anonymous
          ? {
              accessToken: currentSession.access_token,
              userId: currentSession.user.id,
            }
          : null;

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("email not confirmed")) {
          rememberPendingVerification(cleanedEmail, nextPath);
          router.replace(withAuthNext("/verify-email", nextPath));
          return;
        }

        setError(friendlyAuthError(signInError.message));
        setCaptchaToken(null);
        setCaptchaKey((current) => current + 1);
        return;
      }

      const newSession = data.session;
      const newUser = data.user;

      if (!newSession || !newUser) {
        setError("Signed in, but the new session could not be read.");
        return;
      }

      if (isRegisteredUnverified(newUser)) {
        rememberPendingVerification(
          newUser.email ?? cleanedEmail,
          nextPath,
        );
        router.replace(withAuthNext("/verify-email", nextPath));
        return;
      }

      if (
        guestProofRef.current &&
        guestProofRef.current.userId !== newUser.id
      ) {
        await runTransfer(newSession.access_token);
        return;
      }

      router.replace(nextPath ?? "/account");
    } finally {
      setLoading(false);
    }
  }

  const transferMessage = transferSummary
    ? transferSummary.pages > 0
      ? `Your ${transferSummary.pages === 1 ? "Lovely page has" : `${transferSummary.pages} Lovely pages have`} been successfully added to your account.`
      : `Your ${transferSummary.images === 1 ? "photo has" : `${transferSummary.images} photos have`} been successfully added to your account.`
    : "Your Lovely page has been successfully added to your account.";

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={
        <>
          Your Lovely pages are{" "}
          <span className="text-strawberry">waiting.</span>
        </>
      }
      description="Sign in to open, edit, and keep every page you've made in one place."
      footer={
        transferStatus === "idle" ? (
          <>
            New to Lovely?{" "}
            <Link
              href={withAuthNext("/signup", nextPath)}
              className="font-semibold text-strawberry transition-colors hover:text-strawberry-deep"
            >
              Create an account
            </Link>
          </>
        ) : undefined
      }
    >
      {transferStatus === "idle" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email address" required>
            <TextInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={320}
            />
          </Field>
          <Field label="Password" required>
            <TextInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Your password"
              maxLength={200}
            />
          </Field>

          {turnstileSiteKey ? (
            <div className="flex justify-center">
              <TurnstileWidget
                key={captchaKey}
                siteKey={turnstileSiteKey}
                onToken={setCaptchaToken}
                onExpire={() => {
                  setCaptchaToken(null);
                  setCaptchaKey((current) => current + 1);
                }}
                onError={() => {
                  setCaptchaToken(null);
                  setError(
                    "Cloudflare verification could not load. Please refresh and try again.",
                  );
                }}
              />
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-xl border-2 border-strawberry/25 bg-blush/70 px-3.5 py-2.5 font-body text-xs leading-relaxed text-[#7d4250]"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Log in"}
            {loading ? null : <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <div className="text-center">
          {transferStatus === "transferring" ? (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-pink-soft text-strawberry">
                <Heart className="h-6 w-6 animate-pulse" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-ink">
                Moving your Lovely pages to your account...
              </p>
              <p className="mt-1 font-hand text-lg leading-tight text-ink-soft/70">
                Your photos and edit keys are coming with you.
              </p>
            </>
          ) : null}

          {transferStatus === "success" ? (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint-soft text-[#3d8a6d]">
                <Heart className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-ink">
                {transferMessage}
              </p>
              <p className="mt-1 font-hand text-lg leading-tight text-ink-soft/70">
                Taking you to your account...
              </p>
            </>
          ) : null}

          {transferStatus === "error" ? (
            <>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blush text-strawberry">
                <Heart className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-ink">
                You&apos;re signed in, but the pages haven&apos;t moved yet.
              </p>
              <p className="mt-2 font-body text-xs leading-relaxed text-[#7d4250]">
                {transferError ??
                  "Your original pages are safe. Please try the transfer again."}
              </p>
              <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => void retryTransfer()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-strawberry px-4 py-2 font-display text-xs font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </button>
                <Link
                  href="/account"
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white px-4 py-2 font-display text-xs font-semibold text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
                >
                  Open my account
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-3 font-hand text-base leading-tight text-ink-soft/60">
                If the guest session has expired, your edit key can still open
                the original page.
              </p>
            </>
          ) : null}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-1.5 font-hand text-base text-ink-soft/60">
        <Heart className="h-3.5 w-3.5 text-strawberry" />
        your edit keys still work too
      </div>
    </AuthShell>
  );
}
