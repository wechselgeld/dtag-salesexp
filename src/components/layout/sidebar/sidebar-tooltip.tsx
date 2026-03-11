import React from "react";

export function Tooltip({
	children,
	label,
	show
}: {
	children: React.ReactNode;
	label: string;
	show: boolean;
}) {
	if (!show) return <>{children}</>;
	return (
		<div className="relative group/tooltip">
			{children}
			<div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1a1a2e] text-white text-[0.7rem] font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 shadow-lg z-50">
				{label}
				<div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-[#1a1a2e]" />
			</div>
		</div>
	);
}
