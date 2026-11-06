"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { TurnstileWidget } from "./TurnstileWidget";
import {
  createGuestSession,
  restoreSession,
} from "@/lib/guest-session";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export type GuestSessionStatus =
  | "loading"
  | "ready"
  | "unavailable"
  | "error";

type GuestSessionContextValue = {
  session: Session | null;
  user: User | null;
  userId: string | null;
  isAnonymous: boolean;
  status: GuestSessionStatus;
  error: string | null;
  retry: () => void;
};

const GuestSessionContext = createContext<GuestSessionContextValue | null>(
  null,
);

export function GuestSessionProvider({
  children,
  supabaseUrl,
  supabaseKey,
  turnstileSiteKey = "",
  autoCreateGuest = true,
}: {
  children: ReactNode;
  supabaseUrl?: string;
  supabaseKey?: string;
  turnstileSiteKey?: string;
  autoCreateGuest?: boolean;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<GuestSessionStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const creatingRef = useRef(false);

  useEffect(() => {
    let active = true;
    const config = { url: supabaseUrl, key: supabaseKey };
    const supabase = getSupabaseBrowserClient(config);
    const subscription = supabase?.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!active) return;

        if (nextSession?.user) {
          setSession(nextSession);
          setStatus("ready");
          setError(null);
          setNeedsCaptcha(false);
          setCaptchaError(null);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setStatus("ready");
        }
      },
    );

    restoreSession(config).then((result) => {
      if (!active) return;

      if (!result.ok) {
        setSession(null);
        setStatus(result.reason);
        setError(result.message);
        return;
      }

      if (result.session?.user) {
        setSession(result.session);
        setStatus("ready");
        setError(null);
        setNeedsCaptcha(false);
        setCaptchaError(null);
        return;
      }

      setSession(null);

      if (!autoCreateGuest) {
        setStatus("ready");
        setError(null);
        setNeedsCaptcha(false);
        return;
      }

      if (!turnstileSiteKey) {
        setStatus("error");
        setError(
          "Guest verification is not configured. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY.",
        );
        setNeedsCaptcha(false);
        return;
      }

      setStatus("loading");
      setError(null);
      setCaptchaError(null);
      setNeedsCaptcha(true);
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [
    attempt,
    autoCreateGuest,
    supabaseKey,
    supabaseUrl,
    turnstileSiteKey,
  ]);

  async function handleCaptchaToken(token: string) {
    if (creatingRef.current) return;
    creatingRef.current = true;
    setNeedsCaptcha(false);
    setCaptchaError(null);
    setStatus("loading");

    try {
      const result = await createGuestSession(token, {
        url: supabaseUrl,
        key: supabaseKey,
      });

      if (result.ok) {
        setSession(result.session);
        setStatus("ready");
        setError(null);
      } else {
        setSession(null);
        setStatus(result.reason);
        setError(result.message);
        setCaptchaError(result.message);
        setNeedsCaptcha(false);
        setCaptchaKey((current) => current + 1);
      }
    } finally {
      creatingRef.current = false;
    }
  }

  function handleCaptchaExpire() {
    setCaptchaKey((current) => current + 1);
    setNeedsCaptcha(true);
    setCaptchaError(null);
  }

  function handleCaptchaError() {
    setNeedsCaptcha(false);
    setCaptchaError(
      "Cloudflare verification could not load. Please try again.",
    );
    setStatus("error");
  }

  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    setCaptchaError(null);
    setNeedsCaptcha(false);
    setCaptchaKey((current) => current + 1);
    setAttempt((current) => current + 1);
  }, []);

  const user = session?.user ?? null;

  return (
    <GuestSessionContext.Provider
      value={{
        session,
        user,
        userId: user?.id ?? null,
        isAnonymous: Boolean(user?.is_anonymous),
        status,
        error,
        retry,
      }}
    >
      {children}

      {autoCreateGuest && (needsCaptcha || captchaError) ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4 sm:justify-end">
          <div className="pointer-events-auto w-full max-w-xs rounded-2xl border-2 border-white bg-white/95 p-3 shadow-lovely backdrop-blur-sm">
            <p className="font-display text-sm font-semibold text-ink">
              One tiny check
            </p>
            <p className="mt-1 font-hand text-base leading-tight text-ink-soft/75">
              This keeps new Lovely pages safe from bots.
            </p>

            {needsCaptcha ? (
              <div className="mt-2 flex justify-center">
                <TurnstileWidget
                  key={captchaKey}
                  siteKey={turnstileSiteKey}
                  onToken={handleCaptchaToken}
                  onExpire={handleCaptchaExpire}
                  onError={handleCaptchaError}
                />
              </div>
            ) : null}

            {captchaError ? (
              <div className="mt-2">
                <p
                  role="alert"
                  className="font-body text-[0.68rem] leading-relaxed text-[#7d4250]"
                >
                  {captchaError}
                </p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-2 rounded-full bg-strawberry px-3.5 py-1.5 font-body text-[0.56rem] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#f56a80]"
                >
                  Try again
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSession() {
  const context = useContext(GuestSessionContext);

  if (!context) {
    throw new Error(
      "useGuestSession must be used inside a GuestSessionProvider.",
    );
  }

  return context;
}
