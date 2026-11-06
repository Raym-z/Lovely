"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { TurnstileWidget } from "./TurnstileWidget";
import { Field, TextInput } from "@/components/create/fields";
import { friendlyAuthError } from "@/lib/auth-errors";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError(null);
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

    const supabase = getSupabaseBrowserClient({
      url: supabaseUrl,
      key: supabaseKey,
    });

    if (!supabase) {
      setError("Accounts are not configured right now.");
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      if (signInError) {
        setError(friendlyAuthError(signInError.message));
        setCaptchaToken(null);
        setCaptchaKey((current) => current + 1);
        return;
      }

      router.replace("/account");
    } finally {
      setLoading(false);
    }
  }

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
        <>
          New to Lovely?{" "}
          <Link
            href="/signup"
            className="font-semibold text-strawberry transition-colors hover:text-strawberry-deep"
          >
            Create an account
          </Link>
        </>
      }
    >
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

      <div className="mt-4 flex items-center justify-center gap-1.5 font-hand text-base text-ink-soft/60">
        <Heart className="h-3.5 w-3.5 text-strawberry" />
        your edit keys still work too
      </div>
    </AuthShell>
  );
}
