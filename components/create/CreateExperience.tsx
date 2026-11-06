"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  Copy,
  ExternalLink,
  Gift,
  Heart,
  HelpCircle,
  KeyRound,
  Mail,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  lovelyContent,
  type LovelyContent,
  type SecretMessage,
} from "@/content/lovely";
import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/use-hydrated";
import {
  validateLovelyContent,
  type ValidationIssue,
} from "@/lib/lovely-schema";
import {
  moveSecretMessage,
  normalizeSecretMessages,
} from "@/lib/secret-garden";
import { useGuestSession } from "@/components/auth/GuestSessionProvider";
import { LoadingScreen } from "@/components/lovely/LoadingScreen";
import { HeartShape, Squiggle } from "@/components/lovely/Doodles";
import { GhostButton, PrimaryButton, Sticker } from "@/components/lovely/ui";
import { BasicsStep } from "./steps/BasicsStep";
import { StoryStep } from "./steps/StoryStep";
import { QuizStep } from "./steps/QuizStep";
import { GiftsStep, type GiftTab } from "./steps/GiftsStep";
import { LetterStep } from "./steps/LetterStep";
import { ReviewStep } from "./steps/ReviewStep";
import { LivePreview } from "./LivePreview";
import { Field, TextInput } from "./fields";
import type { LetterSectionId } from "./letter-sections";

const DRAFT_KEY = "lovely.create.draft.v2";

const steps = [
  { id: "basics", label: "Basics", icon: Heart },
  { id: "story", label: "Story", icon: Camera },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "gifts", label: "Gifts", icon: Gift },
  { id: "letter", label: "Letter", icon: Mail },
  { id: "review", label: "Review", icon: Check },
] as const;

type StepId = (typeof steps)[number]["id"];

