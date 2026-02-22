"use client";

import { motion } from "framer-motion";
import { Plus, Search, FileText, Zap } from "lucide-react";
import Link from "next/link";

const actions = [
	{
		label: "Neue Beratung",
		icon: Plus,
		href: "#categories",
		gradient: "bg-gradient-magenta",
		description: "Session starten"
	},
	{
		label: "Produkte",
		icon: Search,
		href: "/products",
		gradient: "bg-gradient-cyan",
		description: "Katalog durchsuchen"
	},
	{
		label: "Angebote",
		icon: FileText,
		href: "#",
		gradient: "bg-gradient-purple",
		description: "Letzte anzeigen"
	},
	{
		label: "Schnellsuche",
		icon: Zap,
		href: "#",
		gradient: "bg-gradient-orange",
		description: "Strg+K"
	}
];

export function QuickActions() {
	const handleScrollToCategories = (e: React.MouseEvent, href: string) => {
		if (href === "#categories") {
			e.preventDefault();
			document.getElementById("categories")?.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		}
	};

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{actions.map((action, index) => {
				const Component =
					action.href.startsWith("#") && action.href !== "#" ? "a" : Link;
				const props =
					action.href.startsWith("#") && action.href !== "#"
						? {
								href: action.href,
								onClick: (e: React.MouseEvent) =>
									handleScrollToCategories(e, action.href)
							}
						: { href: action.href };

				return (
					<motion.div
						key={action.label}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.4 + index * 0.1 }}
					>
						<Component {...props} className="block group">
							<div
								className={`${action.gradient} rounded-2xl p-6 text-white hover:scale-105 hover:shadow-premium-lg transition-all duration-300 relative overflow-hidden`}
							>
								<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="relative z-10">
									<action.icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
									<div className="font-bold text-lg mb-1">{action.label}</div>
									<div className="text-sm text-white/80">
										{action.description}
									</div>
								</div>
							</div>
						</Component>
					</motion.div>
				);
			})}
		</div>
	);
}
