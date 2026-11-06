import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSupabasePublicConfig } from "@/lib/supabase-public-config";

export const metadata: Metadata = {
  title: "Log in to Lovely",
  description: "Sign in to manage the Lovely pages you own.",
};

export default function LoginPage() {
  const supabase = getSupabasePublicConfig();

  return (
    <LoginForm
      supabaseUrl={supabase.url}
      supabaseKey={supabase.key}
      turnstileSiteKey={supabase.turnstileSiteKey}
    />
  );
}
