"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Maximize2, Sparkles, X } from "lucide-react";
import { defaultEmergencyNote } from "@/content/lovely";
import type {
  Accent,
  Coupon,
  LovelyContent,
  Memory,
} from "@/content/lovely";
import type { GiftTab } from "./steps/GiftsStep";
import {
  getLetterSection,
  type LetterSectionId,
} from "./letter-sections";
import {
  FlowerShape,
  HeartShape,
  SparkleShape,
  StarShape,
} from "@/components/lovely/Doodles";
import { MemoryPhoto } from "@/components/lovely/MemoryPhoto";
import {
  reasonCardStyles,
  reasonIconColors,
} from "@/components/lovely/gifts/ReasonCards";
import { Sticker } from "@/components/lovely/ui";
import { cn } from "@/lib/cn";
import { SecretGardenPreview } from "./SecretGardenPreview";

export type PreviewStep =
  | "basics"
  | "story"
  | "quiz"
  | "gifts"
  | "letter"
  | "review";

const stepMeta: Record<PreviewStep, { label: string; tip: string }> = {
  basics: {
    label: "Invitation",
    tip: "This is the very first thing they'll see. Lead with their name and one good line.",
  },
  story: {
    label: "Your story",
    tip: "Pick the moments only the two of you would know. The tiny details do the heavy lifting.",
  },
  quiz: {
    label: "The quiz",
    tip: "Keep the answers guessable. The fun part is the reaction, not the score.",
  },
  gifts: {
    label: "Little gifts",
    tip: "Coupons and compliments land best when they sound exactly like you.",
  },
  letter: {
    label: "The letter",
    tip: "Say the thing you keep almost saying. This is the part they'll reread.",
  },
  review: {
    label: "Final look",
    tip: "Give everything one last read, then send it off with a bow.",
  },
};

const accentBadge: Record<Accent, string> = {
  pink: "bg-pink-soft text-strawberry-deep",
  lavender: "bg-lavender-soft text-[#7b60b5]",
  butter: "bg-butter-soft text-[#a5771c]",
  mint: "bg-mint-soft text-[#3d8a6d]",
};

const couponAccents: Record<
  Accent,
  { stub: string; button: string }
> = {
  pink: {
    stub: "bg-pink-soft text-strawberry-deep",
    button: "border-strawberry/30 text-strawberry-deep",
  },
  lavender: {
    stub: "bg-lavender-soft text-[#7b60b5]",
    button: "border-[#c7b4f4]/60 text-[#7b60b5]",
  },
  butter: {
    stub: "bg-butter-soft text-[#a5771c]",
    button: "border-[#e7cf8c]/70 text-[#a5771c]",
  },
  mint: {
    stub: "bg-mint-soft text-[#3d8a6d]",
    button: "border-[#a9ddc9]/70 text-[#3d8a6d]",
  },
};

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-cream/70 px-2 py-2.5 text-center">
      <p className="font-display text-lg font-semibold leading-none text-ink">
        {value}
      </p>
      <p className="mt-1 font-body text-[0.5rem] font-bold uppercase tracking-[0.12em] text-ink-soft/60">
        {label}
      </p>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-[0.55rem] font-bold uppercase tracking-[0.18em] text-strawberry-deep">
      {children}
    </p>
  );
}

function InvitationPreview({ content }: { content: LovelyContent }) {
  return (
    <>
      <Eyebrow>for {content.recipient || "your person"}</Eyebrow>
      <h3 className="mt-2 line-clamp-3 text-balance font-display text-[1.35rem] font-semibold leading-tight text-ink">
        {content.invitation.title || "Your opening line goes here"}
      </h3>
      <p className="mt-2 line-clamp-2 font-hand text-lg leading-tight text-[#8f4557]">
        {content.invitation.subtitle}
      </p>

      <div className="relative mx-auto mt-4 aspect-[4/3] w-[72%]">
        <span className="absolute inset-0 rounded-xl bg-[#f489a1] shadow-[0_14px_24px_-14px_rgba(217,67,96,0.7)]" />
        <span
          className="absolute inset-0 bg-[#f796ac]"
          style={{
            clipPath:
              "polygon(0 100%, 0 30%, 50% 76%, 100% 30%, 100% 100%)",
          }}
        />
        <span
          className="absolute inset-x-0 top-0 h-[58%]"
          style={{
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            background: "linear-gradient(160deg,#ffd3dd,#f489a1)",
          }}
        />
        <span className="wax-seal absolute left-1/2 top-[57%] grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white ring-1 ring-white/40">
          <HeartShape className="h-4 w-4" />
        </span>
        <span className="absolute inset-x-0 bottom-2 font-hand text-sm text-white">
          For {content.recipient || "you"}
        </span>
      </div>

      <span className="mt-4 inline-flex rounded-full bg-strawberry px-4 py-2 font-display text-[0.68rem] font-semibold text-white shadow-[0_3px_0_#d94360]">
        {content.invitation.cta || "Open your surprise"}
      </span>
      <p className="mt-3 font-hand text-base leading-tight text-[#8f4557]/75">
        {content.invitation.hint}
      </p>
    </>
  );
}

