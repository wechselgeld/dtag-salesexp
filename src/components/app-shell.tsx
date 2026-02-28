"use client";

import { usePathname } from "next/navigation";
import { SidebarNav } from "@/components/sidebar-nav";
import { BasketDrawer } from "@/components/basket/basket-drawer";
import { IntroSplash } from "@/components/intro-splash";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { MaintenanceSplash } from "@/components/maintenance-splash";
import { OnboardingTutorial } from "@/components/onboarding-tutorial";
import { useModalStore } from "@/hooks/use-modal-store";
import { AvailabilityCheckModal } from "@/components/availability-check-modal";
import { StreamingCalculatorModal } from "@/components/streaming-calculator-modal";
import { BattlecardModal } from "@/components/battlecard-panel";

// Routes that SHOULD render WITH the sales shell (sidebar + basket)
const SHELL_ROUTES = ["/products", "/settings"];

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: isMaintenance } = trpc.admin.getMaintenanceStatus.useQuery();
	const { data: user } = trpc.admin.getCurrentUser.useQuery(undefined, {
		retry: false
	});

	const isMaintenanceActive = isMaintenance && user?.role !== "ADMIN";

	// Standalone if it's NOT a shell route AND not the root home page
	const isShellRoute =
		SHELL_ROUTES.some((r) => pathname.startsWith(r)) || pathname === "/";
	const isStandalone = !isShellRoute;

	const {
		availabilityOpen,
		setAvailabilityOpen,
		calculatorOpen,
		setCalculatorOpen,
		battlecardOpen,
		setBattlecardOpen
	} = useModalStore();

	const isLoginOrAdmin = pathname.startsWith("/admin") || pathname === "/login";

	if (
		isMaintenanceActive &&
		!pathname.startsWith("/admin") &&
		pathname !== "/login"
	) {
		return <MaintenanceSplash />;
	}

	const shellContent = isStandalone ? (
		<div className="h-screen w-full overflow-y-auto bg-white sm:bg-[#f7f8fa]">
			{children}
		</div>
	) : (
		<div className="grid grid-cols-[auto_1fr_340px] h-screen w-full">
			<SidebarNav />
			<main className="p-8 overflow-y-auto w-full max-w-[1200px] mx-auto scrollbar-none">
				<div className="h-full">{children}</div>
			</main>
			<BasketDrawer />
		</div>
	);

	// Don't show splash/modals on admin/login
	if (isLoginOrAdmin) {
		return shellContent;
	}

	return (
		<IntroSplash>
			{shellContent}
			{!isStandalone && (
				<>
					<OnboardingTutorial />
					<AvailabilityCheckModal
						isOpen={availabilityOpen}
						onClose={() => setAvailabilityOpen(false)}
					/>
					<StreamingCalculatorModal
						isOpen={calculatorOpen}
						onClose={() => setCalculatorOpen(false)}
					/>
					<BattlecardModal
						isOpen={battlecardOpen}
						onClose={() => setBattlecardOpen(false)}
					/>
				</>
			)}
		</IntroSplash>
	);
}
