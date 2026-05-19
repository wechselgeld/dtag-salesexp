'use client';

import Link from 'next/link';

interface SidebarFooterProps {
	collapsed: boolean;
}

export function SidebarFooter({
	collapsed,
}: SidebarFooterProps) {
	return (
		<div className="relative z-10 pb-1 pt-1 shrink-0 px-3 overflow-hidden flex flex-col items-start w-full">
			{/* ───── Copyright Footer ───── */}
			<div
				className="mt-1.5 pt-1.5 border-t border-[#f0f0f0] overflow-hidden transition-all duration-200 w-full"
				style={{
					opacity: collapsed ? 0 : 1,
					maxHeight: collapsed ? 0 : 120,
					transitionProperty: 'opacity, max-height',
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
