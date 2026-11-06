import { HeartShape } from "./Doodles";

export function LoadingScreen({
  message = "Fluffing the pillows and tying the ribbon...",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-cream px-6 text-center">
      <span className="grid h-16 w-16 animate-pulse place-items-center rounded-full bg-pink-soft text-strawberry shadow-lovely">
        <HeartShape className="h-8 w-8" />
      </span>
      <p className="font-display text-2xl font-semibold tracking-tight text-ink">
        lovely<span className="text-strawberry">.</span>
      </p>
      <p className="font-hand text-xl text-ink-soft">{message}</p>
    </div>
  );
}
