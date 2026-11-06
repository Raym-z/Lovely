import { useId } from "react";
import { cn } from "@/lib/cn";
import { HeartShape } from "../Doodles";

export function ReasonEnvelopeIcon({
  color,
  size = "md",
}: {
  color: string;
  size?: "sm" | "md";
}) {
  const compact = size === "sm";
  const clipId = `reason-envelope-${useId().replace(/:/g, "")}`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid place-items-center",
        compact ? "h-7 w-8" : "h-12 w-14",
      )}
    >
      <svg
        viewBox="0 0 56 48"
        className={cn("h-full w-full", color)}
        fill="none"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="2" y="16" width="52" height="30" rx="7" />
          </clipPath>
        </defs>
        <rect
          x="2"
          y="16"
          width="52"
          height="30"
          rx="7"
          fill="rgba(255,255,255,0.6)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M2 16 L28 32 L54 16 Z"
          fill="rgba(255,255,255,0.85)"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          clipPath={`url(#${clipId})`}
        />
      </svg>

      <span
        className={cn(
          "absolute left-1/2 top-[66.667%] grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-strawberry text-white shadow-sm",
          compact ? "h-3.5 w-3.5" : "h-6 w-6",
        )}
      >
        <HeartShape
          style={
            compact
              ? { width: "0.4rem", height: "0.4rem" }
              : { width: "0.625rem", height: "0.625rem" }
          }
        />
      </span>
    </span>
  );
}
