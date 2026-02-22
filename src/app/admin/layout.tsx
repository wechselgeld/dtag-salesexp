"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	Box,
	Tag,
	Settings,
	LogOut,
	Wallet,
	Users,
	ArrowLeft,
	Megaphone,
	Layers
} from "lucide-react";
import clsx from "clsx";
import { TelekomLogo } from "@/components/telekom-logo";

export default function AdminLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		document.cookie =
			"auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		router.push("/login");
		router.refresh();
	};

	const navItems = [
		{ href: "/admin/products", label: "Produkte", icon: Box },
		{ href: "/admin/special-prices", label: "Aktionen", icon: Tag },
		{ href: "/admin/addons", label: "Optionen", icon: Layers },
		{ href: "/admin/credits", label: "Gutschriften", icon: Wallet },
		{ href: "/admin/teams", label: "Teams", icon: Users },
		{ href: "/admin/news", label: "Neuigkeiten", icon: Megaphone },
		{ href: "/admin/settings", label: "Einstellungen", icon: Settings }
	];

	return (
		<div className="min-h-screen bg-[#f7f8fa] flex">
			{/* Sidebar */}
			<aside className="w-[260px] bg-white border-r border-[#eaedf0] flex flex-col fixed h-full">
				{/* Logo area */}
				<div className="px-5 pt-5 pb-4">
					<div className="flex items-center gap-3 mb-5">
						<TelekomLogo className="w-7 h-7 text-[#e20074] shrink-0" />
						<div className="leading-none">
							<div className="text-[1.1rem] font-extrabold text-[#e20074] tracking-tight">
								Admin
							</div>
							<div className="text-[0.65rem] text-[#bbb] font-medium mt-0.5">
								Verwaltung
							</div>
						</div>
					</div>

					{/* Back to Sales */}
					<Link
						href="/"
						className="flex items-center gap-2 px-3 py-2 rounded-xl no-underline text-[0.75rem] font-medium text-[#bbb] hover:text-[#e20074] hover:bg-[#f7f8fa] transition-all duration-200"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Zurück zum Sales Tool
					</Link>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-4 space-y-0.5">
					<div className="text-[0.6rem] uppercase tracking-[0.15em] text-[#ccc] font-semibold mb-3 px-3">
						Verwaltung
					</div>
					{navItems.map((item) => {
						const isActive = pathname.startsWith(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={clsx(
									"flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 no-underline text-[0.82rem]",
									isActive
										? "bg-[#f7f8fa] text-[#e20074] font-semibold"
										: "text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e]"
								)}
							>
								<div
									className={clsx(
										"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
										isActive
											? "bg-[#e20074]/[0.08] text-[#e20074]"
											: "bg-transparent text-[#bbb]"
									)}
								>
									<item.icon
										className="w-4 h-4"
										strokeWidth={isActive ? 2 : 1.5}
									/>
								</div>
								{item.label}
							</Link>
						);
					})}
				</nav>

				{/* Footer */}
				<div className="px-4 pb-5 pt-3">
					<button
						onClick={handleLogout}
						className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-[0.78rem] text-[#ccc] hover:bg-[#fee2e2]/40 hover:text-[#dc2626] transition-all duration-200 cursor-pointer bg-transparent border border-dashed border-[#eaedf0] hover:border-[#fca5a5]"
					>
						<LogOut className="w-3.5 h-3.5" />
						Abmelden
					</button>

					<div className="text-center text-[0.55rem] text-[#ddd] mt-3">
						© {new Date().getFullYear()} Felix Kinze
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="flex-1 ml-[260px] p-8 overflow-y-auto h-screen">
				<div className="max-w-[1000px] mx-auto">{children}</div>
			</main>
		</div>
	);
}
