"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LovelyContent, Memory } from "@/content/lovely";
import { HeartShape } from "./Doodles";
import { MemoryCard } from "./MemoryCard";
import { MemoryPhoto, type MemoryPhotoImage } from "./MemoryPhoto";
import { JourneyFooter, SectionIntro, Sticker } from "./ui";

function memoryImage(memory: Memory, imageMap: Record<string, MemoryPhotoImage>) {
	if (memory.photoSource === "upload" && memory.photoImageId && imageMap[memory.photoImageId]) {
		return imageMap[memory.photoImageId];
	}

	return null;
}

function MemoryDetail({ memory, image, onClose }: { memory: Memory; image?: MemoryPhotoImage | null; onClose: () => void }) {
	return (
		<motion.div className='fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
			<motion.div className='absolute inset-0 bg-ink/45 backdrop-blur-sm' onClick={onClose} aria-hidden='true' />
			<motion.div
				role='dialog'
				aria-modal='true'
				aria-labelledby='memory-dialog-title'
				className='no-scrollbar relative z-10 max-h-[89dvh] w-full max-w-xl overflow-y-auto rounded-[2rem] border-2 border-white bg-cream p-3 shadow-[0_40px_100px_-40px_rgba(73,52,59,0.6)]'
				initial={{ opacity: 0, scale: 0.94, y: 26 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.96, y: 16 }}
				transition={{ type: "spring", stiffness: 300, damping: 28 }}
			>
				<button
					type='button'
					onClick={onClose}
					autoFocus
					aria-label='Close memory'
					className='absolute right-5 top-5 z-20 grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-white/90 text-ink-soft shadow-md transition-colors hover:text-strawberry'
				>
					<X className='h-4 w-4' />
				</button>

				<div className='rounded-[1.5rem] bg-paper p-4 sm:p-6'>
					<MemoryPhoto variant={memory.photo} image={image} />

					<div className='mt-5 flex items-center justify-between gap-3'>
						<p className='font-body text-[0.63rem] font-bold uppercase tracking-[0.16em] text-ink-soft/65'>{memory.date}</p>
						<Sticker tone={memory.accent}>
							<Heart className='h-3 w-3' strokeWidth={2.5} />a good one
						</Sticker>
					</div>

					<h3 id='memory-dialog-title' className='mt-2 font-display text-[1.9rem] font-semibold leading-tight text-ink sm:text-4xl'>
						{memory.title}
					</h3>

					<p className='mt-3 text-pretty font-body text-[0.93rem] leading-relaxed text-ink-soft sm:text-base'>{memory.caption}</p>

					<div className='relative mt-5 rounded-2xl border-2 border-dashed border-pink bg-blush/60 p-4 sm:p-5'>
						<HeartShape className='absolute -right-2 -top-2 h-6 w-6 rotate-12 text-pink' />
						<p className='font-hand text-xl leading-snug text-[#8f4557] sm:text-[1.4rem]'>{memory.detail}</p>
					</div>

					<div className='mt-5 flex items-center justify-between gap-3'>
						<p className='font-hand text-lg text-strawberry'>the little details matter most</p>
						<button
							type='button'
							onClick={onClose}
							className='rounded-full border-2 border-ink/10 bg-white px-4 py-2 font-body text-xs font-bold uppercase tracking-widest text-ink-soft transition-colors hover:border-pink hover:text-strawberry'
						>
							Close
						</button>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

export function MemoryTimeline({ content, imageMap = {}, onContinue, onBack }: { content: LovelyContent; imageMap?: Record<string, MemoryPhotoImage>; onContinue: () => void; onBack: () => void }) {
	const [selected, setSelected] = useState<Memory | null>(null);

	useEffect(() => {
		if (!selected) return;

		function handleKey(event: KeyboardEvent) {
			if (event.key === "Escape") setSelected(null);
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleKey);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKey);
		};
	}, [selected]);

	return (
		<section>
			<SectionIntro
				eyebrow='Chapter One · Our Little Story'
				title={
					<>
						All the little moments
						<br className='hidden sm:block' /> <span className='text-strawberry'>I keep in my pocket.</span>
					</>
				}
				subtitle='A scrapbook of us, in no particular order except the order my heart remembers.'
				note='tap a polaroid to open the whole story'
				eyebrowTone='lavender'
			/>

			<div className='relative mt-12 sm:mt-16'>
				<div aria-hidden='true' className='absolute bottom-6 left-[13px] top-5 w-0.5 border-l-2 border-dashed border-pink/70 md:left-1/2 md:-translate-x-1/2' />

				<ol className='space-y-11 sm:space-y-14'>
					{content.memories.map((memory, index) => (
						<li key={memory.id} className='relative pl-11 md:grid md:grid-cols-2 md:gap-x-16 md:pl-0'>
							<div
								aria-hidden='true'
								className='absolute left-0 top-1.5 z-10 grid h-[27px] w-[27px] place-items-center rounded-full border-2 border-pink bg-cream text-strawberry shadow-[0_2px_6px_rgba(241,91,114,0.2)] md:left-1/2 md:top-1/2 md:h-9 md:w-9 md:-translate-x-1/2 md:-translate-y-1/2'
							>
								<HeartShape className='h-3.5 w-3.5 md:h-4 md:w-4' />
							</div>

							<div className={cn("w-full md:max-w-md", index % 2 === 0 ? "md:col-start-1 md:justify-self-end" : "md:col-start-2 md:justify-self-start")}>
								<MemoryCard memory={memory} index={index} image={memoryImage(memory, imageMap)} onOpen={() => setSelected(memory)} />
							</div>

							<p
								aria-hidden='true'
								className={cn(
									"mt-3 hidden pl-2 font-hand text-lg text-ink-soft/55 md:block",
									index % 2 === 0 ? "md:col-start-2 md:mt-0 md:justify-self-start md:pl-0 md:text-left" : "md:col-start-1 md:mt-0 md:row-start-1 md:justify-self-end md:pr-2 md:text-right",
								)}
							>
								{index % 2 === 0 ? "one of my favorites." : "how lucky was that?"}
							</p>
						</li>
					))}
				</ol>
			</div>

			<JourneyFooter onBack={onBack} onContinue={onContinue} nextLabel='Next: a tiny quiz' backLabel='The invitation' note='there are no wrong answers next. well... maybe a few.' />

			<AnimatePresence>{selected ? <MemoryDetail memory={selected} image={memoryImage(selected, imageMap)} onClose={() => setSelected(null)} /> : null}</AnimatePresence>
		</section>
	);
}
