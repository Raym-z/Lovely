"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { useGuestSession } from "./GuestSessionProvider";
import { Field, TextInput } from "@/components/create/fields";
import { friendlyAuthError } from "@/lib/auth-errors";
import {
  buildAuthRedirectUrl,
  clearPasswordPending,
  clearPendingVerification,
  markPasswordPending,
  markVerificationSent,
  rememberPendingVerification,
} from "@/lib/auth-email";
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
}: {
  supabaseUrl: string;
  supabaseKey: string;
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
  const needsEmailVerification = isRegisteredUnverified(user);

  useEffect(() => {
    if (needsEmailVerification && !completing) {
      router.replace(withAuthNext("/verify-email", nextPath));
    }
  }, [completing, needsEmailVerification, nextPath, router]);

  function getClient() {
    return getSupabaseBrowserClient({ url: supabaseUrl, key: supabaseKey });
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

    const supabase = getClient();
    if (!supabase) {
      setError("Accounts are not configured right now.");
      return;
    }

    setLoading(true);

    try {
      const { error: emailUpdateError } = await supabase.auth.updateUser(
        { email: cleanedEmail },
        { emailRedirectTo: buildAuthRedirectUrl(nextPath) },
      );

      if (emailUpdateError) {
        setError(friendlyAuthError(emailUpdateError.message));
        return;
      }

      rememberPendingVerification(cleanedEmail, nextPath);
      markVerificationSent();
      markPasswordPending();

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

  if (!user) {
    return (
      <AuthShell
        eyebrow="Create an account"
        title={
          <>
            Start with a <span className="text-strawberry">Lovely first.</span>
          </>
        }
        description="Accounts are connected to the guest session that created your page. Make a Lovely, then create your account from its success screen."
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
        <div className="space-y-3 text-center">
          <Link
            href="/create"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
          >
            Make your Lovely
            <ArrowRight className="h-4 w-4" />
          </Link>
          {status === "unavailable" || status === "error" ? (
            <p className="font-body text-xs leading-relaxed text-ink-soft/70">
              Account setup is unavailable right now. Your edit keys still work.
            </p>
          ) : null}
        </div>
      </AuthShell>
    );
  }

  if (needsEmailVerification && !completing) {
    return (
      <LoadingScreen message="Taking you to verify your email..." />
    );
  }

  if (!isAnonymous && !completing) {
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
          : "We'll email you a confirmation link first. Once confirmed, you'll choose your password and your guest page comes with you."
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
            />
          </Field>
        )}

        {completing ? (
          <>
            <Field
              label="New password"
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
              />
            </Field>
          </>
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
          {loading
            ? "Saving..."
            : completing
              ? "Finish account"
              : "Send confirmation link"}
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
