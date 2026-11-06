"use client";

import type { LovelyContent } from "@/content/lovely";
import { ComplimentGenerator } from "./gifts/ComplimentGenerator";
import { EmergencyNote } from "./gifts/EmergencyNote";
import { LoveCoupons } from "./gifts/LoveCoupons";
import { ReasonCards } from "./gifts/ReasonCards";
import { SecretMessages } from "./gifts/SecretMessages";
import { JourneyFooter, SectionIntro } from "./ui";

export function LittleGifts({ content, onContinue, onBack, storageNamespace }: { content: LovelyContent; onContinue: () => void; onBack: () => void; storageNamespace: string }) {
	return (
		<section>
			<SectionIntro
				eyebrow='Chapter Three · Little Gifts'
				title={
					<>
						A few little things, <span className='text-strawberry'>just because.</span>
					</>
				}
				subtitle="No wrapping paper. No receipt. Just a small collection of things I'd give you every day if I could."
				note="you don't have to save them for a special occasion"
				eyebrowTone='mint'
			/>

			<div className='mt-10 grid gap-4 sm:gap-5 lg:grid-cols-2'>
				<LoveCoupons coupons={content.coupons} className='lg:col-span-2' storageNamespace={storageNamespace} />
				<div className='flex flex-col gap-4 sm:gap-5'>
					<ComplimentGenerator compliments={content.compliments} />
					<EmergencyNote note={content.emergencyNote} className='flex-1' />
				</div>
				<ReasonCards reasons={content.reasons} storageNamespace={storageNamespace} />
				<SecretMessages messages={content.secretMessages} className='lg:col-span-2' storageNamespace={storageNamespace} />
			</div>

			<JourneyFooter onBack={onBack} onContinue={onContinue} nextLabel='One last thing...' backLabel='The quiz' note='okay. this next part is my favorite.' />
		</section>
	);
}
