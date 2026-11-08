"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Heart, LogIn, Pencil, Sparkles } from "lucide-react";
import type { LovelyContent } from "@/content/lovely";
import { usePersistentState } from "@/lib/use-persistent-state";
import { useHydrated } from "@/lib/use-hydrated";
import { ConfettiEffect } from "./ConfettiEffect";
import { FloatingHearts } from "./FloatingHearts";
import { HeartShape, Squiggle } from "./Doodles";
import { ProgressIndicator } from "./ProgressIndicator";
import { Invitation } from "./Invitation";
import type { MemoryPhotoImage } from "./MemoryPhoto";
import { MemoryTimeline } from "./MemoryTimeline";
import { CoupleQuiz } from "./CoupleQuiz";
import { LittleGifts } from "./LittleGifts";
import { FinalLetter } from "./FinalLetter";
import { Sticker } from "./ui";

interface JourneyState {
  section: number;
  opened: boolean;
  maxSection: number;
}

const initialJourney: JourneyState = {
  section: 0,
  opened: false,
  maxSection: 0,
};

const sectionTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
};

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-cream">
      <motion.span
        className="grid h-16 w-16 place-items-center rounded-full bg-pink-soft text-strawberry shadow-lovely"
        animate={{ scale: [1, 1.09, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeartShape className="h-8 w-8" />
      </motion.span>
      <p className="font-display text-2xl font-semibold tracking-tight text-ink">
        lovely<span className="text-strawberry">.</span>
      </p>
    </div>
  );
}

function Brand({ tagline }: { tagline: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-strawberry text-white shadow-[0_3px_0_#d94360]">
        <HeartShape className="h-4 w-4" />
      </span>
      <div>
        <p className="font-display text-[1.35rem] font-semibold leading-none tracking-tight text-ink">
          lovely<span className="text-strawberry">.</span>
        </p>
        <p className="mt-0.5 hidden font-hand text-sm leading-none text-ink-soft sm:block">
          {tagline}
        </p>
      </div>
    </div>
  );
}

export default function LovelyExperience({
  content,
  storageNamespace = "lovely.demo",
  personalizeHref,
  createHref,
  imageMap = {},
}: {
  content: LovelyContent;
  storageNamespace?: string;
  personalizeHref?: string;
  createHref?: string;
  imageMap?: Record<string, MemoryPhotoImage>;
}) {
  const [journey, setJourney] = usePersistentState<JourneyState>(
    `${storageNamespace}.journey.v1`,
    initialJourney,
  );
  const hydrated = useHydrated();
  const [burst, setBurst] = useState(0);

  const section = Math.min(Math.max(journey.section, 0), 4);
  const maxSection = Math.min(Math.max(journey.maxSection, section), 4);

  useEffect(() => {
    if (!hydrated) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hydrated, section]);

  function goTo(next: number) {
    const safeSection = Math.min(Math.max(next, 0), 4);
    setJourney((previous) => ({
      ...previous,
      section: safeSection,
      maxSection: Math.max(previous.maxSection, safeSection),
    }));
  }

  function openSurprise() {
    setBurst((value) => value + 1);
    setJourney((previous) => ({
      ...previous,
      opened: true,
      section: 1,
      maxSection: Math.max(previous.maxSection, 1),
    }));
  }

  function restart() {
    setJourney(initialJourney);
  }

  if (!hydrated) return <Splash />;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-dvh flex-col overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-pink/20 blur-3xl" />
          <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-lavender/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-butter/20 blur-3xl" />
        </div>

        <FloatingHearts className="z-[1]" />

        <header className="sticky top-0 z-30 border-b border-white/60 bg-cream/80 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <Brand tagline={content.tagline} />

            <div className="flex items-center gap-3">
              {section > 0 ? (
                <ProgressIndicator
                  current={section}
                  max={maxSection}
                  onSelect={goTo}
                />
              ) : personalizeHref ? (
                <>
                  <Link
                    href={personalizeHref}
                    className="group inline-flex items-center gap-1.5 rounded-full border-2 border-pink-soft bg-white/80 px-3.5 py-1.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.16em] text-strawberry-deep shadow-[0_2px_0_rgba(73,52,59,0.06)] transition-colors hover:border-pink hover:bg-blush"
                  >
                    <Pencil className="h-3.5 w-3.5 transition-transform group-hover:-rotate-12" />
                    Personalize
                  </Link>
                  <Link
                    href="/login"
                    aria-label="Log in"
                    className="group inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white/70 px-3.5 py-1.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink-soft shadow-[0_2px_0_rgba(73,52,59,0.06)] transition-colors hover:border-pink hover:bg-white hover:text-ink"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span className="max-[380px]:hidden">Login</span>
                  </Link>
                </>
              ) : (
                <Sticker tone="pink" className="max-[360px]:hidden">
                  <Heart className="h-3 w-3" />
                  for {content.recipient}
                </Sticker>
              )}
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={sectionTransition}
              className="flex flex-1 flex-col"
            >
              {section === 0 ? (
                <Invitation content={content} onOpen={openSurprise} />
              ) : null}
              {section === 1 ? (
                <MemoryTimeline
                  content={content}
                  imageMap={imageMap}
                  onContinue={() => goTo(2)}
                  onBack={() => goTo(0)}
                />
              ) : null}
              {section === 2 ? (
                <CoupleQuiz
                  content={content}
                  onContinue={() => goTo(3)}
                  onBack={() => goTo(1)}
                  storageNamespace={storageNamespace}
                />
              ) : null}
              {section === 3 ? (
                <LittleGifts
                  content={content}
                  onContinue={() => goTo(4)}
                  onBack={() => goTo(2)}
                  storageNamespace={storageNamespace}
                />
              ) : null}
              {section === 4 ? (
                <FinalLetter
                  content={content}
                  onRestart={restart}
                  storageNamespace={storageNamespace}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-1.5 px-6 pb-7 text-center">
          <div className="flex items-center gap-2 text-pink/80">
            <Squiggle className="h-2.5 w-16" />
            <HeartShape className="h-3 w-3" />
            <Squiggle className="h-2.5 w-16 rotate-180" />
          </div>
          {createHref ? (
            <div className="mt-1 flex flex-col items-center">
              <p className="font-display text-lg font-semibold text-ink">
                Have someone in mind?
              </p>
              <p className="mt-0.5 font-body text-sm text-ink-soft">
                Make them something lovely.
              </p>
              <Link
                href={createHref}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-pink-soft bg-white/70 px-4 py-2 font-body text-[0.6rem] font-bold uppercase tracking-[0.16em] text-strawberry transition-colors hover:border-pink hover:bg-blush"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Make your own Lovely
              </Link>
              <Link
                href="/signup"
                className="mt-2 rounded-full px-4 py-1.5 font-body text-[0.58rem] font-bold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-strawberry"
              >
                Create a free account
              </Link>
            </div>
          ) : null}
        </footer>

        <ConfettiEffect burst={burst} />
      </div>
    </MotionConfig>
  );
}
