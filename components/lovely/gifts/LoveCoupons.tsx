"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Accent, Coupon } from "@/content/lovely";
import { usePersistentState } from "@/lib/use-persistent-state";
import { HeartShape } from "../Doodles";
import { GiftPanel } from "../ui";

const accents: Record<
  Accent,
  { stub: string; notch: string; button: string }
> = {
  pink: {
    stub: "bg-pink-soft text-strawberry-deep",
    notch: "bg-[#fdfaf6]",
    button: "border-strawberry/30 text-strawberry-deep hover:bg-pink-soft",
  },
  lavender: {
    stub: "bg-lavender-soft text-[#7b60b5]",
    notch: "bg-[#fdfaf6]",
    button: "border-[#c7b4f4]/60 text-[#7b60b5] hover:bg-lavender-soft",
  },
  butter: {
    stub: "bg-butter-soft text-[#a5771c]",
    notch: "bg-[#fdfaf6]",
    button: "border-[#e7cf8c]/70 text-[#a5771c] hover:bg-butter-soft",
  },
  mint: {
    stub: "bg-mint-soft text-[#3d8a6d]",
    notch: "bg-[#fdfaf6]",
    button: "border-[#a9ddc9]/70 text-[#3d8a6d] hover:bg-mint-soft",
  },
};

function CouponTicket({
  coupon,
  redeemed,
  onToggle,
}: {
  coupon: Coupon;
  redeemed: boolean;
  onToggle: () => void;
}) {
  const accent = accents[coupon.accent];

  return (
    <motion.div
      layout
      className={cn(
        "relative flex overflow-hidden rounded-[1.35rem] border-2 bg-paper transition-colors duration-300",
        redeemed
          ? "border-ink/10 opacity-80"
          : "border-white shadow-[0_12px_28px_-18px_rgba(73,52,59,0.35)]",
      )}
    >
      <div
        className={cn(
          "relative flex w-[68px] shrink-0 flex-col items-center justify-center gap-1.5 py-4",
          accent.stub,
        )}
      >
        <HeartShape className="h-5 w-5" />
        <span className="font-body text-[0.45rem] font-bold uppercase tracking-[0.18em]">
          lovely
        </span>
        <span className="font-hand text-[0.78rem] leading-none">coupon</span>
        <span className="mt-1 font-body text-[0.46rem] font-semibold tracking-wider opacity-70">
          {coupon.serial}
        </span>
      </div>

      <span
        aria-hidden="true"
        className="absolute inset-y-2 left-[68px] border-l-2 border-dashed border-ink/15"
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-[68px] top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
          accent.notch,
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-0 left-[68px] h-3.5 w-3.5 -translate-x-1/2 translate-y-1/2 rounded-full",
          accent.notch,
        )}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col p-4">
        <h4 className="font-display text-[1.02rem] font-semibold leading-tight text-ink">
          {coupon.title}
        </h4>
        <p className="mt-1.5 text-pretty font-body text-[0.72rem] leading-relaxed text-ink-soft">
          {coupon.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3.5">
          <span className="font-body text-[0.52rem] font-bold uppercase tracking-[0.14em] text-ink-soft/50">
            no expiry · kiss included
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={redeemed}
            className={cn(
              "rounded-full border-2 bg-white px-3 py-1.5 font-body text-[0.62rem] font-bold uppercase tracking-[0.1em] transition-colors",
              accent.button,
            )}
          >
            {redeemed ? "Use again" : "Redeem"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {redeemed ? (
          <span className="pointer-events-none absolute inset-0 z-0 grid place-items-center">
            <motion.span
              initial={{ opacity: 0, scale: 1.7, rotate: -24 }}
              animate={{ opacity: 0.28, scale: 1, rotate: -12 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="block rounded-lg border-[3px] border-strawberry px-3 py-1 font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-strawberry"
            >
              redeemed
            </motion.span>
          </span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function LoveCoupons({
  coupons,
  className,
  storageNamespace,
}: {
  coupons: Coupon[];
  className?: string;
  storageNamespace: string;
}) {
  const [redeemed, setRedeemed] = usePersistentState<Record<string, boolean>>(
    `${storageNamespace}.coupons.v1`,
    {},
  );

  const redeemedCount = coupons.filter((coupon) => redeemed[coupon.id]).length;

  function toggle(couponId: string) {
    setRedeemed((previous) => ({
      ...previous,
      [couponId]: !previous[couponId],
    }));
  }

  return (
    <GiftPanel
      icon={<Ticket className="h-5 w-5" />}
      title="Love Coupons"
      note="tear one out whenever you need it"
      meta={`${redeemedCount}/${coupons.length} redeemed`}
      className={className}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {coupons.map((coupon) => (
          <CouponTicket
            key={coupon.id}
            coupon={coupon}
            redeemed={Boolean(redeemed[coupon.id])}
            onToggle={() => toggle(coupon.id)}
          />
        ))}
      </div>
      <p className="mt-4 text-center font-hand text-lg text-ink-soft/60">
        {redeemedCount === coupons.length
          ? "all redeemed. I owe you a very good week."
          : "good for unlimited hugs, even after the coupon is used."}
      </p>
    </GiftPanel>
  );
}