function MemoryPreviewCard({
  memory,
  index,
  expanded,
}: {
  memory: Memory;
  index: number;
  expanded: boolean;
}) {
  return (
    <div className="rounded-[1.25rem] bg-white p-2.5 shadow-card">
      <div className="relative">
        <MemoryPhoto variant={memory.photo} />
        <span
          className={cn(
            "absolute -bottom-2.5 -right-2.5 z-10 grid h-8 w-8 rotate-6 place-items-center rounded-full border-2 border-white font-hand text-[0.55rem] font-bold",
            accentBadge[memory.accent],
          )}
        >
          no. {String(index + 1).padStart(2, "0")}
        </span>
        {expanded ? (
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-ink-soft">
            <X className="h-3 w-3" />
          </span>
        ) : null}
      </div>

      <div className="px-0.5 pb-0.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-body text-[0.5rem] font-bold uppercase tracking-[0.14em] text-ink-soft/65">
            {memory.date || "a day to remember"}
          </p>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 font-body text-[0.42rem] font-bold uppercase tracking-[0.1em]",
              accentBadge[memory.accent],
            )}
          >
            <Heart className="mr-1 inline h-2 w-2" strokeWidth={3} />
            {expanded ? "a good one" : "ours"}
          </span>
        </div>

        <p
          className={cn(
            "mt-1.5 font-display font-semibold leading-tight text-ink",
            expanded ? "text-lg" : "text-base",
          )}
        >
          {memory.title || "A memory"}
        </p>
        <p className="mt-1 line-clamp-2 font-hand text-[0.95rem] leading-snug text-strawberry">
          {memory.excerpt || "The line under the polaroid."}
        </p>

        {expanded ? (
          <>
            <p className="mt-2 line-clamp-4 font-body text-[0.62rem] leading-relaxed text-ink-soft">
              {memory.caption || "The full memory goes here."}
            </p>
            <div className="relative mt-2 rounded-xl border-2 border-dashed border-pink bg-blush/60 p-2.5">
              <HeartShape className="absolute -right-1.5 -top-1.5 h-4 w-4 rotate-12 text-pink" />
              <p className="line-clamp-3 font-hand text-[0.85rem] leading-snug text-[#8f4557]">
                {memory.detail || "The tiny detail goes here."}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="font-hand text-[0.72rem] text-strawberry">
                the little details matter most
              </p>
              <span className="rounded-full border-2 border-ink/10 bg-white px-2 py-1 font-body text-[0.4rem] font-bold uppercase tracking-[0.12em] text-ink-soft/70">
                close
              </span>
            </div>
          </>
        ) : (
          <p className="mt-2 flex items-center gap-1 font-body text-[0.48rem] font-semibold uppercase tracking-[0.12em] text-ink-soft/55">
            <Maximize2 className="h-2.5 w-2.5" />
            open this memory
          </p>
        )}
      </div>
    </div>
  );
}

