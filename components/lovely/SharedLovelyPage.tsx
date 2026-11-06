import Link from "next/link";
import { decompressConfig } from "@/lib/compression";
import { collectMemoryImageReferences } from "@/lib/image-references";
import { getImagesByIds } from "@/lib/image-store";
import { getPage, type StoredPage } from "@/lib/lovely-store";
import { validateLovelyContent } from "@/lib/lovely-schema";
import LovelyExperience from "./LovelyExperience";
import type { MemoryPhotoImage } from "./MemoryPhoto";
import { HeartShape, SparkleShape, Squiggle } from "./Doodles";

function MessageScreen({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-pink/20 blur-3xl" />
        <div className="absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-lavender/25 blur-3xl" />
      </div>

      <SparkleShape className="absolute left-[14%] top-[22%] hidden h-7 w-7 text-butter sm:block" />
      <HeartShape className="absolute right-[16%] top-[30%] hidden h-8 w-8 rotate-12 text-pink sm:block" />

      <div className="flex max-w-md flex-col items-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-pink-soft bg-blush px-3.5 py-1.5 font-body text-[0.62rem] font-bold uppercase tracking-[0.16em] text-strawberry-deep">
          <HeartShape className="h-3 w-3" />
          {eyebrow}
        </span>
        <p className="mt-8 font-display text-2xl font-semibold tracking-tight text-ink">
          lovely<span className="text-strawberry">.</span>
        </p>
        <h1 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-pretty font-body text-sm leading-relaxed text-ink-soft">
          {description}
        </p>
        <div className="mt-4 flex items-center gap-2 text-pink">
          <Squiggle className="w-14" />
          <HeartShape className="h-3 w-3" />
          <Squiggle className="w-14 rotate-180" />
        </div>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-strawberry px-6 py-3 font-display text-sm font-semibold text-white shadow-button transition-colors hover:bg-[#f56a80]"
          >
            Make your own Lovely
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink/10 bg-white/70 px-5 py-2.5 font-body text-xs font-bold uppercase tracking-widest text-ink-soft transition-colors hover:border-pink hover:text-strawberry"
          >
            See the demo
          </Link>
        </div>
      </div>
    </main>
  );
}

export async function SharedLovelyPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;

  let page: StoredPage | null = null;
  try {
    page = await getPage(uid);
  } catch (error) {
    console.error("Failed to load shared Lovely page", error);
    return (
      <MessageScreen
        eyebrow="A tiny hiccup"
        title="This Love Note is hiding right now."
        description="We couldn't reach the page. Give it a moment and try the link again."
      />
    );
  }

  if (!page) {
    return (
      <MessageScreen
        eyebrow="Not found"
        title="This love note wandered off."
        description="The link might be mistyped, or this Lovely was never saved. You can always make a new one — it only takes a few minutes."
      />
    );
  }

  let content;
  try {
    content = validateLovelyContent(decompressConfig(page.config));
  } catch (error) {
    console.error("Failed to decode shared Lovely page", error);
    return (
      <MessageScreen
        eyebrow="A tiny hiccup"
        title="This Love Note needs a little fixing."
        description="The saved page couldn't be read. Try opening the link again, or create a fresh Lovely."
      />
    );
  }

  if (!content.success) {
    return (
      <MessageScreen
        eyebrow="A tiny hiccup"
        title="This Love Note needs a little fixing."
        description="The saved page couldn't be read. Try opening the link again, or create a fresh Lovely."
      />
    );
  }

  let imageMap: Record<string, MemoryPhotoImage> = {};

  try {
    const references = collectMemoryImageReferences(content.data);
    if (references.length > 0) {
      const images = await getImagesByIds(
        references.map((reference) => reference.imageId),
      );
      imageMap = Object.fromEntries(
        images.map((image) => [
          image.id,
          {
            src: image.url,
            width: image.width,
            height: image.height,
            alt: "A photo from this memory",
          },
        ]),
      );
    }
  } catch (error) {
    console.error("Failed to load Lovely photos", error);
  }

  return (
    <LovelyExperience
      content={content.data}
      storageNamespace={`lovely.page.${uid}`}
      createHref="/create"
      imageMap={imageMap}
    />
  );
}
