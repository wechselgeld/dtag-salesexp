import Link from "next/link";
import clsx from "clsx";

interface GlobalFooterProps {
	className?: string;
	textColor?: string;
	linkColor?: string;
	hoverColor?: string;
}

export function GlobalFooter({
	className,
	textColor = "text-[#888]",
	linkColor = "text-[#888]",
	hoverColor = "hover:text-[#e20074]"
}: GlobalFooterProps) {
	return (
		<div
			className={clsx(
				"mt-auto flex flex-col items-center justify-center pt-8 pb-6 text-center z-10",
				className
			)}
		>
			<div
				className={clsx(
					"flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.7rem] font-medium mb-2",
					textColor
				)}
			>
				<Link
					href="/impressum"
					className={clsx(
						"transition-colors duration-200",
						linkColor,
						hoverColor
					)}
				>
					Impressum
				</Link>
				<span className="opacity-50">·</span>
				<Link
					href="/privacy"
					className={clsx(
						"transition-colors duration-200",
						linkColor,
						hoverColor
					)}
				>
					Datenschutz
				</Link>
				<span className="opacity-50">·</span>
				<Link
					href="/faq"
					className={clsx(
						"transition-colors duration-200",
						linkColor,
						hoverColor
					)}
				>
					FAQ
				</Link>
			</div>

			<div
				className={clsx(
					"flex flex-wrap items-center justify-center gap-2 text-[0.65rem] font-medium opacity-70",
					textColor
				)}
			>
				<span>
					&copy; {new Date().getFullYear()} Felix Kinze für Deutsche Telekom
					Service GmbH
				</span>
				<span className="hidden sm:inline opacity-50">|</span>
				<div className="flex items-center gap-2">
					<span className="font-semibold bg-linear-to-r from-[#e20074] to-[#ff007f] bg-clip-text text-transparent">
						Sales Experience
					</span>
					<span className="px-1.5 py-0.5 rounded shadow-sm bg-black/5 font-mono text-[0.55rem] font-bold tracking-wider leading-none">
						v2.3
					</span>
				</div>
			</div>
		</div>
	);
}
