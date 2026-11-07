"use client";

import { useRef, useState } from "react";
import { ImagePlus, Images, Trash2, Upload } from "lucide-react";
import type { LovelyImage } from "@/lib/image-types";
import type { Memory } from "@/content/lovely";
import {
  uploadProcessedImage,
  validateOriginalImage,
} from "@/lib/image-client";
import { useGuestSession } from "@/components/auth/GuestSessionProvider";
import { MemoryPhoto } from "@/components/lovely/MemoryPhoto";
import { cn } from "@/lib/cn";
import { OptionPicker } from "./fields";
import { ImageCropper, type CroppedImage } from "./ImageCropper";
import { photoOptions } from "./options";

const scenePickerOptions = photoOptions.map((option) => ({
  ...option,
  preview: (
    <span className="h-10 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-ink/5">
      <MemoryPhoto variant={option.value} className="h-full w-full rounded-lg" />
    </span>
  ),
}));

export function MemoryPhotoSourceToggle({
  source,
  onChange,
}: {
  source: "template" | "upload";
  onChange: (source: "template" | "upload") => void;
}) {
  return (
    <div className="inline-flex rounded-full border-2 border-white bg-white/60 p-1">
      <button
        type="button"
        onClick={() => onChange("template")}
        className={cn(
          "rounded-full px-3.5 py-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.1em] transition-colors",
          source === "template"
            ? "bg-strawberry text-white"
            : "text-ink-soft hover:bg-blush hover:text-strawberry",
        )}
      >
        Use a template
      </button>
      <button
        type="button"
        onClick={() => onChange("upload")}
        className={cn(
          "rounded-full px-3.5 py-2 font-body text-[0.58rem] font-bold uppercase tracking-[0.1em] transition-colors",
          source === "upload"
            ? "bg-strawberry text-white"
            : "text-ink-soft hover:bg-blush hover:text-strawberry",
        )}
      >
        Upload your photo
      </button>
    </div>
  );
}

