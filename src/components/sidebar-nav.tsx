"use client";

import Link from "next/link";
import { TelekomLogo } from "@/components/telekom-logo";
import {
	LayoutGrid,
	Settings2,
	ShoppingCart,
	RotateCcw,
	ExternalLink,
	Settings,
	HelpCircle,
	Calculator
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useBasketStore } from "@/hooks/use-basket-store";
import clsx from "clsx";
import { useState } from "react";
import { StreamingCalculatorModal } from "./streaming-calculator-modal";

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: "#e20074",
	FIBER: "#0090d0",
	DSL: "#7b61ff",
	MAGENTA_TV_OTT: "#ff6b00",
	DEVICE: "#00a878"
};

const CATEGORY_NAMES: Record<string, string> = {
	MOBILE: "Mobilfunk",
	FIBER: "Glasfaser",
	DSL: "Festnetz",
	MAGENTA_TV_OTT: "MagentaTV",
	DEVICE: "Endgeräte"
};

export function SidebarNav() {
	const pathname = usePathname();
	const router = useRouter();
	const { items, clearBasket } = useBasketStore();
	const [calculatorOpen, setCalculatorOpen] = useState(false);

	// Determine current step from route
	const isHome = pathname === "/" || pathname === "/products";
	const isCategory = pathname.match(/^\/products\/[A-Z_]+$/);
	const isProduct = pathname.match(/^\/products\/[A-Z_]+\/.+$/);

	// Extract category from path
	const categoryMatch = pathname.match(/^\/products\/([A-Z_]+)/);
	const currentCategory = categoryMatch ? categoryMatch[1] : null;
	const catColor = currentCategory
		? CATEGORY_COLORS[currentCategory] || "#e20074"
		: "#e20074";
	const catName = currentCategory
		? CATEGORY_NAMES[currentCategory] || currentCategory
		: null;

	const steps = [
		{
			id: "select",
			label: "Auswahl",
			sublabel: "Kategorie wählen",
			icon: LayoutGrid,
			href: "/products",
			active: isHome || pathname === "/products",
			completed: !!isCategory || !!isProduct
		},
		{
			id: "configure",
			label: "Beratung",
			sublabel: catName ? catName : "Tarif konfigurieren",
			icon: Settings2,
			href: isCategory
				? pathname
				: currentCategory
					? `/products/${currentCategory}`
					: "/products",
			active: !!isCategory || !!isProduct,
			completed: items.length > 0
		}
	];

	const currentStepIndex = steps.findIndex((s) => s.active);

	const handleReset = () => {
		clearBasket();
		router.push("/");
	};

	return (
		<aside className="bg-white border-r border-[#eaedf0] flex flex-col z-10 w-[260px] h-screen">
			{/* Logo */}
			<div className="px-5 pt-5 pb-6">
				<Link href="/" className="flex items-center gap-3 no-underline group">
					<TelekomLogo className="w-7 h-7 text-[#e20074] shrink-0 group-hover:scale-105 transition-transform" />
					<div className="leading-none">
						<div className="text-[1.1rem] font-extrabold text-[#e20074] tracking-tight">
							Sales
						</div>
						<div className="text-[0.7rem] text-[#bbb] font-medium mt-0.5">
							Experience
						</div>
					</div>
				</Link>
			</div>

			{/* Workflow Steps */}
			<div className="flex-1 px-5">
				<div className="text-[0.6rem] uppercase tracking-[0.15em] text-[#ccc] font-semibold mb-4 px-1">
					Workflow
				</div>

				<nav className="flex flex-col gap-1">
					{steps.map((step, i) => {
						const Icon = step.icon;
						const isActive = step.active;
						const isPast = i < currentStepIndex && currentStepIndex >= 0;

						return (
							<Link
								key={step.id}
								href={step.href}
								className={clsx(
									"flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline transition-all duration-200 group relative",
									isActive ? "bg-[#f7f8fa]" : "hover:bg-[#f7f8fa]/60"
								)}
							>
								<div
									className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
									style={{
										backgroundColor: isActive
											? `${catColor}12`
											: isPast
												? `${catColor}08`
												: "#f7f8fa",
										color: isActive ? catColor : isPast ? catColor : "#ccc"
									}}
								>
									<Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
								</div>

								<div className="flex-1 min-w-0">
									<div
										className={clsx(
											"text-[0.82rem] leading-tight transition-colors",
											isActive
												? "font-bold text-[#1a1a2e]"
												: isPast
													? "font-semibold text-[#888]"
													: "font-medium text-[#ccc]"
										)}
									>
										{step.label}
									</div>
									<div
										className={clsx(
											"text-[0.65rem] mt-0.5 transition-colors",
											isActive ? "text-[#999]" : "text-[#ddd]"
										)}
									>
										{step.sublabel}
									</div>
								</div>

								{isActive && (
									<div
										className="w-1.5 h-1.5 rounded-full shrink-0"
										style={{ backgroundColor: catColor }}
									/>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Context indicator */}
				{currentCategory && (
					<div className="mt-5 mx-1">
						<div className="h-px bg-[#eaedf0] mb-4" />
						<div className="text-[0.6rem] uppercase tracking-[0.15em] text-[#ccc] font-semibold mb-3">
							Aktive Kategorie
						</div>
						<div
							className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
							style={{ backgroundColor: `${catColor}06` }}
						>
							<div
								className="w-2 h-2 rounded-full shrink-0"
								style={{ backgroundColor: catColor }}
							/>
							<span
								className="text-[0.8rem] font-semibold"
								style={{ color: catColor }}
							>
								{catName}
							</span>
						</div>
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="px-5 pb-4 pt-3">
				{/* Utility links */}
				<div className="flex flex-col gap-0.5 mb-3">
					<button
						onClick={() => setCalculatorOpen(true)}
						className="flex items-center w-full bg-transparent border-none text-left gap-2.5 px-3 py-2 rounded-xl no-underline text-[0.75rem] font-medium transition-all duration-200 text-[#bbb] hover:text-[#e20074] hover:bg-[#e20074]/5 cursor-pointer"
					>
						<Calculator className="w-3.5 h-3.5" />
						Sparvorteil-Rechner
					</button>

					<Link
						href="/settings"
						className={clsx(
							"flex items-center gap-2.5 px-3 py-2 rounded-xl no-underline text-[0.75rem] font-medium transition-all duration-200",
							pathname === "/settings"
								? "bg-[#f7f8fa] text-[#1a1a2e]"
								: "text-[#bbb] hover:text-[#888] hover:bg-[#f7f8fa]"
						)}
					>
						<Settings className="w-3.5 h-3.5" />
						Einstellungen
					</Link>

					<Link
						href="/faq"
						className={clsx(
							"flex items-center gap-2.5 px-3 py-2 rounded-xl no-underline text-[0.75rem] font-medium transition-all duration-200",
							pathname === "/faq"
								? "bg-[#f7f8fa] text-[#1a1a2e]"
								: "text-[#bbb] hover:text-[#888] hover:bg-[#f7f8fa]"
						)}
					>
						<HelpCircle className="w-3.5 h-3.5" />
						FAQ
					</Link>

					<a
						href="/login"
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2.5 px-3 py-2 rounded-xl no-underline text-[0.75rem] font-medium text-[#bbb] hover:text-[#888] hover:bg-[#f7f8fa] transition-all duration-200"
					>
						<ExternalLink className="w-3.5 h-3.5" />
						Admin
					</a>
				</div>

				{/* Reset */}
				<button
					onClick={handleReset}
					className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-transparent border border-dashed border-[#eaedf0] text-[#ccc] hover:text-[#dc2626] hover:border-[#fca5a5] hover:bg-[#fee2e2]/30 transition-all duration-200 cursor-pointer text-[0.72rem] font-medium"
				>
					<RotateCcw className="w-3 h-3" />
					Sitzung zurücksetzen
				</button>

				{/* Copyright + Links */}
				<div className="mt-4 pt-3 border-t border-[#f0f0f0]">
					<div className="flex justify-center items-center gap-1.5 text-[0.6rem] text-[#ddd]">
						<Link
							href="/impressum"
							className="no-underline text-[#ccc] hover:text-[#999] transition-colors"
						>
							Impressum
						</Link>
						<span>·</span>
						<Link
							href="/faq"
							className="no-underline text-[#ccc] hover:text-[#999] transition-colors"
						>
							FAQ
						</Link>
						<span>·</span>
						<span>v2.0</span>
					</div>
					<div className="text-center text-[0.90rem] text-[#ccc] mt-1.5">
						© {new Date().getFullYear()} Felix Kinze
					</div>
				</div>
			</div>

			{/* Streaming Calculator Modal */}
			<StreamingCalculatorModal
				isOpen={calculatorOpen}
				onClose={() => setCalculatorOpen(false)}
			/>
		</aside>
	);
}
