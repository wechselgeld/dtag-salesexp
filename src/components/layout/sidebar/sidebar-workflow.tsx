'use client';

import Link from 'next/link';
import {
	useState,
} from 'react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Check, ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import {
	Tooltip,
} from './sidebar-tooltip';

interface Step {
	id: string;
	label: string;
	sublabel: string;
	icon: any;
	href: string;
	active: boolean;
	completed: boolean;
}

interface SidebarWorkflowProps {
	steps: Step[];
	currentStepIndex: number;
	collapsed: boolean;
	catColor: string;
	catName: string | null;
	currentCategory: string | null;
}

export function SidebarWorkflow({
	steps,
	currentStepIndex,
	collapsed,
	catColor,
	catName,
	currentCategory,
}: SidebarWorkflowProps) {
	const [
		isExpanded,
		setIsExpanded,
	] = useState(true);

	return (
		<div className="relative z-10 px-3 pt-2 shrink-0">
			<button
				onClick={() => !collapsed && setIsExpanded(!isExpanded)}
				className={clsx(
					'w-full flex items-center justify-between text-[1rem] font-bold text-[#1a1a2e] mb-3 px-2 tracking-tight transition-all duration-200 overflow-hidden group focus:outline-none',
					collapsed ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100 h-auto cursor-pointer',
				)}
			>
				<span>Workflow</span>
				<ChevronDown
					className={clsx(
						'w-4 h-4 text-[#aaa] transition-transform duration-300 group-hover:text-[#e20074]',
						isExpanded ? 'rotate-0' : '-rotate-90',
					)}
				/>
			</button>

			<motion.nav
				initial={false}
				animate={{
					height: isExpanded || collapsed ? 'auto' : 0,
					opacity: isExpanded || collapsed ? 1 : 0,
					marginBottom: isExpanded || collapsed ? 0 : -12,
				}}
				className="flex flex-col gap-1.5 relative overflow-hidden"
			>
				{steps.map((step, i) => {
					const Icon = step.icon;
					const isActive = step.active;
					const isPast = i < currentStepIndex && currentStepIndex >= 0;

					return (
						<div key={step.id} className="relative">
							{/* Connecting Line */}
							{i < steps.length - 1 && (
								<div
									className={clsx(
										'absolute w-[2px] transition-all duration-300 z-0',
										collapsed ? 'left-1/2 -ml-px' : 'left-[25.5px]',
									)}
									style={{
										top: collapsed ? '36px' : '28px',
										bottom: '-40px',
										backgroundColor: isPast ? catColor : '#eaedf0',
										opacity: isPast ? 0.6 : 1,
									}}
								/>
							)}

							<Tooltip label={step.label} show={collapsed}>
								<Link
									href={step.href}
									className={clsx(
										'flex items-center gap-3 rounded-[16px] no-underline transition-all duration-300 group relative z-10',
										collapsed ? 'justify-center py-2 px-0' : 'px-3 py-2.5',
										isActive ? '' : 'hover:bg-black/3',
									)}
								>
									{/* Active Background Pill */}
									{isActive && (
										<motion.div
											layoutId="activeStep"
											className="absolute inset-0 rounded-[14px] z-0"
											style={{
												backgroundColor: `${catColor}15`,
											}}
											transition={{
												type: 'spring',
												stiffness: 400,
												damping: 30,
											}}
										/>
									)}

									{/* Icon Container */}
									<div
										className={clsx(
											'relative shrink-0 flex items-center justify-center transition-all duration-300 z-10',
											collapsed
												? 'w-9 h-9 rounded-[14px]'
												: 'w-7 h-7 rounded-lg',
											isActive
												? ''
												: 'bg-white border border-[#eaedf0] shadow-xs',
										)}
										style={
											isActive
												? {
													backgroundColor: '#fff',
													boxShadow: `inset 0 0 0 100px ${catColor}15`,
													color: catColor,
													border: `1px solid ${catColor}40`,
												}
												: {
													color: isPast ? catColor : '#9ea4ad',
												}
										}
									>
										<AnimatePresence mode="wait">
											{isPast && step.completed ? (
												<motion.div
													key="check"
													initial={{
														scale: 0.5,
														opacity: 0,
													}}
													animate={{
														scale: 1,
														opacity: 1,
													}}
													exit={{
														scale: 0.5,
														opacity: 0,
													}}
												>
													<Check className="w-3.5 h-3.5" strokeWidth={3} />
												</motion.div>
											) : (
												<motion.div
													key="icon"
													initial={{
														scale: 0.8,
														opacity: 0,
													}}
													animate={{
														scale: 1,
														opacity: 1,
													}}
													exit={{
														scale: 0.8,
														opacity: 0,
													}}
												>
													<Icon
														className={clsx(
															'transition-transform duration-300',
															isActive ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5',
														)}
														strokeWidth={isActive ? 2.5 : 2}
													/>
												</motion.div>
											)}
										</AnimatePresence>
									</div>

									{/* Labels */}
									<div
										className="flex-1 min-w-0 flex flex-col transition-all duration-300 z-10"
										style={{
											opacity: collapsed ? 0 : 1,
											width: collapsed ? 0 : 'auto',
											marginLeft: collapsed ? '-10px' : '0px',
										}}
									>
										<div
											className={clsx(
												'text-[0.82rem] leading-none mb-1 transition-colors',
												isActive ? 'font-extrabold' : 'font-bold text-[#5c6166]',
											)}
											style={isActive ? {
												color: catColor,
											} : undefined}
										>
											{step.label}
										</div>
										<div
											className={clsx(
												'text-[0.7rem] leading-none truncate transition-colors',
												isActive
													? 'text-[#1a1a2e]/60 font-medium'
													: 'text-[#9ea4ad] font-medium',
											)}
											style={isActive ? {
												color: `${catColor}99`,
											} : undefined}
										>
											{step.sublabel}
										</div>
									</div>

									{/* Status Indicator (active only) */}
									{isActive && !collapsed && (
										<motion.div
											initial={{
												scale: 0,
												opacity: 0,
											}}
											animate={{
												scale: 1,
												opacity: 1,
											}}
											className="w-1.5 h-1.5 rounded-full mr-1 z-10"
											style={{
												backgroundColor: catColor,
											}}
										/>
									)}
								</Link>
							</Tooltip>
						</div>
					);
				})}
			</motion.nav>

			{/* Category badge (collapsed only) */}
			{currentCategory && collapsed && (
				<div className="flex justify-center mt-6">
					<Tooltip label={catName || ''} show={true}>
						<div
							className="w-8 h-8 rounded-lg flex items-center justify-center"
							style={{
								backgroundColor: `${catColor}12`,
							}}
						>
							<div
								className="w-2.5 h-2.5 rounded-full"
								style={{
									backgroundColor: catColor,
								}}
							/>
						</div>
					</Tooltip>
				</div>
			)}
		</div>
	);
}
