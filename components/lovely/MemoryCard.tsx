"use client";

import { motion } from "framer-motion";
import { Heart, Maximize2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Accent, Memory } from "@/content/lovely";
import { MemoryPhoto } from "./MemoryPhoto";
import { Sticker } from "./ui";

const accentSticker: Record<Accent, string> = {
  pink: "bg-pink-soft text-strawberry-deep",
  lavender: "bg-lavender-soft text-[#7b60b5]",
  butter: "bg-butter-soft text-[#a5771c]",
  mint: "bg-mint-soft text-[#3d8a6d]",
};

export function MemoryCard({
  memory,
  index,
  onOpen,
}: {
  memory: Memory;
  index: number;
  onOpen: () => void;
}) {
  const tilt = index % 2 === 0 ? -1.6 : 1.6;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open memory: ${memory.title}`}
      initial={{ opacity: 0, y: 26, rotate: tilt }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      whileHover={{
        rotate: 0,
        y: -7,
        transition: { type: "spring", stiffness: 320, damping: 24 },
      }}
      whileTap={{ scale: 0.985, rotate: 0 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.05, 0.2) }}
      className="group relative block w-full max-w-md text-left"
    >
      <span
        aria-hidden="true"
        className="tape absolute -top-3.5 left-1/2 z-20 h-7 w-28 -translate-x-1/2 rotate-[-2deg] rounded-[3px]"
      />

      <span className="block rounded-[1.65rem] bg-white p-3 shadow-card transition-shadow duration-300 group-hover:shadow-lovely sm:p-3.5">
        <span className="relative block">
          <MemoryPhoto variant={memory.photo} />
          <span
            aria-hidden="true"
            className={cn(
              "absolute -bottom-3 -right-3 z-10 grid h-11 w-11 rotate-6 place-items-center rounded-full border-2 border-white font-hand text-[0.72rem] font-bold",
              accentSticker[memory.accent],
            )}
          >
            no. {String(index + 1).padStart(2, "0")}
          </span>
        </span>

        <span className="block px-1 pb-1.5 pt-4">
          <span className="flex items-center justify-between gap-3">
            <span className="font-body text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink-soft/65">
              {memory.date}
            </span>
            <Sticker tone={memory.accent} className="scale-[0.85] px-2.5 py-1">
              <Heart className="h-3 w-3" strokeWidth={2.5} />
              ours
            </Sticker>
          </span>
          <span className="mt-2 block font-display text-[1.45rem] font-semibold leading-tight text-ink">
            {memory.title}
          </span>
          <span className="mt-1 block font-hand text-lg leading-snug text-strawberry">
            {memory.excerpt}
          </span>
          <span className="mt-3.5 inline-flex items-center gap-1.5 font-body text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-soft/55 transition-colors group-hover:text-strawberry">
            <Maximize2 className="h-3 w-3" />
            Open this memory
          </span>
        </span>
      </span>
    </motion.button>
  );
}
