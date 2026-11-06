"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, Sparkles } from "lucide-react";
import type { Accent } from "@/content/lovely";
import { accentPalette } from "@/lib/accent-palette";
import { cn } from "@/lib/cn";
import { HeartShape, Squiggle } from "./Doodles";

type Tone = Accent | "white";

const accentStickerTones = Object.fromEntries(
  accentPalette.map((entry) => [entry.value, entry.sticker]),
) as Record<Accent, string>;

const accentPillTones = Object.fromEntries(
  accentPalette.map((entry) => [entry.value, entry.accentTone]),
) as Record<Accent, string>;

const stickerTones: Record<Tone, string> = {
  ...accentStickerTones,
  white: "border-white bg-white/80 text-ink-soft",
};

const accentTones: Record<Tone, string> = {
  ...accentPillTones,
  white: "bg-white text-ink-soft",
};

export function Sticker({
  children,
  tone = "white",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 font-body text-[0.66rem] font-bold uppercase tracking-[0.16em] shadow-[0_2px_0_rgba(73,52,59,0.06)]",
        stickerTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function AccentPill({
  children,
  tone = "pink",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-[0.7rem] font-semibold",
        accentTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  subtitle,
  note,
  align = "center",
  eyebrowTone = "pink",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  note?: string;
  align?: "center" | "left";
  eyebrowTone?: Tone;
}) {
  return (
    <div
      className={cn(
        "relative",
        align === "center"
          ? "mx-auto flex max-w-2xl flex-col items-center text-center"
          : "flex max-w-2xl flex-col items-start text-left",
      )}
    >
      <Sticker tone={eyebrowTone}>
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </Sticker>
      <h2 className="mt-5 text-balance font-display text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 max-w-xl text-pretty font-body text-[0.98rem] leading-relaxed text-ink-soft sm:text-lg">
          {subtitle}
        </p>
      ) : null}
      {note ? (
        <div className="mt-4 flex items-center gap-2 text-strawberry">
          <Squiggle className="hidden w-16 sm:block" />
          <p className="font-hand text-xl leading-tight sm:text-2xl">{note}</p>
          <Squiggle className="hidden w-16 rotate-180 sm:block" />
        </div>
      ) : null}
    </div>
  );
}

export const buttonBaseClasses =
  "inline-flex h-[3.25rem] items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-7 font-display text-[0.98rem] font-semibold";

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  icon = true,
  type = "button",
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: boolean;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.035, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 2 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className={cn(
        buttonBaseClasses,
        "group bg-strawberry text-white shadow-button transition-colors duration-200 hover:bg-[#f56a80] disabled:cursor-wait disabled:opacity-80",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">{children}</span>
      {icon ? (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      ) : null}
    </motion.button>
  );
}

export function GhostButton({
  children,
  onClick,
  className,
  icon = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        buttonBaseClasses,
        "group border-2 border-ink/10 bg-white/70 text-ink-soft transition-colors hover:border-pink hover:bg-white hover:text-ink",
        className,
      )}
    >
      {icon ? (
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      ) : null}
      {children}
    </button>
  );
}

export function JourneyFooter({
  onBack,
  onContinue,
  nextLabel,
  note,
  backLabel = "Back",
}: {
  onBack?: () => void;
  onContinue?: () => void;
  nextLabel?: string;
  note?: string;
  backLabel?: string;
}) {
  return (
    <div className="mt-14 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 text-pink">
        <span className="h-px w-10 bg-current opacity-50" />
        <HeartShape className="h-3.5 w-3.5" />
        <span className="h-px w-10 bg-current opacity-50" />
      </div>
      <div className="flex w-full flex-col-reverse items-center justify-center gap-3 sm:w-auto sm:flex-row">
        {onBack ? <GhostButton onClick={onBack}>{backLabel}</GhostButton> : null}
        {onContinue && nextLabel ? (
          <PrimaryButton onClick={onContinue}>{nextLabel}</PrimaryButton>
        ) : null}
      </div>
      {note ? (
        <p className="font-hand text-lg text-ink-soft/80">{note}</p>
      ) : null}
    </div>
  );
}

export function PrettyCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.8rem] border-2 border-white bg-white/80 p-5 shadow-card backdrop-blur-sm sm:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GiftPanel({
  icon,
  title,
  note,
  meta,
  children,
  className,
}: {
  icon: ReactNode;
  title: ReactNode;
  note?: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.9rem] border-2 border-white bg-white/80 p-5 shadow-card backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blush text-strawberry">
            {icon}
          </span>
          <div>
            <h3 className="font-display text-[1.25rem] font-semibold leading-tight text-ink sm:text-[1.4rem]">
              {title}
            </h3>
            {note ? (
              <p className="mt-0.5 font-hand text-lg leading-tight text-ink-soft">
                {note}
              </p>
            ) : null}
          </div>
        </div>
        {meta ? (
          <span className="rounded-full bg-cream px-2.5 py-1 font-body text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ink-soft/65">
            {meta}
          </span>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}