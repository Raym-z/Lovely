import type { LovelyContent } from "@/content/lovely";

export function collectMemoryImageReferences(content: LovelyContent) {
  return content.memories
    .filter(
      (memory) =>
        memory.photoSource === "upload" &&
        typeof memory.photoImageId === "string" &&
        memory.photoImageId.length > 0,
    )
    .map((memory) => ({
      imageId: memory.photoImageId as string,
      memoryId: memory.id,
    }));
}
