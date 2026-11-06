import Link from "next/link";
import type { ReactNode } from "react";
import {
  HeartShape,
  SparkleShape,
  Squiggle,
} from "@/components/lovely/Doodles";
import { Sticker } from "@/components/lovely/ui";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-pink/20 blur-3xl" />
        <div className="absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-lavender/25 blur-3xl" />
        <div className="absolute right-1/4 top-0 h-64 w-64 rounded-full bg-butter/20 blur-3xl" />
      </div>

      <SparkleShape className="absolute left-[12%] top-[18%] hidden h-7 w-7 text-butter sm:block" />
      <HeartShape className="absolute right-[14%] top-[28%] hidden h-8 w-8 rotate-12 text-pink sm:block" />

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-strawberry text-white shadow-[0_3px_0_#d94360]">
            <HeartShape className="h-4 w-4" />
          </span>
          <span className="font-display text-[1.6rem] font-semibold leading-none tracking-tight text-ink">
            lovely<span className="text-strawberry">.</span>
          </span>
        </Link>

        <div className="mt-7 flex flex-col items-center text-center">
          <Sticker tone="pink">
            <HeartShape className="h-3 w-3" />
            {eyebrow}
          </Sticker>
          <h1 className="mt-4 text-balance font-display text-[2rem] font-semibold leading-[1.08] text-ink sm:text-[2.35rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-sm text-pretty font-body text-sm leading-relaxed text-ink-soft">
            {description}
          </p>
          <div className="mt-3 flex items-center gap-2 text-pink">
            <Squiggle className="w-12" />
            <HeartShape className="h-2.5 w-2.5" />
            <Squiggle className="w-12 rotate-180" />
          </div>
        </div>

        <div className="mt-6 w-full rounded-[1.8rem] border-2 border-white bg-white/85 p-5 shadow-lovely backdrop-blur-sm sm:p-6">
          {children}
        </div>

        {footer ? (
          <div className="mt-5 text-center font-body text-xs text-ink-soft/75">
            {footer}
          </div>
        ) : null}
      </main>
    </div>
  );
}
