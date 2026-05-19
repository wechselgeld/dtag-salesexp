'use client';

import {
	useState, useEffect, useCallback, useRef,
} from 'react';
import {
	usePathname, useRouter,
} from 'next/navigation';
import {
	Home,
	LayoutGrid,
	Settings2,
	Calculator,
	Swords,
	Settings,
	HelpCircle,
	ExternalLink,
	MessageSquare,
	Logs,
} from 'lucide-react';

import {
	useBasketStore,
} from '@/hooks/use-basket-store';
import {
	useModalStore,
} from '@/hooks/use-modal-store';

import {
	SidebarWorkflow,
} from './sidebar/sidebar-workflow';
import type {
	UtilityLink,
} from './sidebar/sidebar-tools';
import {
	SidebarTools,
} from './sidebar/sidebar-tools';
import {
	SidebarNps,
} from './sidebar/sidebar-nps';
import {
	SidebarFooter,
} from './sidebar/sidebar-footer';
import {
	SidebarLayout,
} from './sidebar/sidebar-layout';
import {
	SidebarAccount,
} from './sidebar/sidebar-account';
import {
	useNewsNotificationStore,
} from '@/lib/store/news-notification-store';

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: '#e20074',
	FIBER: '#0090d0',
	DSL: '#7b61ff',
	MAGENTA_TV_OTT: '#ff6b00',
	DEVICE: '#00a878',
};

const CATEGORY_NAMES: Record<string, string> = {
	MOBILE: 'Mobilfunk',
	FIBER: 'Glasfaser',
	DSL: 'Festnetz',
	MAGENTA_TV_OTT: 'MagentaTV',
	DEVICE: 'Endgeräte',
};

