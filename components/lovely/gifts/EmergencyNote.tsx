import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { HeartShape, StarShape } from "../Doodles";

export function EmergencyNote({
  note,
  className,
}: {
  note: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[1.9rem] border-2 border-butter bg-butter-soft/65 p-5 shadow-card sm:p-6",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-2deg] rounded-[3px]"
      />
      <StarShape className="absolute -right-2 top-8 h-8 w-8 rotate-12 text-[#e7cf8c]/50" />
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/70 text-[#a5771c]">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-[1.25rem] font-semibold leading-tight text-ink">
            Emergency Love Note
          </h3>
          <p className="mt-0.5 font-hand text-lg leading-tight text-ink-soft">
            for the days you need it
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-1 items-center rounded-2xl border-2 border-dashed border-[#e7cf8c] bg-white/55 p-4">
        <p className="font-hand text-[1.3rem] leading-snug text-[#7a5a1f]">
          {note}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-hand text-base text-[#a5771c]/80">
          keep this one in your pocket
        </span>
        <HeartShape className="h-5 w-5 shrink-0 text-[#c29427]" />
      </div>
    </div>
  );
}
