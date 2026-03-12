"use client";

import Link from "next/link";
import clsx from "clsx";
import { Tooltip } from "./sidebar-tooltip";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export interface UtilityLink {
	id: string;
	icon: any;
	label: string;
	onClick?: () => void;
	href?: string;
	type: "button" | "link" | "external";
}

interface SidebarToolsProps {
	collapsed: boolean;
	group1: UtilityLink[];
	group2: UtilityLink[];
}

export function SidebarTools({ collapsed, group1, group2 }: SidebarToolsProps) {
	const pathname = usePathname();

	const renderGroup = (links: UtilityLink[]) => {
		return (
			<div
				className={clsx(
					"flex flex-col gap-0.5",
					!collapsed && "bg-[#f7f8fa] rounded-[20px] p-2 w-full",
					collapsed && "items-center gap-1.5"
				)}
			>
				{links.map((item) => {
					const Icon = item.icon;
					const isLinkActive = item.type === "link" && pathname === item.href;

					const btnClass = clsx(
						"flex items-center gap-3 rounded-[14px] no-underline text-[0.8rem] font-bold transition-all duration-200 cursor-pointer border-none overflow-hidden whitespace-nowrap",
						collapsed
							? "w-9 h-9 justify-center mx-auto p-0 hover:bg-[#f7f8fa]"
							: "px-3 py-2.5 w-full hover:bg-white hover:shadow-sm",
						isLinkActive ? "bg-white text-[#1a1a2e] shadow-sm" : "text-[#333]"
					);

					const content = (
						<div className="flex items-center justify-between w-full h-full">
							<div className="flex items-center gap-3 min-w-0">
								<Icon
									className={clsx(
										"shrink-0 transition-all duration-200 text-[#444]",
										collapsed ? "w-4 h-4" : "w-4 h-4"
									)}
									strokeWidth={2}
								/>
								<span
									className="truncate transition-opacity duration-200"
									style={{
										opacity: collapsed ? 0 : 1,
										width: collapsed ? 0 : "auto",
										overflow: "hidden"
									}}
								>
									{item.label}
								</span>
							</div>
							{!collapsed && (
								<ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#444] transition-colors shrink-0" />
							)}
						</div>
					);

					return (
						<Tooltip key={item.id} label={item.label} show={collapsed}>
							{item.type === "button" ? (
								<button
									id={item.id}
									onClick={item.onClick}
									className={clsx(btnClass, "group")}
								>
									{content}
								</button>
							) : item.type === "external" ? (
								<a
									id={item.id}
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className={clsx(btnClass, "group")}
								>
									{content}
								</a>
							) : (
								<Link
									id={item.id}
									href={item.href!}
									className={clsx(btnClass, "group")}
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
			{!collapsed && (
				<div className="text-[1rem] font-bold text-[#1a1a2e] mb-3 px-2 tracking-tight">
					Tools
				</div>
			)}
			<div className="flex flex-col gap-3 w-full">
				{renderGroup(group1)}
				{renderGroup(group2)}
			</div>
		</div>
	);
}
