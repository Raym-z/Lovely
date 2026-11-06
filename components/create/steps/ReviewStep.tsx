"use client";

import type { LovelyContent } from "@/content/lovely";
import type { ValidationIssue } from "@/lib/lovely-schema";
import { Check, Heart, Sparkles } from "lucide-react";
import { HeartShape } from "@/components/lovely/Doodles";
import { EditorCard } from "../fields";

function prettyPath(path: string) {
  if (!path) return "The page";
  return path
    .replace(/\.(\d+)/g, " #$1")
    .replace(/\./g, " → ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const sections = [
  { key: "invitation", label: "Invitation" },
  { key: "memories", label: "Memories" },
  { key: "quiz", label: "Quiz" },
  { key: "coupons", label: "Coupons" },
  { key: "compliments", label: "Compliments" },
  { key: "reasons", label: "Reasons" },
  { key: "secretMessages", label: "Secrets" },
  { key: "emergencyNote", label: "Love note" },
  { key: "letter", label: "Final letter" },
] as const;

export function ReviewStep({
  content,
  issues,
}: {
  content: LovelyContent;
  issues: ValidationIssue[];
}) {
  const counts: Record<(typeof sections)[number]["key"], number> = {
    invitation: 1,
    memories: content.memories.length,
    quiz: content.quiz.length,
    coupons: content.coupons.length,
    compliments: content.compliments.length,
    reasons: content.reasons.length,
    secretMessages: content.secretMessages.length,
    emergencyNote: content.emergencyNote ? 1 : 0,
    letter: content.finalLetter.paragraphs.length,
  };

  return (
    <div className="space-y-5">
      <EditorCard
        title="One last look"
        description="Everything below is ready to be folded into a link. You can still come back and edit it afterwards."
        accent="mint"
      >
        <div className="rounded-2xl border-2 border-ink/5 bg-cream/60 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pink-soft text-strawberry">
              <HeartShape className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold leading-tight text-ink">
                For {content.recipient} · from {content.sender}
              </p>
              <p className="truncate font-hand text-lg text-ink-soft">
                {content.invitation.title}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sections.map((section) => (
              <div
                key={section.key}
                className="flex items-center gap-2 rounded-xl bg-white/75 px-2.5 py-2"
              >
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint-soft text-[#3d8a6d]">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-body text-[0.62rem] font-bold uppercase tracking-[0.08em] text-ink-soft/65">
                    {section.label}
                  </span>
                  <span className="block font-hand text-base leading-tight text-ink">
                    {counts[section.key]}{" "}
                    {section.key === "invitation"
                      ? "ready"
                      : counts[section.key] === 1
                        ? "piece"
                        : "pieces"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-dashed border-pink/60 bg-blush/35 p-4 text-center">
            <p className="font-body text-[0.55rem] font-bold uppercase tracking-[0.16em] text-strawberry">
              The question
            </p>
            <p className="mt-1 font-hand text-xl leading-snug text-[#8f4557]">
              {content.finalLetter.question}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-lavender bg-lavender-soft/40 p-4 text-center">
            <p className="font-body text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[#7b60b5]">
              After yes
            </p>
            <p className="mt-1 font-hand text-xl leading-snug text-[#6b5195]">
              {content.finalLetter.celebration.title}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-butter-soft/50 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#a5771c]" />
          <p className="text-pretty font-body text-[0.8rem] leading-relaxed text-ink-soft">
            When you save, we compress your content into a short link. Their
            journey, quiz answers, coupons, and secrets stay in their browser —
            so they can come back and keep exploring.
          </p>
        </div>
      </EditorCard>

      {issues.length > 0 ? (
        <div className="rounded-[1.5rem] border-2 border-strawberry/25 bg-blush/70 p-5">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-[#a3324a]">
            <Heart className="h-4 w-4" />
            A few things to fix first
          </div>
          <ul className="mt-3 space-y-1.5">
            {issues.map((issue, index) => (
              <li
                key={`${issue.path}-${index}`}
                className="rounded-lg bg-white/60 px-3 py-2 font-body text-xs leading-relaxed text-[#7d4250]"
              >
                <span className="font-semibold">{prettyPath(issue.path)}:</span>{" "}
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

    </div>
  );
}
