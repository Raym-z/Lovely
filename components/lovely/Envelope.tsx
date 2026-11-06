"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { HeartShape, SparkleShape, StarShape } from "./Doodles";

const ease = [0.22, 1, 0.36, 1] as const;

export function Envelope({ recipient, opening, onOpen }: { recipient: string; opening: boolean; onOpen: () => void }) {
	const uid = useId().replace(/:/g, "");
	const sideFlapGradient = `side-flap-${uid}`;
	const pocketGradient = `pocket-${uid}`;
	const topFlapGradient = `top-flap-${uid}`;
	const topFlapLight = `top-flap-light-${uid}`;

	return (
		<motion.button
			type='button'
			onClick={onOpen}
			disabled={opening}
			aria-label='Open the envelope'
			className='group relative block w-[min(78vw,380px)] rounded-[1.7rem] outline-none disabled:cursor-default'
			initial={{ rotate: -1.5 }}
			animate={opening ? { y: 0, rotate: 0 } : { y: [0, -9, 0], rotate: -1.5 }}
			transition={
				opening
					? { duration: 0.4, ease }
					: {
							y: { duration: 5.6, repeat: Infinity, ease: "easeInOut" },
							rotate: { duration: 0.7, ease },
						}
			}
			whileHover={opening ? undefined : { rotate: 1.2, scale: 1.015 }}
			whileTap={opening ? undefined : { scale: 0.985 }}
		>
			<span aria-hidden='true' className='absolute -bottom-8 left-1/2 h-8 w-[68%] -translate-x-1/2 rounded-[100%] bg-strawberry/20 blur-xl' />

			<span className='relative block aspect-[100/86] w-full'>
				<span className='absolute inset-x-0 bottom-0 block aspect-[33/20]' style={{ perspective: 1000 }}>
					<span className='absolute inset-0 rounded-[1.7rem] bg-gradient-to-br from-[#f8a9bb] via-[#f79bb0] to-[#ef7f97] shadow-[0_34px_70px_-34px_rgba(217,67,96,0.75)]' />

					<motion.span
						aria-hidden='true'
						className='absolute inset-x-[9%] top-[13%] z-10 block h-[87%] rounded-xl bg-paper p-4 text-left shadow-[0_10px_25px_rgba(73,52,59,0.18)]'
						animate={opening ? { y: "-50%", rotate: -2.5 } : { y: 0, rotate: 0 }}
						transition={{
							duration: 1,
							delay: opening ? 0.16 : 0,
							ease,
						}}
					>
						<span className='block font-hand text-2xl leading-none text-strawberry'>Dear {recipient},</span>
						<span className='mt-4 flex items-center gap-1.5 text-pink'>
							<HeartShape className='h-4 w-4' />
							<HeartShape className='h-3 w-3' />
							<HeartShape className='h-4 w-4' />
						</span>
					</motion.span>

					<span className='absolute inset-0 z-20 overflow-hidden rounded-[1.7rem]'>
						<svg viewBox='0 0 660 400' preserveAspectRatio='none' aria-hidden='true' className='absolute inset-0 h-full w-full'>
							<defs>
								<linearGradient id={sideFlapGradient} x1='0' y1='0' x2='0' y2='1'>
									<stop offset='0%' stopColor='#f8acbc' />
									<stop offset='100%' stopColor='#f0889d' />
								</linearGradient>
								<linearGradient id={pocketGradient} x1='0' y1='0' x2='0' y2='1'>
									<stop offset='0%' stopColor='#f79fb4' />
									<stop offset='100%' stopColor='#ee7e96' />
								</linearGradient>
							</defs>

							<path d='M0 0 L330 200 L0 400 Z' fill={`url(#${sideFlapGradient})`} />
							<path d='M660 0 L330 200 L660 400 Z' fill={`url(#${sideFlapGradient})`} />
							<path d='M0 400 L330 200 L660 400 Z' fill={`url(#${pocketGradient})`} />
							<g fill='none' stroke='#d96983' strokeWidth='2.5' strokeLinecap='round' opacity='0.14'>
								<path d='M0 0 L330 200 L660 0' />
								<path d='M0 400 L330 200 L660 400' />
								<path d='M0 0 L330 200 L0 400' />
								<path d='M660 0 L330 200 L660 400' />
							</g>
							<rect x='1.5' y='1.5' width='657' height='397' rx='25' fill='none' stroke='rgba(255,255,255,0.28)' strokeWidth='2' />
						</svg>

						<span className='absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 font-hand text-2xl text-white drop-shadow-[0_1px_2px_rgba(180,50,76,0.25)]'>
							{/* For {recipient} */}
							<HeartShape className='h-4 w-4 text-white' />
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
						<svg viewBox='0 0 660 200' preserveAspectRatio='none' className='h-full w-full'>
							<defs>
								<linearGradient id={topFlapGradient} x1='0' y1='0' x2='0' y2='1'>
									<stop offset='0%' stopColor='#ffd3dd' />
									<stop offset='100%' stopColor='#f489a1' />
								</linearGradient>
								<linearGradient id={topFlapLight} x1='0' y1='0' x2='0' y2='1'>
									<stop offset='0%' stopColor='rgba(255,255,255,0.55)' />
									<stop offset='58%' stopColor='rgba(255,255,255,0)' />
								</linearGradient>
							</defs>
							<path d='M0 0 L330 200 L660 0 Z' fill={`url(#${topFlapGradient})`} />
							<path d='M0 0 L330 200 L660 0 Z' fill={`url(#${topFlapLight})`} />
							<path d='M0 0 L330 200 L660 0' fill='none' stroke='#d96983' strokeWidth='2.5' strokeLinecap='round' opacity='0.14' />
						</svg>
					</motion.span>

					<span className='absolute left-1/2 top-1/2 z-40 w-[24%] -translate-x-1/2 -translate-y-1/2'>
						<motion.span
							className='wax-seal grid aspect-square w-full place-items-center rounded-full text-white ring-2 ring-white/40'
							animate={opening ? { scale: [1, 1.12, 1.45], opacity: [1, 1, 0], y: -12 } : { scale: [1, 1.035, 1] }}
							transition={opening ? { duration: 0.55, ease: "easeOut" } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
						>
							<HeartShape style={{ width: "46%", height: "46%" }} />
						</motion.span>
					</span>

					<motion.span
						aria-hidden='true'
						className='absolute -right-2 top-8 z-40 rotate-[-8deg] rounded-full bg-butter px-2.5 py-1 font-hand text-sm text-[#8a6219] shadow-sm sm:-right-4'
						animate={opening ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						open me
					</motion.span>

					<StarShape className='absolute -left-5 top-1/3 z-40 h-5 w-5 text-butter/90' />
					<SparkleShape className='absolute -right-5 bottom-1/3 z-40 h-4 w-4 text-lavender' />
				</span>
			</span>
		</motion.button>
	);
}
