"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { HeartShape } from "../Doodles";
import { GiftPanel, PrimaryButton } from "../ui";

const bursts = [
  { left: "14%", delay: 0, color: "text-strawberry", size: 16 },
  { left: "34%", delay: 0.06, color: "text-pink", size: 12 },
  { left: "53%", delay: 0.12, color: "text-lavender", size: 15 },
  { left: "72%", delay: 0.18, color: "text-butter", size: 13 },
  { left: "87%", delay: 0.24, color: "text-strawberry", size: 11 },
];

export function ComplimentGenerator({
  compliments,
  className,
}: {
  compliments: string[];
  className?: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const [count, setCount] = useState(0);

  function giveCompliment() {
    if (compliments.length === 0) return;

    let next = Math.floor(Math.random() * compliments.length);
    if (compliments.length > 1 && next === index) {
      next = (next + 1 + Math.floor(Math.random() * (compliments.length - 1))) % compliments.length;
    }

    setIndex(next);
    setCount((value) => value + 1);
  }

  return (
    <GiftPanel
      icon={<Sparkles className="h-5 w-5" />}
      title="Random Compliments"
      note="because you deserve to hear it twice"
      meta={count > 0 ? `${count} given` : "100% true"}
      className={className}
    >
      <div className="relative flex min-h-[176px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-pink/70 bg-blush/30 p-5 text-center sm:p-6">
        <Quote className="absolute left-4 top-4 h-6 w-6 -scale-x-100 text-pink/50" />
        <HeartShape className="absolute bottom-4 right-5 h-5 w-5 rotate-12 text-pink/55" />

        <AnimatePresence mode="wait">
          {index === null ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-xs font-hand text-xl leading-snug text-ink-soft/70 sm:text-[1.35rem]"
            >
              Every compliment in here is true. Tap below and I&apos;ll prove
              it.
            </motion.p>
          ) : (
            <motion.p
              key={`${index}-${count}`}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-sm text-pretty font-hand text-[1.55rem] leading-snug text-[#8f4557] sm:text-[1.7rem]"
            >
              &ldquo;{compliments[index]}&rdquo;
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {count > 0 ? (
            <motion.div
              key={count}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {bursts.map((item, i) => (
                <motion.span
                  key={`${count}-${i}`}
                  className={cn("absolute bottom-3", item.color)}
                  style={{ left: item.left }}
                  initial={{ opacity: 0, y: 10, scale: 0.5 }}
                  animate={{ opacity: [0, 0.9, 0], y: -70, scale: 1.1 }}
                  transition={{ duration: 1, delay: item.delay, ease: "easeOut" }}
                >
                  <HeartShape style={{ width: item.size, height: item.size }} />
                </motion.span>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <PrimaryButton onClick={giveCompliment} className="px-6 py-3">
          Tell me something sweet
        </PrimaryButton>
        <p className="font-hand text-base text-ink-soft/60">
          {count === 0
            ? "no repeats back-to-back. I checked."
            : count === 1
              ? "see? told you."
              : "still true. all of them."}
        </p>
      </div>
    </GiftPanel>
  );
}
