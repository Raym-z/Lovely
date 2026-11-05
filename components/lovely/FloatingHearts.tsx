"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  BowShape,
  FlowerShape,
  HeartShape,
  SparkleShape,
  StarShape,
} from "./Doodles";

type Kind = "heart" | "star" | "sparkle" | "flower" | "bow";

interface Decoration {
  left: string;
  top: string;
  kind: Kind;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  opacity: number;
  mobile?: "hide" | "show";
}

const decorations: Decoration[] = [
  { left: "5%", top: "14%", kind: "heart", size: 22, color: "text-pink", delay: 0, duration: 7, drift: 18, rotate: -12, opacity: 0.7 },
  { left: "12%", top: "62%", kind: "sparkle", size: 18, color: "text-butter", delay: 1.2, duration: 8, drift: -12, rotate: 8, opacity: 0.85 },
  { left: "19%", top: "34%", kind: "flower", size: 17, color: "text-lavender", delay: 0.6, duration: 9, drift: 14, rotate: 6, opacity: 0.7, mobile: "hide" },
  { left: "9%", top: "86%", kind: "star", size: 14, color: "text-strawberry", delay: 2, duration: 6.5, drift: 10, rotate: -6, opacity: 0.5 },
  { left: "28%", top: "8%", kind: "sparkle", size: 13, color: "text-lavender", delay: 1.8, duration: 7.5, drift: 9, rotate: 12, opacity: 0.8, mobile: "hide" },
  { left: "34%", top: "78%", kind: "heart", size: 15, color: "text-pink", delay: 2.4, duration: 8.5, drift: -16, rotate: 10, opacity: 0.5, mobile: "hide" },
  { left: "45%", top: "6%", kind: "star", size: 12, color: "text-butter", delay: 0.9, duration: 6, drift: 8, rotate: -8, opacity: 0.7 },
  { left: "52%", top: "89%", kind: "flower", size: 19, color: "text-pink-soft", delay: 1.4, duration: 9.5, drift: 15, rotate: -4, opacity: 0.8, mobile: "hide" },
  { left: "93%", top: "34%", kind: "heart", size: 16, color: "text-strawberry", delay: 2.1, duration: 7.2, drift: -10, rotate: 14, opacity: 0.5, mobile: "hide" },
  { left: "71%", top: "58%", kind: "sparkle", size: 15, color: "text-lavender", delay: 0.3, duration: 7.8, drift: 12, rotate: -10, opacity: 0.8 },
  { left: "79%", top: "32%", kind: "bow", size: 20, color: "text-lavender", delay: 1.7, duration: 9, drift: -14, rotate: -6, opacity: 0.6, mobile: "hide" },
  { left: "88%", top: "12%", kind: "heart", size: 24, color: "text-pink", delay: 0.5, duration: 8, drift: -18, rotate: 8, opacity: 0.62 },
  { left: "92%", top: "68%", kind: "star", size: 16, color: "text-butter", delay: 2.6, duration: 6.8, drift: 10, rotate: 10, opacity: 0.75 },
  { left: "83%", top: "88%", kind: "flower", size: 16, color: "text-mint", delay: 1.1, duration: 10, drift: -12, rotate: 4, opacity: 0.75, mobile: "hide" },
  { left: "40%", top: "46%", kind: "heart", size: 12, color: "text-pink-soft", delay: 3, duration: 11, drift: 16, rotate: -14, opacity: 0.35, mobile: "hide" },
  { left: "58%", top: "38%", kind: "sparkle", size: 11, color: "text-pink", delay: 2.8, duration: 9.5, drift: -8, rotate: 6, opacity: 0.45, mobile: "hide" },
];

const shapes = {
  heart: HeartShape,
  star: StarShape,
  sparkle: SparkleShape,
  flower: FlowerShape,
  bow: BowShape,
};

export function FloatingHearts({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      {decorations.map((item, index) => {
        const Shape = shapes[item.kind];
        return (
          <motion.span
            key={`${item.left}-${item.top}-${index}`}
            className={cn(
              "absolute",
              item.color,
              item.mobile === "hide" && "hidden sm:block",
            )}
            style={{
              left: item.left,
              top: item.top,
              opacity: item.opacity,
            }}
            animate={{
              y: [0, -16, 0],
              x: [0, item.drift, 0],
              rotate: [item.rotate, item.rotate + 7, item.rotate],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Shape style={{ width: item.size, height: item.size }} />
          </motion.span>
        );
      })}
    </div>
  );
}
