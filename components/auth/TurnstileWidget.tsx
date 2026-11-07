"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

let scriptPromise: Promise<TurnstileApi> | null = null;

function getTurnstileApi() {
  if (typeof window === "undefined") return null;

  return (
    (window as unknown as { turnstile?: TurnstileApi }).turnstile ?? null
  );
}

function loadTurnstile() {
  const existingApi = getTurnstileApi();
  if (existingApi) return Promise.resolve(existingApi);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.getElementById(
      "cf-turnstile-script",
    ) as HTMLScriptElement | null;

    function handleLoad() {
      const api = getTurnstileApi();
      if (api) {
        resolve(api);
      } else {
        reject(new Error("Turnstile loaded without an API."));
      }
    }

    function handleError() {
      reject(new Error("Could not load Turnstile."));
    }

    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

export function TurnstileWidget({
  siteKey,
  onToken,
  onExpire,
  onError,
  appearance = "interaction-only",
}: {
  siteKey: string;
  onToken: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
  appearance?: "always" | "interaction-only" | "execute";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTokenRef.current = onToken;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onError, onExpire, onToken]);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;
    let api: TurnstileApi | null = null;
    let widgetId: string | null = null;

    loadTurnstile()
      .then((loaded) => {
        api = loaded;
        if (cancelled || !containerRef.current) return;

        widgetId = loaded.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "normal",
          appearance,
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onExpireRef.current(),
          "timeout-callback": () => onExpireRef.current(),
          "error-callback": () => onErrorRef.current(),
        });
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current();
      });

    return () => {
      cancelled = true;
      if (api && widgetId) {
        api.remove(widgetId);
      }
    };
  }, [appearance, siteKey]);

  return <div ref={containerRef} />;
}
