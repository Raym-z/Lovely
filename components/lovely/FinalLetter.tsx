"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import type { LovelyContent } from "@/content/lovely";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn } from "@/lib/cn";
import { ConfettiEffect } from "./ConfettiEffect";
import {
  FlowerShape,
  HeartShape,
  SparkleShape,
  StarShape,
} from "./Doodles";
import {
  buttonBaseClasses,
  GhostButton,
  PrimaryButton,
  SectionIntro,
  Sticker,
} from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

interface FinalState {
  letterOpened: boolean;
  accepted: boolean;
}

const initialState: FinalState = { letterOpened: false, accepted: false };

function SealButton({
  recipient,
  opening,
  onOpen,
}: {
  recipient: string;
  opening: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      disabled={opening}
      aria-label="Open the final letter"
      className="group relative block w-[min(84vw,420px)] rounded-[1.7rem] text-left outline-none disabled:cursor-default"
      initial={{ rotate: 1, opacity: 0, y: 20 }}
      animate={
        opening
          ? { rotate: 0, opacity: 1, y: 0 }
          : { rotate: 1, opacity: 1, y: [0, -8, 0] }
      }
      transition={
        opening
          ? { duration: 0.3 }
          : {
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.5 },
            }
      }
      whileHover={opening ? undefined : { rotate: -0.5, scale: 1.012 }}
      whileTap={opening ? undefined : { scale: 0.985 }}
    >
      <span
        aria-hidden="true"
        className="absolute -bottom-7 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-[100%] bg-[#c9a37c]/20 blur-xl"
      />
      <span
        className="relative block aspect-[4/3] w-full"
        style={{ perspective: 1000 }}
      >
        <span className="absolute inset-0 rounded-[1.7rem] border-2 border-white bg-[#f2dfc8] shadow-[0_34px_70px_-36px_rgba(120,86,66,0.6)]" />
        <span className="dot-grid absolute inset-0 rounded-[1.7rem] opacity-25" />
        <span className="absolute inset-x-7 top-6 h-[64%] rounded-lg bg-lavender-soft/70" />

        <span className="absolute inset-0 overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#fdf6ea] via-[#f9eddc] to-[#f0dabf] ring-1 ring-inset ring-[#e4c9ac]/60">
          <span
            className="absolute inset-0 bg-[#f6e7d3]"
            style={{
              clipPath: "polygon(0 100%, 0 34%, 50% 74%, 100% 34%, 100% 100%)",
            }}
          />
          <span
            className="absolute inset-0 bg-white/30"
            style={{
              clipPath: "polygon(0 100%, 0 64%, 50% 100%, 100% 64%, 100% 100%)",
            }}
          />
          <span className="absolute bottom-5 left-6 font-hand text-xl text-[#a97a58]">
            For {recipient},
          </span>
          <span className="absolute bottom-5 right-6 font-hand text-base text-[#b58a68]">
            with all my love
          </span>
        </span>

        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 block h-[62%]"
          style={{
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
          }}
          animate={opening ? { rotateX: -168 } : { rotateX: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <span
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 50% 100%, 100% 0)",
              background: "linear-gradient(160deg,#fbf0e1,#e3c5a3)",
            }}
          />
          <span
            className="absolute inset-0 opacity-55"
            style={{
              clipPath: "polygon(0 0, 50% 100%, 100% 0)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.65), transparent 58%)",
            }}
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 100 62"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M0 0 L50 62 L100 0"
              fill="none"
              stroke="#d8b892"
              strokeWidth="1"
              opacity="0.65"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </motion.span>

        <span className="absolute left-1/2 top-[61%] z-30 -translate-x-1/2 -translate-y-1/2">
          <motion.span
            className="wax-seal grid h-[4.4rem] w-[4.4rem] place-items-center rounded-full text-white ring-2 ring-white/50 sm:h-20 sm:w-20"
            animate={
              opening
                ? { scale: [1, 1.12, 1.5], opacity: [1, 1, 0], y: -14 }
                : { scale: [1, 1.04, 1] }
            }
            transition={
              opening
                ? { duration: 0.55, ease: "easeOut" }
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <HeartShape className="h-8 w-8" />
          </motion.span>
        </span>

        <span className="absolute -right-2 top-10 z-30 rotate-[-7deg] rounded-full bg-pink-soft px-3 py-1 font-hand text-sm text-[#a3324a] shadow-sm sm:-right-4">
          open me
        </span>

        <StarShape className="absolute -left-4 bottom-1/4 z-30 h-5 w-5 text-[#d9b679]" />
        <FlowerShape className="absolute -right-4 bottom-10 z-30 h-5 w-5 text-pink" />
      </span>
    </motion.button>
  );
}

