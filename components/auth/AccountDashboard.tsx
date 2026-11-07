"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ExternalLink,
  Heart,
  LogOut,
  Mail,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useGuestSession } from "./GuestSessionProvider";
import { HeartShape, Squiggle } from "@/components/lovely/Doodles";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import { Sticker } from "@/components/lovely/ui";
import {
  clearCreateDraft,
  readCreateDraftSummary,
  type CreateDraftSummary,
} from "@/lib/create-draft";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type OwnedPage = {
  uid: string;
  recipient: string;
  tagline: string;
  title: string;
  updatedAt: string;
};

export function AccountDashboard({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const router = useRouter();
  const { session, user, isAnonymous, status, error: authError } =
    useGuestSession();
  const [pages, setPages] = useState<OwnedPage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [draft, setDraft] = useState<CreateDraftSummary | null>(() =>
    readCreateDraftSummary(),
  );

  function discardDraft() {
    if (!window.confirm("Discard the unfinished draft saved in this browser?")) {
      return;
    }
    clearCreateDraft();
    setDraft(null);
  }

  useEffect(() => {
    if (status !== "ready" || !user) return;
    const token = session?.access_token;
    if (!token) return;

    let active = true;

    fetch("/api/account/pages", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as {
          pages?: OwnedPage[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Could not load your Lovely pages.");
        }
        if (active) {
          setPages(data.pages ?? []);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your Lovely pages.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [refreshKey, session?.access_token, status, user]);

  useEffect(() => {
    if (status === "ready" && !user) {
      router.replace("/login");
    }
  }, [router, status, user]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const supabase = getSupabaseBrowserClient({
        url: supabaseUrl,
        key: supabaseKey,
      });
      await supabase?.auth.signOut();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  function retry() {
    setPages(null);
    setError(null);
    setDeleteError(null);
    setRefreshKey((current) => current + 1);
  }

  async function deletePage(page: OwnedPage) {
    if (deletingUid) return;

    const confirmed = window.confirm(
      `Delete "${page.title || "this Lovely"}"? This removes the page and its public link permanently. The edit key will stop working. This cannot be undone.`,
    );
    if (!confirmed) return;

    const token = session?.access_token;
    if (!token) {
      setDeleteError("Your session has expired. Log in again to delete a page.");
      return;
    }

    setDeletingUid(page.uid);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/account/pages/${page.uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete this Lovely.");
      }

      setPages((current) =>
        current ? current.filter((item) => item.uid !== page.uid) : current,
      );
    } catch (deleteFailure) {
      setDeleteError(
        deleteFailure instanceof Error
          ? deleteFailure.message
          : "Could not delete this Lovely right now.",
      );
    } finally {
      setDeletingUid(null);
    }
  }

  if (status === "loading") {
    return <LoadingScreen message="Opening your Lovely account..." />;
  }

  if (status === "unavailable" || status === "error") {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-pink-soft text-strawberry">
          <HeartShape className="h-8 w-8" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink">
          Accounts are taking a little nap.
        </h1>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-ink-soft">
          {authError ?? "We could not reach the account service right now."}
        </p>
        <Link
          href="/create"
          className="mt-6 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button"
        >
          Back to the creator
        </Link>
      </div>
    );
  }

  if (!user) {
    return <LoadingScreen message="Taking you to login..." />;
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-pink/20 blur-3xl" />
        <div className="absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-lavender/25 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/60 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-strawberry text-white shadow-[0_3px_0_#d94360]">
              <HeartShape className="h-4 w-4" />
            </span>
            <span className="font-display text-[1.3rem] font-semibold leading-none tracking-tight text-ink">
              lovely<span className="text-strawberry">.</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white/70 px-3.5 py-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-pink hover:text-strawberry disabled:opacity-60"
          >
            <LogOut className="h-3 w-3" />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Sticker tone="pink">
              <Sparkles className="h-3.5 w-3.5" />
              Your Lovely account
            </Sticker>
            <h1 className="mt-4 text-balance font-display text-[2.1rem] font-semibold leading-[1.08] text-ink sm:text-4xl">
              Every little world,{" "}
              <span className="text-strawberry">in one place.</span>
            </h1>
            <p className="mt-2 max-w-lg font-body text-sm leading-relaxed text-ink-soft">
              Open, edit, and revisit the Lovely pages tied to{" "}
              <span className="font-semibold text-ink">
                {user.email ?? "your account"}
              </span>
              .
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-strawberry px-5 py-2.5 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
          >
            Create another
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto mt-4 flex items-center justify-start gap-2 text-pink">
          <Squiggle className="w-16" />
          <HeartShape className="h-3 w-3" />
          <Squiggle className="w-16 rotate-180" />
        </div>

        {isAnonymous ? (
          <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border-2 border-dashed border-pink bg-blush/50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-sm font-semibold text-ink">
                You&apos;re browsing with a guest session.
              </p>
              <p className="mt-1 font-hand text-base leading-tight text-[#8f4557]">
                Create an account to keep these pages and future photos with you
                on every device.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-strawberry px-4 py-2 font-display text-xs font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
            >
              Create free account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}

        <div className="mt-6">
          {draft ? (
            <div className="mb-3 flex flex-col items-start justify-between gap-4 rounded-2xl border-2 border-dashed border-lavender bg-lavender-soft/45 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="font-body text-[0.52rem] font-bold uppercase tracking-[0.12em] text-[#7b60b5]">
                  Draft saved in this browser
                </p>
                <h2 className="mt-1 line-clamp-1 font-display text-lg font-semibold leading-tight text-ink">
                  {draft.recipient
                    ? `For ${draft.recipient}`
                    : `From ${draft.sender}`}
                </h2>
                <p className="mt-1 line-clamp-2 font-body text-xs leading-relaxed text-ink-soft">
                  {draft.tagline ||
                    draft.title ||
                    "Pick up where you left off."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 rounded-full bg-strawberry px-4 py-2 font-display text-xs font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
                >
                  Continue draft
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={discardDraft}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white px-3 py-2 font-body text-[0.56rem] font-bold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-strawberry hover:text-strawberry"
                >
                  Discard
                </button>
              </div>
            </div>
          ) : null}

          {pages === null && !error ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-36 animate-pulse rounded-2xl bg-white/60" />
              <div className="h-36 animate-pulse rounded-2xl bg-white/40" />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border-2 border-strawberry/25 bg-blush/60 p-5 text-center">
              <p className="font-body text-sm leading-relaxed text-[#7d4250]">
                {error}
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-3 rounded-full bg-white px-4 py-2 font-body text-[0.6rem] font-bold uppercase tracking-[0.12em] text-strawberry transition-colors hover:bg-blush"
              >
                Try again
              </button>
            </div>
          ) : null}

          {deleteError ? (
            <div className="mb-3 rounded-2xl border-2 border-strawberry/25 bg-blush/60 px-4 py-3">
              <p
                role="alert"
                className="font-body text-sm leading-relaxed text-[#7d4250]"
              >
                {deleteError}
              </p>
            </div>
          ) : null}

          {pages && pages.length === 0 && !draft ? (
            <div className="rounded-[1.8rem] border-2 border-white bg-white/80 p-8 text-center shadow-card">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-pink-soft text-strawberry">
                <Heart className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">
                Your first Lovely is waiting.
              </h2>
              <p className="mx-auto mt-2 max-w-sm font-body text-sm leading-relaxed text-ink-soft">
                Pages you create while signed in will appear here, ready to open
                or edit whenever you come back.
              </p>
              <Link
                href="/create"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-strawberry px-5 py-2.5 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
              >
                Make your first Lovely
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}

          {pages && pages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {pages.map((page) => (
                <article
                  key={page.uid}
                  className="flex flex-col rounded-2xl border-2 border-white bg-white/85 p-4 shadow-[0_18px_40px_-32px_rgba(73,52,59,0.5)] backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pink-soft text-strawberry">
                      <HeartShape className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-cream px-2 py-0.5 font-body text-[0.48rem] font-bold uppercase tracking-[0.1em] text-ink-soft/60">
                      /{page.uid}
                    </span>
                  </div>

                  <h2 className="mt-3 line-clamp-2 font-display text-lg font-semibold leading-tight text-ink">
                    {page.title || "Your Lovely"}
                  </h2>
                  <p className="mt-1 line-clamp-2 font-body text-xs leading-relaxed text-ink-soft">
                    {page.recipient
                      ? `For ${page.recipient}. ${page.tagline}`
                      : page.tagline || "A little world made with love."}
                  </p>
                  <p className="mt-2 font-hand text-sm text-ink-soft/55">
                    updated {new Date(page.updatedAt).toLocaleDateString()}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/${page.uid}`}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white px-3 py-1.5 font-body text-[0.56rem] font-bold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Link
                      href={`/create?edit=${page.uid}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-strawberry px-3 py-1.5 font-body text-[0.56rem] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#f56a80]"
                    >
                      Edit
                      <Pencil className="h-3 w-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void deletePage(page)}
                      disabled={Boolean(deletingUid)}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white px-3 py-1.5 font-body text-[0.56rem] font-bold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-strawberry hover:text-strawberry disabled:cursor-wait disabled:opacity-50"
                    >
                      {deletingUid === page.uid ? "Deleting..." : "Delete"}
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 font-hand text-base text-ink-soft/55">
          <Mail className="h-3.5 w-3.5 text-strawberry" />
          your edit keys still work from any browser
        </div>
      </main>
    </div>
  );
}