function StoryPreview({
  content,
  activeMemoryId,
}: {
  content: LovelyContent;
  activeMemoryId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const activeIndex = content.memories.findIndex(
    (memory) => memory.id === activeMemoryId,
  );
  const index = activeIndex >= 0 ? activeIndex : 0;
  const memory = content.memories[index];

  if (!memory) {
    return (
      <>
        <Eyebrow>our story</Eyebrow>
        <h3 className="mt-2 font-display text-[1.35rem] font-semibold leading-tight text-ink">
          The little things we kept
        </h3>
        <p className="mt-3 rounded-xl bg-white/70 p-3 text-left font-body text-xs text-ink-soft/70">
          Add a memory and it will show up here.
        </p>
      </>
    );
  }

  return (
    <>
      <Eyebrow>
        our story · moment {index + 1} of {content.memories.length}
      </Eyebrow>
      <div
        className="mt-2 text-left"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
      >
        <MemoryPreviewCard memory={memory} index={index} expanded={expanded} />
        <p className="mt-2 text-center font-body text-[0.45rem] font-bold uppercase tracking-[0.14em] text-strawberry-deep/70">
          {expanded ? "move away to close" : "hover to open this memory"}
        </p>
      </div>
    </>
  );
}

function QuizPreview({
  content,
  activeQuestionId,
}: {
  content: LovelyContent;
  activeQuestionId: string | null;
}) {
  const activeIndex = content.quiz.findIndex(
    (question) => question.id === activeQuestionId,
  );
  const index = activeIndex >= 0 ? activeIndex : 0;
  const question = content.quiz[index];

  return (
    <div className="rounded-[1.35rem] border-2 border-white bg-white/90 p-4 text-left shadow-[0_18px_40px_-30px_rgba(73,52,59,0.5)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-butter-soft px-2.5 py-1 font-body text-[0.5rem] font-bold uppercase tracking-[0.1em] text-[#a5771c]">
          <Sparkles className="h-3 w-3" />
          {content.quiz.length > 0
            ? `Question ${index + 1} of ${content.quiz.length}`
            : "The quiz"}
        </span>
        <div className="flex items-center gap-1">
          {content.quiz.map((item, itemIndex) => (
            <span
              key={item.id}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                itemIndex === index ? "w-4 bg-strawberry" : "w-1.5 bg-ink/10",
              )}
            />
          ))}
        </div>
      </div>

      <h3 className="mt-4 line-clamp-3 text-balance font-display text-lg font-semibold leading-tight text-ink sm:text-xl">
        {question?.prompt || "Your first question goes here"}
      </h3>
      <p className="mt-1 font-hand text-sm text-ink-soft">
        pick the one your heart says
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {question ? (
          question.options.map((option, optionIndex) => (
            <div
              key={option.id}
              className="flex min-h-[2.6rem] items-center gap-1.5 rounded-xl border-2 border-ink/10 bg-paper px-2 py-1.5"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-ink/10 bg-white font-display text-[0.5rem] font-semibold text-ink-soft">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span className="line-clamp-2 font-body text-[0.58rem] font-semibold leading-tight text-ink">
                {option.text || "An answer option"}
              </span>
            </div>
          ))
        ) : (
          <p className="col-span-2 rounded-xl bg-cream/70 p-3 font-body text-[0.65rem] text-ink-soft/70">
            Add a question and its answers will show up here.
          </p>
        )}
      </div>

      <p className="mt-3 font-hand text-sm text-ink-soft/60">
        take your time, sweetheart
      </p>
    </div>
  );
}

function CouponPreviewTicket({ coupon }: { coupon: Coupon }) {
  const accent = couponAccents[coupon.accent];

  return (
    <div className="relative flex overflow-hidden rounded-[1.1rem] border-2 border-white bg-paper text-left shadow-[0_12px_28px_-18px_rgba(73,52,59,0.35)]">
      <div
        className={cn(
          "relative flex w-11 shrink-0 flex-col items-center justify-center gap-1 py-3",
          accent.stub,
        )}
      >
        <HeartShape className="h-4 w-4" />
        <span className="font-body text-[0.36rem] font-bold uppercase tracking-[0.14em]">
          lovely
        </span>
        <span className="font-hand text-[0.62rem] leading-none">coupon</span>
        <span className="mt-0.5 font-body text-[0.36rem] font-semibold tracking-wider opacity-70">
          {coupon.serial}
        </span>
      </div>

      <span
        aria-hidden="true"
        className="absolute inset-y-2 left-11 border-l-2 border-dashed border-ink/15"
      />
      <span
        aria-hidden="true"
        className="absolute left-11 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fdfaf6]"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-11 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#fdfaf6]"
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col p-3">
        <h4 className="line-clamp-2 font-display text-[0.8rem] font-semibold leading-tight text-ink">
          {coupon.title}
        </h4>
        <p className="mt-1 line-clamp-3 font-body text-[0.56rem] leading-relaxed text-ink-soft">
          {coupon.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-body text-[0.4rem] font-bold uppercase tracking-[0.12em] text-ink-soft/50">
            no expiry · kiss included
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full border-2 bg-white px-2 py-1 font-body text-[0.44rem] font-bold uppercase tracking-[0.08em]",
              accent.button,
            )}
          >
            Redeem
          </span>
        </div>
      </div>
    </div>
  );
}

