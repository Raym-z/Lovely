export const CREATE_DRAFT_KEY = "lovely.create.draft.v2";

export type CreateDraftSummary = {
  recipient: string;
  sender: string;
  title: string;
  tagline: string;
};

export function readCreateDraftSummary(): CreateDraftSummary | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CREATE_DRAFT_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as {
      recipient?: unknown;
      sender?: unknown;
      tagline?: unknown;
      invitation?: { title?: unknown } | null;
    };

    if (!value || typeof value !== "object") return null;
    if (
      typeof value.recipient !== "string" ||
      typeof value.sender !== "string" ||
      typeof value.tagline !== "string" ||
      !value.invitation ||
      typeof value.invitation !== "object" ||
      typeof value.invitation.title !== "string"
    ) {
      return null;
    }

    const recipient = value.recipient.trim();
    const sender = value.sender.trim();
    if (!recipient && !sender) return null;

    return {
      recipient,
      sender,
      title: value.invitation.title.trim(),
      tagline: value.tagline.trim(),
    };
  } catch {
    return null;
  }
}

export function clearCreateDraft() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CREATE_DRAFT_KEY);
  } catch {
    // The editor still works without local storage.
  }
}
