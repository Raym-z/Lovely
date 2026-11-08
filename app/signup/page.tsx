import { Suspense } from "react";
import type { Metadata } from "next";
import { GuestSessionProvider } from "@/components/auth/GuestSessionProvider";
import { SignupForm } from "@/components/auth/SignupForm";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import { getSupabasePublicConfig } from "@/lib/supabase-public-config";

export const metadata: Metadata = {
  title: "Create a Lovely account",
  description:
    "Create an account first, or keep a guest Lovely and its pages together under your account.",
};

export default function SignupPage() {
  const supabase = getSupabasePublicConfig();

  return (
    <GuestSessionProvider
      autoCreateGuest={false}
      supabaseUrl={supabase.url}
      supabaseKey={supabase.key}
    >
      <Suspense fallback={<LoadingScreen message="Opening account setup..." />}>
        <SignupForm
          supabaseUrl={supabase.url}
          supabaseKey={supabase.key}
          turnstileSiteKey={supabase.turnstileSiteKey}
        />
      </Suspense>
    </GuestSessionProvider>
  );
}
