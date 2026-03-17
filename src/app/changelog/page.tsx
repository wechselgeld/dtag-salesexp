'use client';

import {
	ArrowLeft, ChevronDown,
} from 'lucide-react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	useState,
} from 'react';
import {
	TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import clsx from 'clsx';

const CHANGELOGS = [
	{
		id: 'march-17',
		title: '17. März 2025',
		items: [
			{
				q: 'Hinzugefügt',
				a: 'Zu Mobilfunk-Tarifen können nun Smartphones hinzugebucht werden; Es gibt nun ein Feedback-Modal; Es gibt nun einen Changelog',
			},
			{
				q: 'Geändert',
				a: 'Die Ansicht der Zubuchoptionen (UI) wurde optimiert; Die Preiskachel "Regulär" zeigt nun immer den korrekten Preis an; Es wurden schwerwiegende Performanceprobleme behoben; Die Sonderpreis- und Optionslogik wurde übearbeitet; Die Suchleiste wurde überarbeitet (UI)',
			},
			{
				q: 'Entfernt',
				a: 'Es wurde nichts entfernt',
			},
		],
	},
];

export default function FAQPage() {
	return (
		<div className="min-h-screen py-12 px-4 selection:bg-[#e20074]/10 selection:text-[#e20074]">
			<div className="max-w-3xl mx-auto">
				{/* ─── Header / Branding ─── */}
				<motion.div
					initial={{
						opacity: 0,
						y: 12,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					transition={{
						duration: 0.5,
						ease: [
							0.16,
							1,
							0.3,
							1,
						],
					}}
					className="flex flex-col items-center mb-10 text-center"
				>
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-8" />
					<h1 className="text-3xl sm:text-[2.5rem] font-extrabold text-[#1a1a2e] tracking-tight mb-3 leading-none">
						Änderungsverlauf
					</h1>
					<p className="text-[1.05rem] text-[#888] font-normal leading-relaxed max-w-md mx-auto mt-1">
						Hier findest Du alle Änderungen und Updates der Sales Experience.
					</p>
				</motion.div>

				<div className="space-y-12 mb-16">
					{CHANGELOGS.map((category, catIdx) => (
						<motion.section
							key={category.id}
							initial={{
								opacity: 0,
								y: 20,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								duration: 0.5,
								delay: 0.1 + catIdx * 0.1,
								ease: [
									0.16,
									1,
									0.3,
									1,
								],
							}}
							className="space-y-6"
						>
							<div className="flex items-center gap-4 px-2">
								<h2 className="text-[1.3rem] font-extrabold text-[#1a1a2e] m-0 tracking-tight">
									{category.title}
								</h2>
							</div>

							<div className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-[#eaedf0] p-3 sm:p-5 space-y-3">
								{category.items.map((item, i) => (
									<FAQItem
										key={`${catIdx}-${i}`}
										question={item.q}
										answer={item.a}
										index={i}
									/>
								))}
							</div>
						</motion.section>
					))}
				</div>

				<div className="flex justify-center mb-20">
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center justify-center px-10 py-5 bg-[#1a1a2e] hover:bg-black text-white font-bold rounded-2xl transition-all cursor-pointer border-none shadow-xl shadow-[#1a1a2e]/20 active:scale-[0.98] gap-2.5 text-[1rem]"
					>
						<ArrowLeft className="w-5 h-5" />
						Zurück zur App
					</button>
				</div>

				<GlobalFooter
					className="pt-10 pb-0 mt-4 text-[#bbb]"
					linkColor="text-[#bbb]"
				/>
			</div>
		</div>
	);
}

function FAQItem({
	question,
	answer,
	index,
}: {
	question: string;
	answer: string;
	index: number;
}) {
	const [
		open,
		setOpen,
	] = useState(false);

	return (
		<motion.div
			initial={{
				opacity: 0,
				y: 10,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			transition={{
				delay: index * 0.05,
				duration: 0.4,
				ease: [
					0.16,
					1,
					0.3,
					1,
				],
			}}
			className={clsx(
				'group rounded-3xl border transition-all duration-300 overflow-hidden',
				open
					? 'border-[#e20074]/30 bg-[#e20074]/2 shadow-xs'
					: 'border-transparent bg-[#f7f8fa] hover:bg-white hover:border-[#eaedf0] hover:shadow-sm',
			)}
		>
			<button
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between px-6 py-4.5 text-left cursor-pointer bg-transparent border-none outline-none group"
			>
				<span
					className={clsx(
						'text-[0.95rem] font-bold transition-colors duration-300 pr-6 leading-snug',
						open
							? 'text-[#e20074]'
							: 'text-[#1a1a2e] group-hover:text-[#e20074]',
					)}
				>
					{question}
				</span>
				<div
					className={clsx(
						'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-300',
						open
							? 'bg-[#e20074] border-[#e20074] text-white shadow-lg shadow-[#e20074]/20'
							: 'border-[#eaedf0] bg-white text-[#ccc] group-hover:border-[#e20074]/30 group-hover:text-[#e20074]',
					)}
				>
					<ChevronDown
						className={clsx(
							'w-3.5 h-3.5 transition-transform duration-300',
							open && 'rotate-180',
						)}
						strokeWidth={2.5}
					/>
				</div>
			</button>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						initial={{
							height: 0,
							opacity: 0,
						}}
						animate={{
							height: 'auto',
							opacity: 1,
						}}
						exit={{
							height: 0,
							opacity: 0,
						}}
						transition={{
							duration: 0.35,
							ease: [
								0.16,
								1,
								0.3,
								1,
							],
						}}
					>
						<div className="px-6 pb-6 pt-1">
							<p className="text-[0.92rem] text-[#5b5b71] leading-relaxed m-0 font-medium">
								{answer}
							</p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
