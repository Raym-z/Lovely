"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartHandshake, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePersistentState } from "@/lib/use-persistent-state";
import {
  FlowerShape,
  HeartShape,
  SparkleShape,
  StarShape,
} from "../Doodles";
import { GiftPanel } from "../ui";

const positions = [
  { left: "10%", top: "24%", size: 26, rotate: -12, color: "text-strawberry" },
  { left: "27%", top: "64%", size: 19, rotate: 10, color: "text-pink" },
  { left: "43%", top: "30%", size: 30, rotate: 6, color: "text-strawberry" },
  { left: "59%", top: "68%", size: 21, rotate: -8, color: "text-[#9b7fd6]" },
  { left: "76%", top: "26%", size: 27, rotate: 13, color: "text-pink" },
  { left: "90%", top: "58%", size: 18, rotate: -14, color: "text-strawberry" },
  { left: "18%", top: "84%", size: 20, rotate: 8, color: "text-[#c49a2c]" },
  { left: "51%", top: "84%", size: 24, rotate: -6, color: "text-strawberry" },
  { left: "68%", top: "46%", size: 17, rotate: 15, color: "text-pink" },
];

function getPosition(index: number) {
  return (
    positions[index] ?? {
      left: `${12 + ((index * 23) % 76)}%`,
      top: `${22 + ((index * 29) % 58)}%`,
      size: 20,
      rotate: (index % 2 === 0 ? -1 : 1) * (6 + index * 2),
      color: "text-strawberry",
    }
  );
}

export function SecretMessages({
  messages,
  className,
  storageNamespace,
}: {
  messages: string[];
  className?: string;
  storageNamespace: string;
}) {
  const [opened, setOpened] = usePersistentState<number[]>(
    `${storageNamespace}.secrets.v1`,
    [],
  );
  const [active, setActive] = useState<number | null>(null);
  const openedSet = new Set(opened);

  function reveal(index: number) {
    setActive(index);
    setOpened((previous) =>
      previous.includes(index) ? previous : [...previous, index],
    );
  }

  return (
    <GiftPanel
      icon={<HeartHandshake className="h-5 w-5" />}
      title="Secret Messages"
      note="hidden in the garden, just for you"
      meta={`${openedSet.size}/${messages.length} found`}
      className={className}
    >
      <div className="relative h-[258px] overflow-hidden rounded-2xl border-2 border-dashed border-lavender bg-gradient-to-br from-lavender-soft/55 via-blush/30 to-butter-soft/40 sm:h-[286px]">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-lavender/80"
        >
          <path
            d="M7 32 C 20 10, 34 56, 47 32 S 72 72, 93 46"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1.6 2.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <span aria-hidden="true" className="absolute left-[4%] top-[48%] text-pink/50">
          <FlowerShape className="h-5 w-5" />
        </span>
        <span aria-hidden="true" className="absolute right-[5%] top-[15%] text-butter">
          <StarShape className="h-5 w-5" />
        </span>
        <span aria-hidden="true" className="absolute left-[6%] bottom-[9%] text-lavender">
          <SparkleShape className="h-4 w-4" />
        </span>
        <span aria-hidden="true" className="absolute right-[10%] bottom-[8%] text-pink/60">
          <FlowerShape className="h-4 w-4" />
        </span>

        {messages.map((message, index) => {
          const position = getPosition(index);
          const isOpen = openedSet.has(index);

          return (
            <span
              key={`${message}-${index}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: position.left, top: position.top }}
            >
              <motion.button
                type="button"
                onClick={() => reveal(index)}
                aria-label={`Secret message ${index + 1}${isOpen ? ", found" : ""}`}
                aria-pressed={isOpen}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-full transition-colors focus-visible:bg-white/60",
                  isOpen
                    ? "text-strawberry drop-shadow-[0_3px_7px_rgba(241,91,114,0.45)]"
                    : position.color,
                )}
                animate={{
                  y: [0, -4 - (index % 3), 0],
                  rotate: [position.rotate, position.rotate + 5, position.rotate],
                }}
                transition={{
                  duration: 4 + (index % 3),
                  delay: index * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.18, rotate: 0 }}
                whileTap={{ scale: 0.88 }}
              >
                <HeartShape
                  style={{ width: position.size, height: position.size }}
                />
                {isOpen ? (
                  <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-strawberry ring-2 ring-white" />
                ) : null}
              </motion.button>
            </span>
          );
        })}

        <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-hand text-sm text-ink-soft/55">
          a little garden of things I never said out loud
        </span>
      </div>

      <div className="mt-4 min-h-[118px]">
        <AnimatePresence mode="wait">
          {active !== null ? (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl border-2 border-pink bg-blush/60 p-4 text-center sm:p-5"
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Hide secret message"
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/80 text-ink-soft transition-colors hover:text-strawberry"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.18em] text-strawberry">
                secret no. {String(active + 1).padStart(2, "0")}
              </p>
              <p className="mx-auto mt-2 max-w-lg text-pretty font-hand text-[1.4rem] leading-snug text-[#8f4557] sm:text-[1.55rem]">
                {messages[active]}
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[118px] items-center justify-center text-center font-hand text-lg text-ink-soft/65"
            >
              tap any heart to find a little secret
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-1 text-center font-hand text-lg text-ink-soft/60">
        {openedSet.size === messages.length
          ? "you found them all. there might be one more in person."
          : "some are sillier than others. that's the point."}
      </p>
    </GiftPanel>
  );
}
