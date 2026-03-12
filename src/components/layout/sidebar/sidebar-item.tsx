"use client";

import Link from "next/link";
import clsx from "clsx";
import { LucideIcon, ChevronRight } from "lucide-react";
import { Tooltip } from "./sidebar-tooltip";

interface SidebarItemProps {
	icon: any;
	label: string;
	href?: string;
	onClick?: () => void;
	active?: boolean;
	collapsed?: boolean;
	variant?: "default" | "premium" | "danger";
}

export function SidebarItem({
	icon: Icon,
	label,
	href,
	onClick,
	active,
	collapsed,
	variant = "default"
}: SidebarItemProps) {
	const baseClasses = clsx(
		"flex items-center gap-3 rounded-[14px] no-underline transition-all duration-200 cursor-pointer border-none overflow-hidden whitespace-nowrap group",
		collapsed
			? "w-10 h-10 justify-center mx-auto p-0 hover:bg-[#f7f8fa]"
			: "px-3 py-2.5 w-full hover:bg-white hover:shadow-sm",
		active
			? "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-[#1a1a2e]"
			: variant === "danger" 
				? "text-[#999] hover:text-[#dc2626] hover:bg-[#fee2e2]/40" 
				: "text-[#333]",
		variant === "danger" && active && "bg-[#fee2e2]/80 text-[#dc2626]"
	);

	const content = (
		<div className="flex items-center justify-between w-full h-full min-w-0">
			<div className="flex items-center gap-3 min-w-0">
				<Icon
					className={clsx(
						"shrink-0 transition-all duration-300",
						collapsed ? "w-4.5 h-4.5" : "w-4 h-4",
						active ? "text-[#1a1a2e]" : (variant === "danger" ? "inherit" : "text-[#444]")
					)}
					strokeWidth={active ? 2.5 : 2}
				/>
				<span
					className={clsx(
						"truncate transition-all duration-300 font-bold text-[0.8rem]",
						collapsed ? "opacity-0 w-0 -translate-x-2.5" : "opacity-100 w-auto translate-x-0"
					)}
				>
					{label}
				</span>
			</div>
			{!collapsed && active && (
				<ChevronRight className="w-4 h-4 text-[#e20074] transition-transform duration-300 group-hover:translate-x-0.5 shrink-0" />
			)}
			{!collapsed && !active && (
				<ChevronRight className="w-4 h-4 text-[#eee] group-hover:text-[#ccc] transition-colors shrink-0" />
			)}
		</div>
	);

	const Element = href ? Link : "button";

	return (
		<Tooltip label={label} show={collapsed || false}>
			<Element
				href={href as any}
				onClick={onClick}
				className={baseClasses}
				type={href ? undefined : "button"}
			>
				{content}
			</Element>
		</Tooltip>
	);
}

export function SidebarGroup({
	title,
	collapsed,
	children
}: {
	title: string;
	collapsed?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="px-3 w-full mb-6">
			{!collapsed && (
				<div className="text-[1rem] font-bold text-[#1a1a2e] mb-3 px-2 tracking-tight">
					{title}
				</div>
			)}
			<div 
				className={clsx(
					"flex flex-col gap-0.5",
					!collapsed && "bg-[#f7f8fa] rounded-[20px] p-2",
					collapsed && "items-center gap-1.5"
				)}
			>
				{children}
			</div>
		</div>
	);
}
