"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { FlowerShape, HeartShape, StarShape } from "./Doodles";

const ease = [0.22, 1, 0.36, 1] as const;

export function CreamEnvelope({
	recipient,
	opening = false,
	preview = false,
}: {
	recipient: string;
	opening?: boolean;
	preview?: boolean;
}) {
	const uid = useId().replace(/:/g, "");
	const sideGradient = `cream-side-${uid}`;
	const pocketGradient = `cream-pocket-${uid}`;
	const topGradient = `cream-top-${uid}`;
	const topLight = `cream-top-light-${uid}`;

	return (
		<span
			className={`relative block w-full ${preview ? "aspect-[33/20]" : "aspect-[100/86]"}`}
		>
			<span
				className='absolute inset-x-0 bottom-0 block aspect-[33/20]'
				style={{ perspective: 1000 }}
			>
				<span className='absolute inset-0 rounded-[1.7rem] border-2 border-white bg-gradient-to-br from-[#fdf6ea] via-[#f9eddc] to-[#f0dabf] shadow-[0_34px_70px_-36px_rgba(120,86,66,0.6)] ring-1 ring-inset ring-[#e4c9ac]/60' />

				<motion.span
					aria-hidden='true'
					className='absolute inset-x-[9%] top-[13%] z-10 block h-[87%] rounded-xl bg-[#fffdf8] p-4 text-left shadow-[0_10px_25px_rgba(120,86,66,0.18)]'
					animate={opening ? { y: "-50%", rotate: -2.5 } : { y: 0, rotate: 0 }}
					transition={{
						duration: 0.65,
						delay: opening ? 0.1 : 0,
						ease,
					}}
				>
					<span className='block font-hand text-2xl leading-none text-[#a97a58]'>
						Dear {recipient},
					</span>
					<span className='mt-4 flex items-center gap-1.5 text-pink/70'>
						<HeartShape className='h-4 w-4' />
						<HeartShape className='h-3 w-3' />
						<HeartShape className='h-4 w-4' />
					</span>
				</motion.span>

				<span className='absolute inset-0 z-20 overflow-hidden rounded-[1.7rem]'>
					<svg
						viewBox='0 0 660 400'
						preserveAspectRatio='none'
						aria-hidden='true'
						className='absolute inset-0 h-full w-full'
					>
						<defs>
							<linearGradient id={sideGradient} x1='0' y1='0' x2='0' y2='1'>
								<stop offset='0%' stopColor='#f7e7d0' />
								<stop offset='100%' stopColor='#eed8b9' />
							</linearGradient>
							<linearGradient id={pocketGradient} x1='0' y1='0' x2='0' y2='1'>
								<stop offset='0%' stopColor='#f6e4ca' />
								<stop offset='100%' stopColor='#e8cfad' />
							</linearGradient>
						</defs>

						<path d='M0 0 L330 200 L0 400 Z' fill={`url(#${sideGradient})`} />
						<path d='M660 0 L330 200 L660 400 Z' fill={`url(#${sideGradient})`} />
						<path d='M0 400 L330 200 L660 400 Z' fill={`url(#${pocketGradient})`} />
						<g fill='none' stroke='#d8b892' strokeWidth='2.5' strokeLinecap='round' opacity='0.38'>
							<path d='M0 0 L330 200 L660 0' />
							<path d='M0 400 L330 200 L660 400' />
							<path d='M0 0 L330 200 L0 400' />
							<path d='M660 0 L330 200 L660 400' />
						</g>
						<rect
							x='1.5'
							y='1.5'
							width='657'
							height='397'
							rx='25'
							fill='none'
							stroke='rgba(255,255,255,0.5)'
							strokeWidth='2'
						/>
					</svg>

					<span
						className={`absolute inset-x-0 bottom-5 flex items-center justify-between text-[#a97a58] ${
							preview ? "px-3 text-[0.7rem]" : "px-6 text-base"
						}`}
					>
						<span className='font-hand'>For {recipient},</span>
						<span className='font-hand text-[#b58a68]'>with all my love</span>
					</span>
				</span>

				<motion.span
					aria-hidden='true'
					className='absolute inset-x-0 top-0 z-30 block h-1/2 overflow-hidden rounded-t-[1.7rem]'
					style={{
						transformOrigin: "top center",
						transformStyle: "preserve-3d",
						backfaceVisibility: "hidden",
					}}
					animate={opening ? { rotateX: -166 } : { rotateX: 0 }}
					transition={{ duration: 0.8, ease }}
				>
					<svg
						viewBox='0 0 660 200'
						preserveAspectRatio='none'
						className='h-full w-full'
					>
						<defs>
							<linearGradient id={topGradient} x1='0' y1='0' x2='0' y2='1'>
								<stop offset='0%' stopColor='#fbf0e1' />
								<stop offset='100%' stopColor='#e3c5a3' />
							</linearGradient>
							<linearGradient id={topLight} x1='0' y1='0' x2='0' y2='1'>
								<stop offset='0%' stopColor='rgba(255,255,255,0.65)' />
								<stop offset='58%' stopColor='rgba(255,255,255,0)' />
							</linearGradient>
						</defs>
						<path d='M0 0 L330 200 L660 0 Z' fill={`url(#${topGradient})`} />
						<path d='M0 0 L330 200 L660 0 Z' fill={`url(#${topLight})`} />
						<path
							d='M0 0 L330 200 L660 0'
							fill='none'
							stroke='#d8b892'
							strokeWidth='2.5'
							strokeLinecap='round'
							opacity='0.38'
						/>
					</svg>
				</motion.span>

				<span className='absolute left-1/2 top-1/2 z-40 w-[24%] -translate-x-1/2 -translate-y-1/2'>
					<motion.span
						className='wax-seal grid aspect-square w-full place-items-center rounded-full text-white ring-2 ring-white/50'
						animate={
							opening
								? { scale: [1, 1.12, 1.5], opacity: [1, 1, 0], y: -14 }
								: { scale: [1, 1.04, 1] }
						}
						transition={
							opening
								? { duration: 0.55, ease: "easeOut" }
								: { duration: 3, repeat: Infinity, ease: "easeInOut" }
						}
					>
						<HeartShape style={{ width: "46%", height: "46%" }} />
					</motion.span>
				</span>

				<span
					className={`absolute z-40 rotate-[-7deg] rounded-full bg-pink-soft font-hand text-[#a3324a] shadow-sm ${
						preview
							? "-right-1 top-2 px-2 py-0.5 text-[0.55rem]"
							: "-right-2 top-10 px-3 py-1 text-sm sm:-right-4"
					}`}
				>
					open me
				</span>

				<StarShape
					className={`absolute z-30 text-[#d9b679] ${preview ? "-left-2 bottom-1/4 h-3 w-3" : "-left-4 bottom-1/4 h-5 w-5"}`}
				/>
				<FlowerShape
					className={`absolute z-30 text-pink ${preview ? "-right-2 bottom-5 h-3 w-3" : "-right-4 bottom-10 h-5 w-5"}`}
				/>
			</span>
		</span>
	);
}
