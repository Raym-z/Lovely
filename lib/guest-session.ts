import "client-only";

import type { Session, User } from "@supabase/supabase-js";
import { friendlyAuthError } from "@/lib/auth-errors";
import {
  getSupabaseBrowserClient,
  type SupabaseBrowserConfig,
} from "@/lib/supabase-browser";

export type GuestSessionResult =
  | {
      ok: true;
      session: Session | null;
      user: User | null;
    }
  | {
      ok: false;
      reason: "unavailable" | "error";
      message: string;
    };

let guestCreation: Promise<GuestSessionResult> | null = null;

async function createAnonymousSession(
  config: SupabaseBrowserConfig | undefined,
  captchaToken: string,
): Promise<GuestSessionResult> {
  const supabase = getSupabaseBrowserClient(config);

  if (!supabase) {
    return {
      ok: false,
      reason: "unavailable",
      message:
        "Guest sessions are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.user) {
    return {
      ok: true,
      session: existing.session,
      user: existing.session.user,
    };
  }

  if (!captchaToken) {
    return {
      ok: false,
      reason: "error",
      message: "Complete the CAPTCHA check to start a guest session.",
    };
  }

  const { data, error } = await supabase.auth.signInAnonymously({
    options: { captchaToken },
  });

  if (error) {
    return {
      ok: false,
      reason: "error",
      message: friendlyAuthError(error.message),
    };
  }

  if (!data.session?.user) {
    return {
      ok: false,
      reason: "error",
      message: "Supabase did not return a guest session.",
    };
  }

  return { ok: true, session: data.session, user: data.session.user };
}

export function createGuestSession(
  captchaToken: string,
  config?: SupabaseBrowserConfig,
) {
  if (guestCreation) return guestCreation;

  guestCreation = createAnonymousSession(config, captchaToken)
    .catch((error: unknown) => ({
      ok: false as const,
      reason: "error" as const,
      message:
        error instanceof Error
          ? error.message
          : "Could not start a guest session.",
    }))
    .then((result) => {
      guestCreation = null;
      return result;
    });

  return guestCreation;
}

export async function restoreSession(
  config?: SupabaseBrowserConfig,
): Promise<GuestSessionResult> {
  const supabase = getSupabaseBrowserClient(config);

  if (!supabase) {
    return {
      ok: false,
      reason: "unavailable",
      message:
        "Accounts are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { ok: false, reason: "error", message: error.message };
    }

    return {
      ok: true,
      session: data.session,
      user: data.session?.user ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      reason: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not restore the current session.",
    };
  }
}


