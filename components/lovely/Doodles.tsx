import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

interface DoodleProps {
  className?: string;
  style?: CSSProperties;
}

export function HeartShape({ className, style }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      style={style}
    >
      <path d="M12 21.2c-.4 0-.8-.14-1.1-.42C9.35 19.4 2.5 13.18 2.5 8.6 2.5 5.5 4.9 3 7.9 3c1.62 0 3.13.72 4.1 1.94A5.28 5.28 0 0 1 16.1 3c3 0 5.4 2.5 5.4 5.6 0 4.58-6.85 10.8-8.4 12.18-.3.28-.7.42-1.1.42Z" />
    </svg>
  );
}

export function StarShape({ className, style }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      style={style}
    >
      <path d="M12 1.8c.35 0 .66.22.77.55l2.1 6.43a.82.82 0 0 0 .52.52l6.43 2.1a.82.82 0 0 1 0 1.55l-6.43 2.1a.82.82 0 0 0-.52.52l-2.1 6.43a.82.82 0 0 1-1.54 0l-2.1-6.43a.82.82 0 0 0-.52-.52l-6.43-2.1a.82.82 0 0 1 0-1.54l6.43-2.1a.82.82 0 0 0 .52-.53l2.1-6.43A.82.82 0 0 1 12 1.8Z" />
    </svg>
  );
}

export function SparkleShape({ className, style }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      style={style}
    >
      <path d="M12 2c.42 0 .78.27.9.67l1.36 4.42a3 3 0 0 0 1.95 1.95l4.42 1.36a.94.94 0 0 1 0 1.8l-4.42 1.36a3 3 0 0 0-1.95 1.95l-1.36 4.42a.94.94 0 0 1-1.8 0l-1.36-4.42a3 3 0 0 0-1.95-1.95L3.37 12.2a.94.94 0 0 1 0-1.8l4.42-1.36a3 3 0 0 0 1.95-1.95l1.36-4.42c.12-.4.48-.67.9-.67Z" />
    </svg>
  );
}

export function FlowerShape({ className, style }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      style={style}
    >
      <path d="M12 2.6a3.1 3.1 0 0 1 3.08 2.8 3.1 3.1 0 0 1 3.52 3.52A3.1 3.1 0 0 1 21.4 12a3.1 3.1 0 0 1-2.8 3.08 3.1 3.1 0 0 1-3.52 3.52A3.1 3.1 0 0 1 12 21.4a3.1 3.1 0 0 1-3.08-2.8 3.1 3.1 0 0 1-3.52-3.52A3.1 3.1 0 0 1 2.6 12a3.1 3.1 0 0 1 2.8-3.08 3.1 3.1 0 0 1 3.52-3.52A3.1 3.1 0 0 1 12 2.6Z" />
      <circle cx="12" cy="12" r="2.1" fill="rgba(255,255,255,.72)" />
    </svg>
  );
}

export function BowShape({ className, style }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
      style={style}
    >
      <path d="M11.2 10.2C9.9 7.7 7.9 6.1 5.9 6.1 3.2 6.1 1.4 8 1.4 10.5c0 2.4 1.8 4.3 4.4 4.3 2 0 4.1-1.5 5.4-3.8v2.6c0 .5.4.9.9.9s.9-.4.9-.9V11c1.3 2.3 3.4 3.8 5.4 3.8 2.6 0 4.4-1.9 4.4-4.3 0-2.5-1.8-4.4-4.5-4.4-2 0-4 1.6-5.3 4.1 0 .1-.1.1-.1 0Z" />
      <path d="M11.1 14.2c-.4 1.9-1.5 3.7-3.6 4.8a.8.8 0 1 0 .8 1.4c2.1-1.2 3.3-2.9 3.8-4.8.1-.5-.8-.8-1-.2v-1.2Zm1.8 0c.4 1.9 1.5 3.7 3.6 4.8a.8.8 0 1 1-.8 1.4c-2.1-1.2-3.3-2.9-3.8-4.8-.1-.5.8-.8 1-.2v-1.2Z" />
    </svg>
  );
}

export function Squiggle({ className, style }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 120 12"
      fill="none"
      aria-hidden="true"
      className={cn("h-3 w-24", className)}
      style={style}
    >
      <path
        d="M2 8.4c8-7 13 4 21-2.2 7.5-5.8 13.5 5 21-1.2 7.5-6.2 13.5 4.8 21-1.4 7.5-6.2 13.5 4.8 21-1.4 7.5-6.2 13.5 4.8 21-1.4"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LetterDoodle({ className, style }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      aria-hidden="true"
      className={cn("h-10 w-10", className)}
      style={style}
    >
      <rect
        x="3"
        y="7"
        width="42"
        height="29"
        rx="4"
        fill="currentColor"
        opacity=".16"
      />
      <rect
        x="3"
        y="7"
        width="42"
        height="29"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M4.5 10.5 24 24l19.5-13.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 6c0-2-1.5-3.5-3.4-3.5-1 0-1.9.5-2.6 1.2A3.6 3.6 0 0 0 29.4 2.5C27.5 2.5 26 4 26 6c0 2.6 3.4 5 6 6.6C34.6 11 38 8.6 38 6Z"
        fill="currentColor"
      />
    </svg>
  );
}
