"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import clsx from "clsx";
import { Tooltip } from "./sidebar-tooltip";

interface SidebarFooterProps {
	collapsed: boolean;
	resetConfirm: boolean;
	handleReset: () => void;
}

export function SidebarFooter({
	collapsed,
	resetConfirm,
	handleReset
}: SidebarFooterProps) {
	return (
		<div className="relative z-10 pb-4 pt-2 shrink-0 px-3 overflow-hidden flex flex-col items-start w-full">
			{/* Reset button */}
			<Tooltip label="Sitzung zurücksetzen" show={collapsed}>
				<button
					onClick={handleReset}
					className={clsx(
						"flex items-center gap-2.5 rounded-xl transition-all duration-200 cursor-pointer font-bold overflow-hidden whitespace-nowrap",
						collapsed
							? "w-9 h-9 justify-center mx-auto p-0 border border-transparent hover:border-[#ea580c]/30"
							: "px-4 py-3 border w-full text-left",
						resetConfirm
							? "bg-[#fee2e2]/80 text-[#dc2626]"
							: "bg-transparent text-[#999] hover:text-[#dc2626] hover:bg-[#fee2e2]/40",
						collapsed ? "text-[0.7rem]" : "text-[0.8rem]"
					)}
				>
					<RotateCcw
						className={clsx(
							"shrink-0",
							collapsed ? "w-4 h-4" : "w-4 h-4",
							resetConfirm && "animate-spin"
						)}
						style={resetConfirm ? { animationDuration: "1s" } : {}}
						strokeWidth={2}
					/>
					<span
						className="transition-opacity duration-200 truncate"
						style={{
							opacity: collapsed ? 0 : 1,
							width: collapsed ? 0 : "auto",
							overflow: "hidden"
						}}
					>
						{resetConfirm ? "Wirklich zurücksetzen?" : "Sitzung zurücksetzen"}
					</span>
				</button>
			</Tooltip>

			{/* ───── Copyright Footer ───── */}
			<div
				className="mt-3 pt-3 border-t border-[#f0f0f0] overflow-hidden transition-all duration-200 w-full"
				style={{
					opacity: collapsed ? 0 : 1,
					maxHeight: collapsed ? 0 : 120,
					marginTop: collapsed ? 0 : 12,
					paddingTop: collapsed ? 0 : 12,
					transitionProperty: "opacity, max-height, margin-top, padding-top"
				}}
			>
				<div className="flex justify-center items-center flex-wrap gap-x-2 gap-y-1 text-[0.65rem] font-medium text-[#aaa]">
					<Link
						href="/impressum"
						className="no-underline text-[#aaa] hover:text-[#e20074] transition-colors duration-200"
					>
						Impressum
					</Link>
					<span className="text-[#ddd]">·</span>
					<Link
						href="/privacy"
						className="no-underline text-[#aaa] hover:text-[#e20074] transition-colors duration-200"
					>
						Datenschutz
					</Link>
					<span className="text-[#ddd]">·</span>
					<Link
						href="/faq"
						className="no-underline text-[#aaa] hover:text-[#e20074] transition-colors duration-200"
					>
						FAQ
					</Link>
				</div>
			</div>
		</div>
	);
}
