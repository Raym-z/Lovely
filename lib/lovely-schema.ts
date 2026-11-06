import { z } from "zod";
import { defaultEmergencyNote, type LovelyContent } from "@/content/lovely";
import { normalizeSecretMessages } from "@/lib/secret-garden";

const photoVariantSchema = z.enum([
  "cafe",
  "sunset",
  "rain",
  "roadtrip",
  "cozy",
  "dance",
  "bookstore",
  "cherry-blossom",
  "beach-picnic",
  "city-night",
  "rooftop",
  "flower-market",
  "autumn",
  "arcade",
  "mountain",
  "sunday-morning",
]);

const accentSchema = z.enum(["pink", "lavender", "butter", "mint"]);

const requiredText = (max: number) => z.string().trim().min(1).max(max);

const memorySchema = z.object({
  id: requiredText(80),
  date: requiredText(80),
  title: requiredText(120),
  excerpt: requiredText(240),
  caption: requiredText(1200),
  detail: requiredText(1200),
  photo: photoVariantSchema,
  accent: accentSchema,
});

const quizOptionSchema = z.object({
  id: requiredText(60),
  text: requiredText(200),
});

const quizQuestionSchema = z
  .object({
    id: requiredText(80),
    prompt: requiredText(300),
    options: z
      .array(quizOptionSchema)
      .min(2)
      .refine(
        (options) =>
          new Set(options.map((option) => option.id)).size === options.length,
        "Quiz option ids must be unique.",
      ),
    answer: requiredText(60),
    correctReaction: requiredText(500),
    wrongReaction: requiredText(500),
  })
  .refine(
    (question) =>
      question.options.some((option) => option.id === question.answer),
    "The correct answer must match one of the options.",
  );

const secretMessageSchema = z.object({
  id: requiredText(80),
  text: requiredText(500),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const secretMessagesSchema = z.preprocess(
  (value) => normalizeSecretMessages(value),
  z
    .array(secretMessageSchema)
    .min(1)
    .max(30)
    .refine(
      (messages) =>
        new Set(messages.map((message) => message.id)).size ===
        messages.length,
      "Secret message ids must be unique.",
    ),
);

const couponSchema = z.object({
  id: requiredText(80),
  title: requiredText(120),
  description: requiredText(500),
  serial: requiredText(40),
  accent: accentSchema,
});

const finalLetterSchema = z.object({
  eyebrow: requiredText(80),
  title: requiredText(200),
  subtitle: requiredText(500),
  tapHint: requiredText(200),
  salutation: requiredText(200),
  paragraphs: z.array(requiredText(1200)).min(1).max(12),
  signature: requiredText(200),
  signatureName: requiredText(80),
  postscript: requiredText(500),
  question: requiredText(200),
  yesLabel: requiredText(80),
  thinkLabel: requiredText(80),
  thinkingNotes: z.array(requiredText(300)).min(1).max(6),
  acceptAfterThinkingLabel: requiredText(120),
  celebration: z.object({
    flag: requiredText(80),
    title: requiredText(200),
    subtitle: requiredText(300),
    note: requiredText(500),
  }),
});

export const lovelyContentSchema: z.ZodType<LovelyContent> = z.object({
  sender: requiredText(60),
  recipient: requiredText(60),
  tagline: requiredText(120),
  invitation: z.object({
    eyebrow: requiredText(120),
    title: requiredText(300),
    subtitle: requiredText(500),
    hint: requiredText(300),
    cta: requiredText(80),
    note: requiredText(300),
  }),
  memories: z.array(memorySchema).min(1).max(12),
  quiz: z.array(quizQuestionSchema).min(1).max(10),
  coupons: z.array(couponSchema).min(1).max(20),
  compliments: z.array(requiredText(300)).min(1).max(60),
  reasons: z.array(requiredText(500)).min(1).max(30),
  secretMessages: secretMessagesSchema,
  emergencyNote: requiredText(1200).default(defaultEmergencyNote),
  finalLetter: finalLetterSchema,
});

export type ValidationIssue = {
  path: string;
  message: string;
};

export function validateLovelyContent(input: unknown) {
  const result = lovelyContentSchema.safeParse(input);
  if (result.success) {
    return { success: true as const, data: result.data };
  }

  return {
    success: false as const,
    issues: result.error.issues.slice(0, 12).map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

export const MAX_CONTENT_BYTES = 180_000;
export const MAX_COMPRESSED_LENGTH = 90_000;