function Celebration({
  content,
  burst,
  onReadAgain,
  onRestart,
}: {
  content: LovelyContent;
  burst: number;
  onReadAgain: () => void;
  onRestart: () => void;
}) {
  const { celebration } = content.finalLetter;

  return (
    <section className="relative flex min-h-[calc(100dvh-12rem)] flex-col items-center justify-center py-8 text-center">
      {burst > 0 ? <ConfettiEffect burst={burst} /> : null}

      <motion.span
        aria-hidden="true"
        className="absolute left-[6%] top-[14%] text-pink/80"
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeartShape className="h-8 w-8" />
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute right-[8%] top-[22%] text-lavender"
        animate={{ y: [0, 12, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <SparkleShape className="h-8 w-8" />
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute left-[12%] bottom-[18%] text-butter"
        animate={{ y: [0, -9, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <StarShape className="h-6 w-6" />
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="absolute right-[10%] bottom-[15%] text-pink"
        animate={{ y: [0, 10, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <FlowerShape className="h-7 w-7" />
      </motion.span>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="flex max-w-2xl flex-col items-center"
      >
        <Sticker tone="pink">
          <Heart className="h-3.5 w-3.5" />
          {celebration.flag}
        </Sticker>

        <div className="relative mx-auto mt-8 h-40 w-40">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <HeartShape className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 text-strawberry" />
            <StarShape className="absolute bottom-1 right-2 h-5 w-5 text-butter" />
            <SparkleShape className="absolute left-0 top-1/2 h-4 w-4 text-lavender" />
            <FlowerShape className="absolute bottom-6 left-3 h-4 w-4 text-pink" />
          </motion.span>
          <span className="absolute inset-5 rounded-full bg-pink-soft shadow-[0_18px_40px_-18px_rgba(241,91,114,0.65)]" />
          <span className="absolute inset-5 rounded-full border-2 border-dashed border-strawberry/35" />
          <div className="absolute inset-0 grid place-items-center">
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <HeartShape className="h-16 w-16 text-strawberry drop-shadow-[0_4px_8px_rgba(217,67,96,0.35)]" />
            </motion.span>
          </div>
        </div>

        <h2 className="mt-7 text-balance font-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.02em] text-ink sm:text-6xl">
          {celebration.title}
        </h2>
        <p className="mt-4 font-hand text-2xl leading-snug text-strawberry sm:text-3xl">
          {celebration.subtitle}
        </p>
        <p className="mt-4 max-w-md text-pretty font-body text-sm leading-relaxed text-ink-soft sm:text-base">
          {celebration.note}
        </p>
        <p className="mt-5 font-hand text-2xl text-ink">
          with all my love, {content.sender}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <PrimaryButton onClick={onReadAgain} icon={false}>
            Read it again
            <Heart className="h-4 w-4" />
          </PrimaryButton>
          <GhostButton onClick={onRestart} icon={false}>
            From the very beginning
          </GhostButton>
        </div>

        <p className="mt-8 font-hand text-lg text-ink-soft/60">
          p.s. you&apos;re still my favorite person.
        </p>
      </motion.div>
    </section>
  );
}

export function FinalLetter({
  content,
  onRestart,
  storageNamespace,
}: {
  content: LovelyContent;
  onRestart: () => void;
  storageNamespace: string;
}) {
  const { finalLetter } = content;
  const [state, setState] = usePersistentState<FinalState>(
    `${storageNamespace}.final.v1`,
    initialState,
  );
  const [opening, setOpening] = useState(false);
  const [thinking, setThinking] = useState(0);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function openLetter() {
    if (opening || state.letterOpened) return;
    setOpening(true);
    timer.current = window.setTimeout(() => {
      setState((previous) => ({ ...previous, letterOpened: true }));
      setOpening(false);
    }, 850);
  }

  function accept() {
    setState((previous) => ({ ...previous, accepted: true }));
    setBurst((value) => value + 1);
  }

  function handleThink() {
    if (thinking >= finalLetter.thinkingNotes.length) {
      accept();
      return;
    }
    setThinking((value) => value + 1);
  }

  function readAgain() {
    setState((previous) => ({ ...previous, accepted: false }));
    setThinking(0);
  }

  function restart() {
    setState(initialState);
    setThinking(0);
    onRestart();
  }

  if (state.accepted) {
    return (
      <Celebration
        content={content}
        burst={burst}
        onReadAgain={readAgain}
        onRestart={restart}
      />
    );
  }

  const thinkLabel =
    thinking >= finalLetter.thinkingNotes.length
      ? finalLetter.acceptAfterThinkingLabel
      : finalLetter.thinkLabel;

  return (
    <section>
      <SectionIntro
        eyebrow="Chapter Five · One Last Thing"
        title={
          <>
            There&apos;s just <span className="text-strawberry">one more</span>{" "}
            thing...
          </>
        }
        subtitle={finalLetter.subtitle}
        note={state.letterOpened ? "take your time with this one" : undefined}
        eyebrowTone="lavender"
      />

      <AnimatePresence mode="wait" initial={false}>
        {!state.letterOpened ? (
          <motion.div
            key="sealed"
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.35 }}
            className="mt-10 flex flex-col items-center justify-center"
          >
            <SealButton
              recipient={content.recipient}
              opening={opening}
              onOpen={openLetter}
            />
            <p className="mt-7 font-hand text-xl text-ink-soft/70">
              {finalLetter.tapHint}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-pink">
              <span className="h-px w-8 bg-current opacity-50" />
              <HeartShape className="h-3 w-3" />
              <span className="h-px w-8 bg-current opacity-50" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease }}
            className="mt-10"
          >
            <div className="relative mx-auto max-w-2xl">
              <span
                aria-hidden="true"
                className="tape absolute -top-4 left-1/2 z-20 h-8 w-36 -translate-x-1/2 rotate-[-2deg] rounded-[3px]"
              />
              <span className="absolute -right-3 -top-5 z-20 rotate-6 rounded-full bg-butter-soft px-3 py-1 font-hand text-sm text-[#a5771c] shadow-sm sm:-right-5">
                keep this one
              </span>

              <div className="relative overflow-hidden rounded-[2rem] border-2 border-white bg-paper shadow-lovely">
                <div className="paper-lines px-5 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-12">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Sticker tone="pink">
                      <Heart className="h-3 w-3" />
                      for {content.recipient}, always
                    </Sticker>
                    <span className="font-hand text-base text-ink-soft/60">
                      opened with love
                    </span>
                  </div>

                  <p className="mt-6 font-hand text-[1.9rem] leading-tight text-strawberry sm:text-[2.1rem]">
                    {finalLetter.salutation}
                  </p>

                  <div className="mt-2">
                    {finalLetter.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mt-4 font-hand text-[1.35rem] leading-8 text-[#5a4148] sm:text-[1.5rem] sm:leading-8"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  <div className="mt-7">
                    <p className="font-hand text-xl text-ink-soft">
                      {finalLetter.signature}
                    </p>
                    <p className="font-hand text-[2.1rem] leading-tight text-strawberry">
                      {finalLetter.signatureName || content.sender}
                    </p>
                  </div>

                  <p className="mt-5 border-t-2 border-dashed border-pink/40 pt-4 font-hand text-lg text-ink-soft/75">
                    {finalLetter.postscript}
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease }}
              className="mx-auto mt-10 max-w-xl text-center"
            >
              <Sticker tone="pink">
                <Sparkles className="h-3.5 w-3.5" />
                the important part
              </Sticker>
              <h3 className="mt-4 text-balance font-display text-[2rem] font-semibold leading-tight text-ink sm:text-4xl">
                {finalLetter.question}
              </h3>
              <p className="mt-2 font-hand text-lg text-ink-soft/75">
                no wrong answers. (there is one right answer.)
              </p>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <PrimaryButton onClick={accept}> {finalLetter.yesLabel}</PrimaryButton>
                <motion.button
                  type="button"
                  onClick={handleThink}
                  whileHover={{ rotate: -1.5, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    buttonBaseClasses,
                    "gap-2 rounded-full border-2 border-ink/10 bg-white text-ink-soft transition-colors hover:border-pink hover:text-strawberry",
                  )}
                >
                  {thinkLabel}
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {thinking > 0 ? (
                  <motion.p
                    key={Math.min(thinking, finalLetter.thinkingNotes.length)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mx-auto mt-5 max-w-md font-hand text-xl leading-snug text-strawberry"
                  >
                    {
                      finalLetter.thinkingNotes[
                        Math.min(
                          thinking - 1,
                          finalLetter.thinkingNotes.length - 1,
                        )
                      ]
                    }
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <p className="mt-8 font-hand text-lg text-ink-soft/55">
                either way, I&apos;m really glad you&apos;re here.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
