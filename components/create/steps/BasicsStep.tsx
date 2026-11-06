"use client";

import type { Dispatch, SetStateAction } from "react";
import type { LovelyContent } from "@/content/lovely";
import { replaceNameDeep } from "@/lib/name-replace";
import { EditorCard, Field, TextArea, TextInput } from "../fields";

export function BasicsStep({
	content,
	setContent,
	recipientError,
	senderError,
}: {
	content: LovelyContent;
	setContent: Dispatch<SetStateAction<LovelyContent>>;
	recipientError?: string | null;
	senderError?: string | null;
}) {
	function updateName(field: "recipient" | "sender", value: string) {
		const placeholder = field === "recipient" ? "Mia" : "Alex";

		setContent((previous) => {
			const previousName = previous[field].trim();
			const next = { ...previous, [field]: value };
			const trimmed = value.trim();
			const source = previousName.length >= 2 ? previousName : placeholder;
			const target = trimmed.length >= 2 ? value : placeholder;

			if (source === target) return next;
			const replaced = replaceNameDeep(next, source, target);
			return { ...replaced, [field]: value };
		});
	}

	function updateInvitation(patch: Partial<LovelyContent["invitation"]>) {
		setContent((previous) => ({
			...previous,
			invitation: { ...previous.invitation, ...patch },
		}));
	}

	return (
		<div className='space-y-5'>
			<EditorCard title='The two of you' description="This is the part that makes it theirs. We'll swap their name through the letter, notes, and celebration copy as you type." accent='pink'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<div>
						<Field label='Their name' hint='The person receiving this little world.' required>
							<TextInput
								id='basics-recipient-name'
								value={content.recipient}
								onChange={(event) => updateName("recipient", event.target.value)}
								placeholder=''
								maxLength={60}
								aria-invalid={Boolean(recipientError)}
								aria-describedby={recipientError ? "basics-recipient-name-error" : undefined}
							/>
						</Field>
						{recipientError ? (
							<p id='basics-recipient-name-error' role='alert' className='mt-1.5 font-body text-xs font-semibold text-strawberry'>
								{recipientError}
							</p>
						) : null}
					</div>
					<div>
						<Field label='Your name' hint='The one sealing the envelope.' required>
							<TextInput
								id='basics-sender-name'
								value={content.sender}
								onChange={(event) => updateName("sender", event.target.value)}
								placeholder=''
								maxLength={60}
								aria-invalid={Boolean(senderError)}
								aria-describedby={senderError ? "basics-sender-name-error" : undefined}
							/>
						</Field>
						{senderError ? (
							<p id='basics-sender-name-error' role='alert' className='mt-1.5 font-body text-xs font-semibold text-strawberry'>
								{senderError}
							</p>
						) : null}
					</div>
				</div>
				<Field label='Tiny tagline' hint='Appears next to the wordmark at the top.' required>
					<TextInput
						value={content.tagline}
						onChange={(event) =>
							setContent((previous) => ({
								...previous,
								tagline: event.target.value,
							}))
						}
						maxLength={120}
					/>
				</Field>
			</EditorCard>

			<EditorCard title='The invitation' description='The first thing they see. Keep it warm, a little mysterious, and very you.' accent='pink'>
				<Field label='Big opening line' hint='This is the headline on the first screen.' required>
					<TextArea rows={2} value={content.invitation.title} onChange={(event) => updateInvitation({ title: event.target.value })} maxLength={300} />
				</Field>
				<Field label='Subtitle' required>
					<TextArea rows={2} value={content.invitation.subtitle} onChange={(event) => updateInvitation({ subtitle: event.target.value })} maxLength={500} />
				</Field>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field label='Button label' required>
						<TextInput value={content.invitation.cta} onChange={(event) => updateInvitation({ cta: event.target.value })} maxLength={80} />
					</Field>
					<Field label='Little hint' required>
						<TextInput value={content.invitation.hint} onChange={(event) => updateInvitation({ hint: event.target.value })} maxLength={300} />
					</Field>
				</div>
				<Field label='Small print' hint='The tiny uppercase line under the button.' required>
					<TextInput value={content.invitation.note} onChange={(event) => updateInvitation({ note: event.target.value })} maxLength={300} />
				</Field>
			</EditorCard>
		</div>
	);
}
