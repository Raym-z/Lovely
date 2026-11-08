"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { TurnstileWidget } from "./TurnstileWidget";
import { useGuestSession } from "./GuestSessionProvider";
import { Field, TextInput } from "@/components/create/fields";
import { friendlyAuthError } from "@/lib/auth-errors";
import {
  buildAuthRedirectUrl,
  clearPasswordPending,
  clearPendingVerification,
  createVerificationWatchToken,
  markVerificationSent,
  rememberPendingVerification,
} from "@/lib/auth-email";
import { rememberPendingSignupCredentials } from "@/lib/pending-signup-credentials";
import { safeAuthNext, withAuthNext } from "@/lib/auth-redirect";
import { isRegisteredUnverified } from "@/lib/auth-verification";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordError(password: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Include at least one letter and one number.";
  }
  return null;
}

export function SignupForm({
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
  const { user, isAnonymous, status } = useGuestSession();
  const completing = searchParams.get("complete") === "1";
  const nextPath = safeAuthNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const needsEmailVerification = isRegisteredUnverified(user);
  const isStandalone = !user;

  useEffect(() => {
    if (needsEmailVerification && !completing) {
      router.replace(withAuthNext("/verify-email", nextPath));
    }
  }, [completing, needsEmailVerification, nextPath, router]);

  function getClient() {
    return getSupabaseBrowserClient({ url: supabaseUrl, key: supabaseKey });
  }

  function resetCaptcha() {
    setCaptchaToken(null);
    setCaptchaKey((current) => current + 1);
  }

  function duplicateEmailMessage() {
    return "If that email can be used, a confirmation link is on its way. If you already have an account, log in instead.";
  }

  async function finishPassword(
    supabase: NonNullable<ReturnType<typeof getClient>>,
    nextPassword: string,
  ) {
    const { error: passwordUpdateError } = await supabase.auth.updateUser({
      password: nextPassword,
    });

    if (passwordUpdateError) {
      return {
        ok: false as const,
        message: friendlyAuthError(passwordUpdateError.message),
      };
    }

    clearPasswordPending();
    clearPendingVerification();
    router.replace(nextPath ?? "/account");
    return { ok: true as const };
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    const cleanedEmail = email.trim();

    if (!emailPattern.test(cleanedEmail)) {
      setError("Add a valid email address.");
      return;
    }

    const passwordIssue = passwordError(password);
    if (passwordIssue) {
      setError(passwordIssue);
      return;
    }

    if (password !== confirmPassword) {
      setError("Those passwords do not match yet.");
      return;
    }

    if (isStandalone && turnstileSiteKey && !captchaToken) {
      setError("Complete the verification check before creating your account.");
      return;
    }

    const supabase = getClient();
    if (!supabase) {
      setError("Accounts are not configured right now.");
      return;
    }

    setLoading(true);

    try {
      const watchToken = createVerificationWatchToken();

      if (isStandalone) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanedEmail,
          password,
          options: {
            emailRedirectTo: buildAuthRedirectUrl(nextPath),
            ...(captchaToken ? { captchaToken } : {}),
            ...(watchToken
              ? { data: { lovely_email_watch: watchToken } }
              : {}),
          },
        });

        resetCaptcha();

        if (signUpError) {
          const normalized = signUpError.message.toLowerCase();
          setError(
            normalized.includes("already registered") ||
              normalized.includes("already exists")
              ? duplicateEmailMessage()
              : friendlyAuthError(signUpError.message),
          );
          return;
        }

        if (!data.user) {
          setError("The account could not be created. Please try again.");
          return;
        }

        if ((data.user.identities?.length ?? 0) === 0) {
          setError(duplicateEmailMessage());
          return;
        }

        rememberPendingVerification(
          cleanedEmail,
          nextPath,
          "signup",
          watchToken
            ? { userId: data.user.id, token: watchToken }
            : undefined,
        );
        rememberPendingSignupCredentials(cleanedEmail, password);
        markVerificationSent();
        clearPasswordPending();

        if (data.session?.user?.email_confirmed_at) {
          router.replace(nextPath ?? "/account");
          return;
        }

        router.replace(withAuthNext("/verify-email", nextPath));
        return;
      }

      const { data, error: updateError } = await supabase.auth.updateUser(
        {
          email: cleanedEmail,
          password,
          ...(watchToken
            ? { data: { lovely_email_watch: watchToken } }
            : {}),
        },
        { emailRedirectTo: buildAuthRedirectUrl(nextPath) },
      );

      if (updateError) {
        setError(friendlyAuthError(updateError.message));
        return;
      }

      const watchUserId = data.user?.id ?? user?.id;
      rememberPendingVerification(
        cleanedEmail,
        nextPath,
        "email_change",
        watchUserId && watchToken
          ? { userId: watchUserId, token: watchToken }
          : undefined,
      );
      rememberPendingSignupCredentials(cleanedEmail, password);
      markVerificationSent();
      clearPasswordPending();

      router.replace(withAuthNext("/verify-email", nextPath));
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
    const passwordIssue = passwordError(password);
    if (passwordIssue) {
      setError(passwordIssue);
      return;
    }

    if (password !== confirmPassword) {
      setError("Those passwords do not match yet.");
      return;
    }

    const supabase = getClient();
    if (!supabase) {
      setError("Accounts are not configured right now.");
      return;
    }

    setLoading(true);

    try {
      const result = await finishPassword(supabase, password);
      if (!result.ok) setError(result.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <AuthShell
        eyebrow="One moment"
        title={
          <>
            Finding your <span className="text-strawberry">guest page.</span>
          </>
        }
        description="We're reconnecting your Lovely session so your pages stay with you."
      >
        <p className="text-center font-hand text-lg text-ink-soft/70">
          just a tiny moment...
        </p>
      </AuthShell>
    );
  }

  if (needsEmailVerification && !completing) {
    return (
      <LoadingScreen message="Taking you to verify your email..." />
    );
  }

  if (user && !isAnonymous && !completing) {
    return (
      <AuthShell
        eyebrow="You're already in"
        title={
          <>
            Signed in as{" "}
            <span className="text-strawberry">{user.email ?? "your account"}.</span>
          </>
        }
        description="Your Lovely pages and account settings are ready whenever you are."
      >
        <Link
          href="/account"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
        >
          Open your account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow={completing ? "Finish your account" : "Create a Lovely account"}
      title={
        completing ? (
          <>
            One last <span className="text-strawberry">little step.</span>
          </>
        ) : (
          <>
            Keep every Lovely{" "}
            <span className="text-strawberry">close to you.</span>
          </>
        )
      }
      description={
        completing
          ? "Your email is confirmed. Choose a password so you can log in from any device."
          : isAnonymous
            ? "Your guest page and all its details stay right where they are. We'll email a confirmation link, then your account is official."
            : "Create your permanent account now. You can make your first Lovely whenever you're ready."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={withAuthNext("/login", nextPath)}
            className="font-semibold text-strawberry transition-colors hover:text-strawberry-deep"
          >
            Log in
          </Link>
        </>
      }
    >
      <form
        onSubmit={completing ? handleComplete : handleRegister}
        className="space-y-4"
      >
        {completing ? null : (
          <Field label="Email address" required>
            <TextInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={320}
              required
            />
          </Field>
        )}

        <Field
          label={completing ? "New password" : "Password"}
          hint="At least 8 characters with a letter and a number."
          required
        >
          <TextInput
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Choose a password"
            maxLength={200}
            required
          />
        </Field>

        <Field label="Confirm password" required>
          <TextInput
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            placeholder="Type it once more"
            maxLength={200}
            required
          />
        </Field>

        {isStandalone && turnstileSiteKey ? (
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
                Complete the verification check to create your account.
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

        {error ? (
          <p
            role="alert"
            className="rounded-xl border-2 border-strawberry/25 bg-blush/70 px-3.5 py-2.5 font-body text-xs leading-relaxed text-[#7d4250]"
          >
            {error}
          </p>
        ) : null}

        {status === "unavailable" || status === "error" ? (
          <p className="font-body text-xs leading-relaxed text-ink-soft/70">
            Account setup is unavailable right now. Please try again later.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            loading ||
            Boolean(isStandalone && captchaError) ||
            Boolean(isStandalone && turnstileSiteKey && !captchaToken)
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80] disabled:cursor-wait disabled:opacity-70"
        >
          {loading
            ? "Saving..."
            : completing
              ? "Finish account"
              : isStandalone
                ? "Create free account"
                : "Save my Lovely"}
          {loading ? null : <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-center gap-1.5 font-hand text-base text-ink-soft/60">
        <Heart className="h-3.5 w-3.5 text-strawberry" />
        your edit key keeps working either way
      </div>
    </AuthShell>
  );
}
