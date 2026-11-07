import { Suspense } from "react";
import type { Metadata } from "next";
import { EmailVerificationPending } from "@/components/auth/EmailVerificationPending";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import { getSupabasePublicConfig } from "@/lib/supabase-public-config";

export const metadata: Metadata = {
  title: "Verify your email — Lovely",
  description: "Confirm your email address to finish setting up your Lovely account.",
};

export default function VerifyEmailPage() {
  const supabase = getSupabasePublicConfig();

  return (
    <Suspense fallback={<LoadingScreen message="Checking your confirmation..." />}>
      <EmailVerificationPending
        supabaseUrl={supabase.url}
        supabaseKey={supabase.key}
      />
    </Suspense>
  );
}
