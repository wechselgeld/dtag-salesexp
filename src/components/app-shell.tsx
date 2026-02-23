"use client";

import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/sidebar-nav";
import { BasketDrawer } from "@/components/basket/basket-drawer";
import { IntroSplash } from "@/components/intro-splash";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { MaintenanceSplash } from "@/components/maintenance-splash";
import { OnboardingTutorial } from "@/components/onboarding-tutorial";

// Routes that should render WITHOUT the sales shell (sidebar + basket)
const STANDALONE_ROUTES = [
	"/admin",
	"/login",
	"/setup",
	"/impressum",
	"/privacy",
	"/faq"
];

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: isMaintenance } = trpc.admin.getMaintenanceStatus.useQuery();
	const { data: user } = trpc.admin.getCurrentUser.useQuery(undefined, {
		retry: false
	});

	const isMaintenanceActive = isMaintenance && user?.role !== "ADMIN";
	const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

	if (
		isMaintenanceActive &&
		!pathname.startsWith("/admin") &&
		pathname !== "/login"
	) {
		return <MaintenanceSplash />;
	}

	if (isStandalone) {
		// Full-page layout — no sidebar, no basket. Added wrapper to allow scrolling.
		return (
			<div className="h-screen w-full overflow-y-auto bg-white sm:bg-[#f7f8fa]">
				{children}
			</div>
		);
	}

	return (
		<IntroSplash>
			<div className="grid grid-cols-[260px_1fr_340px] h-screen w-full">
				<SidebarNav />
				<main className="p-8 overflow-y-auto w-full max-w-[1200px] mx-auto scrollbar-none">
					<div className="h-full">{children}</div>
				</main>
				<BasketDrawer />
			</div>
			<OnboardingTutorial />
		</IntroSplash>
	);
}
