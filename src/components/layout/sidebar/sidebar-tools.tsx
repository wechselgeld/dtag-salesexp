'use client';

import Link from 'next/link';
import clsx from 'clsx';
import {
	Tooltip,
} from './sidebar-tooltip';
import {
	ChevronRight, ChevronDown,
} from 'lucide-react';
import {
	motion,
} from 'framer-motion';
import {
	useSettingsStore,
} from '@/lib/store/settings-store';
import {
	usePathname,
} from 'next/navigation';

export interface UtilityLink {
	id: string;
	icon: any;
	label: string;
	onClick?: () => void;
	href?: string;
	type: 'button' | 'link' | 'external';
	badge?: React.ReactNode;
}

interface SidebarToolsProps {
	collapsed: boolean;
	group1: UtilityLink[];
	group2: UtilityLink[];
}

export function SidebarTools({
	collapsed, group1, group2,
}: SidebarToolsProps) {
	const pathname = usePathname();
	const {
		toolsExpanded,
		setToolsExpanded,
	} = useSettingsStore();

	const renderGroup = (links: UtilityLink[]) => {
		return (
			<div
				className={clsx(
					'flex flex-col gap-0.5',
					!collapsed && 'bg-[#f7f8fa] rounded-[20px] p-2 w-full',
					collapsed && 'items-center gap-1.5',
				)}
			>
				{links.map((item) => {
					const Icon = item.icon;
					const isLinkActive = item.type === 'link' && pathname === item.href;

					const btnClass = clsx(
						'flex items-center gap-3 rounded-[14px] no-underline text-[0.8rem] font-bold transition-all duration-200 cursor-pointer border-none overflow-hidden whitespace-nowrap',
						collapsed
							? 'w-9 h-9 justify-center mx-auto p-0 hover:bg-[#f7f8fa]'
							: 'px-3 py-2.5 w-full hover:bg-white hover:shadow-sm',
						isLinkActive ? 'bg-white text-[#1a1a2e] shadow-sm' : 'text-[#333]',
					);

					const content = (
						<div className="flex items-center justify-between w-full h-full relative">
							<div className="flex items-center gap-3 min-w-0">
								<div className="relative flex items-center justify-center shrink-0">
									<Icon
										className={clsx(
											'shrink-0 transition-all duration-200 text-[#444]',
											collapsed ? 'w-4 h-4' : 'w-4 h-4',
										)}
										strokeWidth={2}
									/>
									{/* Collapsed view pulsing dot overlay */}
									{collapsed && item.badge && (
										<span className="absolute -top-1 -right-1 w-2 h-2 bg-[#e20074] rounded-full ring-2 ring-white animate-ping" />
									)}
								</div>
								<span
									className="truncate transition-opacity duration-200 flex items-center gap-1.5"
									style={{
										opacity: collapsed ? 0 : 1,
										width: collapsed ? 0 : 'auto',
										overflow: 'hidden',
									}}
								>
									{item.label}
									{item.badge}
								</span>
							</div>
							{!collapsed && (
								<ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#444] transition-colors shrink-0" />
							)}
						</div>
					);

					return (
						<Tooltip key={item.id} label={item.label} show={collapsed}>
							{item.type === 'button' ? (
								<button
									id={item.id}
									onClick={item.onClick}
									className={clsx(btnClass, 'group')}
								>
									{content}
								</button>
							) : item.type === 'external' ? (
								<a
									id={item.id}
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className={clsx(btnClass, 'group')}
								>
									{content}
								</a>
							) : (
								<Link
									id={item.id}
									href={item.href!}
									className={clsx(btnClass, 'group')}
								>
									{content}
								</Link>
							)}
						</Tooltip>
					);
				})}
			</div>
		);
	};

	return (
		<div className="relative z-10 px-3 w-full shrink-0 mt-4 mb-2">
			<button
				onClick={() => !collapsed && setToolsExpanded(!toolsExpanded)}
				className={clsx(
					'w-full flex items-center justify-between text-[1rem] font-bold text-[#1a1a2e] mb-3 px-2 tracking-tight transition-all duration-200 overflow-hidden group focus:outline-none',
					collapsed ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100 h-auto cursor-pointer',
				)}
			>
				<span>Tools</span>
				<ChevronDown
					className={clsx(
						'w-4 h-4 text-[#aaa] transition-transform duration-300 group-hover:text-[#e20074]',
						toolsExpanded ? 'rotate-0' : '-rotate-90',
					)}
				/>
			</button>

			<motion.div
				initial={false}
				animate={{
					height: toolsExpanded || collapsed ? 'auto' : 0,
					opacity: toolsExpanded || collapsed ? 1 : 0,
					marginBottom: toolsExpanded || collapsed ? 0 : -12,
				}}
				className="flex flex-col gap-3 w-full overflow-hidden"
			>
				{renderGroup(group1)}
				{renderGroup(group2)}
			</motion.div>
		</div>
	);
}
