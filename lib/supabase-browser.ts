"use client";

import "client-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;

export type SupabaseBrowserConfig = {
  url?: string;
  key?: string;
};

function getSupabaseUrl(override?: string) {
  return (override || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(
    /\/$/,
    "",
  );
}

function getSupabasePublicKey(override?: string) {
  return (
    override ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

export function isSupabaseBrowserConfigured(config?: SupabaseBrowserConfig) {
  return Boolean(
    getSupabaseUrl(config?.url) && getSupabasePublicKey(config?.key),
  );
}

export function getSupabaseBrowserClient(config?: SupabaseBrowserConfig) {
  if (browserClient) return browserClient;

  const url = getSupabaseUrl(config?.url);
  const key = getSupabasePublicKey(config?.key);

  if (!url || !key) {
    browserClient = null;
    return browserClient;
  }

  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}
