"use client";

import type { LucideIcon } from "lucide-react";
import { Camera, Gift, Heart, Mail, MailOpen } from "lucide-react";
import { cn } from "@/lib/cn";

export interface JourneyStep {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const journeySteps: JourneyStep[] = [
  { label: "The Invitation", shortLabel: "Invitation", icon: Mail },
  { label: "Our Little Story", shortLabel: "Our Story", icon: Camera },
  { label: "How Well Do You Know Me?", shortLabel: "The Quiz", icon: Heart },
  { label: "A Few Little Gifts", shortLabel: "Little Gifts", icon: Gift },
  { label: "One Last Thing...", shortLabel: "One Last Thing", icon: MailOpen },
];

export function ProgressIndicator({
  current,
  max,
  onSelect,
}: {
  current: number;
  max: number;
  onSelect: (section: number) => void;
}) {
  return (
    <nav aria-label="Your journey" className="flex items-center">
      <ol className="flex items-center gap-0.5 sm:gap-1.5">
        {journeySteps.map((step, index) => {
          const isCurrent = index === current;
          const isVisited = index <= max;
          const Icon = step.icon;

          return (
            <li key={step.label} className="flex items-center">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mr-0.5 h-px w-1.5 sm:mr-1.5 sm:w-3",
                    index <= max ? "bg-pink" : "bg-ink/10",
                  )}
                />
              ) : null}
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={!isVisited}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${index + 1}. ${step.label}${isVisited ? "" : " (locked)"}`}
                title={step.label}
                className={cn(
                  "group flex items-center gap-2 rounded-full p-0.5 transition-opacity",
                  !isVisited && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full border-2 transition-all duration-300 sm:h-8 sm:w-8",
                    isCurrent
                      ? "border-strawberry bg-strawberry text-white shadow-[0_0_0_4px_rgba(241,91,114,0.14)]"
                      : isVisited
                        ? "border-pink bg-blush text-strawberry group-hover:border-strawberry"
                        : "border-ink/10 bg-white/60 text-ink/25",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                <span
                  className={cn(
                    "hidden font-body text-[0.7rem] font-semibold leading-none md:inline",
                    isCurrent
                      ? "text-ink"
                      : isVisited
                        ? "text-ink-soft"
                        : "text-ink/30",
                  )}
                >
                  {step.shortLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
