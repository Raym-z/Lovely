import "server-only";

import crypto from "node:crypto";
import type { LovelyImage } from "@/lib/image-types";
import {
  MAX_IMAGES_PER_OWNER,
  MAX_IMAGES_PER_PAGE,
  MAX_OWNER_IMAGE_BYTES,
} from "@/lib/image-validation";
import { getSupabaseAdminClient } from "@/lib/lovely-store";

const IMAGES_TABLE = "lovely_images";
const REFERENCES_TABLE = "lovely_image_references";
export const IMAGE_BUCKET = "lovely-images";

type ImageRow = {
  id: string;
  owner_id: string | null;
  storage_path: string;
  mime_type: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string | null;
  created_at: string;
};

function getProjectUrl() {
  return (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .replace(/\/$/, "");
}

export function getImagePublicUrl(storagePath: string) {
  const encoded = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${getProjectUrl()}/storage/v1/object/public/${IMAGE_BUCKET}/${encoded}`;
}

function toLovelyImage(row: ImageRow, canDelete = false): LovelyImage {
  return {
    id: row.id,
    url: getImagePublicUrl(row.storage_path),
    width: row.width,
    height: row.height,
    mimeType: row.mime_type,
    bytes: Number(row.bytes),
    originalFilename: row.original_filename,
    createdAt: row.created_at,
    canDelete,
  };
}

export async function getImageRecord(id: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(IMAGES_TABLE)
    .select(
      "id, owner_id, storage_path, mime_type, width, height, bytes, original_filename, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ImageRow | null) ?? null;
}

export async function getImagesByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(IMAGES_TABLE)
    .select(
      "id, owner_id, storage_path, mime_type, width, height, bytes, original_filename, created_at",
    )
    .in("id", uniqueIds);

  if (error) throw new Error(error.message);
  return ((data ?? []) as ImageRow[]).map((row) => toLovelyImage(row));
}

export async function listOwnerImages(ownerId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(IMAGES_TABLE)
    .select(
      "id, owner_id, storage_path, mime_type, width, height, bytes, original_filename, created_at",
    )
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ImageRow[]).map((row) => toLovelyImage(row, true));
}

export async function listPageImages(pageId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(REFERENCES_TABLE)
    .select("image_id")
    .eq("page_id", pageId);

  if (error) throw new Error(error.message);
  const ids = ((data ?? []) as Array<{ image_id: string }>).map(
    (row) => row.image_id,
  );

  return getImagesByIds(ids);
}

export async function getReferenceCount(imageId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from(REFERENCES_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("image_id", imageId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function enforceOwnerQuota(ownerId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { data, error } = await supabase
    .from(IMAGES_TABLE)
    .select("bytes")
    .eq("owner_id", ownerId);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<{ bytes: number }>;

  if (rows.length >= MAX_IMAGES_PER_OWNER) {
    throw new Error("This photo library has reached its image limit.");
  }

  const usedBytes = rows.reduce((total, row) => total + Number(row.bytes), 0);
  if (usedBytes >= MAX_OWNER_IMAGE_BYTES) {
    throw new Error("This photo library has reached its storage limit.");
  }
}

async function enforcePageQuota(pageId: string, memoryId: string | null) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { data, error } = await supabase
    .from(REFERENCES_TABLE)
    .select("id, memory_id")
    .eq("page_id", pageId);

  if (error) throw new Error(error.message);
  const references = (data ?? []) as Array<{
    id: string;
    memory_id: string;
  }>;

  if (
    references.length >= MAX_IMAGES_PER_PAGE &&
    (!memoryId ||
      !references.some((reference) => reference.memory_id === memoryId))
  ) {
    throw new Error("This Lovely page has reached its photo limit.");
  }
}

export async function createImageAsset({
  ownerId,
  uploadedByUserId,
  uploadMethod,
  pageId,
  memoryId,
  bytes,
  mimeType,
  width,
  height,
  originalFilename,
}: {
  ownerId: string | null;
  uploadedByUserId: string | null;
  uploadMethod: "owner_session" | "edit_key";
  pageId: string | null;
  memoryId: string | null;
  bytes: Uint8Array;
  mimeType: "image/webp" | "image/jpeg";
  width: number;
  height: number;
  originalFilename: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase Storage is not configured.");
  }

  if (ownerId) {
    await enforceOwnerQuota(ownerId);
  } else if (pageId) {
    await enforcePageQuota(pageId, memoryId);
  }

  const id = crypto.randomUUID();
  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  const storagePath = `${ownerId ?? "unowned"}/${pageId ?? "library"}/${id}.${extension}`;
  const checksum = crypto.createHash("sha256").update(bytes).digest("hex");

  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(storagePath, bytes, {
      contentType: mimeType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from(IMAGES_TABLE)
    .insert({
      id,
      owner_id: ownerId,
      storage_path: storagePath,
      mime_type: mimeType,
      width,
      height,
      bytes: bytes.byteLength,
      original_filename: originalFilename,
      checksum,
      uploaded_by_user_id: uploadedByUserId,
      upload_method: uploadMethod,
    })
    .select(
      "id, owner_id, storage_path, mime_type, width, height, bytes, original_filename, created_at",
    )
    .single();

  if (error) {
    await supabase.storage.from(IMAGE_BUCKET).remove([storagePath]);
    throw new Error(error.message);
  }

  return toLovelyImage(data as ImageRow);
}

export async function deleteOwnedImage(ownerId: string, imageId: string) {
  const image = await getImageRecord(imageId);
  if (!image) return { ok: false as const, reason: "not_found" as const };
  if (image.owner_id !== ownerId) {
    return { ok: false as const, reason: "forbidden" as const };
  }

  const references = await getReferenceCount(imageId);
  if (references > 0) {
    return { ok: false as const, reason: "in_use" as const, references };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  const { error: storageError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .remove([image.storage_path]);

  if (storageError) throw new Error(storageError.message);

  const { error } = await supabase
    .from(IMAGES_TABLE)
    .delete()
    .eq("id", imageId);

  if (error) throw new Error(error.message);
  return { ok: true as const };
}

export async function claimPageImages(pageId: string, ownerId: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  const { data, error } = await supabase
    .from(REFERENCES_TABLE)
    .select("image_id")
    .eq("page_id", pageId);

  if (error) throw new Error(error.message);

  const imageIds = [
    ...new Set(
      ((data ?? []) as Array<{ image_id: string }>).map(
        (row) => row.image_id,
      ),
    ),
  ];

  if (imageIds.length === 0) return;

  const { error: updateError } = await supabase
    .from(IMAGES_TABLE)
    .update({ owner_id: ownerId })
    .in("id", imageIds)
    .is("owner_id", null);

  if (updateError) throw new Error(updateError.message);
}

export async function addPageImageReference(
  pageId: string,
  imageId: string,
  memoryId: string,
) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from(REFERENCES_TABLE)
    .upsert(
      {
        page_id: pageId,
        image_id: imageId,
        memory_id: memoryId,
      },
      { onConflict: "page_id,memory_id" },
    );

  if (error) throw new Error(error.message);
}

export async function syncPageImageReferences(
  pageId: string,
  ownerId: string | null,
  references: Array<{ imageId: string; memoryId: string }>,
) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const uniqueReferences = [...new Map(
    references.map((reference) => [
      reference.memoryId,
      reference,
    ]),
  ).values()];

  if (uniqueReferences.length > MAX_IMAGES_PER_PAGE) {
    throw new Error("This Lovely page has too many photos.");
  }

  const imageIds = [...new Set(uniqueReferences.map((ref) => ref.imageId))];
  const images = await getImagesByIds(imageIds);

  if (images.length !== imageIds.length) {
    throw new Error("One of the selected photos could not be found.");
  }

  const imageRows = await Promise.all(imageIds.map((id) => getImageRecord(id)));

  for (const image of imageRows) {
    if (!image) {
      throw new Error("One of the selected photos could not be found.");
    }
    if (image.owner_id !== ownerId && image.owner_id !== null) {
      throw new Error("One of the selected photos belongs to another account.");
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from(REFERENCES_TABLE)
    .select("id, memory_id")
    .eq("page_id", pageId);

  if (existingError) {
    const missingImageSchema =
      existingError.code === "42P01" || existingError.code === "42703";
    if (missingImageSchema && uniqueReferences.length === 0) return;
    throw new Error(existingError.message);
  }

  if (uniqueReferences.length > 0) {
    const { error: upsertError } = await supabase
      .from(REFERENCES_TABLE)
      .upsert(
        uniqueReferences.map((reference) => ({
          image_id: reference.imageId,
          page_id: pageId,
          memory_id: reference.memoryId,
        })),
        { onConflict: "page_id,memory_id" },
      );

    if (upsertError) throw new Error(upsertError.message);
  }

  const activeMemoryIds = new Set(
    uniqueReferences.map((reference) => reference.memoryId),
  );
  const staleIds = ((existing ?? []) as Array<{
    id: string;
    memory_id: string;
  }>)
    .filter((reference) => !activeMemoryIds.has(reference.memory_id))
    .map((reference) => reference.id);

  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from(REFERENCES_TABLE)
      .delete()
      .in("id", staleIds);

    if (deleteError) throw new Error(deleteError.message);
  }
}
