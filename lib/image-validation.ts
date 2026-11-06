export const MAX_ORIGINAL_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_STORED_IMAGE_BYTES = 1_200_000;
export const MAX_IMAGE_DIMENSION = 6000;
export const MAX_IMAGE_PIXELS = 25_000_000;
export const MEMORY_PHOTO_ASPECT_RATIO = 4 / 3;
export const TARGET_IMAGE_WIDTH = 1200;
export const MAX_IMAGES_PER_PAGE = 12;
export const MAX_IMAGES_PER_OWNER = 100;
export const MAX_OWNER_IMAGE_BYTES = 200 * 1024 * 1024;

export type DetectedImageType =
  | "jpeg"
  | "png"
  | "webp"
  | "gif"
  | "heic"
  | "svg"
  | "unknown";

export type ImageDimensions = {
  width: number;
  height: number;
};

function ascii(bytes: Uint8Array, start: number, length: number) {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += String.fromCharCode(bytes[start + index] ?? 0);
  }
  return value;
}

export function detectImageType(bytes: Uint8Array): DetectedImageType {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }

  if (
    bytes.length >= 12 &&
    ascii(bytes, 0, 4) === "RIFF" &&
    ascii(bytes, 8, 4) === "WEBP"
  ) {
    return "webp";
  }

  if (bytes.length >= 6) {
    const header = ascii(bytes, 0, 6);
    if (header === "GIF87a" || header === "GIF89a") return "gif";
  }

  if (bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4).toLowerCase();
    if (
      brand === "heic" ||
      brand === "heix" ||
      brand === "hevc" ||
      brand === "hevx" ||
      brand === "mif1" ||
      brand === "msf1"
    ) {
      return "heic";
    }
  }

  const text = ascii(bytes, 0, Math.min(bytes.length, 512))
    .trimStart()
    .toLowerCase();
  if (text.startsWith("<svg") || text.startsWith("<?xml") || text.startsWith("<html")) {
    return "svg";
  }

  return "unknown";
}

function readUint16BE(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}

function readUint16LE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

function readUint24LE(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset] ?? 0) |
    ((bytes[offset + 1] ?? 0) << 8) |
    ((bytes[offset + 2] ?? 0) << 16)
  );
}

function readUint32LE(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset] ?? 0) |
    ((bytes[offset + 1] ?? 0) << 8) |
    ((bytes[offset + 2] ?? 0) << 16) |
    ((bytes[offset + 3] ?? 0) << 24)
  ) >>> 0;
}

export function readImageDimensions(
  bytes: Uint8Array,
  type: DetectedImageType,
): ImageDimensions | null {
  if (type === "png" && bytes.length >= 24) {
    const width =
      ((bytes[16] ?? 0) << 24) |
      ((bytes[17] ?? 0) << 16) |
      ((bytes[18] ?? 0) << 8) |
      (bytes[19] ?? 0);
    const height =
      ((bytes[20] ?? 0) << 24) |
      ((bytes[21] ?? 0) << 16) |
      ((bytes[22] ?? 0) << 8) |
      (bytes[23] ?? 0);
    return width > 0 && height > 0 ? { width, height } : null;
  }

  if (type === "jpeg") {
    let offset = 2;
    while (offset + 8 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = bytes[offset + 1] ?? 0;
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }

      const length = readUint16BE(bytes, offset + 2);
      if (length < 2) return null;

      const isStartOfFrame =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf);

      if (isStartOfFrame) {
        const height = readUint16BE(bytes, offset + 5);
        const width = readUint16BE(bytes, offset + 7);
        return width > 0 && height > 0 ? { width, height } : null;
      }

      offset += 2 + length;
    }
    return null;
  }

  if (type === "webp" && bytes.length >= 30) {
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const chunk = ascii(bytes, offset, 4);
      const size = readUint32LE(bytes, offset + 4);
      const data = offset + 8;

      if (chunk === "VP8X" && data + 10 <= bytes.length) {
        const width = readUint24LE(bytes, data + 4) + 1;
        const height = readUint24LE(bytes, data + 7) + 1;
        return { width, height };
      }

      if (chunk === "VP8 " && data + 10 <= bytes.length) {
        if (
          bytes[data + 3] === 0x9d &&
          bytes[data + 4] === 0x01 &&
          bytes[data + 5] === 0x2a
        ) {
          const width = readUint16LE(bytes, data + 6) & 0x3fff;
          const height = readUint16LE(bytes, data + 8) & 0x3fff;
          return width > 0 && height > 0 ? { width, height } : null;
        }
      }

      if (chunk === "VP8L" && data + 5 <= bytes.length) {
        if (bytes[data] === 0x2f) {
          const bits = readUint32LE(bytes, data + 1);
          const width = (bits & 0x3fff) + 1;
          const height = ((bits >> 14) & 0x3fff) + 1;
          return { width, height };
        }
      }

      offset = data + size + (size % 2);
    }
  }

  return null;
}

export function validateStoredImage(
  bytes: Uint8Array,
):
  | { ok: true; mimeType: "image/webp" | "image/jpeg"; dimensions: ImageDimensions }
  | { ok: false; error: string } {
  if (bytes.byteLength > MAX_STORED_IMAGE_BYTES) {
    return { ok: false, error: "That processed image is still a little too large." };
  }

  const type = detectImageType(bytes);
  if (type !== "webp" && type !== "jpeg") {
    return { ok: false, error: "Upload a processed WebP or JPEG photo." };
  }

  const dimensions = readImageDimensions(bytes, type);
  if (!dimensions) {
    return { ok: false, error: "Could not read the photo dimensions." };
  }

  if (
    dimensions.width > MAX_IMAGE_DIMENSION ||
    dimensions.height > MAX_IMAGE_DIMENSION ||
    dimensions.width * dimensions.height > MAX_IMAGE_PIXELS
  ) {
    return { ok: false, error: "That photo resolution is too large." };
  }

  if (
    dimensions.width > TARGET_IMAGE_WIDTH ||
    dimensions.height > Math.round(TARGET_IMAGE_WIDTH / MEMORY_PHOTO_ASPECT_RATIO)
  ) {
    return {
      ok: false,
      error: "Photos must be cropped and resized before upload.",
    };
  }

  if (
    Math.abs(
      dimensions.width / dimensions.height - MEMORY_PHOTO_ASPECT_RATIO,
    ) > 0.02
  ) {
    return {
      ok: false,
      error: "Photos must be cropped to the polaroid frame before upload.",
    };
  }

  return {
    ok: true,
    mimeType: type === "webp" ? "image/webp" : "image/jpeg",
    dimensions,
  };
}
