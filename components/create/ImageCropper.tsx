"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Crop, RotateCcw, X } from "lucide-react";
import type { DecodedImage } from "@/lib/image-client";
import { decodeImageFile } from "@/lib/image-client";
import {
  MEMORY_PHOTO_ASPECT_RATIO,
  TARGET_IMAGE_WIDTH,
} from "@/lib/image-validation";
import { cn } from "@/lib/cn";

export type CroppedImage = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  filename: string;
};

type Point = { x: number; y: number };
type FrameSize = { width: number; height: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function canvasBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

export function ImageCropper({
  file,
  onCancel,
  onConfirm,
  busy,
  uploadError,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (image: CroppedImage) => void;
  busy?: boolean;
  uploadError?: string | null;
}) {
  const [decoded, setDecoded] = useState<DecodedImage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [frame, setFrame] = useState<FrameSize>({ width: 0, height: 0 });
  const [exporting, setExporting] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const decodedRef = useRef<DecodedImage | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: Point;
  } | null>(null);
  const pinchRef = useRef<{
    distance: number;
    zoom: number;
  } | null>(null);

  useEffect(() => {
    let active = true;

    decodeImageFile(file)
      .then((image) => {
        if (!active) {
          image.close();
          return;
        }
        decodedRef.current?.close();
        decodedRef.current = image;
        setDecoded(image);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "This photo could not be decoded.",
          );
        }
      });

    return () => {
      active = false;
      decodedRef.current?.close();
      decodedRef.current = null;
    };
  }, [file]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const maxWidth = Math.min(
        entry.contentRect.width,
        560,
        entry.contentRect.height * MEMORY_PHOTO_ASPECT_RATIO,
      );
      const width = Math.max(0, Math.floor(maxWidth / 4) * 4);
      const height = (width * 3) / 4;

      setFrame({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy && !exporting) onCancel();
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [busy, exporting, onCancel]);

  function metrics(currentZoom = zoom) {
    if (!decoded || !frame.width || !frame.height) return null;

    const baseScale = Math.max(
      frame.width / decoded.width,
      frame.height / decoded.height,
    );
    const scale = baseScale * currentZoom;

    return {
      scale,
      displayWidth: decoded.width * scale,
      displayHeight: decoded.height * scale,
    };
  }

  function clampOffset(next: Point, currentZoom = zoom) {
    const current = metrics(currentZoom);
    if (!current) return next;

    const maxX = Math.max(0, (current.displayWidth - frame.width) / 2);
    const maxY = Math.max(0, (current.displayHeight - frame.height) / 2);
    return {
      x: clamp(next.x, -maxX, maxX),
      y: clamp(next.y, -maxY, maxY),
    };
  }

  const clampedOffset = clampOffset(offset);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !decoded || !frame.width || !frame.height) return;

    const baseScale = Math.max(
      frame.width / decoded.width,
      frame.height / decoded.height,
    );
    const scale = baseScale * zoom;
    const displayWidth = decoded.width * scale;
    const displayHeight = decoded.height * scale;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(frame.width * ratio);
    canvas.height = Math.round(frame.height * ratio);

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, frame.width, frame.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(
      decoded.source,
      (frame.width - displayWidth) / 2 + clampedOffset.x,
      (frame.height - displayHeight) / 2 + clampedOffset.y,
      displayWidth,
      displayHeight,
    );
  }, [clampedOffset.x, clampedOffset.y, decoded, frame, zoom]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (busy || exporting) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startOffset: clampedOffset,
      };
    } else if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      pinchRef.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        zoom,
      };
      dragRef.current = null;
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const nextZoom = clamp(
        pinchRef.current.zoom * (distance / Math.max(1, pinchRef.current.distance)),
        1,
        4,
      );
      setZoom(nextZoom);
      setOffset((current) => clampOffset(current, nextZoom));
      return;
    }

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setOffset(
      clampOffset({
        x: drag.startOffset.x + event.clientX - drag.startX,
        y: drag.startOffset.y + event.clientY - drag.startY,
      }),
    );
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) dragRef.current = null;
  }

  function updateZoom(nextZoom: number) {
    const safeZoom = clamp(nextZoom, 1, 4);
    setZoom(safeZoom);
    setOffset((current) => clampOffset(current, safeZoom));
  }

  async function confirmCrop() {
    if (!decoded || exporting || busy) return;

    const current = metrics();
    if (!current) return;

    setExporting(true);
    setExportError(null);

    try {
      const cropWidth = frame.width / current.scale;
      const cropHeight = frame.height / current.scale;
      const sourceX = clamp(
        decoded.width / 2 - cropWidth / 2 - clampedOffset.x / current.scale,
        0,
        Math.max(0, decoded.width - cropWidth),
      );
      const sourceY = clamp(
        decoded.height / 2 - cropHeight / 2 - clampedOffset.y / current.scale,
        0,
        Math.max(0, decoded.height - cropHeight),
      );

      let outputWidth = Math.max(
        1,
        Math.min(TARGET_IMAGE_WIDTH, Math.round(cropWidth)),
      );
      let outputHeight = Math.max(
        1,
        Math.round(outputWidth / MEMORY_PHOTO_ASPECT_RATIO),
      );
      let quality = 0.85;
      let lastBlob: Blob | null = null;
      let lastMimeType = "image/webp";

      const canvas = document.createElement("canvas");

      for (let attempt = 0; attempt < 6; attempt += 1) {
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not prepare the photo.");

        context.imageSmoothingQuality = "high";
        context.drawImage(
          decoded.source,
          sourceX,
          sourceY,
          cropWidth,
          cropHeight,
          0,
          0,
          outputWidth,
          outputHeight,
        );

        let blob = await canvasBlob(canvas, "image/webp", quality);
        if (!blob || blob.type !== "image/webp") {
          blob = await canvasBlob(canvas, "image/jpeg", 0.86);
          lastMimeType = "image/jpeg";
        } else {
          lastMimeType = "image/webp";
        }

        if (!blob) throw new Error("Could not export this photo.");
        lastBlob = blob;

        if (blob.size <= 1_000_000 || attempt === 5) break;

        if (quality > 0.7) {
          quality -= 0.05;
        } else {
          outputWidth = Math.max(1, Math.round(outputWidth * 0.85));
          outputHeight = Math.max(
            1,
            Math.round(outputWidth / MEMORY_PHOTO_ASPECT_RATIO),
          );
        }
      }

      if (!lastBlob) throw new Error("Could not export this photo.");

      const extension = lastMimeType === "image/webp" ? "webp" : "jpg";
      onConfirm({
        blob: lastBlob,
        width: outputWidth,
        height: outputHeight,
        mimeType: lastMimeType,
        filename: `lovely-photo-${Date.now()}.${extension}`,
      });
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Could not crop this photo.",
      );
    } finally {
      setExporting(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label="Close photo cropper"
        onClick={onCancel}
        disabled={busy || exporting}
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-dialog-title"
        className="relative z-10 flex h-[85dvh] max-h-[640px] w-full max-w-[760px] flex-col overflow-hidden rounded-[1.5rem] border-2 border-white bg-cream p-3 shadow-[0_40px_100px_-40px_rgba(73,52,59,0.6)] sm:p-4"
      >
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-pink-soft px-2.5 py-0.5 font-body text-[0.52rem] font-bold uppercase tracking-[0.14em] text-strawberry">
              <Crop className="h-3 w-3" />
              Photo crop
            </p>
            <h2
              id="crop-dialog-title"
              className="mt-1.5 font-display text-lg font-semibold text-ink sm:text-xl"
            >
              Frame your favorite part.
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy || exporting}
            aria-label="Close photo cropper"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-white bg-white/85 text-ink-soft transition-colors hover:text-strawberry disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-1 shrink-0 font-body text-[0.68rem] leading-relaxed text-ink-soft">
          Exact polaroid shape. Drag to reposition, pinch or use the slider to
          zoom.
        </p>

        <div
          ref={viewportRef}
          className="mt-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        >
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onWheel={(event) => {
              event.preventDefault();
              updateZoom(zoom * (event.deltaY < 0 ? 1.08 : 0.92));
            }}
            style={{
              width: frame.width,
              height: frame.height,
              aspectRatio: MEMORY_PHOTO_ASPECT_RATIO,
            }}
            className="relative shrink-0 touch-none overflow-hidden rounded-xl bg-ink/10 ring-1 ring-inset ring-white/60"
          >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-white/35"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-2/3 border-t border-white/35"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-1/3 border-l border-white/35"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-2/3 border-l border-white/35"
            />
          </div>
        </div>

        <div className="mt-2 flex shrink-0 items-center gap-2.5">
          <span className="font-body text-[0.55rem] font-bold uppercase tracking-[0.12em] text-ink-soft/65">
            Zoom
          </span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(event) => updateZoom(Number(event.target.value))}
            aria-label="Photo zoom"
            className="h-2 flex-1 cursor-pointer accent-[#F15B72]"
          />
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            disabled={busy || exporting}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white px-2.5 py-1 font-body text-[0.52rem] font-bold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-pink hover:text-strawberry disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>

        <p className="mt-2 shrink-0 font-hand text-sm leading-tight text-[#8f4557]/80">
          The crop is saved into the photo itself, so every story using it sees
          exactly this frame.
        </p>

        {loadError || exportError || uploadError ? (
          <p
            role="alert"
            className="mt-2 shrink-0 rounded-xl border-2 border-strawberry/25 bg-blush/70 px-3 py-2 font-body text-xs leading-relaxed text-[#7d4250]"
          >
            {loadError ?? exportError ?? uploadError}
          </p>
        ) : null}

        <div className="mt-3 flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy || exporting}
            className={cn(
              "inline-flex items-center justify-center rounded-full border-2 border-ink/10 bg-white px-4 py-2 font-display text-sm font-semibold text-ink-soft transition-colors hover:border-pink hover:text-strawberry disabled:opacity-50",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmCrop}
            disabled={!decoded || Boolean(loadError) || busy || exporting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-strawberry px-4 py-2 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80] disabled:cursor-wait disabled:opacity-60"
          >
            {busy
              ? "Uploading..."
              : exporting
                ? "Preparing..."
                : "Use this crop"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
