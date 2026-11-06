import type { Metadata } from "next";
import { AccountDashboard } from "@/components/auth/AccountDashboard";
import { GuestSessionProvider } from "@/components/auth/GuestSessionProvider";
import { getSupabasePublicConfig } from "@/lib/supabase-public-config";

export const metadata: Metadata = {
  title: "Your Lovely account",
  description: "Open and edit the Lovely pages you own.",
};

export default function AccountPage() {
  const supabase = getSupabasePublicConfig();

  return (
    <GuestSessionProvider
      autoCreateGuest={false}
      supabaseUrl={supabase.url}
      supabaseKey={supabase.key}
    >
      <AccountDashboard supabaseUrl={supabase.url} supabaseKey={supabase.key} />
    </GuestSessionProvider>
  );
}