interface SavedInfo {
  uid: string;
  editKey: string;
  storage: string;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createStarterContent(): LovelyContent {
  const content = clone(lovelyContent);
  content.recipient = "";
  content.sender = "";
  return content;
}

function focusBasicsNameField(missingRecipient: boolean) {
  const input = document.getElementById(
    missingRecipient ? "basics-recipient-name" : "basics-sender-name",
  );
  if (!(input instanceof HTMLInputElement)) return;
  input.scrollIntoView({ behavior: "smooth", block: "center" });
  input.focus({ preventScroll: true });
}

function focusSignatureNameField() {
  const input = document.getElementById("letter-signature-name");
  if (!(input instanceof HTMLInputElement)) return;
  input.scrollIntoView({ behavior: "smooth", block: "center" });
  input.focus({ preventScroll: true });
}

function looksLikeLovelyContent(value: unknown): value is LovelyContent {
  if (!value || typeof value !== "object") return false;
  const content = value as Partial<LovelyContent>;

  return Boolean(
    typeof content.recipient === "string" &&
      typeof content.sender === "string" &&
      typeof content.tagline === "string" &&
      content.invitation &&
      typeof content.invitation === "object" &&
      Array.isArray(content.memories) &&
      Array.isArray(content.quiz) &&
      Array.isArray(content.coupons) &&
      Array.isArray(content.compliments) &&
      Array.isArray(content.reasons) &&
      Array.isArray(content.secretMessages) &&
      content.finalLetter &&
      typeof content.finalLetter === "object" &&
      Array.isArray(content.finalLetter.paragraphs) &&
      Array.isArray(content.finalLetter.thinkingNotes),
  );
}

function normalizeDraftContent(value: unknown): LovelyContent | null {
  if (!looksLikeLovelyContent(value)) return null;

  const messages = normalizeSecretMessages(value.secretMessages);
  if (!Array.isArray(messages)) return null;

  const validMessages = messages.every((message: unknown) => {
    if (!message || typeof message !== "object") return false;
    const secret = message as Partial<SecretMessage>;
    return (
      typeof secret.id === "string" &&
      typeof secret.text === "string" &&
      typeof secret.x === "number" &&
      typeof secret.y === "number"
    );
  });

  return validMessages
    ? { ...value, secretMessages: messages as SecretMessage[] }
    : null;
}

function StepNav({
  current,
  onSelect,
}: {
  current: StepId;
  onSelect: (step: StepId) => void;
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [current]);

  return (
    <nav
      aria-label="Editor steps"
      className="no-scrollbar mt-6 overflow-x-auto"
    >
      <ol className="flex min-w-max items-center gap-1.5 rounded-full border-2 border-white bg-white/55 p-1.5">
        {steps.map((step) => {
          const Icon = step.icon;
          const active = current === step.id;
          return (
            <li key={step.id}>
              <button
                ref={active ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(step.id)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 font-body text-[0.64rem] font-bold uppercase tracking-[0.1em] transition-colors",
                  active
                    ? "bg-strawberry text-white shadow-[0_2px_0_#d94360]"
                    : "text-ink-soft hover:bg-blush hover:text-strawberry",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-strawberry/25 bg-blush/75 p-4">
      <Heart className="mt-0.5 h-4 w-4 shrink-0 text-strawberry" />
      <p className="font-body text-sm leading-relaxed text-[#7d4250]">
        {message}
      </p>
    </div>
  );
}

function EditKeyBanner({
  value,
  onChange,
  onApply,
}: {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="mt-5 rounded-[1.5rem] border-2 border-dashed border-lavender bg-lavender-soft/45 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#7b60b5]">
          <KeyRound className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-ink">
            We need the edit key for this Lovely
          </p>
          <p className="mt-1 font-body text-xs leading-relaxed text-ink-soft">
            If you made this page in this browser, the key should already be
            here. If not, paste the recovery key you saved when you created it.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Field label="Edit key" className="min-w-0 flex-1">
              <TextInput
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Paste edit key..."
                autoComplete="off"
              />
            </Field>
            <button
              type="button"
              onClick={onApply}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#7b60b5] px-5 py-2.5 font-display text-xs font-semibold text-white transition-colors hover:bg-[#6b51a3]"
            >
              Use key
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateExperience() {
  const hydrated = useHydrated();
  const {
    session,
    user,
    isAnonymous,
    status: guestStatus,
  } = useGuestSession();
  const authToken = session?.access_token ?? null;
  const authTokenRef = useRef<string | null>(authToken);

  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

  const [ownsPage, setOwnsPage] = useState(false);
  const [editUid, setEditUid] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const value = new URLSearchParams(window.location.search).get("edit");
    return value && /^[a-z0-9]{4,32}$/.test(value) ? value : null;
  });
  const shouldLoadEditRef = useRef(Boolean(editUid));

  const [editKey, setEditKey] = useState<string>(() => {
    if (typeof window === "undefined" || !editUid) return "";
    try {
      return window.localStorage.getItem(`lovely.edit.${editUid}`) ?? "";
    } catch {
      return "";
    }
  });

  const [content, setContent] = useState<LovelyContent>(() => {
    if (typeof window === "undefined" || editUid) return createStarterContent();

    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        const draft = normalizeDraftContent(parsed);
        if (draft) return draft;
      }
    } catch {
      // Ignore unreadable drafts.
    }

    return createStarterContent();
  });

  const [step, setStep] = useState<StepId>("basics");
  const [openMemoryId, setOpenMemoryId] = useState<string | null>(null);
  const [lastMemoryId, setLastMemoryId] = useState<string | null>(null);
  const activeMemoryId =
    content.memories.find((memory) => memory.id === openMemoryId)?.id ?? null;
  const lastEditedMemoryId =
    content.memories.find((memory) => memory.id === lastMemoryId)?.id ?? null;
  const previewMemoryId =
    activeMemoryId ??
    lastEditedMemoryId ??
    content.memories[0]?.id ??
    null;

  function handleActiveMemoryChange(id: string | null) {
    setOpenMemoryId(id);
    if (id) setLastMemoryId(id);
  }

  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null);
  const activeQuestionId =
    content.quiz.find((question) => question.id === openQuestionId)?.id ?? null;
  const lastEditedQuestionId =
    content.quiz.find((question) => question.id === lastQuestionId)?.id ?? null;
  const previewQuestionId =
    activeQuestionId ??
    lastEditedQuestionId ??
    content.quiz[0]?.id ??
    null;

  function handleActiveQuestionChange(id: string | null) {
    setOpenQuestionId(id);
    if (id) setLastQuestionId(id);
  }

  const [giftTab, setGiftTab] = useState<GiftTab>("coupons");
  const [openCouponId, setOpenCouponId] = useState<string | null>(null);
  const [lastCouponId, setLastCouponId] = useState<string | null>(null);
  const activeCouponId =
    content.coupons.find((coupon) => coupon.id === openCouponId)?.id ?? null;
  const lastEditedCouponId =
    content.coupons.find((coupon) => coupon.id === lastCouponId)?.id ?? null;
  const previewCouponId =
    activeCouponId ??
    lastEditedCouponId ??
    content.coupons[0]?.id ??
    null;

  function handleActiveCouponChange(id: string | null) {
    setOpenCouponId(id);
    if (id) setLastCouponId(id);
  }

  const [openLetterSectionId, setOpenLetterSectionId] =
    useState<LetterSectionId | null>("chapter");
  const [lastLetterSectionId, setLastLetterSectionId] =
    useState<LetterSectionId | null>("chapter");
  const activeLetterSectionId =
    openLetterSectionId ?? lastLetterSectionId ?? "chapter";

  function handleActiveLetterSectionChange(id: LetterSectionId | null) {
    setOpenLetterSectionId(id);
    if (id) setLastLetterSectionId(id);
  }

  const [keyDraft, setKeyDraft] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    editUid ? "loading" : "ready",
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [saved, setSaved] = useState<SavedInfo | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [letterValidationAttempted, setLetterValidationAttempted] =
    useState(false);
  const signatureNameMissing =
    content.finalLetter.signatureName.trim().length === 0;
  const signatureNameError =
    letterValidationAttempted && signatureNameMissing
      ? "Please add a signature name before moving on."
      : null;

  const [basicsValidationAttempted, setBasicsValidationAttempted] =
    useState(false);
  const recipientMissing = content.recipient.trim().length === 0;
  const senderMissing = content.sender.trim().length === 0;
  const recipientError =
    basicsValidationAttempted && recipientMissing
      ? "Please add their name before moving on."
      : null;
  const senderError =
    basicsValidationAttempted && senderMissing
      ? "Please add your name before moving on."
      : null;

  useEffect(() => {
    if (
      !hydrated ||
      !editUid ||
      guestStatus === "loading" ||
      !shouldLoadEditRef.current
    ) {
      return;
    }

    const uid = editUid;
    let cancelled = false;
    const token = authTokenRef.current;

    async function loadPage() {
      try {
        const response = await fetch(`/api/lovely/${encodeURIComponent(uid)}`, {
          cache: "no-store",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error("Could not load this Lovely.");
        const data = (await response.json()) as {
          content?: unknown;
          owned?: boolean;
        };
        const parsed = validateLovelyContent(data.content);
        if (!parsed.success) throw new Error("This Lovely is not readable.");
        if (!cancelled) {
          setContent(parsed.data);
          setOwnsPage(Boolean(data.owned));
          setLoadState("ready");
        }
      } catch {
        if (!cancelled) setLoadState("error");
      }
    }

    loadPage();
    return () => {
      cancelled = true;
    };
  }, [editUid, guestStatus, hydrated]);

  useEffect(() => {
    if (!hydrated || editUid || loadState !== "ready") return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
    } catch {
      // The editor still works without a draft.
    }
  }, [content, editUid, hydrated, loadState]);

  useEffect(() => {
    if (!hydrated) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hydrated, step]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (
      !letterValidationAttempted ||
      step !== "letter" ||
      !signatureNameMissing ||
      openLetterSectionId !== "letter"
    ) {
      return;
    }
    focusSignatureNameField();
  }, [
    letterValidationAttempted,
    openLetterSectionId,
    signatureNameMissing,
    step,
  ]);

  function goToStep(next: StepId) {
    if (
      step === "basics" &&
      next !== "basics" &&
      (recipientMissing || senderMissing)
    ) {
      setBasicsValidationAttempted(true);
      focusBasicsNameField(recipientMissing);
      return;
    }

    if (next === "review" && signatureNameMissing) {
      setLetterValidationAttempted(true);
      setOpenLetterSectionId("letter");
      setLastLetterSectionId("letter");
      if (step !== "letter") {
        setStep("letter");
      }
      if (step === "letter" && openLetterSectionId === "letter") {
        focusSignatureNameField();
      }
      return;
    }
    setStep(next);
  }

  function nextFrom(current: StepId) {
    const index = steps.findIndex((item) => item.id === current);
    return steps[Math.min(index + 1, steps.length - 1)].id;
  }

  function previousFrom(current: StepId) {
    const index = steps.findIndex((item) => item.id === current);
    return steps[Math.max(index - 1, 0)].id;
  }

  function applyEditKey() {
    const cleaned = keyDraft.trim();
    if (!cleaned) return;
    setEditKey(cleaned);
    setKeyDraft("");
    setSaveError(null);
    setIssues([]);
  }

  function resetDraft() {
    if (editUid) return;
    if (
      !window.confirm(
        "Start over with the demo content? Your current draft will be replaced.",
      )
    ) {
      return;
    }
    setContent(createStarterContent());
    setStep("basics");
    setOpenLetterSectionId("chapter");
    setLastLetterSectionId("chapter");
    setBasicsValidationAttempted(false);
    setLetterValidationAttempted(false);
    setIssues([]);
    setSaveError(null);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore.
    }
  }

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      window.prompt("Copy this:", value);
    }
  }

