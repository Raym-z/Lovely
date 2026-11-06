"use client";

import type { LovelyImage } from "@/lib/image-types";
import {
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_PIXELS,
  MAX_ORIGINAL_IMAGE_BYTES,
  detectImageType,
  readImageDimensions,
} from "@/lib/image-validation";

export type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

export async function validateOriginalImage(file: File) {
  if (file.size > MAX_ORIGINAL_IMAGE_BYTES) {
    return { ok: false as const, error: "Choose a photo smaller than 5 MB." };
  }

  const header = new Uint8Array(await file.slice(0, 65_536).arrayBuffer());
  const type = detectImageType(header);

  if (type === "gif") {
    return { ok: false as const, error: "Animated GIFs are not supported." };
  }

  if (type === "svg") {
    return { ok: false as const, error: "SVG files are not supported." };
  }

  if (
    type !== "jpeg" &&
    type !== "png" &&
    type !== "webp" &&
    type !== "heic"
  ) {
    return {
      ok: false as const,
      error: "Choose a JPEG, PNG, WebP, or supported HEIC photo.",
    };
  }

  const dimensions = readImageDimensions(header, type);
  if (
    dimensions &&
    (dimensions.width > MAX_IMAGE_DIMENSION ||
      dimensions.height > MAX_IMAGE_DIMENSION ||
      dimensions.width * dimensions.height > MAX_IMAGE_PIXELS)
  ) {
    return {
      ok: false as const,
      error: "That photo resolution is too large. Choose a smaller photo.",
    };
  }

  return { ok: true as const, type };
}

export async function decodeImageFile(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // Try the browser's <img> decoder as a fallback.
    }
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("This photo could not be decoded."));
    });

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      close: () => URL.revokeObjectURL(objectUrl),
    };
  } catch {
    URL.revokeObjectURL(objectUrl);
    throw new Error(
      "This photo format is not supported by your browser. Try JPEG, PNG, or WebP.",
    );
  }
}

export function uploadProcessedImage({
  blob,
  filename,
  pageId,
  editKey,
  memoryId,
  accessToken,
  onProgress,
}: {
  blob: Blob;
  filename: string;
  pageId: string | null;
  editKey: string | null;
  memoryId: string | null;
  accessToken: string | null;
  onProgress: (progress: number) => void;
}) {
  const form = new FormData();
  form.append("file", blob, filename);
  if (pageId) form.append("pageId", pageId);
  if (editKey) form.append("editKey", editKey);
  if (memoryId) form.append("memoryId", memoryId);
  form.append("originalFilename", filename);

  return new Promise<LovelyImage>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/images");

    if (accessToken) {
      request.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    }

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      let payload: { image?: LovelyImage; error?: string } = {};
      try {
        payload = JSON.parse(request.responseText) as typeof payload;
      } catch {
        // Fall through to a generic error.
      }

      if (request.status >= 200 && request.status < 300 && payload.image) {
        onProgress(100);
        resolve(payload.image);
      } else {
        reject(
          new Error(payload.error ?? "Could not upload this photo right now."),
        );
      }
    });

    request.addEventListener("error", () => {
      reject(new Error("The upload was interrupted. Please try again."));
    });

    request.addEventListener("abort", () => {
      reject(new Error("The upload was cancelled."));
    });

    request.send(form);
  });
}
