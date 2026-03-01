"use client";

import Link from "next/link";
import { TelekomLogo } from "@/components/shared/telekom-logo";
import { Search, ShoppingCart, User } from "lucide-react";
import { useBasketStore } from "@/hooks/use-basket-store";

export function Navbar() {
	const basketItems = useBasketStore((state) => state.items.length);
	const setIsOpen = useBasketStore((state) => state.setIsOpen);

	return (
		<nav className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
			<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-3 group">
					<div className="w-10 h-10 text-pink-500 group-hover:scale-105 transition-transform">
						<TelekomLogo width="100%" height="100%" />
					</div>
					<span className="font-sans font-bold text-xl tracking-tight text-white">
						Sales<span className="text-pink-500">Experience</span>
					</span>
				</Link>

				{/* Actions */}
				<div className="flex items-center gap-1">
					<button
						className="p-2.5 text-zinc-400 hover:text-pink-400 hover:bg-zinc-800 rounded-xl transition-all duration-200"
						aria-label="Search"
					>
						<Search className="w-5 h-5" strokeWidth={2} />
					</button>

					<button
						onClick={() => setIsOpen(true)}
						className="relative p-2.5 text-zinc-400 hover:text-pink-400 hover:bg-zinc-800 rounded-xl transition-all duration-200"
						aria-label="Shopping cart"
					>
						<ShoppingCart className="w-5 h-5" strokeWidth={2} />
						{basketItems > 0 && (
							<span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-zinc-950 shadow-sm animate-pulse" />
						)}
					</button>

					<div className="w-px h-6 bg-zinc-800 mx-2" />

					<button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-zinc-300 hover:bg-zinc-800 transition-all duration-200 group">
						<div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-magenta-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-pink-500/50">
							<User className="w-4 h-4" strokeWidth={2.5} />
						</div>
						<span className="text-sm font-semibold">Agent</span>
					</button>
				</div>
			</div>
		</nav>
	);
}
