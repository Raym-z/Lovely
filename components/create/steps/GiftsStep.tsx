"use client";

import type { Dispatch, SetStateAction } from "react";
import { defaultEmergencyNote } from "@/content/lovely";
import type { Coupon, LovelyContent } from "@/content/lovely";
import { makeId } from "@/lib/ids";
import { reconcileSecretMessages } from "@/lib/secret-garden";
import { AddButton, CollapsibleCard, EditorCard, Field, OptionPicker, SegmentedTabs, StringListEditor, TextArea, TextInput } from "../fields";
import { accentOptions } from "../options";

export type GiftTab = "coupons" | "compliments" | "reasons" | "secrets" | "note";

export function GiftsStep({
	content,
	setContent,
	activeCouponId,
	onActiveCouponChange,
	tab,
	onTabChange,
}: {
	content: LovelyContent;
	setContent: Dispatch<SetStateAction<LovelyContent>>;
	activeCouponId: string | null;
	onActiveCouponChange: (id: string | null) => void;
	tab: GiftTab;
	onTabChange: (tab: GiftTab) => void;
}) {
	function updateCoupon(index: number, patch: Partial<Coupon>) {
		setContent((previous) => ({
			...previous,
			coupons: previous.coupons.map((coupon, itemIndex) => (itemIndex === index ? { ...coupon, ...patch } : coupon)),
		}));
	}

	function removeCoupon(index: number) {
		if (content.coupons.length <= 1) return;
		const removed = content.coupons[index];
		setContent((previous) => ({
			...previous,
			coupons: previous.coupons.filter((_, itemIndex) => itemIndex !== index),
		}));
		if (removed.id === activeCouponId) {
			onActiveCouponChange(null);
		}
	}

	function addCoupon() {
		if (content.coupons.length >= 20) return;
		const coupon: Coupon = {
			id: makeId("coupon"),
			title: "A new little coupon",
			description: "Tell them exactly what this one is good for.",
			serial: `LOV-${String(content.coupons.length + 1).padStart(3, "0")}`,
			accent: "pink",
		};
		setContent((previous) => {
			if (previous.coupons.length >= 20) return previous;
			return { ...previous, coupons: [...previous.coupons, coupon] };
		});
		onActiveCouponChange(coupon.id);
	}

	function setList(field: "compliments" | "reasons", items: string[]) {
		setContent((previous) => ({ ...previous, [field]: items }));
	}

	function setSecretMessages(items: string[]) {
		setContent((previous) => ({
			...previous,
			secretMessages: reconcileSecretMessages(previous.secretMessages, items),
		}));
	}

	function reorderSecretMessages(from: number, to: number) {
		setContent((previous) => {
			if (from === to) return previous;
			const next = [...previous.secretMessages];
			const [moved] = next.splice(from, 1);
			if (!moved) return previous;
			next.splice(to, 0, moved);
			return { ...previous, secretMessages: next };
		});
	}

	return (
		<div className='space-y-5'>
			<SegmentedTabs
				value={tab}
				onChange={onTabChange}
				options={[
					{ value: "coupons", label: "Coupons", count: content.coupons.length },
					{
						value: "compliments",
						label: "Compliments",
						count: content.compliments.length,
					},
					{ value: "reasons", label: "Reasons", count: content.reasons.length },
					{ value: "secrets", label: "Secrets", count: content.secretMessages.length },
					{ value: "note", label: "Love note" },
				]}
			/>

			{tab === "coupons" ? (
				<EditorCard title='Love coupons' description='Little redeemable promises. Keep them specific and a little mischievous.' accent='pink'>
					<div className='space-y-3'>
						{content.coupons.map((coupon, index) => (
							<CollapsibleCard
								key={coupon.id}
								title={coupon.title || `Coupon ${index + 1}`}
								subtitle={coupon.serial}
								badge={coupon.serial}
								open={activeCouponId === coupon.id}
								onOpenChange={(open) => onActiveCouponChange(open ? coupon.id : null)}
								onRemove={() => removeCoupon(index)}
								removeDisabled={content.coupons.length <= 1}
							>
								<div className='grid gap-4 sm:grid-cols-[1fr_140px]'>
									<Field label='Coupon title' required>
										<TextInput value={coupon.title} onChange={(event) => updateCoupon(index, { title: event.target.value })} maxLength={120} />
									</Field>
									<Field label='Serial' required>
										<TextInput value={coupon.serial} onChange={(event) => updateCoupon(index, { serial: event.target.value })} maxLength={40} />
									</Field>
								</div>
								<Field label='What it promises' required>
									<TextArea rows={2} value={coupon.description} onChange={(event) => updateCoupon(index, { description: event.target.value })} maxLength={500} />
								</Field>
								<Field label='Ticket color' required>
									<OptionPicker
										value={coupon.accent}
										onChange={(accent) => updateCoupon(index, { accent })}
										options={accentOptions}
										label='Ticket color'
									/>
								</Field>
							</CollapsibleCard>
						))}
					</div>
					<div className='flex items-center justify-between gap-3'>
						<AddButton onClick={addCoupon} disabled={content.coupons.length >= 20}>
							Add a coupon
						</AddButton>
						<span className='font-hand text-base text-ink-soft/55'>{content.coupons.length} / 20</span>
					</div>
				</EditorCard>
			) : null}

			{tab === "compliments" ? (
				<EditorCard title='Random compliments' description='The generator picks one at random. Make each one true enough to make them blush.' accent='pink'>
					<StringListEditor
						items={content.compliments}
						onChange={(items) => setList("compliments", items)}
						placeholder='A compliment that sounds exactly like you...'
						addLabel='Add a compliment'
						min={1}
						max={60}
						rows={1}
						compact
						tone='pink'
						itemMaxLength={300}
					/>
				</EditorCard>
			) : null}

			{tab === "reasons" ? (
				<EditorCard title='Reasons why you love them' description='These open one by one like tiny sealed envelopes. Specific, small, and true works best.' accent='butter'>
					<StringListEditor
						items={content.reasons}
						onChange={(items) => setList("reasons", items)}
						placeholder="A reason that would make them say 'you noticed'..."
						addLabel='Add a reason'
						min={1}
						max={30}
						rows={1}
						compact
						tone='rose'
						itemMaxLength={500}
					/>
				</EditorCard>
			) : null}

			{tab === "secrets" ? (
				<EditorCard title='Secret messages' description='Scattered as hearts in the little garden. These can be sillier, quieter, or the things you struggle to say out loud.' accent='lavender'>
					<StringListEditor
						items={content.secretMessages.map((message) => message.text)}
						onChange={setSecretMessages}
						placeholder="A small secret they don't know yet..."
						addLabel='Add a secret'
						min={1}
						max={30}
						rows={1}
						compact
						tone='lavender'
						itemMaxLength={500}
						itemIds={content.secretMessages.map((message) => message.id)}
						onMove={reorderSecretMessages}
					/>
				</EditorCard>
			) : null}

			{tab === "note" ? (
				<EditorCard title='Emergency love note' description='A note for the hard days. It sits in their gifts, ready whenever they need it.' accent='butter'>
					<Field
						label='Your note'
						hint='Warm and true. No jokes required.'
						required
					>
						<TextArea
							rows={5}
							value={content.emergencyNote ?? defaultEmergencyNote}
							onChange={(event) =>
								setContent((previous) => ({
									...previous,
									emergencyNote: event.target.value,
								}))
							}
							maxLength={1200}
						/>
					</Field>
				</EditorCard>
			) : null}
		</div>
	);
}
