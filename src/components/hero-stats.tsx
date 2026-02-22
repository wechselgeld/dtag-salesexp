"use client";

import { motion } from "framer-motion";
import { TrendingUp, Package, Users, Sparkles } from "lucide-react";

const stats = [
	{
		label: "Aktive Sessions",
		value: "8",
		icon: Users,
		gradient: "from-magenta-500 to-magenta-600"
	},
	{
		label: "Produkte",
		value: "247",
		icon: Package,
		gradient: "from-cyan-500 to-cyan-600"
	},
	{
		label: "Heute",
		value: "23",
		icon: Sparkles,
		gradient: "from-purple-500 to-purple-600"
	},
	{
		label: "Top Kategorie",
		value: "Mobile",
		icon: TrendingUp,
		gradient: "from-orange-500 to-orange-600"
	}
];

export function HeroStats() {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
			{stats.map((stat, index) => (
				<motion.div
					key={stat.label}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
					className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300 shadow-premium group"
				>
					<div className="flex items-start justify-between mb-3">
						<div
							className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
						>
							<stat.icon className="w-5 h-5" />
						</div>
					</div>
					<div className="text-3xl font-bold text-zinc-900 mb-1">
						{stat.value}
					</div>
					<div className="text-sm text-zinc-500 font-medium">{stat.label}</div>
				</motion.div>
			))}
		</div>
	);
}