  async function save() {
    setSaveError(null);
    setIssues([]);

    const validation = validateLovelyContent(content);
    if (!validation.success) {
      setIssues(validation.issues);
      setSaveError("A few fields need a little love before this can be saved.");
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (editUid && !editKey && !ownsPage) {
      setSaveError(
        "Add the edit key above or sign in as this page's owner to save your changes.",
      );
      setStep("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        editUid ? `/api/lovely/${encodeURIComponent(editUid)}` : "/api/lovely",
        {
          method: editUid ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authTokenRef.current
              ? { Authorization: `Bearer ${authTokenRef.current}` }
              : {}),
          },
          body: JSON.stringify(
            editUid
              ? { content: validation.data, editKey }
              : { content: validation.data },
          ),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        uid?: string;
        editKey?: string;
        storage?: string;
        error?: string;
        issues?: ValidationIssue[];
      };

      if (!response.ok) {
        setSaveError(data.error ?? "Could not save your Lovely right now.");
        if (Array.isArray(data.issues)) setIssues(data.issues);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (editUid) {
        try {
          window.localStorage.setItem(`lovely.edit.${editUid}`, editKey);
        } catch {
          // The key still works for this session.
        }
        setSaved({
          uid: editUid,
          editKey,
          storage: data.storage ?? "",
        });
        return;
      }

      if (!data.uid || !data.editKey) {
        setSaveError("The page saved, but the link could not be created.");
        return;
      }

      try {
        window.localStorage.setItem(
          `lovely.edit.${data.uid}`,
          data.editKey,
        );
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // The recovery key is still shown on the success screen.
      }

      setEditUid(data.uid);
      setEditKey(data.editKey);
      window.history.replaceState(null, "", `/create?edit=${data.uid}`);
      setSaved({
        uid: data.uid,
        editKey: data.editKey,
        storage: data.storage ?? "",
      });
    } catch {
      setSaveError(
        "The save didn't go through. Check your connection and try again.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  function continueEditing() {
    if (!saved) return;
    setSaved(null);
    setStep("basics");
    setIssues([]);
    setSaveError(null);
    setCopied(null);
    window.history.replaceState(null, "", `/create?edit=${saved.uid}`);
  }

  function startAnother() {
    setSaved(null);
    setEditUid(null);
    setEditKey("");
    setOwnsPage(false);
    setLoadState("ready");
    setContent(createStarterContent());
    setStep("basics");
    setOpenLetterSectionId("chapter");
    setLastLetterSectionId("chapter");
    setBasicsValidationAttempted(false);
    setLetterValidationAttempted(false);
    setIssues([]);
    setSaveError(null);
    setCopied(null);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore.
    }
    window.history.replaceState(null, "", "/create");
  }

  if (!hydrated) {
    return <LoadingScreen message="Opening the editor..." />;
  }

  if (editUid && loadState === "loading") {
    return <LoadingScreen message="Opening your saved Lovely..." />;
  }

  if (editUid && loadState === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-pink-soft text-strawberry">
          <HeartShape className="h-8 w-8" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink">
          We couldn&apos;t find that Lovely.
        </h1>
        <p className="mt-2 max-w-md font-body text-sm leading-relaxed text-ink-soft">
          The edit link might be mistyped, or the page was never saved. You can
          start a fresh Lovely instead.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button"
          >
            Start a new Lovely
          </Link>
          <Link
            href="/"
            className="rounded-full border-2 border-ink/10 bg-white/70 px-5 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-ink-soft"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (saved) {
    const configuredOrigin =
      process.env.NEXT_PUBLIC_SHARE_ORIGIN?.replace(/\/$/, "") ?? "";
    const origin =
      configuredOrigin ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const shareUrl = `${origin}/${saved.uid}`;
    const editUrl = `${origin}/create?edit=${saved.uid}`;

    return (
      <div className="relative min-h-dvh overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
        >
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-pink/20 blur-3xl" />
          <div className="absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-lavender/25 blur-3xl" />
        </div>

        <main className="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex justify-center">
            <Sticker tone="pink">
              <Sparkles className="h-3.5 w-3.5" />
              Saved with love
            </Sticker>
          </div>
          <h1 className="mt-6 text-center text-balance font-display text-[2.5rem] font-semibold leading-[1.05] text-ink sm:text-5xl">
            Your Lovely is <span className="text-strawberry">ready.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-center text-pretty font-body text-sm leading-relaxed text-ink-soft">
            Send this link to {content.recipient}. It opens the exact little
            world you just made.
          </p>
          <div className="mx-auto mt-5 flex items-center justify-center gap-2 text-pink">
            <Squiggle className="w-16" />
            <HeartShape className="h-3 w-3" />
            <Squiggle className="w-16 rotate-180" />
          </div>

          <div className="mt-8 rounded-[1.8rem] border-2 border-white bg-white/85 p-5 shadow-lovely sm:p-7">
            <p className="font-body text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink-soft/65">
              Share link
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={shareUrl}
                aria-label="Share link"
                className="w-full rounded-xl border-2 border-ink/10 bg-cream/60 px-3.5 py-3 font-body text-xs text-ink outline-none"
                onFocus={(event) => event.target.select()}
              />
              <button
                type="button"
                onClick={() => copyValue(shareUrl, "share")}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-strawberry px-5 py-3 font-display text-xs font-semibold text-white shadow-[0_3px_0_#d94360] transition-colors hover:bg-[#f56a80]"
              >
                {copied === "share" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === "share" ? "Copied" : "Copy link"}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${saved.uid}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-strawberry px-5 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
              >
                Open your Lovely
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={continueEditing}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-ink/10 bg-white px-5 py-3 font-display text-sm font-semibold text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
              >
                Edit this page
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {saved.storage === "file" ? (
              <div className="mt-5 rounded-xl border-2 border-dashed border-butter bg-butter-soft/60 p-3">
                <p className="font-body text-[0.72rem] leading-relaxed text-[#7a5a1f]">
                  <strong>Local development mode:</strong> this Lovely was saved
                  to a JSON file on this machine. Add Supabase environment
                  variables for links that work anywhere.
                </p>
              </div>
            ) : null}

            {saved.editKey ? (
              <div className="mt-5 rounded-xl border-2 border-dashed border-lavender bg-lavender-soft/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-display text-sm font-semibold text-[#6b5195]">
                    <KeyRound className="h-4 w-4" />
                    Your edit key
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(saved.editKey, "key")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 font-body text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[#6b5195] transition-colors hover:bg-white"
                  >
                    {copied === "key" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied === "key" ? "Copied" : "Copy key"}
                  </button>
                </div>
                <code className="mt-2 block break-all rounded-lg bg-white/70 px-3 py-2 font-mono text-[0.7rem] text-ink-soft">
                  {saved.editKey}
                </code>
                <p className="mt-2 font-hand text-base leading-tight text-[#6b5195]/80">
                  Keep this private. You&apos;ll need it to edit from another
                  browser.
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border-2 border-dashed border-mint bg-mint-soft/40 p-4">
                <div className="flex items-center gap-2 font-display text-sm font-semibold text-[#3d8a6d]">
                  <Heart className="h-4 w-4" />
                  Saved to your Lovely account
                </div>
                <p className="mt-1.5 font-hand text-base leading-tight text-[#3d8a6d]/80">
                  You can edit this page from your account without needing the
                  original edit key.
                </p>
              </div>
            )}

            <div className="mt-5 rounded-xl border-2 border-pink/25 bg-blush/35 p-4">
              <p className="font-display text-sm font-semibold text-ink">
                Want to keep all your Lovely pages in one place?
              </p>
              <p className="mt-1 font-body text-[0.72rem] leading-relaxed text-ink-soft">
                Create a free Lovely account to save your pages, photos, and
                customizations. You can always keep using your edit key instead.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-white/75 p-3">
                  <div className="flex items-center gap-1.5 font-body text-[0.56rem] font-bold uppercase tracking-[0.12em] text-[#6b5195]">
                    <KeyRound className="h-3.5 w-3.5" />
                    Keep my edit key
                  </div>
                  <p className="mt-1 font-hand text-base leading-tight text-[#6b5195]/85">
                    Save the key from when you created this page. You will need
                    it to edit from another browser or device.
                  </p>
                </div>
                <div className="rounded-xl bg-white/75 p-3">
                  <div className="flex items-center gap-1.5 font-body text-[0.56rem] font-bold uppercase tracking-[0.12em] text-strawberry">
                    <Heart className="h-3.5 w-3.5" />
                    Create a Lovely account
                  </div>
                  <p className="mt-1 font-hand text-base leading-tight text-[#8f4557]/85">
                    Keep your pages, future photos, and projects together in one
                    place.
                  </p>
                  {user && !isAnonymous ? (
                    <Link
                      href="/account"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-strawberry px-3.5 py-2 font-display text-[0.68rem] font-semibold text-white shadow-[0_3px_0_#d94360] transition-colors hover:bg-[#f56a80]"
                    >
                      Open your account
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : user && isAnonymous ? (
                    <Link
                      href="/signup"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-strawberry px-3.5 py-2 font-display text-[0.68rem] font-semibold text-white shadow-[0_3px_0_#d94360] transition-colors hover:bg-[#f56a80]"
                    >
                      Create free account
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <p className="mt-2 font-body text-[0.62rem] leading-relaxed text-ink-soft/70">
                      {guestStatus === "loading"
                        ? "Checking your account..."
                        : "Account sign-up is unavailable right now. Your edit key still works."}
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-2 text-center font-body text-[0.62rem] text-ink-soft/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-strawberry transition-colors hover:text-strawberry-deep"
                >
                  Log in
                </Link>
              </p>
            </div>

            <p className="mt-5 text-center font-hand text-lg text-ink-soft/60">
              Psst — the link is public to anyone who has it. Share it only with
              your person.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={startAnother}
              className="rounded-full border-2 border-pink-soft bg-white/70 px-4 py-2 font-body text-[0.62rem] font-bold uppercase tracking-[0.14em] text-strawberry transition-colors hover:border-pink hover:bg-blush"
            >
              Create another
            </button>
            <button
              type="button"
              onClick={() => copyValue(editUrl, "edit")}
              className="rounded-full border-2 border-ink/10 bg-white/70 px-4 py-2 font-body text-[0.62rem] font-bold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
            >
              {copied === "edit" ? "Edit link copied" : "Copy edit link"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const configuredOrigin =
    process.env.NEXT_PUBLIC_SHARE_ORIGIN?.replace(/\/$/, "") ?? "";
  const shareOrigin =
    configuredOrigin ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const editShareUrl = editUid ? `${shareOrigin}/${editUid}` : null;

  const stepIndex = steps.findIndex((item) => item.id === step);
  const isLast = step === "review";
  const nextStep = nextFrom(step);
  const nextStepLabel = steps.find((item) => item.id === nextStep)?.label;

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-pink/20 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-lavender/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-butter/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/60 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-strawberry text-white shadow-[0_3px_0_#d94360]">
              <HeartShape className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-display text-[1.3rem] font-semibold leading-none tracking-tight text-ink">
                lovely<span className="text-strawberry">.</span>
              </span>
              <span className="hidden font-hand text-sm leading-none text-ink-soft sm:block">
                make it theirs
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-lavender-soft px-3 py-1.5 font-body text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[#7b60b5] md:inline">
              {editUid ? `Editing /${editUid}` : "New Lovely"}
            </span>
            <Link
              href="/"
              className="rounded-full border-2 border-ink/10 bg-white/70 px-4 py-2 font-body text-[0.6rem] font-bold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
            >
              View demo
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <Sticker tone="pink">
              <Sparkles className="h-3.5 w-3.5" />
              {editUid ? "Editing your Lovely" : "Create your own"}
            </Sticker>
            <h1 className="mt-4 text-balance font-display text-[2.35rem] font-semibold leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
              {editUid ? (
                <>
                  Polish the <span className="text-strawberry">little details.</span>
                </>
              ) : (
                <>
                  Make them a <span className="text-strawberry">little world.</span>
                </>
              )}
            </h1>
            <p className="mt-3 max-w-lg text-pretty font-body text-[0.92rem] leading-relaxed text-ink-soft sm:text-base">
              Fill in the pieces below, preview as you go, then save it into one
              short link. No account, no app — just a love note with a UID.
            </p>
          </div>

          {!editUid ? (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="font-hand text-lg text-ink-soft/65">
                draft auto-saves in this browser
              </p>
              <button
                type="button"
                onClick={resetDraft}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white/70 px-3.5 py-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
              >
                <RotateCcw className="h-3 w-3" />
                Start over
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="font-hand text-lg text-ink-soft/65">
                saves update this same link
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {editShareUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        copyValue(editShareUrl, "editor-share")
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-pink-soft bg-white/70 px-3.5 py-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.12em] text-strawberry transition-colors hover:border-pink hover:bg-blush"
                    >
                      {copied === "editor-share" ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copied === "editor-share"
                        ? "Copied"
                        : "Copy share link"}
                    </button>
                    <Link
                      href={`/${editUid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white/70 px-3.5 py-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
                    >
                      Open page
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </>
                ) : null}
                {editKey ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditKey("");
                      setKeyDraft("");
                      try {
                        window.localStorage.removeItem(
                          `lovely.edit.${editUid}`,
                        );
                      } catch {
                        // Ignore.
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white/70 px-3.5 py-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-[#c7b4f4] hover:text-[#7b60b5]"
                  >
                    <KeyRound className="h-3 w-3" />
                    Different edit key
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <StepNav current={step} onSelect={goToStep} />

        {editUid && !editKey && !ownsPage ? (
          <EditKeyBanner
            value={keyDraft}
            onChange={setKeyDraft}
            onApply={applyEditKey}
          />
        ) : null}

        {saveError ? <ErrorBanner message={saveError} /> : null}

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {step === "basics" ? (
              <BasicsStep
                content={content}
                setContent={setContent}
                recipientError={recipientError}
                senderError={senderError}
              />
            ) : null}
            {step === "story" ? (
              <StoryStep
                content={content}
                setContent={setContent}
                activeMemoryId={activeMemoryId}
                onActiveMemoryChange={handleActiveMemoryChange}
              />
            ) : null}
            {step === "quiz" ? (
              <QuizStep
                content={content}
                setContent={setContent}
                activeQuestionId={activeQuestionId}
                onActiveQuestionChange={handleActiveQuestionChange}
              />
            ) : null}
            {step === "gifts" ? (
              <GiftsStep
                content={content}
                setContent={setContent}
                activeCouponId={activeCouponId}
                onActiveCouponChange={handleActiveCouponChange}
                tab={giftTab}
                onTabChange={setGiftTab}
              />
            ) : null}
            {step === "letter" ? (
              <LetterStep
                content={content}
                setContent={setContent}
                signatureNameError={signatureNameError}
                openSectionId={openLetterSectionId}
                onOpenSectionChange={handleActiveLetterSectionChange}
              />
            ) : null}
            {step === "review" ? (
              <ReviewStep content={content} issues={issues} />
            ) : null}
          </div>

          <aside className="order-first h-max lg:sticky lg:top-24 lg:order-last">
            <LivePreview
              content={content}
              step={step}
              activeMemoryId={previewMemoryId}
              activeQuestionId={previewQuestionId}
              activeCouponId={previewCouponId}
              activeLetterSectionId={activeLetterSectionId}
              giftTab={giftTab}
              onSecretPositionChange={(id, x, y) =>
                setContent((previous) => ({
                  ...previous,
                  secretMessages: moveSecretMessage(
                    previous.secretMessages,
                    id,
                    x,
                    y,
                  ),
                }))
              }
            />
          </aside>
        </div>

        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-3 rounded-[1.5rem] border-2 border-white bg-white/60 p-4 sm:flex-row">
          <GhostButton
            onClick={() => goToStep(previousFrom(step))}
            className={cn(stepIndex === 0 && "invisible")}
          >
            Back
          </GhostButton>

          <div className="flex flex-col items-center gap-2">
            {isLast ? (
              <>
                <PrimaryButton
                  onClick={save}
                  disabled={saving}
                  icon={false}
                  className="px-8"
                >
                  {saving
                    ? "Saving..."
                    : editUid
                      ? "Save changes"
                      : "Create my Lovely"}
                  {saving ? null : <Heart className="h-4 w-4" />}
                </PrimaryButton>
                <p className="font-hand text-base text-ink-soft/55">
                  {editUid
                    ? "your share link stays the same"
                    : "you'll get a short link to send"}
                </p>
              </>
            ) : (
              <>
                <PrimaryButton onClick={() => goToStep(nextStep)}>
                  Next: {nextStepLabel}
                </PrimaryButton>
                <p className="font-hand text-base text-ink-soft/55">
                  step {stepIndex + 1} of {steps.length}
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
