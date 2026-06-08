'use client';

import {
	motion,
} from 'framer-motion';
import {
	ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
	SidebarLogo,
} from './sidebar-logo';

interface SidebarLayoutProps {
	collapsed: boolean;
	onToggle: () => void;
	logoPath?: string;
	catColor?: string;
	children: React.ReactNode;
	footerActions: React.ReactNode;
	copyright?: string;
}

export function SidebarLayout({
	collapsed,
	onToggle,
	catColor = '#e20074',
	children,
	footerActions,
	copyright,
}: SidebarLayoutProps) {
	const sidebarWidth = collapsed ? 72 : 280;

	return (
		<motion.aside
			id="tour-sidebar"
			initial={false}
			animate={{
				width: sidebarWidth,
			}}
			transition={{
				duration: 0.25,
				ease: [
					0.25,
					0.8,
					0.25,
					1,
				],
			}}
			className="relative bg-white border-r border-[#eaedf0] z-20 h-screen shrink-0 flex flex-col"
		>
			{/* ───── Subtle gradient overlay at top ───── */}
			<div
				className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-0"
				style={{
					background: `linear-gradient(180deg, ${catColor}04 0%, transparent 100%)`,
				}}
			/>

			{/* Collapse toggle button */}
			<div className="absolute top-[37px] -right-[14px] z-50">
				<button
					onClick={onToggle}
					className="w-7 h-7 bg-white border border-[#eaedf0] text-[#aaa] hover:text-[#e20074] hover:border-[#e20074]/30 rounded-full flex items-center justify-center transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer focus:outline-none"
					title={collapsed ? 'Aufklappen (Strg+H)' : 'Einklappen (Strg+H)'}
				>
					{collapsed ? (
						<ChevronRight className="w-3.5 h-3.5 shrink-0 ml-0.5" />
					) : (
						<ChevronLeft className="w-3.5 h-3.5 shrink-0 mr-0.5" />
					)}
				</button>
			</div>

			{/* Logo area */}
			<SidebarLogo collapsed={collapsed} catColor={catColor} />

			{/* Main scrollable content area */}
			<div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-none pb-12">
				{children}
			</div>

			{/* Footer area */}
			<div className="mt-auto pb-2 pt-2">
				{footerActions}
				{!collapsed && copyright && (
					<div className="text-center text-[0.55rem] text-[#ddd] mt-2 font-medium tracking-tight">
						{copyright}
					</div>
				)}
			</div>
		</motion.aside>
	);
}
