import { NextResponse } from "next/server";
import { compressConfig } from "@/lib/compression";
import {
  createPage,
  deletePageRecord,
  getAuthenticatedUserIdFromRequest,
  getStorageConfigIssue,
  getStorageMode,
} from "@/lib/lovely-store";
import { collectMemoryImageReferences } from "@/lib/image-references";
import { syncPageImageReferences } from "@/lib/image-store";
import {
  MAX_COMPRESSED_LENGTH,
  MAX_CONTENT_BYTES,
  validateLovelyContent,
} from "@/lib/lovely-schema";
import { recordUserActivity } from "@/lib/user-activity";

export async function POST(request: Request) {
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

  const content = (body as { content?: unknown } | null)?.content;
  const parsed = validateLovelyContent(content);

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
    const ownerId = await getAuthenticatedUserIdFromRequest(request);
    const created = await createPage(compressed, ownerId);
    const references = collectMemoryImageReferences(parsed.data);

    try {
      if (references.length > 0) {
        await syncPageImageReferences(created.uid, ownerId, references);
      }
    } catch (referenceError) {
      await deletePageRecord(created.uid).catch(() => undefined);
      throw referenceError;
    }

    await recordUserActivity([ownerId]);

    return NextResponse.json(
      {
        uid: created.uid,
        editKey: created.editKey,
        storage: created.storage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create Lovely page", error);
    return NextResponse.json(
      { error: "Could not save your Lovely right now. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    storage: getStorageMode(),
  });
}
