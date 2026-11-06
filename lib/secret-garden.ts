import type { SecretMessage } from "@/content/lovely";
import { makeId } from "@/lib/ids";

export const SECRET_GARDEN_ASPECT_RATIO = 1056 / 286;

export const SECRET_POSITION_MIN_X = 8;
export const SECRET_POSITION_MAX_X = 92;
export const SECRET_POSITION_MIN_Y = 13;
export const SECRET_POSITION_MAX_Y = 87;

const DEFAULT_SECRET_POSITIONS = [
  { x: 10, y: 24 },
  { x: 27, y: 64 },
  { x: 43, y: 30 },
  { x: 59, y: 68 },
  { x: 76, y: 26 },
  { x: 90, y: 58 },
  { x: 18, y: 84 },
  { x: 51, y: 84 },
  { x: 68, y: 46 },
];

const GENERATED_POSITION_COUNT = 30;

const SECRET_HEART_DECORATIONS = [
  { size: 26, rotate: -12, color: "text-strawberry" },
  { size: 19, rotate: 10, color: "text-pink" },
  { size: 30, rotate: 6, color: "text-strawberry" },
  { size: 21, rotate: -8, color: "text-[#9b7fd6]" },
  { size: 27, rotate: 13, color: "text-pink" },
  { size: 18, rotate: -14, color: "text-strawberry" },
  { size: 20, rotate: 8, color: "text-[#c49a2c]" },
  { size: 24, rotate: -6, color: "text-strawberry" },
  { size: 17, rotate: 15, color: "text-pink" },
];

export function getSecretHeartDecoration(index: number) {
  return (
    SECRET_HEART_DECORATIONS[index] ?? {
      size: 20,
      rotate: (index % 2 === 0 ? -1 : 1) * (6 + index * 2),
      color: "text-strawberry",
    }
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function generatedPosition(index: number) {
  const extra = Math.max(0, index - DEFAULT_SECRET_POSITIONS.length);
  const angle = index * 2.399963229728653 + 0.7;
  const radius = 32 + (extra % 3) * 3;

  return {
    x: clamp(50 + Math.cos(angle) * radius, 10, 90),
    y: clamp(50 + Math.sin(angle) * radius * 0.62, 15, 85),
  };
}

export function getDefaultSecretPosition(index: number) {
  return DEFAULT_SECRET_POSITIONS[index] ?? generatedPosition(index);
}

export function clampSecretPosition(x: number, y: number) {
  return {
    x: clamp(x, SECRET_POSITION_MIN_X, SECRET_POSITION_MAX_X),
    y: clamp(y, SECRET_POSITION_MIN_Y, SECRET_POSITION_MAX_Y),
  };
}

function findOpenDefaultPosition(existing: SecretMessage[]) {
  let best = getDefaultSecretPosition(0);
  let bestDistance = -1;

  for (let index = 0; index < GENERATED_POSITION_COUNT; index += 1) {
    const candidate = getDefaultSecretPosition(index);
    const nearest =
      existing.length > 0
        ? Math.min(
            ...existing.map((message) =>
              Math.hypot(
                message.x - candidate.x,
                (message.y - candidate.y) * 1.4,
              ),
            ),
          )
        : Infinity;

    if (nearest > bestDistance) {
      bestDistance = nearest;
      best = candidate;
    }
  }

  return best;
}

export function createSecretMessage(
  text: string,
  existing: SecretMessage[] = [],
): SecretMessage {
  return {
    id: makeId("secret"),
    text,
    ...findOpenDefaultPosition(existing),
  };
}

export function migrateSecretMessages(messages: string[]): SecretMessage[] {
  return messages.map((text, index) => ({
    id: `secret-${index + 1}`,
    text,
    ...getDefaultSecretPosition(index),
  }));
}

function normalizeCoordinate(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clamp(value, 0, 100);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return clamp(parsed, 0, 100);
  }

  return fallback;
}

export function normalizeSecretMessages(value: unknown): unknown {
  if (!Array.isArray(value)) return value;

  const usedIds = new Set<string>();

  return value.map((entry, index) => {
    const fallback = getDefaultSecretPosition(index);

    if (typeof entry === "string") {
      let id = `secret-${index + 1}`;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `secret-${index + 1}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);

      return { id, text: entry, ...fallback };
    }

    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return entry;
    }

    const record = entry as Record<string, unknown>;
    const baseId =
      typeof record.id === "string" && record.id.trim().length > 0
        ? record.id
        : `secret-${index + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    return {
      ...record,
      id,
      text: record.text !== undefined ? record.text : record.message,
      x: normalizeCoordinate(record.x, fallback.x),
      y: normalizeCoordinate(record.y, fallback.y),
    };
  });
}

export function reconcileSecretMessages(
  previous: SecretMessage[],
  messages: string[],
) {
  if (
    previous.length === messages.length &&
    previous.every((message, index) => message.text === messages[index])
  ) {
    return previous;
  }

  const usedOldIndexes = new Set<number>();
  const next: Array<SecretMessage | null> = messages.map(() => null);

  messages.forEach((text, newIndex) => {
    const oldIndex = previous.findIndex(
      (message, index) =>
        !usedOldIndexes.has(index) && message.text === text,
    );
    if (oldIndex < 0) return;

    usedOldIndexes.add(oldIndex);
    next[newIndex] = { ...previous[oldIndex], text };
  });

  const unmatchedOldIndexes = previous
    .map((_, index) => index)
    .filter((index) => !usedOldIndexes.has(index));
  const unmatchedNewIndexes = messages
    .map((_, index) => index)
    .filter((index) => next[index] === null);
  const pairedCount = Math.min(
    unmatchedOldIndexes.length,
    unmatchedNewIndexes.length,
  );

  for (let index = 0; index < pairedCount; index += 1) {
    const oldMessage = previous[unmatchedOldIndexes[index]];
    const newIndex = unmatchedNewIndexes[index];
    next[newIndex] = { ...oldMessage, text: messages[newIndex] };
  }

  const created = next.filter(
    (message): message is SecretMessage => message !== null,
  );

  unmatchedNewIndexes.slice(pairedCount).forEach((newIndex) => {
    const message = createSecretMessage(messages[newIndex], created);
    created.push(message);
    next[newIndex] = message;
  });

  return next as SecretMessage[];
}

export function moveSecretMessage(
  messages: SecretMessage[],
  id: string,
  x: number,
  y: number,
) {
  const position = clampSecretPosition(x, y);

  return messages.map((message) =>
    message.id === id ? { ...message, ...position } : message,
  );
}
