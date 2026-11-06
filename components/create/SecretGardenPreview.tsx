"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import type { SecretMessage } from "@/content/lovely";
import {
  FlowerShape,
  HeartShape,
  SparkleShape,
  StarShape,
} from "@/components/lovely/Doodles";
import { cn } from "@/lib/cn";
import {
  SECRET_GARDEN_ASPECT_RATIO,
  clampSecretPosition,
  getSecretHeartDecoration,
} from "@/lib/secret-garden";

type DragState = {
  id: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  moved: boolean;
};

type DragPosition = {
  id: string;
  x: number;
  y: number;
};

export function SecretGardenPreview({
  messages,
  onPositionChange,
}: {
  messages: SecretMessage[];
  onPositionChange: (id: string, x: number, y: number) => void;
}) {
  const [openedIds, setOpenedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [popup, setPopup] = useState<{
    id: string;
    pinned: boolean;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const gardenRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const lastPointerTypeRef = useRef("mouse");
  const suppressClickRef = useRef(false);

  const openedSet = new Set(openedIds);
  const activeItem = messages.find((message) => message.id === activeId) ?? null;
  const popupItem = popup
    ? (messages.find((message) => message.id === popup.id) ?? null)
    : null;
  const discoveredIds = openedIds.filter((id) =>
    messages.some((message) => message.id === id),
  );
  const activeNumber = activeItem
    ? discoveredIds.indexOf(activeItem.id) + 1
    : 0;
  const popupNumber = popupItem
    ? discoveredIds.indexOf(popupItem.id) + 1
    : 0;
  const openedCount = messages.reduce(
    (count, message) => count + (openedSet.has(message.id) ? 1 : 0),
    0,
  );
  const densityScale =
    messages.length > 20
      ? 0.78
      : messages.length > 14
        ? 0.86
        : messages.length > 10
          ? 0.93
          : 1;
  const hitSize = messages.length > 18 ? 22 : 26;

  function closeHeart(id: string) {
    setOpenedIds((previous) => previous.filter((item) => item !== id));
    setActiveId((current) => (current === id ? null : current));
    setPopup((current) => (current?.id === id ? null : current));
  }

  function handleHeartClick(message: SecretMessage) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    const isOpen = openedSet.has(message.id);
    const isTouch = lastPointerTypeRef.current === "touch";

    if (isOpen) {
      if (isTouch) {
        setPopup({ id: message.id, pinned: true });
      } else {
        closeHeart(message.id);
      }
      return;
    }

    setOpenedIds((previous) =>
      previous.includes(message.id) ? previous : [...previous, message.id],
    );
    setActiveId(message.id);
    setPopup(null);
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    message: SecretMessage,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    lastPointerTypeRef.current = event.pointerType;
    suppressClickRef.current = false;
    dragRef.current = {
      id: message.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: message.x,
      startY: message.y,
      currentX: message.x,
      currentY: message.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingId(message.id);
    setPopup(null);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const garden = gardenRef.current;
    if (!drag || !garden || drag.pointerId !== event.pointerId) return;

    const distance = Math.hypot(
      event.clientX - drag.startClientX,
      event.clientY - drag.startClientY,
    );
    if (!drag.moved && distance < 4) return;

    drag.moved = true;
    suppressClickRef.current = true;

    const rect = garden.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const position = clampSecretPosition(
      drag.startX + ((event.clientX - drag.startClientX) / rect.width) * 100,
      drag.startY + ((event.clientY - drag.startClientY) / rect.height) * 100,
    );

    drag.currentX = position.x;
    drag.currentY = position.y;
    setDragPosition({ id: drag.id, ...position });
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.moved) {
      onPositionChange(drag.id, drag.currentX, drag.currentY);
    }
    dragRef.current = null;
    setDraggingId(null);
    setDragPosition(null);
  }

  function handleHeartEnter(message: SecretMessage) {
    if (draggingId || !openedSet.has(message.id)) return;
    setPopup({ id: message.id, pinned: false });
  }

  function handleHeartLeave(message: SecretMessage) {
    setPopup((current) =>
      current && current.id === message.id && !current.pinned ? null : current,
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border-2 border-white bg-white/90 p-3 text-left shadow-[0_18px_40px_-30px_rgba(73,52,59,0.5)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-lavender-soft text-[#7b60b5]">
            <Heart className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[0.78rem] font-semibold leading-tight text-ink">
              Secret Messages
            </p>
            <p className="truncate font-hand text-[0.68rem] leading-tight text-ink-soft">
              hidden in the garden, just for you
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 font-body text-[0.42rem] font-bold uppercase tracking-[0.08em] text-ink-soft/60">
          {openedCount}/{messages.length} found
        </span>
      </div>

      <div
        ref={gardenRef}
        style={{ aspectRatio: SECRET_GARDEN_ASPECT_RATIO }}
        className="relative mt-2.5 w-full overflow-hidden rounded-2xl border-2 border-dashed border-lavender bg-gradient-to-br from-lavender-soft/55 via-blush/30 to-butter-soft/40"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-lavender/80"
        >
          <path
            d="M7 32 C 20 10, 34 56, 47 32 S 72 72, 93 46"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="1.6 2.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <span
          aria-hidden="true"
          className="absolute left-[4%] top-[48%] text-pink/50"
        >
          <FlowerShape className="h-4 w-4" />
        </span>
        <span
          aria-hidden="true"
          className="absolute right-[5%] top-[15%] text-butter"
        >
          <StarShape className="h-4 w-4" />
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-[9%] left-[6%] text-lavender"
        >
          <SparkleShape className="h-3.5 w-3.5" />
        </span>
        <span
          aria-hidden="true"
          className="absolute bottom-[8%] right-[10%] text-pink/60"
        >
          <FlowerShape className="h-3.5 w-3.5" />
        </span>

        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isOpen = openedSet.has(message.id);
            const isDragging = draggingId === message.id;
            const position =
              dragPosition?.id === message.id ? dragPosition : message;
            const decoration = getSecretHeartDecoration(index);
            const heartSize = Math.max(
              8,
              Math.round(decoration.size * 0.42 * densityScale),
            );

            return (
              <motion.div
                key={message.id}
                className="absolute z-10"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.button
                  type="button"
                  onClick={() => handleHeartClick(message)}
                  onPointerDown={(event) => handlePointerDown(event, message)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onMouseEnter={() => handleHeartEnter(message)}
                  onMouseLeave={() => handleHeartLeave(message)}
                  onFocus={() => handleHeartEnter(message)}
                  onBlur={() => handleHeartLeave(message)}
                  aria-label={`Secret message ${index + 1}${isOpen ? ", opened" : ""}`}
                  aria-pressed={isOpen}
                  style={{ width: hitSize, height: hitSize }}
                  animate={
                    isDragging
                      ? { y: 0, rotate: decoration.rotate, scale: 1.14 }
                      : {
                          y: [0, -3 - (index % 3), 0],
                          rotate: [
                            decoration.rotate,
                            decoration.rotate + 4,
                            decoration.rotate,
                          ],
                          scale: 1,
                        }
                  }
                  transition={
                    isDragging
                      ? { duration: 0.15 }
                      : {
                          duration: 4 + (index % 3),
                          delay: index * 0.12,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                  whileHover={isDragging ? undefined : { scale: 1.16, rotate: 0 }}
                  whileTap={isDragging ? undefined : { scale: 0.88 }}
                  className={cn(
                    "relative grid touch-none select-none place-items-center rounded-full transition-[color,filter] focus-visible:bg-white/60 focus-visible:outline-none",
                    isOpen
                      ? "text-strawberry drop-shadow-[0_3px_7px_rgba(241,91,114,0.5)]"
                      : decoration.color,
                    isDragging &&
                      "z-30 cursor-grabbing drop-shadow-[0_9px_12px_rgba(73,52,59,0.28)]",
                    !isDragging && "cursor-grab",
                  )}
                >
                  <HeartShape
                    style={{ width: heartSize, height: heartSize }}
                  />
                  {isOpen ? (
                    <span className="pointer-events-none absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-strawberry ring-2 ring-white" />
                  ) : null}
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <span className="pointer-events-none absolute inset-x-0 bottom-1 text-center font-hand text-[0.58rem] text-ink-soft/55">
          a little garden of things I never said out loud
        </span>
      </div>

      <div className="mt-2 min-h-[48px]">
        <AnimatePresence mode="wait" initial={false}>
          {activeItem ? (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
              className="relative rounded-xl border-2 border-pink bg-blush/60 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => closeHeart(activeItem.id)}
                aria-label="Hide secret message"
                className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/80 text-ink-soft transition-colors hover:text-strawberry"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="text-[0.44rem] font-bold uppercase tracking-[0.16em] text-strawberry">
                secret no. {String(activeNumber).padStart(2, "0")}
              </p>
              <p className="mt-0.5 line-clamp-3 pr-4 font-hand text-[0.92rem] leading-snug text-[#8f4557]">
                {activeItem.text}
              </p>
              <button
                type="button"
                onClick={() => setPopup({ id: activeItem.id, pinned: true })}
                className="mt-0.5 font-hand text-[0.62rem] text-strawberry/80 transition-colors hover:text-strawberry"
              >
                read it all
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[48px] items-center justify-center text-center font-hand text-[0.7rem] text-ink-soft/65"
            >
              {messages.length === 0
                ? "add a secret and it will appear in the garden."
                : "tap any heart to find a little secret."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-1 text-center font-hand text-[0.62rem] leading-snug text-ink-soft/60">
        {messages.length > 0 && openedCount === messages.length
          ? "you found them all. there might be one more in person."
          : "some are sillier than others. that's the point."}
      </p>

      <AnimatePresence>
        {popup && popupItem ? (
          <motion.div
            key="secret-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (popup.pinned) setPopup(null);
            }}
            className={cn(
              "absolute inset-0 z-40 flex items-center justify-center p-3",
              popup.pinned
                ? "pointer-events-auto bg-ink/25 backdrop-blur-[1px]"
                : "pointer-events-none",
            )}
          >
            <motion.div
              initial={{ scale: 0.96, y: 4 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-full w-full overflow-y-auto rounded-xl bg-white p-3 shadow-lg"
            >
              {popup.pinned ? (
                <button
                  type="button"
                  onClick={() => setPopup(null)}
                  aria-label="Close secret message"
                  className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-cream text-ink-soft transition-colors hover:text-strawberry"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
              <p className="whitespace-pre-wrap break-words pr-4 font-hand text-[0.95rem] leading-snug text-[#6b5195]">
                {popupItem.text}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 font-body text-[0.42rem] font-bold uppercase tracking-[0.14em] text-ink-soft/55">
                <HeartShape className="h-2 w-2 text-strawberry" />
                secret no. {String(popupNumber).padStart(2, "0")}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
