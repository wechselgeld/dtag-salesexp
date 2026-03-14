'use client';

import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Check, MessageSquare,
} from 'lucide-react';
import clsx from 'clsx';
import {
	Tooltip,
} from './sidebar-tooltip';

interface SidebarNpsProps {
	collapsed: boolean;
	npsChecked: boolean;
	npsResetting: boolean;
	npsHovered: boolean;
	setNpsHovered: (v: boolean) => void;
	onToggle: () => void;
}

export function SidebarNps({
	collapsed,
	npsChecked,
	npsResetting,
	npsHovered,
	setNpsHovered,
	onToggle,
}: SidebarNpsProps) {
	return (
		<Tooltip
			label={npsChecked ? 'NPS ✓' : 'NPS-Hinweis geben'}
			show={collapsed}
		>
			<div
				id="tour-nps"
				className="relative mb-2 w-full flex flex-col justify-end px-3 mt-2"
				onMouseEnter={() => setNpsHovered(true)}
				onMouseLeave={() => setNpsHovered(false)}
			>
				{!collapsed && (
					<AnimatePresence>
						{npsHovered && !npsChecked && (
							<motion.div
								initial={{
									opacity: 0,
									scale: 0.95,
									y: 5,
								}}
								animate={{
									opacity: 1,
									scale: 1,
									y: 0,
								}}
								exit={{
									opacity: 0,
									scale: 0.95,
									y: 5,
								}}
								transition={{
									duration: 0.2,
								}}
								className="absolute bottom-[calc(100%+12px)] left-2 right-2 z-50 origin-bottom"
							>
								<div className="bg-[#fff7ed] border border-[#fed7aa] p-3 rounded-[16px] text-[0.7rem] text-[#ea580c] leading-relaxed shadow-lg relative">
									<div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-[#fff7ed] border-b border-r border-[#fed7aa] rotate-45" />
									<div className="relative z-10">
										<div className="font-bold flex items-center gap-1.5 mb-1.5">
											<span className="text-[0.8rem]">💡</span>
											Beispielformulierung:
										</div>
										„Sie erhalten morgen eine SMS von uns. Sie werden gefragt...
										<br />- ...ob wir Ihr <strong>Anliegen lösen</strong>{' '}
										konnten
										<br />- ...ob ich Ihnen <strong>
											ein Angebot gemacht
										</strong>{' '}
										habe
										<br />- ...und wie Sie das Gespräch mit mir fanden.
										<br />
										<strong>
											1 bis 8 bedeutet dort, dass es Ihnen nicht gefallen hat
											und 9 bis 10 bedeutet, dass Sie es gern wieder mit mir
											führen würden!
										</strong>
										<br />
										Ich würde mich freuen, wenn Sie sich kurz Zeit dafür
										nehmen.“
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				)}

				<motion.button
					onClick={onToggle}
					animate={
						npsResetting
							? {
								scale: [
									1,
									1.05,
									0.95,
									1.05,
									1,
								],
								rotate: [
									0,
									-2,
									2,
									-1,
									0,
								],
							}
							: {
								scale: 1,
								rotate: 0,
							}
					}
					transition={{
						duration: 0.5,
					}}
					className={clsx(
						'w-full flex items-center justify-between gap-3 rounded-[20px] transition-all duration-300 cursor-pointer overflow-hidden whitespace-nowrap relative z-10 shrink-0 shadow-sm',
						collapsed
							? 'w-9 h-9 justify-center mx-auto p-0 hover:border-[#ea580c]/30'
							: 'px-4 py-3 w-full',
						npsResetting && 'animate-pulse',
						npsChecked
							? 'bg-linear-to-r from-[#dcfce7] to-[#bbf7d0] border-[#86efac] text-[#166534]'
							: 'bg-linear-to-r from-white to-[#fffaf7] border-[#e8e8e8] text-[#ea580c] hover:shadow-md hover:border-[#ea580c]/30',
					)}
				>
					<div className="flex items-center gap-3">
						<div
							className={clsx(
								'shrink-0 rounded-[12px] flex items-center justify-center transition-all',
								collapsed ? 'w-full h-full bg-transparent' : 'w-8 h-8',
								npsChecked
									? 'bg-white/50 text-[#16a34a]'
									: 'bg-[#ea580c]/10 text-[#ea580c]',
							)}
						>
							{npsChecked ? (
								<Check className="w-4 h-4" strokeWidth={3} />
							) : (
								<MessageSquare className="w-4 h-4" strokeWidth={2} />
							)}
						</div>

						<span
							className="text-[0.8rem] font-bold transition-opacity duration-200 truncate tracking-tight"
							style={{
								opacity: collapsed ? 0 : 1,
								width: collapsed ? 0 : 'auto',
								overflow: 'hidden',
							}}
						>
							{npsChecked ? 'NPS erledigt. Top!' : 'Auf NPS hingewiesen?'}
						</span>
					</div>

					{/* Loading Circle for the Timer */}
					{npsChecked && !collapsed && (
						<div className="w-5 h-5 relative shrink-0 opacity-80">
							<svg
								className="w-full h-full -rotate-90"
								style={{
									color: '#166534',
								}}
								viewBox="0 0 20 20"
							>
								<circle
									cx="10"
									cy="10"
									r="8"
									stroke="currentColor"
									strokeWidth="2.5"
									fill="none"
									className="opacity-20"
								/>
								<motion.circle
									cx="10"
									cy="10"
									r="8"
									stroke="currentColor"
									strokeWidth="2.5"
									fill="none"
									strokeDasharray={2 * Math.PI * 8}
									initial={{
										strokeDashoffset: 0,
									}}
									animate={{
										strokeDashoffset: 2 * Math.PI * 8,
									}}
									transition={{
										duration: 120,
										ease: 'linear',
									}}
								/>
							</svg>
						</div>
					)}
				</motion.button>
			</div>
		</Tooltip>
	);
}
