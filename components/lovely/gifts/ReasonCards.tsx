"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePersistentState } from "@/lib/use-persistent-state";
import { HeartShape } from "../Doodles";
import { GiftPanel } from "../ui";

const cardStyles = [
  "border-pink/70 bg-blush/55 hover:border-pink",
  "border-lavender bg-lavender-soft/55 hover:border-[#c3aef3]",
  "border-butter bg-butter-soft/55 hover:border-[#f0d58c]",
  "border-mint bg-mint-soft/55 hover:border-[#a9ddc9]",
];

const iconColors = [
  "text-strawberry",
  "text-[#8a6cc4]",
  "text-[#c29427]",
  "text-[#4f9a7c]",
];

export function ReasonCards({
  reasons,
  className,
}: {
  reasons: string[];
  className?: string;
}) {
  const [opened, setOpened] = usePersistentState<string[]>(
    "lovely.reasons.v1",
    [],
  );
  const openedSet = new Set(opened);

  function toggle(id: string) {
    setOpened((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  }

  return (
    <GiftPanel
      icon={<Heart className="h-5 w-5" />}
      title="Reasons Why I Love You"
      note="a few of the many, many, many"
      meta={`${openedSet.size}/${reasons.length} opened`}
      className={className}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {reasons.map((reason, index) => {
          const id = `reason-${index}`;
          const isOpen = openedSet.has(id);
          const tone = index % cardStyles.length;

          return (
            <motion.button
              key={id}
              type="button"
              layout
              onClick={() => toggle(id)}
              aria-expanded={isOpen}
              aria-label={
                isOpen
                  ? `Close reason ${index + 1}`
                  : `Open reason ${index + 1}`
              }
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className={cn(
                "relative flex min-h-[150px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 p-3 text-center transition-colors duration-200",
                cardStyles[tone],
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -right-1.5 -top-1.5 text-current opacity-30",
                  iconColors[tone],
                )}
              >
                <HeartShape className="h-7 w-7 rotate-12" />
              </span>

              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.span
                    key="open"
                    initial={{ opacity: 0, rotateX: 55, y: 8 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    exit={{ opacity: 0, rotateX: -45, y: -6 }}
                    transition={{ duration: 0.28 }}
                    className="flex flex-col items-center gap-2.5"
                  >
                    <span className="font-hand text-[1.12rem] leading-snug text-[#6d4550] sm:text-[1.2rem]">
                      {reason}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-body text-[0.5rem] font-bold uppercase tracking-[0.14em] text-ink-soft/55">
                      <HeartShape className="h-2.5 w-2.5 text-strawberry" />
                      reason no. {String(index + 1).padStart(2, "0")}
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="closed"
                    initial={{ opacity: 0, rotateX: -50 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: 40 }}
                    transition={{ duration: 0.28 }}
                    className="flex flex-col items-center"
                  >
                    <span className="relative grid h-12 w-14 place-items-center">
                      <span
                        className={cn(
                          "absolute inset-x-0 bottom-0 h-9 rounded-md border-2 border-current bg-white/60",
                          iconColors[tone],
                        )}
                      />
                      <span
                        className={cn(
                          "absolute inset-x-0 bottom-[18px] top-1.5 rounded-md border-2 border-current bg-white/85",
                          iconColors[tone],
                        )}
                        style={{
                          clipPath: "polygon(0 0, 50% 62%, 100% 0, 100% 100%, 0 100%)",
                        }}
                      />
                      <span className="relative mt-2.5 grid h-6 w-6 place-items-center rounded-full bg-strawberry text-white shadow-sm">
                        <HeartShape className="h-3 w-3" />
                      </span>
                    </span>
                    <span className="mt-2.5 font-display text-[0.82rem] font-semibold leading-tight text-ink">
                      Reason no. {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-0.5 font-hand text-base text-ink-soft/65">
                      tap to open
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-4 text-center font-hand text-lg text-ink-soft/60">
        {openedSet.size === 0
          ? "each one opens with a little tap."
          : openedSet.size === reasons.length
            ? "all the reasons. and still not all of them."
            : "there's no wrong order. open whichever one you need today."}
      </p>
    </GiftPanel>
  );
}
