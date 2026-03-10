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
	Layers,
	Shield,
	MapPin,
	Globe,
	Activity,
	BarChart3
} from "lucide-react";
import clsx from "clsx";
import { TelekomLogo } from "@/components/shared/telekom-logo";
import { DeleteConfirmToast } from "@/components/shared/delete-confirm-toast";
import { trpc } from "@/lib/trpc";
import { LucideIcon } from "lucide-react";

interface MenuItem {
	href: string;
	label: string;
	icon: LucideIcon;
}

interface MenuGroup {
	title: string;
	show: boolean;
	items: MenuItem[];
}

export default function AdminLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const logoutMutation = trpc.auth.logout.useMutation({
		onSuccess: () => {
			router.push("/login");
			router.refresh();
		}
	});

	const { data: currentUser } = trpc.auth.me.useQuery();

	const handleLogout = async () => {
		logoutMutation.mutate();
	};

	const role = currentUser?.role;
	const isEditor = currentUser?.isEditor || role === "ADMIN";

	const menuGroups: MenuGroup[] = [
		{
			title: "Katalog & Konditionen",
			show: isEditor,
			items: [
				{ href: "/admin/products", label: "Produkte", icon: Box },
				{ href: "/admin/special-prices", label: "Aktionen", icon: Tag },
				{ href: "/admin/addons", label: "Optionen", icon: Layers },
				{ href: "/admin/credits", label: "Gutschriften", icon: Wallet }
			]
		},
		{
			title: "Organisation",
			show: true,
			items: [
				...(role === "ADMIN"
					? [{ href: "/admin/od-regions", label: "OD-Bereiche", icon: Globe }]
					: []),
				...(role === "ADMIN" || role === "OD_MANAGER"
					? [{ href: "/admin/locations", label: "Standorte", icon: MapPin }]
					: []),
				{ href: "/admin/teams", label: "Teams", icon: Users },
				{ href: "/admin/sessions", label: "Sessions", icon: Activity },
				{ href: "/admin/analytics", label: "Statistiken", icon: BarChart3 }
			]
		},
		{
			title: "Inhalte",
			show: isEditor,
			items: [{ href: "/admin/news", label: "Neuigkeiten", icon: Megaphone }]
		},
		{
			title: "System",
			show: true,
			items: [
				...(role === "ADMIN" ||
				role === "OD_MANAGER" ||
				role === "LOCATION_MANAGER"
					? [{ href: "/admin/users", label: "Benutzer", icon: Shield }]
					: []),
				{
					href: "/admin/settings",
					label: "Einstellungen",
					icon: Settings
				}
			]
		}
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
				<nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto custom-scrollbar">
					{menuGroups
						.filter((group) => group.show && group.items.length > 0)
						.map((group) => (
							<div key={group.title} className="space-y-1">
								<div className="text-[0.6rem] uppercase tracking-[0.15em] text-[#bbb] font-bold px-3 mb-2 flex items-center justify-between">
									<span>{group.title}</span>
									<span className="h-px bg-[#eaedf0] flex-1 ml-3 mt-px"></span>
								</div>
								<div className="space-y-0.5">
									{group.items.map((item) => {
										const isActive = pathname.startsWith(item.href);
										return (
											<Link
												key={item.href}
												href={item.href}
												className={clsx(
													"flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 no-underline text-[0.82rem] group",
													isActive
														? "bg-[#e20074]/5 text-[#e20074] font-semibold"
														: "text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e]"
												)}
											>
												<div
													className={clsx(
														"w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
														isActive
															? "bg-[#e20074] text-white shadow-[0_4px_10px_rgba(226,0,116,0.25)]"
															: "bg-[#f7f8fa] text-[#bbb] group-hover:bg-[#eaedf0] group-hover:text-[#888]"
													)}
												>
													<item.icon
														className="w-4 h-4"
														strokeWidth={isActive ? 2.5 : 1.5}
													/>
												</div>
												{item.label}
											</Link>
										);
									})}
								</div>
							</div>
						))}
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

			<DeleteConfirmToast />
		</div>
	);
}
