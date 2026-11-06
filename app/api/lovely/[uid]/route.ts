import { NextResponse } from "next/server";
import { compressConfig, decompressConfig } from "@/lib/compression";
import {
  getAuthenticatedUserIdFromRequest,
  getPage,
  getStorageConfigIssue,
  getStorageMode,
  updatePage,
} from "@/lib/lovely-store";
import { collectMemoryImageReferences } from "@/lib/image-references";
import {
  claimPageImages,
  syncPageImageReferences,
} from "@/lib/image-store";
import {
  MAX_COMPRESSED_LENGTH,
  MAX_CONTENT_BYTES,
  validateLovelyContent,
} from "@/lib/lovely-schema";

type RouteContext = {
  params: Promise<{ uid: string }>;
};

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
  };
}

export async function GET(request: Request, context: RouteContext) {
  const { uid } = await context.params;

  try {
    const ownerId = await getAuthenticatedUserIdFromRequest(request);
    const page = await getPage(uid);
    if (!page) {
      return NextResponse.json(
        { error: "This Lovely could not be found." },
        { status: 404, headers: noStoreHeaders() },
      );
    }

    const content: unknown = decompressConfig(page.config);
    const parsed = validateLovelyContent(content);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "This Lovely is not readable." },
        { status: 500, headers: noStoreHeaders() },
      );
    }

    return NextResponse.json(
      {
        content: parsed.data,
        owned: Boolean(ownerId && page.ownerId === ownerId),
      },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    console.error("Failed to read Lovely page", error);
    return NextResponse.json(
      { error: "Could not read this Lovely right now." },
      { status: 500, headers: noStoreHeaders() },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { uid } = await context.params;

  const configIssue = getStorageConfigIssue();
  if (configIssue) {
    return NextResponse.json({ error: configIssue }, { status: 503 });
  }

  if (process.env.VERCEL === "1" && getStorageMode() === "file") {
    return NextResponse.json(
      {
        error:
          "Storage is not configured. Add the Supabase environment variables before saving.",
      },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_CONTENT_BYTES) {
    return NextResponse.json(
      { error: "This Lovely is a little too big to save." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = body as { content?: unknown; editKey?: unknown } | null;
  const editKey = typeof payload?.editKey === "string" ? payload.editKey : "";
  const ownerId = await getAuthenticatedUserIdFromRequest(request);

  if (!editKey && !ownerId) {
    return NextResponse.json(
      { error: "The edit key is missing." },
      { status: 401 },
    );
  }

  const parsed = validateLovelyContent(payload?.content);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some of the love note needs another look.",
        issues: parsed.issues,
      },
      { status: 400 },
    );
  }

  const compressed = compressConfig(parsed.data);
  if (compressed.length > MAX_COMPRESSED_LENGTH) {
    return NextResponse.json(
      { error: "This Lovely is a little too big to save." },
      { status: 413 },
    );
  }

  try {
    const result = await updatePage(uid, compressed, editKey, ownerId);

    if (!result.ok && result.reason === "not_found") {
      return NextResponse.json(
        { error: "This Lovely could not be found." },
        { status: 404 },
      );
    }

    if (!result.ok) {
      return NextResponse.json(
        { error: "That edit key does not match this Lovely." },
        { status: 403 },
      );
    }

    const references = collectMemoryImageReferences(parsed.data);
    if (references.length > 0) {
      const storedPage = await getPage(uid);
      if (!storedPage) {
        return NextResponse.json(
          { error: "This Lovely could not be found." },
          { status: 404 },
        );
      }

      await syncPageImageReferences(
        uid,
        storedPage.ownerId,
        references,
      );
      if (storedPage.ownerId) {
        await claimPageImages(uid, storedPage.ownerId);
      }
    } else {
      const storedPage = await getPage(uid);
      if (storedPage) {
        await syncPageImageReferences(uid, storedPage.ownerId, []);
        if (storedPage.ownerId) {
          await claimPageImages(uid, storedPage.ownerId);
        }
      }
    }

    return NextResponse.json({ ok: true, storage: result.storage });
  } catch (error) {
    console.error("Failed to update Lovely page", error);
    return NextResponse.json(
      { error: "Could not save your changes right now. Please try again." },
      { status: 500 },
    );
  }
}
