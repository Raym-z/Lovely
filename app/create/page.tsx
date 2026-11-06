import type { Metadata } from "next";
import { GuestSessionProvider } from "@/components/auth/GuestSessionProvider";
import CreateExperience from "@/components/create/CreateExperience";
import { getSupabasePublicConfig } from "@/lib/supabase-public-config";

export const metadata: Metadata = {
  title: "Create your Lovely — A little place for love",
  description:
    "Build a personalized interactive Valentine, save it, and share it with one short link.",
};

export default function CreatePage() {
  const supabase = getSupabasePublicConfig();

  return (
    <GuestSessionProvider
      supabaseUrl={supabase.url}
      supabaseKey={supabase.key}
      turnstileSiteKey={supabase.turnstileSiteKey}
    >
      <CreateExperience />
    </GuestSessionProvider>
  );
}