export function MemoryPhotoField({
  memory,
  pageId,
  editKey,
  images,
  usedImageIds,
  onPatch,
  onImageCreated,
  onImageRemoved,
  onImagesRefresh,
}: {
  memory: Memory;
  pageId: string | null;
  editKey: string;
  images: LovelyImage[] | null;
  usedImageIds: string[];
  onPatch: (patch: Partial<Memory>) => void;
  onImageCreated: (image: LovelyImage) => void;
  onImageRemoved: (imageId: string) => void;
  onImagesRefresh: () => void;
}) {
  const { session } = useGuestSession();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const source = memory.photoSource === "upload" ? "upload" : "template";
  const selectedImage =
    memory.photoImageId && images
      ? images.find((image) => image.id === memory.photoImageId) ?? null
      : null;

  async function chooseFile(nextFile: File | undefined) {
    if (!nextFile) return;
    setError(null);
    const validation = await validateOriginalImage(nextFile);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setFile(nextFile);
    setUploadProgress(0);
  }

  function removeFromStory() {
    onPatch({ photoSource: "template", photoImageId: null });
  }

  async function confirmCrop(cropped: CroppedImage) {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const image = await uploadProcessedImage({
        blob: cropped.blob,
        filename: cropped.filename,
        pageId,
        editKey: editKey || null,
        memoryId: memory.id,
        accessToken: session?.access_token ?? null,
        onProgress: setUploadProgress,
      });

      onImageCreated(image);
      onPatch({ photoSource: "upload", photoImageId: image.id });
      setFile(null);
      onImagesRefresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload this photo.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(image: LovelyImage) {
    if (deletingId) return;
    if (usedImageIds.includes(image.id)) {
      setError(
        "This photo is still used in a story. Remove it from every story before deleting it from your library.",
      );
      return;
    }
    if (
      !window.confirm(
        "Delete this photo from your library? Photos still used in a story cannot be deleted.",
      )
    ) {
      return;
    }

    setDeletingId(image.id);
    setError(null);

    try {
      const response = await fetch(`/api/images/${image.id}`, {
        method: "DELETE",
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete this photo.");
      }

      if (memory.photoImageId === image.id) {
        removeFromStory();
      }
      onImageRemoved(image.id);
      onImagesRefresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this photo.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {source === "template" ? (
        <div>
          <p className="mb-1.5 font-body text-[0.64rem] font-bold uppercase tracking-[0.14em] text-ink-soft/75">
            Photo scene <span className="text-strawberry">*</span>
          </p>
          <OptionPicker
            value={memory.photo}
            onChange={(photo) => onPatch({ photo, photoSource: "template" })}
            options={scenePickerOptions}
            label="Photo scene"
          />
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-pink/40 bg-white/55 p-3">
          {selectedImage ? (
            <div className="grid gap-3 sm:grid-cols-[140px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-xl">
                <MemoryPhoto
                  variant={memory.photo}
                  image={{
                    src: selectedImage.url,
                    width: selectedImage.width,
                    height: selectedImage.height,
                    alt: "Selected memory photo",
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-ink">
                  Your photo is ready.
                </p>
                <p className="mt-1 font-hand text-base leading-tight text-[#8f4557]/85">
                  This shared photo can be used by more than one story. Upload a
                  new crop to replace it without changing the other one.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-strawberry px-3 py-1.5 font-body text-[0.55rem] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#f56a80]"
                  >
                    <Upload className="h-3 w-3" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={removeFromStory}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink/10 bg-white px-3 py-1.5 font-body text-[0.55rem] font-bold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-5 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-pink-soft text-strawberry">
                <ImagePlus className="h-5 w-5" />
              </span>
              <p className="font-display text-sm font-semibold text-ink">
                Add a photograph
              </p>
              <p className="max-w-sm font-body text-[0.7rem] leading-relaxed text-ink-soft">
                JPEG, PNG, WebP, or a browser-supported HEIC up to 5 MB. You can
                crop it before it is saved.
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-strawberry px-4 py-2 font-display text-xs font-semibold text-white shadow-[0_3px_0_#d94360] transition-colors hover:bg-[#f56a80]"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload photo
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="sr-only"
            onChange={(event) => {
              void chooseFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 font-body text-[0.58rem] font-bold uppercase tracking-[0.12em] text-ink-soft/65">
              <Images className="h-3 w-3" />
              Your photo library
            </p>

            {images === null ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <span
                    key={index}
                    className="aspect-[4/3] animate-pulse rounded-lg bg-white/70"
                  />
                ))}
              </div>
            ) : images.length === 0 ? (
              <p className="rounded-xl bg-white/70 px-3 py-2 font-body text-[0.68rem] leading-relaxed text-ink-soft/70">
                No uploaded photos yet. Your first upload will appear here, ready
                to reuse.
              </p>
            ) : (
              <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                {images.map((image) => {
                  const selected = memory.photoImageId === image.id;
                  return (
                    <div key={image.id} className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          onPatch({
                            photoSource: "upload",
                            photoImageId: image.id,
                          })
                        }
                        className={cn(
                          "block w-full overflow-hidden rounded-lg border-2 bg-white p-0.5 transition-colors",
                          selected
                            ? "border-strawberry ring-2 ring-pink/25"
                            : "border-white hover:border-pink/60",
                        )}
                        aria-label="Use this photo"
                      >
                        <img
                          src={image.url}
                          alt={image.originalFilename ?? "Uploaded photo"}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] w-full rounded-md object-cover"
                        />
                      </button>
                      {image.canDelete ? (
                        <button
                          type="button"
                          onClick={() => void deleteImage(image)}
                          disabled={deletingId === image.id}
                          aria-label="Delete photo from library"
                          title="Delete photo"
                          className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-ink-soft shadow-sm transition-colors hover:text-strawberry disabled:opacity-50"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {uploading ? (
        <p className="font-hand text-base text-strawberry">
          Uploading your photo... {uploadProgress}%
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-xl border-2 border-strawberry/25 bg-blush/70 px-3 py-2 font-body text-xs leading-relaxed text-[#7d4250]"
        >
          {error}
        </p>
      ) : null}

      {file ? (
        <ImageCropper
          file={file}
          onCancel={() => {
            if (!uploading) setFile(null);
          }}
          onConfirm={(cropped) => void confirmCrop(cropped)}
          busy={uploading}
          uploadError={error}
        />
      ) : null}
    </div>
  );
}
