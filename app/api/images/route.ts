import { NextResponse } from "next/server";
import { authorizeImageRequest } from "@/lib/image-auth";
import {
  addPageImageReference,
  createImageAsset,
  listOwnerImages,
  listPageImages,
} from "@/lib/image-store";
import {
  MAX_STORED_IMAGE_BYTES,
  validateStoredImage,
} from "@/lib/image-validation";
import { getStorageConfigIssue } from "@/lib/lovely-store";

function queryValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId");
  const editKey = url.searchParams.get("editKey");

  const authorization = await authorizeImageRequest({
    request,
    pageId,
    editKey,
  });

  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  try {
    if (authorization.method === "edit_key" && authorization.pageId) {
      return NextResponse.json({
        scope: "page",
        images: await listPageImages(authorization.pageId),
      });
    }

    return NextResponse.json({
      scope: "library",
      images: await listOwnerImages(authorization.ownerId as string),
    });
  } catch (error) {
    console.error("Failed to list Lovely images", error);
    return NextResponse.json(
      { error: "Could not load your photos right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const storageIssue = getStorageConfigIssue();
  if (storageIssue) {
    return NextResponse.json({ error: storageIssue }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_STORED_IMAGE_BYTES + 500_000) {
    return NextResponse.json(
      { error: "That processed image is still a little too large." },
      { status: 413 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not read the uploaded photo." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const pageId = queryValue(form.get("pageId")) || null;
  const editKey = queryValue(form.get("editKey")) || null;
  const memoryId = queryValue(form.get("memoryId")) || null;
  const originalFilename =
    queryValue(form.get("originalFilename")).slice(0, 200) || null;

  if (
    !file ||
    typeof file !== "object" ||
    !("arrayBuffer" in file) ||
    typeof file.arrayBuffer !== "function"
  ) {
    return NextResponse.json(
      { error: "Choose a processed photo to upload." },
      { status: 400 },
    );
  }

  const authorization = await authorizeImageRequest({
    request,
    pageId,
    editKey,
  });

  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const validation = validateStoredImage(buffer);

    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 },
      );
    }

    const image = await createImageAsset({
      ownerId: authorization.ownerId,
      uploadedByUserId: authorization.uploaderUserId,
      uploadMethod: authorization.method,
      pageId: authorization.pageId,
      memoryId,
      bytes: buffer,
      mimeType: validation.mimeType,
      width: validation.dimensions.width,
      height: validation.dimensions.height,
      originalFilename,
    });

    if (authorization.pageId && memoryId) {
      await addPageImageReference(
        authorization.pageId,
        image.id,
        memoryId,
      ).catch((referenceError) => {
        console.error("Failed to reference uploaded Lovely image", referenceError);
      });
    }

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload Lovely image", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save your photo right now.",
      },
      { status: 500 },
    );
  }
}
