import { cn } from "@/lib/cn";

function Balloon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 34" className={cn("h-full w-full", className)} fill="none">
      <ellipse cx="10" cy="10" rx="7" ry="9" fill="currentColor" />
      <path d="M8 18 L12 18 L10 21 Z" fill="currentColor" />
      <ellipse cx="7.5" cy="6.5" rx="2.2" ry="3" fill="white" opacity="0.45" />
      <path
        d="M10 21 C9 26 13 28 11 33"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

export function ReasonBalloons({
  color,
  size = "md",
}: {
  color: string;
  size?: "sm" | "md";
}) {
  const compact = size === "sm";

  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute rotate-[-10deg] opacity-30",
          color,
          compact
            ? "left-[5%] top-[7%] h-6 w-3.5"
            : "left-[9%] top-[11%] h-9 w-5",
        )}
      >
        <Balloon />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute rotate-[8deg] opacity-25",
          color,
          compact
            ? "right-[7%] top-[20%] h-5 w-3"
            : "right-[11%] top-[27%] h-8 w-[1.1rem]",
        )}
      >
        <Balloon />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute rotate-[-6deg] opacity-20",
          color,
          compact
            ? "bottom-[8%] left-[22%] h-5 w-3"
            : "bottom-[11%] left-[24%] h-7 w-4",
        )}
      >
        <Balloon />
      </span>
    </>
  );
}
