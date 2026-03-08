"use client";

import Link from "next/link";
import {
	Home,
	LayoutGrid,
	Settings2,
	RotateCcw,
	ExternalLink,
	Settings,
	HelpCircle,
	Calculator,
	MapPin,
	Swords,
	ChevronLeft,
	ChevronRight,
	Check,
	MessageSquare
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useBasketStore } from "@/hooks/use-basket-store";
import { useModalStore } from "@/hooks/use-modal-store";
import clsx from "clsx";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

/* ─────────────────── Tooltip (collapsed only) ─────────────────── */
function Tooltip({
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

/* ─────────────────── Main Sidebar ─────────────────── */
export function SidebarNav() {
	const pathname = usePathname();
	const router = useRouter();
	const { items, clearBasket } = useBasketStore();
	const { setAvailabilityOpen, setCalculatorOpen, setBattlecardOpen } =
		useModalStore();

	const [collapsed, setCollapsed] = useState(false);
	const [resetConfirm, setResetConfirm] = useState(false);
	const [npsChecked, setNpsChecked] = useState(false);
	const [npsResetting, setNpsResetting] = useState(false);
	const [npsHovered, setNpsHovered] = useState(false);
	const npsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Auto-reset NPS after 2 minutes with animation
	useEffect(() => {
		if (npsChecked) {
			npsTimerRef.current = setTimeout(() => {
				setNpsResetting(true);
				setTimeout(() => {
					setNpsChecked(false);
					setNpsResetting(false);
				}, 600);
			}, 120000);
		}
		return () => {
			if (npsTimerRef.current) clearTimeout(npsTimerRef.current);
		};
	}, [npsChecked]);

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

	// 3-step workflow: Startseite → Kategorie → Tarifkonfiguration
	const steps = [
		{
			id: "home",
			label: "Startseite",
			sublabel: "Übersicht",
			icon: Home,
			href: "/",
			active: isHome,
			completed: !!isCategory || !!isProduct
		},
		{
			id: "category",
			label: "Kategorie",
			sublabel: catName || "Auswahl",
			icon: LayoutGrid,
			href: currentCategory ? `/products/${currentCategory}` : "/products",
			active: !!isCategory,
			completed: !!isProduct
		},
		{
			id: "configure",
			label: "Tarifkonfiguration",
			sublabel: catName ? `${catName} konfigurieren` : "Tarif konfigurieren",
			icon: Settings2,
			href: isProduct
				? pathname
				: currentCategory
					? `/products/${currentCategory}`
					: "/products",
			active: !!isProduct,
			completed: items.length > 0
		}
	];

	const currentStepIndex = steps.findIndex((s) => s.active);

	// Keyboard shortcut: Ctrl+H to toggle sidebar
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if (e.key === "h" && e.ctrlKey && !e.shiftKey && !e.altKey) {
			e.preventDefault();
			setCollapsed((c) => !c);
		}
	}, []);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	const handleReset = () => {
		if (!resetConfirm) {
			setResetConfirm(true);
			setTimeout(() => setResetConfirm(false), 3000);
			return;
		}
		clearBasket();
		router.push("/");
		setResetConfirm(false);
		setNpsChecked(false);
		if (npsTimerRef.current) clearTimeout(npsTimerRef.current);
	};

	const sidebarWidth = collapsed ? 72 : 260;

	const utilityLinks = [
		{
			id: "tour-calculator",
			icon: Calculator,
			label: "Sparvorteil-Rechner",
			onClick: () => setCalculatorOpen(true),
			type: "button" as const
		},
		{
			id: "tour-availability",
			icon: MapPin,
			label: "Verfügbarkeits-Check",
			onClick: () => setAvailabilityOpen(true),
			type: "button" as const
		},
		{
			id: "tour-battlecards",
			icon: Swords,
			label: "Battlecards",
			onClick: () => setBattlecardOpen(true),
			type: "button" as const
		},
		{
			id: "settings-link",
			icon: Settings,
			label: "Einstellungen",
			href: "/settings",
			type: "link" as const
		},
		{
			id: "faq-link",
			icon: HelpCircle,
			label: "Hilfe & FAQ",
			href: "/faq",
			type: "link" as const
		},
		{
			id: "tour-admin",
			icon: ExternalLink,
			label: "Admin",
			href: "/login",
			type: "external" as const
		}
	];

	return (
		<motion.aside
			id="tour-sidebar"
			initial={false}
			animate={{ width: sidebarWidth }}
			transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
			className="relative bg-white border-r border-[#eaedf0] flex flex-col z-10 h-screen overflow-hidden select-none shrink-0"
		>
			{/* ───── Subtle gradient overlay at top ───── */}
			<div
				className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-0"
				style={{
					background: `linear-gradient(180deg, ${catColor}04 0%, transparent 100%)`
				}}
			/>

			{/* ───── Logo Area ───── */}
			<div className="relative z-10 px-4 pt-6 pb-4 overflow-hidden">
				<Link href="/" className="block no-underline group shrink-0">
					<div className="relative h-12 flex items-center justify-start overflow-hidden">
						<AnimatePresence mode="wait" initial={false}>
							{collapsed ? (
								<motion.img
									key="collapsed-logo"
									src="/Deutsche_Telekom.svg"
									alt="Telekom"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.2 }}
									className="w-8 h-8 select-none pointer-events-none group-hover:brightness-110 transition-all mx-auto"
								/>
							) : (
								<motion.img
									key="expanded-logo"
									src="/se-logo.svg"
									alt="Sales Experience"
									initial={{ opacity: 0, x: 0 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.2 }}
									className="h-full w-auto max-w-none select-none pointer-events-none group-hover:brightness-110 transition-all"
								/>
							)}
						</AnimatePresence>
					</div>
				</Link>
			</div>

			{/* ───── Collapse Toggle ───── */}
			<div className="relative z-10 mb-2 px-3">
				<Tooltip
					label={collapsed ? "Aufklappen (Strg+H)" : "Einklappen (Strg+H)"}
					show={collapsed}
				>
					<button
						onClick={() => setCollapsed((c) => !c)}
						className={clsx(
							"w-full flex items-center gap-2 rounded-lg transition-all duration-200 cursor-pointer overflow-hidden",
							"bg-[#f7f8fa] border border-[#eaedf0] text-[#aaa] hover:text-[#e20074] hover:border-[#e20074]/20 hover:bg-[#fdeaf2]/40",
							"h-8",
							collapsed ? "justify-center px-0" : "px-2.5"
						)}
						title={collapsed ? "Aufklappen (Strg+H)" : "Einklappen (Strg+H)"}
					>
						{collapsed ? (
							<ChevronRight className="w-3.5 h-3.5 shrink-0" />
						) : (
							<>
								<ChevronLeft className="w-3.5 h-3.5 shrink-0" />
								<span className="text-[0.65rem] font-medium whitespace-nowrap">
									Einklappen
								</span>
							</>
						)}
					</button>
				</Tooltip>
			</div>

			{/* ───── Workflow Steps ───── */}
			<div className="relative z-10 flex-1 px-3 overflow-y-auto scrollbar-none overflow-x-hidden">
				{/* "Workflow" label – hidden instantly via CSS when collapsed */}
				<div
					className="text-[0.58rem] uppercase tracking-[0.15em] text-[#ccc] font-semibold mb-3 px-2 whitespace-nowrap transition-opacity duration-200 overflow-hidden"
					style={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
				>
					Workflow
				</div>

				<nav className="flex flex-col gap-0.5">
					{steps.map((step, i) => {
						const Icon = step.icon;
						const isActive = step.active;
						const isPast = i < currentStepIndex && currentStepIndex >= 0;
						const isFuture = !isActive && !isPast;

						return (
							<Tooltip key={step.id} label={step.label} show={collapsed}>
								<Link
									href={step.href}
									className={clsx(
										"flex items-center gap-3 rounded-xl no-underline transition-all duration-200 group relative overflow-hidden",
										collapsed ? "justify-center py-2.5 px-0" : "px-3 py-2.5",
										isActive && !collapsed
											? "bg-[#f7f8fa]"
											: isPast
												? "hover:bg-[#f7f8fa]/60"
												: isFuture
													? "hover:bg-[#f7f8fa]/40 opacity-60 hover:opacity-80"
													: ""
									)}
								>
									{/* Icon */}
									<div
										className={clsx(
											"relative shrink-0 rounded-lg flex items-center justify-center transition-all duration-200",
											collapsed ? "w-9 h-9" : "w-8 h-8"
										)}
										style={{
											backgroundColor: isActive
												? `${catColor}12`
												: isPast
													? `${catColor}08`
													: "#f0f1f3",
											color: isActive ? catColor : isPast ? catColor : "#c0c0c0"
										}}
									>
										{isPast && step.completed ? (
											<Check className="w-3.5 h-3.5" strokeWidth={2.5} />
										) : (
											<Icon
												className={clsx(
													"transition-transform duration-200",
													isActive ? "w-4 h-4" : "w-3.5 h-3.5"
												)}
												strokeWidth={isActive ? 2.2 : 1.5}
											/>
										)}
									</div>

									{/* Labels – pure CSS transition, no AnimatePresence */}
									<div
										className="flex-1 min-w-0 overflow-hidden whitespace-nowrap transition-all duration-200"
										style={{
											opacity: collapsed ? 0 : 1,
											width: collapsed ? 0 : "auto",
											transitionProperty: "opacity"
										}}
									>
										<div
											className={clsx(
												"text-[0.82rem] leading-tight transition-colors",
												isActive
													? "font-bold text-[#1a1a2e]"
													: isPast
														? "font-semibold text-[#888]"
														: "font-medium text-[#c0c0c0]"
											)}
										>
											{step.label}
										</div>
										<div
											className={clsx(
												"text-[0.65rem] mt-0.5 transition-colors",
												isActive
													? "text-[#999]"
													: isFuture
														? "text-[#ddd]"
														: "text-[#bbb]"
											)}
										>
											{step.sublabel}
										</div>
									</div>

									{/* Active dot */}
									{isActive && !collapsed && (
										<div
											className="w-1.5 h-1.5 rounded-full shrink-0"
											style={{ backgroundColor: catColor }}
										/>
									)}
								</Link>
							</Tooltip>
						);
					})}
				</nav>

				{/* ───── Context indicator (expanded only) ───── */}
				{currentCategory && (
					<div
						className="overflow-hidden transition-all duration-250"
						style={{
							opacity: collapsed ? 0 : 1,
							maxHeight: collapsed ? 0 : 200,
							transitionProperty: "opacity, max-height"
						}}
					>
						<div className="mt-4 mx-1">
							<div className="h-px bg-[#eaedf0] mb-4" />
							<div className="text-[0.58rem] uppercase tracking-[0.15em] text-[#ccc] font-semibold mb-3 whitespace-nowrap">
								Aktive Kategorie
							</div>
							<div
								className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
								style={{ backgroundColor: `${catColor}08` }}
							>
								<div
									className="w-2 h-2 rounded-full shrink-0"
									style={{ backgroundColor: catColor }}
								/>
								<span
									className="text-[0.8rem] font-semibold whitespace-nowrap"
									style={{ color: catColor }}
								>
									{catName}
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Category badge (collapsed only) */}
				{currentCategory && collapsed && (
					<div className="flex justify-center mt-3">
						<Tooltip label={catName || ""} show={true}>
							<div
								className="w-8 h-8 rounded-lg flex items-center justify-center"
								style={{ backgroundColor: `${catColor}12` }}
							>
								<div
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: catColor }}
								/>
							</div>
						</Tooltip>
					</div>
				)}
			</div>

			{/* ───── Footer ───── */}
			<div className="relative z-10 pb-3 pt-2 shrink-0 px-3 overflow-hidden">
				{/* Separator */}
				<div className="h-px bg-[#eaedf0] mb-3 mx-1" />

				{/* Utility links */}
				<div className="flex flex-col gap-0.5 mb-2">
					{utilityLinks.map((item) => {
						const Icon = item.icon;
						const isLinkActive = item.type === "link" && pathname === item.href;

						const btnClass = clsx(
							"flex items-center gap-2.5 rounded-xl no-underline text-[0.75rem] font-medium transition-all duration-200 cursor-pointer border-none overflow-hidden whitespace-nowrap",
							collapsed
								? "w-9 h-9 justify-center mx-auto p-0"
								: "px-3 py-2 w-full",
							isLinkActive
								? "bg-[#f7f8fa] text-[#1a1a2e]"
								: "text-[#b0b0b0] hover:text-[#e20074] hover:bg-[#fdeaf2]/50",
							item.type === "button" && "bg-transparent text-left"
						);

						const content = (
							<>
								<Icon
									className={clsx(
										"shrink-0 transition-all duration-200",
										collapsed ? "w-4 h-4" : "w-3.5 h-3.5"
									)}
								/>
								{/* Label hidden via CSS, no AnimatePresence */}
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
							</>
						);

						return (
							<Tooltip key={item.id} label={item.label} show={collapsed}>
								{item.type === "button" ? (
									<button
										id={item.id}
										onClick={item.onClick}
										className={btnClass}
									>
										{content}
									</button>
								) : item.type === "external" ? (
									<a
										id={item.id}
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className={btnClass}
									>
										{content}
									</a>
								) : (
									<Link href={item.href!} className={btnClass}>
										{content}
									</Link>
								)}
							</Tooltip>
						);
					})}
				</div>

				{/* NPS Reminder */}
				<Tooltip
					label={npsChecked ? "NPS ✓" : "NPS-Hinweis geben"}
					show={collapsed}
				>
					<div
						id="tour-nps"
						className="relative mb-2 w-full flex flex-col justify-end"
						onMouseEnter={() => setNpsHovered(true)}
						onMouseLeave={() => setNpsHovered(false)}
					>
						{/* Inline Expandable Example Text (opens upwards) */}
						{!collapsed && (
							<AnimatePresence>
								{npsHovered && !npsChecked && (
									<motion.div
										initial={{ height: 0, opacity: 0, marginBottom: 0 }}
										animate={{ height: "auto", opacity: 1, marginBottom: 8 }}
										exit={{ height: 0, opacity: 0, marginBottom: 0 }}
										transition={{ duration: 0.2 }}
										className="overflow-hidden"
									>
										<div className="bg-[#fff7ed]/80 border border-[#fed7aa] p-3 rounded-xl text-[0.7rem] text-[#ea580c] leading-relaxed relative mx-0.5">
											<div className="font-bold flex items-center gap-1.5 mb-1.5">
												<span className="text-[0.8rem]">💡</span>
												Beispielformulierung:
											</div>
											„Sie erhalten morgen eine SMS von uns. Sie werden
											gefragt...
											<br />- ...ob wir Ihr <strong>Anliegen lösen</strong>{" "}
											konnten
											<br />- ...ob ich Ihnen{" "}
											<strong>ein Angebot gemacht</strong> habe
											<br />- ...und wie Sie das Gespräch mit mir fanden.
											<br />
											<strong>
												1 bis 8 bedeutet dort, dass es Ihnen nicht gefallen hat
												und 9 bis 10 bedeutet, dass Sie es gern wieder mit mir
												führen würden!
											</strong>
											<br />
											Ich würde mich freuen, wenn Sie sich kurz Zeit dafür
											nehmen.“
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						)}

						<motion.button
							onClick={() => {
								if (npsTimerRef.current) clearTimeout(npsTimerRef.current);
								setNpsResetting(false);
								setNpsChecked(!npsChecked);
							}}
							animate={
								npsResetting
									? {
											scale: [1, 1.05, 0.95, 1.05, 1],
											rotate: [0, -2, 2, -1, 0]
										}
									: { scale: 1, rotate: 0 }
							}
							transition={{ duration: 0.5 }}
							className={clsx(
								"w-full flex items-center justify-between gap-2.5 rounded-xl transition-all duration-300 cursor-pointer border overflow-hidden whitespace-nowrap relative z-10 shrink-0",
								collapsed ? "w-9 h-9 justify-center mx-auto p-0" : "px-3 py-2",
								npsResetting && "animate-pulse",
								npsChecked
									? "bg-[#dcfce7]/50 border-[#86efac] text-[#16a34a]"
									: "bg-[#fff7ed]/60 border-[#fed7aa] text-[#ea580c] hover:bg-[#fff7ed] hover:border-[#fb923c]"
							)}
						>
							<div className="flex items-center gap-2.5">
								{npsChecked ? (
									<Check
										className={clsx(
											"shrink-0",
											collapsed ? "w-4 h-4" : "w-3.5 h-3.5"
										)}
										strokeWidth={2.5}
									/>
								) : (
									<MessageSquare
										className={clsx(
											"shrink-0",
											collapsed ? "w-4 h-4" : "w-3.5 h-3.5"
										)}
									/>
								)}
								<span
									className="text-[0.72rem] font-semibold transition-opacity duration-200 truncate"
									style={{
										opacity: collapsed ? 0 : 1,
										width: collapsed ? 0 : "auto",
										overflow: "hidden"
									}}
								>
									{npsChecked ? "NPS erledigt. Top!" : "Auf NPS hingewiesen?"}
								</span>
							</div>

							{/* Loading Circle for the 2-Minute Timer */}
							{npsChecked && !collapsed && (
								<div className="w-4 h-4 relative shrink-0">
									<svg
										className="w-full h-full -rotate-90"
										style={{ color: "#22c55e" }}
										viewBox="0 0 20 20"
									>
										<circle
											cx="10"
											cy="10"
											r="8"
											stroke="currentColor"
											strokeWidth="2.5"
											fill="none"
											className="opacity-20"
										/>
										<motion.circle
											cx="10"
											cy="10"
											r="8"
											stroke="currentColor"
											strokeWidth="2.5"
											fill="none"
											strokeDasharray={2 * Math.PI * 8}
											initial={{ strokeDashoffset: 0 }}
											animate={{ strokeDashoffset: 2 * Math.PI * 8 }}
											transition={{ duration: 120, ease: "linear" }}
										/>
									</svg>
								</div>
							)}
						</motion.button>
					</div>
				</Tooltip>

				{/* Reset button */}
				<Tooltip label="Sitzung zurücksetzen" show={collapsed}>
					<button
						onClick={handleReset}
						className={clsx(
							"flex items-center gap-2.5 rounded-xl transition-all duration-200 cursor-pointer font-medium border overflow-hidden whitespace-nowrap",
							collapsed
								? "w-9 h-9 justify-center mx-auto p-0"
								: "w-full px-3 py-2",
							resetConfirm
								? "bg-[#fee2e2]/40 border-[#fca5a5] text-[#dc2626]"
								: "bg-transparent border-dashed border-[#eaedf0] text-[#ccc] hover:text-[#dc2626] hover:border-[#fca5a5] hover:bg-[#fee2e2]/30",
							collapsed ? "text-[0.7rem]" : "text-[0.72rem]"
						)}
					>
						<RotateCcw
							className={clsx(
								"shrink-0",
								collapsed ? "w-3.5 h-3.5" : "w-3 h-3",
								resetConfirm && "animate-spin"
							)}
							style={resetConfirm ? { animationDuration: "1s" } : {}}
						/>
						<span
							className="transition-opacity duration-200"
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
					className="mt-3 pt-2.5 border-t border-[#f0f0f0] overflow-hidden transition-all duration-200"
					style={{
						opacity: collapsed ? 0 : 1,
						maxHeight: collapsed ? 0 : 120,
						marginTop: collapsed ? 0 : 12,
						paddingTop: collapsed ? 0 : 10,
						transitionProperty: "opacity, max-height, margin-top, padding-top"
					}}
				>
					<div className="flex justify-center items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[0.6rem] text-[#ccc]">
						<Link
							href="/impressum"
							className="no-underline text-[#ccc] hover:text-[#e20074] transition-colors duration-200"
						>
							Impressum
						</Link>
						<span className="text-[#ddd]">·</span>
						<Link
							href="/privacy"
							className="no-underline text-[#ccc] hover:text-[#e20074] transition-colors duration-200"
						>
							Datenschutz
						</Link>
						<span className="text-[#ddd]">·</span>
						<Link
							href="/faq"
							className="no-underline text-[#ccc] hover:text-[#e20074] transition-colors duration-200"
						>
							FAQ
						</Link>
					</div>
					<div className="text-center text-[0.58rem] text-[#ccc] mt-1.5 whitespace-nowrap">
						<span className="text-[0.55rem] text-[#ddd] bg-[#f7f8fa] px-1.5 py-0.5 rounded font-mono tracking-wide mr-1.5">
							v2.0
						</span>
						© {new Date().getFullYear()} Felix Kinze
					</div>
				</div>
			</div>
		</motion.aside>
	);
}
