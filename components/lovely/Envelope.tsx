"use client";

import { motion } from "framer-motion";
import { HeartShape, SparkleShape, StarShape } from "./Doodles";

const ease = [0.22, 1, 0.36, 1] as const;

export function Envelope({
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
      aria-label="Open the envelope"
      className="group relative block w-[min(78vw,380px)] rounded-[1.7rem] outline-none disabled:cursor-default"
      initial={{ rotate: -1.5 }}
      animate={
        opening
          ? { y: 0, rotate: 0 }
          : { y: [0, -9, 0], rotate: -1.5 }
      }
      transition={
        opening
          ? { duration: 0.4, ease }
          : {
              y: { duration: 5.6, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 0.7, ease },
            }
      }
      whileHover={opening ? undefined : { rotate: 1.2, scale: 1.015 }}
      whileTap={opening ? undefined : { scale: 0.985 }}
    >
      <span
        aria-hidden="true"
        className="absolute -bottom-8 left-1/2 h-8 w-[68%] -translate-x-1/2 rounded-[100%] bg-strawberry/20 blur-xl"
      />

      <span
        className="relative block aspect-[4/3] w-full"
        style={{ perspective: 1000 }}
      >
        <span className="absolute inset-0 rounded-[1.7rem] bg-[#ef7f97] shadow-[0_34px_70px_-34px_rgba(217,67,96,0.75)]" />

        <motion.span
          aria-hidden="true"
          className="absolute inset-x-[9%] top-[13%] z-10 block h-[64%] rounded-xl bg-paper p-4 text-left shadow-[0_10px_25px_rgba(73,52,59,0.18)]"
          animate={opening ? { y: "-74%", rotate: -2.5 } : { y: 0, rotate: 0 }}
          transition={{
            duration: 0.75,
            delay: opening ? 0.16 : 0,
            ease,
          }}
        >
          <span className="block font-hand text-2xl leading-none text-strawberry">
            For {recipient},
          </span>
          <span className="mt-2 block font-hand text-lg leading-tight text-ink-soft">
            with all my love...
          </span>
          <span className="mt-3 flex items-center gap-1.5 text-pink">
            <HeartShape className="h-4 w-4" />
            <HeartShape className="h-3 w-3" />
            <HeartShape className="h-4 w-4" />
          </span>
        </motion.span>

        <span className="absolute inset-0 z-20 overflow-hidden rounded-[1.7rem]">
          <span className="absolute inset-0 bg-gradient-to-br from-[#ffc7d4] via-[#ffb1c4] to-[#f489a1]" />
          <span
            className="absolute inset-0 bg-[#f796ac]"
            style={{
              clipPath: "polygon(0 100%, 0 30%, 50% 76%, 100% 30%, 100% 100%)",
            }}
          />
          <span
            className="absolute inset-0 bg-white/15"
            style={{
              clipPath: "polygon(0 100%, 0 62%, 50% 100%, 100% 62%, 100% 100%)",
            }}
          />
          <span className="absolute left-5 top-5 font-hand text-sm text-white/70">
            a little love note
          </span>
          <span className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 font-hand text-2xl text-white drop-shadow-[0_1px_2px_rgba(180,50,76,0.25)]">
            For {recipient}
            <HeartShape className="h-4 w-4 text-white" />
          </span>
        </span>

        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-30 block h-[58%]"
          style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
          animate={opening ? { rotateX: -166 } : { rotateX: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <span
            className="absolute inset-0"
            style={{
              clipPath: "polygon(0 0, 50% 100%, 100% 0)",
              background: "linear-gradient(160deg,#ffd3dd,#f489a1)",
            }}
          />
          <span
            className="absolute inset-0 opacity-60"
            style={{
              clipPath: "polygon(0 0, 50% 100%, 100% 0)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.55), transparent 58%)",
            }}
          />
        </motion.span>

        <span className="absolute left-1/2 top-[57%] z-40 -translate-x-1/2 -translate-y-1/2">
          <motion.span
            className="wax-seal grid h-16 w-16 place-items-center rounded-full text-white ring-2 ring-white/40 sm:h-[4.5rem] sm:w-[4.5rem]"
            animate={
              opening
                ? { scale: [1, 1.12, 1.45], opacity: [1, 1, 0], y: -12 }
                : { scale: [1, 1.035, 1] }
            }
            transition={
              opening
                ? { duration: 0.55, ease: "easeOut" }
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <HeartShape className="h-7 w-7 sm:h-8 sm:w-8" />
          </motion.span>
        </span>

        <motion.span
          aria-hidden="true"
          className="absolute -right-2 top-8 z-40 rotate-[-8deg] rounded-full bg-butter px-2.5 py-1 font-hand text-sm text-[#8a6219] shadow-sm sm:-right-4"
          animate={opening ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          open me
        </motion.span>

        <StarShape className="absolute -left-5 top-1/3 z-40 h-5 w-5 text-butter/90" />
        <SparkleShape className="absolute -right-5 bottom-1/3 z-40 h-4 w-4 text-lavender" />
      </span>
    </motion.button>
  );
}
