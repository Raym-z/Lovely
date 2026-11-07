import { Suspense } from "react";
import type { Metadata } from "next";
import { EmailConfirmation } from "@/components/auth/EmailConfirmation";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import { getSupabasePublicConfig } from "@/lib/supabase-public-config";

export const metadata: Metadata = {
  title: "Confirm your email — Lovely",
  description: "Confirm your email address and finish setting up your Lovely account.",
};

export default function AuthConfirmPage() {
  const supabase = getSupabasePublicConfig();

  return (
    <Suspense fallback={<LoadingScreen message="Confirming your email..." />}>
      <EmailConfirmation
        supabaseUrl={supabase.url}
        supabaseKey={supabase.key}
      />
    </Suspense>
  );
}
