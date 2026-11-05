"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HeartShape, SparkleShape, Squiggle, StarShape } from "./Doodles";
import { PrimaryButton, Sticker } from "./ui";
import { Envelope } from "./Envelope";
import type { LovelyContent } from "@/content/lovely";

export function Invitation({
  content,
  onOpen,
}: {
  content: LovelyContent;
  onOpen: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function handleOpen() {
    if (opening) return;
    setOpening(true);
    timer.current = window.setTimeout(onOpen, 1350);
  }

  return (
    <section className="relative flex min-h-[calc(100dvh-12rem)] flex-col items-center justify-center py-4 text-center sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="flex flex-col items-center"
      >
        <Sticker tone="pink">
          <HeartShape className="h-3.5 w-3.5" />
          {content.invitation.eyebrow}
        </Sticker>

        <h1 className="mt-6 max-w-3xl text-balance font-display text-[2.65rem] font-semibold leading-[1.02] tracking-[-0.025em] text-ink sm:text-6xl lg:text-[4.6rem]">
          Someone has
          <br className="sm:hidden" /> something{" "}
          <span className="relative inline-block whitespace-nowrap text-strawberry">
            for you
            <Squiggle className="absolute -bottom-2 left-0 h-3 w-full text-strawberry/45" />
          </span>
          <span className="text-strawberry">...</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty font-body text-[0.98rem] leading-relaxed text-ink-soft sm:text-lg">
          {content.invitation.subtitle}
        </p>
      </motion.div>

      <div className="relative my-9 flex items-center justify-center sm:my-12">
        <motion.span
          aria-hidden="true"
          className="absolute -left-12 top-8 text-lavender sm:-left-20"
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <SparkleShape className="h-7 w-7 sm:h-9 sm:w-9" />
        </motion.span>
        <motion.span
          aria-hidden="true"
          className="absolute -right-10 bottom-10 text-pink sm:-right-16"
          animate={{ y: [0, 9, 0], rotate: [0, -8, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        >
          <HeartShape className="h-6 w-6 sm:h-8 sm:w-8" />
        </motion.span>
        <motion.span
          aria-hidden="true"
          className="absolute -right-4 top-0 text-butter"
          animate={{ rotate: [0, 18, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <StarShape className="h-5 w-5" />
        </motion.span>
        <Envelope
          recipient={content.recipient}
          opening={opening}
          onOpen={handleOpen}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="flex flex-col items-center"
      >
        <PrimaryButton onClick={handleOpen} disabled={opening}>
          {opening ? "Opening..." : content.invitation.cta}
        </PrimaryButton>
        <p className="mt-4 font-hand text-xl text-ink-soft">
          {content.invitation.hint}
        </p>
        <p className="mt-1.5 max-w-sm text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft/55">
          {content.invitation.note}
        </p>
        <p className="mt-6 font-hand text-lg text-strawberry">
          sealed with love, {content.sender}
        </p>
      </motion.div>
    </section>
  );
}
