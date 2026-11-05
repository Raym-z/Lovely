"use client";

import { motion } from "framer-motion";
import { HeartShape, SparkleShape } from "./Doodles";

const colors = ["#F15B72", "#FFB6C9", "#DCCBFF", "#FFE9A8", "#CFEFE2", "#FFFDF9"];
const shapeNames = ["heart", "sparkle", "bar", "dot"] as const;

type PieceShape = (typeof shapeNames)[number];

interface Piece {
  id: string;
  left: number;
  drift: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
  color: string;
  shape: PieceShape;
}

function createPieces(burst: number): Piece[] {
  let seed = burst * 9301 + 49297;

  function random() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  return Array.from({ length: 54 }, (_, index) => ({
    id: `${burst}-${index}`,
    left: random() * 100,
    drift: (random() - 0.5) * 240,
    delay: random() * 0.35,
    duration: 2.5 + random() * 1.8,
    size: 8 + random() * 13,
    rotate: random() * 720 - 360,
    color: colors[Math.floor(random() * colors.length)],
    shape: shapeNames[Math.floor(random() * shapeNames.length)],
  }));
}

export function ConfettiEffect({ burst }: { burst: number }) {
  if (burst < 1) return null;

  const pieces = createPieces(burst);

  return (
    <div
      aria-hidden="true"
      data-confetti={burst}
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{ left: `${piece.left}%`, top: -32, color: piece.color }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{
            y: "112vh",
            x: piece.drift,
            opacity: [0, 1, 1, 0],
            rotate: piece.rotate,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: [0.18, 0.6, 0.42, 1],
            opacity: {
              duration: piece.duration,
              delay: piece.delay,
              times: [0, 0.08, 0.78, 1],
            },
          }}
        >
          {piece.shape === "heart" ? (
            <HeartShape style={{ width: piece.size, height: piece.size }} />
          ) : piece.shape === "sparkle" ? (
            <SparkleShape style={{ width: piece.size, height: piece.size }} />
          ) : piece.shape === "bar" ? (
            <span
              className="block rounded-full"
              style={{
                width: piece.size * 0.42,
                height: piece.size * 1.5,
                backgroundColor: piece.color,
              }}
            />
          ) : (
            <span
              className="block rounded-full"
              style={{
                width: piece.size * 0.7,
                height: piece.size * 0.7,
                backgroundColor: piece.color,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
