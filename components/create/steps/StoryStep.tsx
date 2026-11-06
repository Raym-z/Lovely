"use client";

import type { Dispatch, SetStateAction } from "react";
import type { LovelyContent, Memory } from "@/content/lovely";
import { MemoryPhoto } from "@/components/lovely/MemoryPhoto";
import { makeId } from "@/lib/ids";
import {
  AddButton,
  CollapsibleCard,
  EditorCard,
  Field,
  OptionPicker,
  TextArea,
  TextInput,
} from "../fields";
import { accentOptions, photoOptions } from "../options";

const scenePickerOptions = photoOptions.map((option) => ({
  ...option,
  preview: (
    <span className="h-10 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-ink/5">
      <MemoryPhoto variant={option.value} className="h-full w-full rounded-lg" />
    </span>
  ),
}));

export function StoryStep({
  content,
  setContent,
  activeMemoryId,
  onActiveMemoryChange,
}: {
  content: LovelyContent;
  setContent: Dispatch<SetStateAction<LovelyContent>>;
  activeMemoryId: string | null;
  onActiveMemoryChange: (id: string | null) => void;
}) {
  function updateMemory(index: number, patch: Partial<Memory>) {
    setContent((previous) => ({
      ...previous,
      memories: previous.memories.map((memory, itemIndex) =>
        itemIndex === index ? { ...memory, ...patch } : memory,
      ),
    }));
  }

  function removeMemory(index: number) {
    if (content.memories.length <= 1) return;
    const removed = content.memories[index];
    setContent((previous) => ({
      ...previous,
      memories: previous.memories.filter((_, itemIndex) => itemIndex !== index),
    }));
    if (removed.id === activeMemoryId) {
      onActiveMemoryChange(null);
    }
  }

  function addMemory() {
    if (content.memories.length >= 12) return;
    const id = makeId("memory");
    setContent((previous) => {
      if (previous.memories.length >= 12) return previous;
      return {
        ...previous,
        memories: [
          ...previous.memories,
          {
            id,
            date: "A day to remember",
            title: "A new little memory",
            excerpt: "Replace this with something only the two of you know.",
            caption:
              "Tell the story here: where you were, what was said, and why it stayed with you.",
            detail:
              "Add the tiny detail you never want to forget — the song, the weather, the look on their face.",
            photo: "cafe",
            accent: "pink",
          },
        ],
      };
    });
    onActiveMemoryChange(id);
  }

  return (
    <div className="space-y-5">
      <EditorCard
        title="Your little story"
        description="Memories appear as polaroids on a timeline. The illustrated scenes are placeholders — choose the one that feels closest, then make the words yours."
        accent="lavender"
      >
        <div className="space-y-3">
          {content.memories.map((memory, index) => (
            <CollapsibleCard
              key={memory.id}
              title={memory.title || `Memory ${index + 1}`}
              subtitle={memory.date}
              open={activeMemoryId === memory.id}
              onOpenChange={(open) =>
                onActiveMemoryChange(open ? memory.id : null)
              }
              badge={`no. ${String(index + 1).padStart(2, "0")}`}
              onRemove={() => removeMemory(index)}
              removeDisabled={content.memories.length <= 1}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" required>
                  <TextInput
                    value={memory.date}
                    onChange={(event) =>
                      updateMemory(index, { date: event.target.value })
                    }
                    maxLength={80}
                  />
                </Field>
                <Field label="Title" required>
                  <TextInput
                    value={memory.title}
                    onChange={(event) =>
                      updateMemory(index, { title: event.target.value })
                    }
                    maxLength={120}
                  />
                </Field>
              </div>
              <Field
                label="Polaroid caption"
                hint="The short line written under the photo."
                required
              >
                <TextArea
                  rows={2}
                  value={memory.excerpt}
                  onChange={(event) =>
                    updateMemory(index, { excerpt: event.target.value })
                  }
                  maxLength={240}
                />
              </Field>
              <Field
                label="The full memory"
                hint="Shown when they tap the polaroid."
                required
              >
                <TextArea
                  rows={3}
                  value={memory.caption}
                  onChange={(event) =>
                    updateMemory(index, { caption: event.target.value })
                  }
                  maxLength={1200}
                />
              </Field>
              <Field
                label="The tiny detail"
                hint="A little handwritten note inside the opened memory."
                required
              >
                <TextArea
                  rows={2}
                  value={memory.detail}
                  onChange={(event) =>
                    updateMemory(index, { detail: event.target.value })
                  }
                  maxLength={1200}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Photo scene" required>
                  <OptionPicker
                    value={memory.photo}
                    onChange={(photo) => updateMemory(index, { photo })}
                    options={scenePickerOptions}
                    label="Photo scene"
                  />
                </Field>
                <Field label="Sticker color" required>
                  <OptionPicker
                    value={memory.accent}
                    onChange={(accent) => updateMemory(index, { accent })}
                    options={accentOptions}
                    label="Sticker color"
                  />
                </Field>
              </div>
            </CollapsibleCard>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <AddButton
            onClick={addMemory}
            disabled={content.memories.length >= 12}
          >
            Add a memory
          </AddButton>
          <span className="font-hand text-base text-ink-soft/55">
            {content.memories.length} / 12
          </span>
        </div>
      </EditorCard>
    </div>
  );
}