function ReasonsPreview({ reasons }: { reasons: string[] }) {
  const [opened, setOpened] = useState<number[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const openedSet = new Set(opened);

  function toggle(index: number) {
    if (openedSet.has(index)) {
      setOpened((previous) => previous.filter((item) => item !== index));
      setHovered((current) => (current === index ? null : current));
    } else {
      setOpened((previous) => [...previous, index]);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border-2 border-white bg-white/90 p-3 text-left shadow-[0_18px_40px_-30px_rgba(73,52,59,0.5)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-pink-soft text-strawberry">
            <Heart className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[0.78rem] font-semibold leading-tight text-ink">
              Reasons Why I Love You
            </p>
            <p className="truncate font-hand text-[0.68rem] leading-tight text-ink-soft">
              a few of the many, many, many
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 font-body text-[0.42rem] font-bold uppercase tracking-[0.08em] text-ink-soft/60">
          {openedSet.size}/{reasons.length} opened
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {reasons.length === 0 ? (
          <p className="col-span-3 rounded-xl bg-cream/70 p-3 font-body text-[0.65rem] text-ink-soft/70">
            Add a reason and it will show up here.
          </p>
        ) : (
          reasons.map((reason, index) => {
            const isOpen = openedSet.has(index);
            const tone = index % reasonCardStyles.length;

            return (
              <button
                key={index}
                type="button"
                onClick={() => toggle(index)}
                onMouseEnter={() => {
                  if (openedSet.has(index)) setHovered(index);
                }}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => {
                  if (openedSet.has(index)) setHovered(index);
                }}
                onBlur={() => setHovered(null)}
                aria-expanded={isOpen}
                aria-label={
                  isOpen
                    ? `Close reason ${index + 1}`
                    : `Open reason ${index + 1}`
                }
                className={cn(
                  "relative flex min-h-[66px] flex-col items-center justify-center overflow-hidden rounded-lg border-2 p-1.5 text-center transition-colors duration-200",
                  reasonCardStyles[tone],
                )}
              >
                <HeartShape
                  className={cn(
                    "absolute -right-1 -top-1 h-3.5 w-3.5 rotate-12 opacity-30",
                    reasonIconColors[tone],
                  )}
                />

                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.span
                      key="open"
                      initial={{ opacity: 0, rotateX: 55, y: 8 }}
                      animate={{ opacity: 1, rotateX: 0, y: 0 }}
                      exit={{ opacity: 0, rotateX: -45, y: -6 }}
                      transition={{ duration: 0.28 }}
                      className="line-clamp-3 font-hand text-[0.56rem] leading-tight text-[#6d4550]"
                    >
                      {reason}
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
                      <span className="relative grid h-7 w-8 place-items-center">
                        <span
                          className={cn(
                            "absolute inset-x-0 bottom-0 h-5 rounded border-2 border-current bg-white/60",
                            reasonIconColors[tone],
                          )}
                        />
                        <span
                          className={cn(
                            "absolute inset-x-0 bottom-[10px] top-0.5 rounded border-2 border-current bg-white/85",
                            reasonIconColors[tone],
                          )}
                          style={{
                            clipPath:
                              "polygon(0 0, 50% 62%, 100% 0, 100% 100%, 0 100%)",
                          }}
                        />
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-strawberry text-white shadow-sm">
                            <HeartShape
                              style={{ width: "0.4rem", height: "0.4rem" }}
                            />
                          </span>
                        </span>
                      </span>
                      <span className="mt-1 font-display text-[0.44rem] font-semibold leading-tight text-ink">
                        Reason no. {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-hand text-[0.46rem] leading-tight text-ink-soft/65">
                        tap to open
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })
        )}
      </div>

      <p className="mt-2 text-center font-hand text-[0.66rem] leading-snug text-ink-soft/60">
        {openedSet.size === 0
          ? "each one opens with a little tap."
          : openedSet.size === reasons.length
            ? "all the reasons. and still not all of them."
            : "open whichever one you need today."}
      </p>

      <AnimatePresence>
        {hovered !== null ? (
          <motion.div
            key="reason-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[1.35rem] bg-ink/35 p-3 backdrop-blur-[1px]"
          >
            <motion.div
              initial={{ scale: 0.96, y: 4 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full rounded-xl bg-white p-3 shadow-lg"
            >
              <p className="line-clamp-8 font-hand text-[0.95rem] leading-snug text-[#6d4550]">
                {reasons[hovered]}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 font-body text-[0.42rem] font-bold uppercase tracking-[0.14em] text-ink-soft/55">
                <HeartShape className="h-2 w-2 text-strawberry" />
                reason no. {String(hovered + 1).padStart(2, "0")}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function GiftsPreview({
  content,
  activeCouponId,
  giftTab,
}: {
  content: LovelyContent;
  activeCouponId: string | null;
  giftTab: GiftTab;
}) {
  const activeIndex = content.coupons.findIndex(
    (coupon) => coupon.id === activeCouponId,
  );
  const index = activeIndex >= 0 ? activeIndex : 0;
  const coupon = content.coupons[index];

  if (giftTab === "compliments") {
    return (
      <>
        <Eyebrow>compliments · {content.compliments.length}</Eyebrow>
        <h3 className="mt-2 font-display text-[1.35rem] font-semibold leading-tight text-ink">
          A few nice things about you
        </h3>
        <div className="mt-3 space-y-2 text-left">
          {content.compliments.length === 0 ? (
            <p className="rounded-xl bg-white/70 p-3 font-body text-xs text-ink-soft/70">
              Add a compliment and it will show up here.
            </p>
          ) : (
            content.compliments.slice(0, 3).map((compliment, complimentIndex) => (
              <p
                key={complimentIndex}
                className="line-clamp-3 rounded-xl bg-white/80 px-3 py-2 font-hand text-[0.92rem] leading-snug text-strawberry-deep"
              >
                &ldquo;{compliment}&rdquo;
              </p>
            ))
          )}
        </div>
      </>
    );
  }

  if (giftTab === "reasons") {
    return <ReasonsPreview reasons={content.reasons} />;
  }

  if (giftTab === "secrets") {
    return <SecretGardenPreview messages={content.secretMessages} />;
  }

  if (giftTab === "note") {
    const note = content.emergencyNote ?? defaultEmergencyNote;

    return (
      <>
        <Eyebrow>emergency love note</Eyebrow>
        <h3 className="mt-2 font-display text-[1.35rem] font-semibold leading-tight text-ink">
          For the days you need it
        </h3>
        <div className="mt-3 rounded-xl border-2 border-dashed border-[#e7cf8c] bg-white/70 p-3 text-left">
          <p className="font-hand text-[0.95rem] leading-snug text-[#7a5a1f]">
            {note || "Write a note for the hard days..."}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-hand text-sm text-[#a5771c]/80">
            keep this one in your pocket
          </span>
          <HeartShape className="h-4 w-4 shrink-0 text-[#c29427]" />
        </div>
      </>
    );
  }

  return (
    <>
      <Eyebrow>
        {content.coupons.length > 0
          ? `coupon ${index + 1} of ${content.coupons.length}`
          : "a few little gifts"}
      </Eyebrow>
      <h3 className="mt-2 font-display text-[1.35rem] font-semibold leading-tight text-ink">
        Redeemable, always
      </h3>

      <div className="mt-3">
        {coupon ? (
          <CouponPreviewTicket coupon={coupon} />
        ) : (
          <p className="rounded-xl bg-white/70 p-3 font-body text-xs text-ink-soft/70">
            Add a coupon and it will show up here.
          </p>
        )}
      </div>
    </>
  );
}

function ChapterLetterPreview({ content }: { content: LovelyContent }) {
  const { finalLetter } = content;

  return (
    <div className="flex flex-col items-center text-center">
      <Eyebrow>{finalLetter.eyebrow || "one last thing"}</Eyebrow>
      <h3 className="mt-1.5 line-clamp-2 text-balance font-display text-[1.3rem] font-semibold leading-tight text-ink">
        {finalLetter.title || "There's just one more thing..."}
      </h3>
      <p className="mt-1 line-clamp-2 font-body text-[0.62rem] leading-relaxed text-ink-soft">
        {finalLetter.subtitle || "The copy around the sealed letter."}
      </p>

      <div className="relative mx-auto mt-3 aspect-[5/3.3] w-[86%]">
        <span className="absolute inset-0 rounded-xl border-2 border-white bg-[#f2dfc8] shadow-[0_14px_26px_-16px_rgba(120,86,66,0.65)]" />
        <span className="dot-grid absolute inset-0 rounded-xl opacity-25" />
        <span className="absolute inset-x-4 top-3 h-[64%] rounded-md bg-lavender-soft/70" />
        <span className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#fdf6ea] via-[#f9eddc] to-[#f0dabf] ring-1 ring-inset ring-[#e4c9ac]/60">
          <span
            className="absolute inset-0 bg-[#f6e7d3]"
            style={{
              clipPath:
                "polygon(0 100%, 0 34%, 50% 74%, 100% 34%, 100% 100%)",
            }}
          />
          <span
            className="absolute inset-0 bg-white/30"
            style={{
              clipPath:
                "polygon(0 100%, 0 64%, 50% 100%, 100% 64%, 100% 100%)",
            }}
          />
          <span className="absolute bottom-2 left-3 font-hand text-[0.7rem] text-[#a97a58]">
            For {content.recipient},
          </span>
          <span className="absolute bottom-2 right-3 font-hand text-[0.55rem] text-[#b58a68]">
            with all my love
          </span>
        </span>
        <span
          className="absolute inset-x-0 top-0 h-[62%]"
          style={{
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            background: "linear-gradient(160deg,#fbf0e1,#e3c5a3)",
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
        <span className="wax-seal absolute left-1/2 top-[61%] grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white ring-1 ring-white/50">
          <HeartShape className="h-4 w-4" />
        </span>
        <span className="absolute -right-1 top-2 rotate-[-7deg] rounded-full bg-pink-soft px-2 py-0.5 font-hand text-[0.55rem] text-[#a3324a] shadow-sm">
          open me
        </span>
        <StarShape className="absolute -left-2 bottom-1/4 h-3 w-3 text-[#d9b679]" />
        <FlowerShape className="absolute -right-2 bottom-5 h-3 w-3 text-pink" />
      </div>

      <p className="mt-2 font-hand text-sm text-ink-soft/70">
        {finalLetter.tapHint || "Tap the seal when you're ready."}
      </p>
    </div>
  );
}

function FullLetterPanel({
  content,
  onClose,
}: {
  content: LovelyContent;
  onClose: () => void;
}) {
  const { finalLetter } = content;
  const signatureName = finalLetter.signatureName.trim();

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close full letter"
        onClick={onClose}
        className="pointer-events-auto absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="The full letter"
        className="pointer-events-auto relative z-10 flex max-h-[86dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-2 border-white bg-paper shadow-[0_40px_100px_-40px_rgba(73,52,59,0.65)] sm:rounded-[2rem]"
      >
        <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-pink/30 bg-cream/70 px-5 py-3">
          <Sticker tone="pink">
            <HeartShape className="h-3 w-3" />
            the full letter
          </Sticker>
          <span className="hidden font-hand text-base text-ink-soft/60 sm:block">
            read at your own pace
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close full letter"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-white bg-white/90 text-ink-soft shadow-sm transition-colors hover:text-strawberry"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="paper-lines overflow-y-auto px-5 pb-7 pt-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-pink-soft bg-blush px-2.5 py-1 font-body text-[0.55rem] font-bold uppercase tracking-[0.12em] text-strawberry-deep">
              <HeartShape className="h-3 w-3" />
              for {content.recipient}, always
            </span>
            <span className="font-hand text-base text-ink-soft/60">
              opened with love
            </span>
          </div>

          <p className="mt-5 font-hand text-[2rem] leading-tight text-strawberry">
            {finalLetter.salutation}
          </p>

          <div className="mt-2">
            {finalLetter.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 font-hand text-[1.35rem] leading-8 text-[#5a4148] sm:text-[1.5rem] sm:leading-8"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-6">
            <p className="font-hand text-xl text-ink-soft">
              {finalLetter.signature}
            </p>
            <p
              className={cn(
                "font-hand text-[2rem] leading-tight text-strawberry",
                !signatureName &&
                  "h-8 w-40 border-b-2 border-dashed border-pink/50",
              )}
            >
              {signatureName}
            </p>
          </div>

          {finalLetter.postscript.trim() ? (
            <p className="mt-5 border-t-2 border-dashed border-pink/40 pt-4 font-hand text-lg text-ink-soft/75">
              {finalLetter.postscript}
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function LetterPaperPreview({ content }: { content: LovelyContent }) {
  const { finalLetter } = content;
  const signatureName = finalLetter.signatureName.trim();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative text-left">
      <div className="mb-4 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="inline-flex -rotate-1 cursor-pointer items-center gap-1.5 rounded-full border-2 border-white bg-butter-soft px-2.5 py-1 font-hand text-sm text-[#a5771c] shadow-sm transition-transform hover:rotate-0 hover:scale-[1.03]"
        >
          <SparkleShape className="h-3 w-3" />
          Read the full letter ♡
        </button>
      </div>

      <div className="relative">
        <span className="tape absolute -top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rotate-[-2deg] rounded-[2px]" />
        <span className="absolute -right-1 -top-3 z-10 rotate-6 rounded-full bg-butter-soft px-2 py-0.5 font-hand text-[0.55rem] text-[#a5771c] shadow-sm">
          keep this one
        </span>

        <div className="paper-lines rounded-[1.1rem] border-2 border-white bg-paper px-3 pb-3 pt-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-pink-soft bg-blush px-1.5 py-0.5 font-body text-[0.42rem] font-bold uppercase tracking-[0.08em] text-strawberry-deep">
              <HeartShape className="h-2 w-2" />
              for {content.recipient}, always
            </span>
            <span className="font-hand text-[0.55rem] text-ink-soft/60">
              opened with love
            </span>
          </div>

          <p className="mt-2 font-hand text-[1.05rem] leading-tight text-strawberry">
            {finalLetter.salutation || "My dearest,"}
          </p>

          <div className="mt-1 space-y-1.5">
            {finalLetter.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-hand text-[0.85rem] leading-[1.4rem] text-[#5a4148]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-2">
            <p className="font-hand text-[0.72rem] text-ink-soft">
              {finalLetter.signature || "With all my love,"}
            </p>
            <p
              className={cn(
                "font-hand text-[1.05rem] leading-tight text-strawberry",
                !signatureName &&
                  "h-[1.15rem] w-20 border-b-2 border-dashed border-pink/50",
              )}
            >
              {signatureName}
            </p>
          </div>

          {finalLetter.postscript.trim() ? (
            <p className="mt-2 border-t-2 border-dashed border-pink/40 pt-1.5 font-hand text-[0.62rem] leading-snug text-ink-soft/75">
              {finalLetter.postscript}
            </p>
          ) : null}
        </div>
      </div>

      {open && typeof document !== "undefined" ? (
        <FullLetterPanel
          content={content}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

function QuestionLetterPreview({ content }: { content: LovelyContent }) {
  const { finalLetter } = content;

  return (
    <div className="flex flex-col items-center text-center">
      <span className="inline-flex items-center gap-1 rounded-full border-2 border-pink-soft bg-blush px-2 py-0.5 font-body text-[0.45rem] font-bold uppercase tracking-[0.12em] text-strawberry-deep">
        <SparkleShape className="h-2.5 w-2.5" />
        the important part
      </span>
      <h3 className="mt-2 text-balance font-display text-[1.45rem] font-semibold leading-tight text-ink">
        {finalLetter.question || "Will you be my Valentine?"}
      </h3>
      <p className="mt-1 font-hand text-sm text-ink-soft/75">
        no wrong answers. (there is one right answer.)
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-strawberry px-3 py-1.5 font-display text-[0.62rem] font-semibold text-white shadow-[0_2px_0_#d94360]">
          {finalLetter.yesLabel || "Of course! ❤️"}
        </span>
        <span className="inline-flex rounded-full border-2 border-ink/10 bg-white px-3 py-1.5 font-display text-[0.62rem] font-semibold text-ink-soft">
          {finalLetter.thinkLabel || "Let me think..."}
        </span>
      </div>

      <p className="mt-3 font-hand text-base leading-snug text-ink-soft/60">
        either way, I&apos;m really glad you&apos;re here.
      </p>
    </div>
  );
}

function CelebrationLetterPreview({ content }: { content: LovelyContent }) {
  const { celebration } = content.finalLetter;

  return (
    <div className="flex flex-col items-center text-center">
      <span className="inline-flex items-center gap-1 rounded-full border-2 border-pink-soft bg-blush px-2 py-0.5 font-body text-[0.45rem] font-bold uppercase tracking-[0.12em] text-strawberry-deep">
        <HeartShape className="h-2.5 w-2.5" />
        {celebration.flag || "She said yes"}
      </span>

      <div className="relative mt-3 h-20 w-20">
        <span className="absolute inset-0 rounded-full border-2 border-dashed border-strawberry/30" />
        <span className="absolute inset-2 rounded-full bg-pink-soft shadow-[0_10px_22px_-10px_rgba(241,91,114,0.6)]" />
        <HeartShape className="absolute inset-0 m-auto h-8 w-8 text-strawberry" />
        <StarShape className="absolute -right-1 top-1 h-4 w-4 text-butter" />
        <SparkleShape className="absolute -left-1 bottom-1 h-3.5 w-3.5 text-lavender" />
      </div>

      <h3 className="mt-3 text-balance font-display text-[1.35rem] font-semibold leading-tight text-ink">
        {celebration.title || "Happy Valentine's Day! ❤️"}
      </h3>
      <p className="mt-1 line-clamp-2 font-hand text-lg leading-snug text-strawberry">
        {celebration.subtitle}
      </p>
      <p className="mt-2 line-clamp-3 font-body text-[0.62rem] leading-relaxed text-ink-soft">
        {celebration.note}
      </p>
      <p className="mt-2 font-hand text-base text-ink">
        with all my love, {content.sender}
      </p>
    </div>
  );
}

function LetterPreview({
  content,
  activeLetterSectionId,
}: {
  content: LovelyContent;
  activeLetterSectionId: LetterSectionId;
}) {
  if (activeLetterSectionId === "letter") {
    return <LetterPaperPreview content={content} />;
  }

  if (activeLetterSectionId === "question") {
    return <QuestionLetterPreview content={content} />;
  }

  if (activeLetterSectionId === "celebration") {
    return <CelebrationLetterPreview content={content} />;
  }

  return <ChapterLetterPreview content={content} />;
}

function ReviewPreview({ content }: { content: LovelyContent }) {
  const { celebration } = content.finalLetter;

  return (
    <>
      <Eyebrow>everything is ready</Eyebrow>
      <h3 className="mt-2 text-balance font-display text-[1.35rem] font-semibold leading-tight text-ink">
        {celebration.title || "Your Lovely is ready"}
      </h3>
      <p className="mt-2 font-hand text-lg leading-tight text-[#8f4557]">
        {celebration.subtitle || content.tagline}
      </p>

      <div className="mx-auto mt-4 grid h-16 w-16 place-items-center rounded-full bg-pink-soft">
        <HeartShape className="h-8 w-8 text-strawberry" />
      </div>

      <p className="mt-3 line-clamp-3 font-body text-[0.65rem] leading-relaxed text-ink-soft">
        {celebration.note || `A little world for ${content.recipient}.`}
      </p>

      <div className="mt-3 flex justify-center gap-1.5 text-butter">
        <StarShape className="h-4 w-4" />
        <SparkleShape className="h-4 w-4" />
        <FlowerShape className="h-4 w-4 text-lavender" />
      </div>
    </>
  );
}

const previews: Record<
  Exclude<PreviewStep, "story" | "quiz" | "gifts" | "letter">,
  (props: { content: LovelyContent }) => React.ReactNode
> = {
  basics: InvitationPreview,
  review: ReviewPreview,
};

export function LivePreview({
  content,
  step,
  activeMemoryId,
  activeQuestionId,
  activeCouponId,
  activeLetterSectionId,
  giftTab,
}: {
  content: LovelyContent;
  step: PreviewStep;
  activeMemoryId: string | null;
  activeQuestionId: string | null;
  activeCouponId: string | null;
  activeLetterSectionId: LetterSectionId;
  giftTab: GiftTab;
}) {
  const meta = stepMeta[step];
  const activeLetterSection =
    step === "letter" ? getLetterSection(activeLetterSectionId) : null;
  const previewLabel = activeLetterSection?.label ?? meta.label;
  const editingLabel = activeLetterSection?.label ?? meta.label;
  const editingTip = activeLetterSection?.tip ?? meta.tip;
  const Preview =
    step === "basics" || step === "review" ? previews[step] : null;

  return (
    <div className="mx-auto w-full max-w-[20rem] space-y-4">
      <div className="rounded-[1.9rem] border-2 border-white bg-white/85 p-4 shadow-card backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <Sticker tone="pink">
            <HeartShape className="h-3 w-3" />
            Live preview
          </Sticker>
          <span className="font-body text-[0.55rem] font-bold uppercase tracking-[0.12em] text-ink-soft/60">
            {previewLabel}
          </span>
        </div>

        <div
          key={step}
          className={cn(
            "relative mt-3 overflow-hidden rounded-[1.5rem] p-5 text-center transition-colors",
            step === "letter"
              ? "bg-gradient-to-br from-cream via-[#fff5ea] to-lavender-soft/60"
              : step === "quiz" || step === "gifts"
                ? "bg-gradient-to-b from-cream via-[#fff3ea] to-pink-soft"
                : "bg-gradient-to-br from-blush via-pink-soft to-pink",
          )}
        >
          <span
            aria-hidden="true"
            className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/25 blur-xl"
          />
          {step === "story" ? (
            <StoryPreview
              content={content}
              activeMemoryId={activeMemoryId}
            />
          ) : step === "quiz" ? (
            <QuizPreview
              content={content}
              activeQuestionId={activeQuestionId}
            />
          ) : step === "gifts" ? (
            <GiftsPreview
              content={content}
              activeCouponId={activeCouponId}
              giftTab={giftTab}
            />
          ) : step === "letter" ? (
            <LetterPreview
              content={content}
              activeLetterSectionId={activeLetterSectionId}
            />
          ) : Preview ? (
            <Preview content={content} />
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <Stat value={content.memories.length} label="memories" />
          <Stat value={content.quiz.length} label="questions" />
          <Stat value={content.coupons.length} label="coupons" />
          <Stat value={content.reasons.length} label="reasons" />
        </div>
      </div>

      <div className="rounded-[1.4rem] border-2 border-dashed border-lavender bg-lavender-soft/45 p-4">
        <div className="mb-1 flex items-center gap-1.5 font-body text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[#7b60b5]">
          <SparkleShape className="h-3 w-3" />
          Editing {editingLabel}
        </div>
        <p className="font-hand text-lg leading-snug text-[#6b5195]">
          {editingTip}
        </p>
      </div>

      <Link
        href="/"
        className="flex items-center justify-between rounded-full border-2 border-pink-soft bg-white/70 px-4 py-2.5 font-body text-[0.62rem] font-bold uppercase tracking-[0.14em] text-strawberry transition-colors hover:border-pink hover:bg-blush"
      >
        Open the demo
        <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
