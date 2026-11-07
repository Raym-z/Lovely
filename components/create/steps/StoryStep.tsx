"use client";

import type { Dispatch, SetStateAction } from "react";
import type { LovelyContent, Memory } from "@/content/lovely";
import type { LovelyImage } from "@/lib/image-types";
import { cn } from "@/lib/cn";
import { makeId } from "@/lib/ids";
import { todayMemoryDate } from "@/lib/memory-date";
import { DateField } from "../DateField";
import { AddButton, CollapsibleCard, EditorCard, Field, OptionPicker, TextArea, TextInput, fieldControlHeight } from "../fields";
import { MemoryPhotoField, MemoryPhotoSourceToggle } from "../MemoryPhotoField";
import { accentOptions } from "../options";

export function StoryStep({
	content,
	setContent,
	activeMemoryId,
	onActiveMemoryChange,
	pageId,
	editKey,
	images,
	onImageCreated,
	onImageRemoved,
	onImagesRefresh,
}: {
	content: LovelyContent;
	setContent: Dispatch<SetStateAction<LovelyContent>>;
	activeMemoryId: string | null;
	onActiveMemoryChange: (id: string | null) => void;
	pageId: string | null;
	editKey: string;
	images: LovelyImage[] | null;
	onImageCreated: (image: LovelyImage) => void;
	onImageRemoved: (imageId: string) => void;
	onImagesRefresh: () => void;
}) {
	function updateMemory(index: number, patch: Partial<Memory>) {
		setContent((previous) => ({
			...previous,
			memories: previous.memories.map((memory, itemIndex) => (itemIndex === index ? { ...memory, ...patch } : memory)),
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
						date: todayMemoryDate(),
						title: "A new little memory",
						excerpt: "Replace this with something only the two of you know.",
						detail: "Add the tiny detail you never want to forget — the song, the weather, the look on their face.",
						photo: "cafe",
						accent: "pink",
					},
				],
			};
		});
		onActiveMemoryChange(id);
	}

	return (
		<div className='space-y-5'>
			<EditorCard
				title='Your little story'
				description='Memories appear as polaroids on a timeline. Choose an illustrated scene or upload your own photo, then make the words yours.'
				accent='lavender'
			>
				<div className='space-y-3'>
					{content.memories.map((memory, index) => (
						<CollapsibleCard
							key={memory.id}
							title={memory.title || `Memory ${index + 1}`}
							subtitle={memory.date}
							open={activeMemoryId === memory.id}
							onOpenChange={(open) => onActiveMemoryChange(open ? memory.id : null)}
							badge={`no. ${String(index + 1).padStart(2, "0")}`}
							onRemove={() => removeMemory(index)}
							removeDisabled={content.memories.length <= 1}
						>
							<div className='grid gap-4 sm:grid-cols-2'>
								<Field label='Date' required>
									<DateField value={memory.date} onChange={(date) => updateMemory(index, { date })} />
								</Field>
								<Field label='Title' required>
									<TextInput value={memory.title} onChange={(event) => updateMemory(index, { title: event.target.value })} maxLength={120} />
								</Field>
							</div>
							<Field label='Polaroid caption' hint='The short line written under the photo.' required>
								<TextArea rows={2} value={memory.excerpt} onChange={(event) => updateMemory(index, { excerpt: event.target.value })} maxLength={240} />
							</Field>
							<Field label='The tiny detail' hint='A little handwritten note inside the opened memory.' required>
								<TextArea rows={2} value={memory.detail} onChange={(event) => updateMemory(index, { detail: event.target.value })} maxLength={1200} className='min-h-36 sm:min-h-[5.5rem]' />
							</Field>
							<div className='mb-4'>
								<MemoryPhotoSourceToggle source={memory.photoSource === "upload" ? "upload" : "template"} onChange={(source) => updateMemory(index, { photoSource: source })} />
							</div>
							<div className='grid gap-4 sm:grid-cols-2'>
								<div className={cn(memory.photoSource === "upload" && "sm:col-span-2")}>
									<MemoryPhotoField
										memory={memory}
										pageId={pageId}
										editKey={editKey}
										images={images}
										usedImageIds={content.memories.filter((item) => item.photoSource === "upload" && item.photoImageId).map((item) => item.photoImageId as string)}
										onPatch={(patch) => updateMemory(index, patch)}
										onImageCreated={onImageCreated}
										onImageRemoved={onImageRemoved}
										onImagesRefresh={onImagesRefresh}
									/>
								</div>
								<Field label='Sticker color' required>
									<OptionPicker value={memory.accent} onChange={(accent) => updateMemory(index, { accent })} options={accentOptions} label='Sticker color' triggerClassName={fieldControlHeight} />
								</Field>
								<Field label='Memory note' hint='Optional. The little nameplate beside this polaroid. Leave blank for a default.' className={cn(memory.photoSource !== "upload" && "sm:col-span-2")}>
									<TextInput value={memory.memoryNote ?? ""} onChange={(event) => updateMemory(index, { memoryNote: event.target.value })} placeholder='one of my favorites.' maxLength={160} className={fieldControlHeight} />
								</Field>
							</div>
						</CollapsibleCard>
					))}
				</div>
				<div className='flex items-center justify-between gap-3'>
					<AddButton onClick={addMemory} disabled={content.memories.length >= 12}>
						Add a memory
					</AddButton>
					<span className='font-hand text-base text-ink-soft/55'>{content.memories.length} / 12</span>
				</div>
			</EditorCard>
		</div>
	);
}