export function SidebarNav() {
	const pathname = usePathname();
	const router = useRouter();
	const {
		items, clearBasket,
	} = useBasketStore();
	const {
		setCalculatorOpen, setBattlecardOpen, setFeedbackOpen,
	} =
		useModalStore();
	const addNotification = useNewsNotificationStore((state) => state.addNotification);

	const [
		collapsed,
		setCollapsed,
	] = useState(false);
	const [
		resetConfirm,
		setResetConfirm,
	] = useState(false);
	const [
		npsChecked,
		setNpsChecked,
	] = useState(false);
	const [
		npsResetting,
		setNpsResetting,
	] = useState(false);
	const [
		npsHovered,
		setNpsHovered,
	] = useState(false);
	const npsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Auto-reset NPS after 2 minutes with animation and toast reminder
	useEffect(() => {
		if (npsChecked) {
			npsTimerRef.current = setTimeout(() => {
				// 1. Trigger vibration and notification
				setNpsResetting(true);
				addNotification({
					id: `nps-reminder-${Date.now()}`,
					title: 'NPS erledigt?',
					content: 'Vergiss nicht, den Kunden auf die NPS-Umfrage hinzuweisen!',
					priority: 'INFO',
				});

				// 2. Clear state after vibration
				setTimeout(() => {
					setNpsChecked(false);
					setNpsResetting(false);
				}, 1500);
			}, 120000);
		}
		return () => {
			if (npsTimerRef.current) {
				clearTimeout(npsTimerRef.current);
			}
		};
	}, [
		npsChecked,
		addNotification,
	]);

	// Determine current step from route
	const isHome = pathname === '/' || pathname === '/products';
	const isCategory = pathname.match(/^\/products\/[A-Z_]+$/);
	const isProduct = pathname.match(/^\/products\/[A-Z_]+\/.+$/);

	// Extract category from path
	const categoryMatch = pathname.match(/^\/products\/([A-Z_]+)/);
	const currentCategory = categoryMatch ? categoryMatch[1] : null;
	const catColor = currentCategory
		? CATEGORY_COLORS[currentCategory] || '#e20074'
		: '#e20074';
	const catName = currentCategory
		? CATEGORY_NAMES[currentCategory] || currentCategory
		: null;

	const steps = [
		{
			id: 'home',
			label: 'Startseite',
			sublabel: isHome ? 'Katalog durchstöbern' : 'Startseite',
			icon: Home,
			href: '/',
			active: isHome,
			completed: !!isCategory || !!isProduct,
		},
		{
			id: 'category',
			label: 'Kategorie',
			sublabel: isCategory
				? `${catName}-Angebote`
				: isProduct
					? catName || 'Kategorie'
					: 'Kategorie wählen',
			icon: LayoutGrid,
			href: currentCategory ? `/products/${currentCategory}` : '/products',
			active: !!isCategory,
			completed: !!isProduct,
		},
		{
			id: 'configure',
			label: 'Konfiguration',
			sublabel: isProduct
				? 'Details anpassen'
				: items.length > 0
					? 'Im Warenkorb'
					: 'Tarif konfigurieren',
			icon: Settings2,
			href: isProduct
				? pathname
				: currentCategory
					? `/products/${currentCategory}`
					: '/products',
			active: !!isProduct,
			completed: items.length > 0,
		},
	];

	const currentStepIndex = steps.findIndex((s) => s.active);

	// Keyboard shortcut: Ctrl+H to toggle sidebar
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if (e.key === 'h' && e.ctrlKey && !e.shiftKey && !e.altKey) {
			e.preventDefault();
			setCollapsed((c) => !c);
		}
	}, [
	]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [
		handleKeyDown,
	]);

	const handleReset = () => {
		if (!resetConfirm) {
			setResetConfirm(true);
			setTimeout(() => setResetConfirm(false), 3000);
			return;
		}
		clearBasket();
		router.push('/');
		setResetConfirm(false);
		setNpsChecked(false);
		if (npsTimerRef.current) { clearTimeout(npsTimerRef.current); }
	};

	// Grouped utilities
	const group1: UtilityLink[] = [
		{
			id: 'tour-calculator',
			icon: Calculator,
			label: 'Sparvorteil-Rechner',
			onClick: () => setCalculatorOpen(true),
			type: 'button',
		},
		{
			id: 'tour-battlecards',
			icon: Swords,
			label: 'Battlecards',
			onClick: () => setBattlecardOpen(true),
			type: 'button',
		},
	];

	const group2: UtilityLink[] = [
		{
			id: 'feedback-button',
			icon: MessageSquare,
			label: 'Feedback geben',
			onClick: () => setFeedbackOpen(true),
			type: 'button',
		},
		{
			id: 'changelog-link',
			icon: Logs,
			label: 'Changelog',
			href: '/changelog',
			type: 'link',
		},
		{
			id: 'settings-link',
			icon: Settings,
			label: 'Einstellungen',
			href: '/settings',
			type: 'link',
		},
		{
			id: 'faq-link',
			icon: HelpCircle,
			label: 'Hilfe & FAQ',
			href: '/faq',
			type: 'link',
		},
		{
			id: 'tour-admin',
			icon: ExternalLink,
			label: 'Admin',
			href: '/login',
			type: 'link',
		},
	];

	return (
		<SidebarLayout
			collapsed={collapsed}
			onToggle={() => setCollapsed(!collapsed)}
			catColor={catColor}
			footerActions={
				<div className="flex flex-col gap-1 w-full">
					<SidebarTools
						collapsed={collapsed}
						group1={group1}
						group2={group2}
					/>

					<SidebarNps
						collapsed={collapsed}
						npsChecked={npsChecked}
						npsResetting={npsResetting}
						npsHovered={npsHovered}
						setNpsHovered={setNpsHovered}
						onToggle={() => {
							if (npsTimerRef.current) { clearTimeout(npsTimerRef.current); }
							setNpsResetting(false);
							setNpsChecked(!npsChecked);
						}}
					/>

					<SidebarAccount collapsed={collapsed} />

					<SidebarFooter
						collapsed={collapsed}
					/>
				</div>
			}
		>
			<SidebarWorkflow
				steps={steps}
				currentStepIndex={currentStepIndex}
				collapsed={collapsed}
				catColor={catColor}
				catName={catName}
				currentCategory={currentCategory}
			/>
		</SidebarLayout>
	);
}
