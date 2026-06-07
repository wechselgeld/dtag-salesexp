'use client';

import {
	usePathname,
} from 'next/navigation';
import {
	SidebarNav,
} from '@/components/layout/sidebar-nav';
import {
	BasketDrawer,
} from '@/components/features/basket/basket-drawer';
import {
	useBasketStore,
} from '@/lib/store/basket-store';
import {
	IntroSplash,
} from '@/components/features/auth-intro/intro-splash';
import {
	trpc,
} from '@/lib/trpc';
import {
	MaintenanceSplash,
} from '@/components/features/maintenance/maintenance-splash';
import {
	OnboardingTutorial,
} from '@/components/features/onboarding/onboarding-tutorial';
import {
	useModalStore,
} from '@/lib/store/modal-store';
import {
	StreamingCalculatorModal,
} from '@/components/features/calculator/streaming-calculator-modal';
import {
	SalesTipsModal,
} from '@/components/features/sales-tips/sales-tips-modal';
import {
	BattlecardModal,
} from '@/components/features/battlecards/battlecard-panel';
import {
	GlobalNewsNotification,
} from '@/components/features/news/global-news-notification';
import {
	WhatsNewModal,
} from '@/components/features/news/whats-new-modal';
import {
	FeedbackModal,
} from '@/components/features/feedback/feedback-modal';
import {
	TrackingConsentBanner,
} from '@/components/shared/tracking-consent-banner';

// Routes that SHOULD render WITH the sales shell (sidebar + basket)
const SHELL_ROUTES = [
	'/products',
];

export function AppShell({
	children,
}: { children: React.ReactNode }) {
	const pathname = usePathname();
	const {
		data: isMaintenance,
	} = trpc.admin.getMaintenanceStatus.useQuery();
	const {
		data: user,
	} = trpc.admin.getCurrentUser.useQuery(undefined, {
		retry: false,
		enabled: typeof document !== 'undefined' && document.cookie.includes('auth-token'),
	});

	const isMaintenanceActive = isMaintenance && user?.role !== 'ADMIN';

	// Standalone if it's NOT a shell route AND not the root home page
	const isShellRoute =
		SHELL_ROUTES.some((r) => pathname.startsWith(r)) || pathname === '/';
	const isStandalone = !isShellRoute;

	const {
		calculatorOpen,
		setCalculatorOpen,
		battlecardOpen,
		setBattlecardOpen,
		feedbackOpen,
		setFeedbackOpen,
		salesTipsOpen,
		setSalesTipsOpen,
	} = useModalStore();

	const isComparisonMode = useBasketStore((state) => state.isComparisonMode);
	const basketsCount = useBasketStore((state) => (state.baskets || [
]).length);

	const isLoginOrAdmin = pathname.startsWith('/admin') || pathname === '/login';
	const showConsentBanner =
		pathname !== '/setup' &&
		pathname !== '/login' &&
		!pathname.startsWith('/admin') &&
		pathname !== '/privacy' &&
		pathname !== '/tracking' &&
		pathname !== '/impressum' &&
		!pathname.startsWith('/verify');

	if (
		isMaintenanceActive &&
		!pathname.startsWith('/admin') &&
		pathname !== '/login'
	) {
		return <MaintenanceSplash />;
	}

	const showComparison = isComparisonMode && basketsCount > 1;
	const basketWidth = showComparison
		? `${basketsCount === 2 ? 780 : 1120}px`
		: '340px';

	const shellContent = isStandalone ? (
		<div className="h-screen w-full overflow-y-auto bg-white sm:bg-[#f7f8fa]">
			{children}
		</div>
	) : (
		<div
			className="grid h-screen w-full"
			style={{
				gridTemplateColumns: `auto 1fr ${basketWidth}`,
				transition: 'grid-template-columns 500ms cubic-bezier(0.16, 1, 0.3, 1)',
			}}
		>
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
			{showConsentBanner && <TrackingConsentBanner />}
			{!isStandalone && (
				<>
					<OnboardingTutorial />
					<StreamingCalculatorModal
						isOpen={calculatorOpen}
						onClose={() => setCalculatorOpen(false)}
					/>
					<SalesTipsModal
						isOpen={salesTipsOpen}
						onClose={() => setSalesTipsOpen(false)}
					/>
					<BattlecardModal
						isOpen={battlecardOpen}
						onClose={() => setBattlecardOpen(false)}
					/>
					<FeedbackModal
						isOpen={feedbackOpen}
						onClose={() => setFeedbackOpen(false)}
					/>
					<GlobalNewsNotification />
					<WhatsNewModal />
				</>
			)}
		</IntroSplash>
	);
}
