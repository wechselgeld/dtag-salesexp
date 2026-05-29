'use client';

import {
	useState, useEffect,
} from 'react';
import {
	usePathname, useRouter,
} from 'next/navigation';
import {
	Box,
	Tag,
	Settings,
	Wallet,
	Users,
	ArrowLeft,
	Megaphone,
	Layers,
	Shield,
	MapPin,
	Globe,
	Terminal,
	History,
} from 'lucide-react';
import type {
	LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import {
	DeleteConfirmToast,
} from '@/components/shared/delete-confirm-toast';
import {
	usePermissions,
} from '@/hooks/use-permissions';
import {
	SidebarLayout,
} from '@/components/layout/sidebar/sidebar-layout';
import {
	SidebarItem,
	SidebarGroup,
} from '@/components/layout/sidebar/sidebar-item';
import {
	SidebarAccount,
} from '@/components/layout/sidebar/sidebar-account';
import {
	AdminPasskeyPrompt,
} from '@/components/features/admin/passkey-prompt';

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

function SidebarGroupSkeleton({
 collapsed,
}: { collapsed: boolean }) {
	return (
		<div className="px-3 w-full mb-6 animate-pulse">
			{!collapsed && (
				<div className="h-4 bg-[#e2e4e8] rounded-full w-24 mb-3.5 mx-2" />
			)}
			<div
				className={clsx(
					'flex flex-col gap-2',
					!collapsed && 'bg-[#f7f8fa] rounded-[20px] p-2',
					collapsed && 'items-center gap-2',
				)}
			>
				{[
 1,
2,
3,
].map((i) => (
					<div
						key={i}
						className={clsx(
							'bg-white/60 rounded-[14px]',
							collapsed ? 'w-10 h-10' : 'h-10 w-full flex items-center px-3 gap-3',
						)}
					>
						<div className={clsx('bg-[#e2e4e8] rounded-full shrink-0', collapsed ? 'w-4.5 h-4.5 m-auto' : 'w-4 h-4')} />
						{!collapsed && (
							<div className="h-3 bg-[#e2e4e8] rounded-full w-24" />
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const {
		can, role, isAuthenticated, isLoading,
	} = usePermissions();

	useEffect(() => {
		if (!isAuthenticated) return;
		if (role === 'USER') {
			router.push('/');
		}
	}, [
		isAuthenticated,
		role,
		router,
	]);

	const [
		collapsed,
		setCollapsed,
	] = useState(false);

	// Keyboard shortcut: Ctrl+H to toggle sidebar
	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'h' && e.ctrlKey && !e.shiftKey && !e.altKey) {
			e.preventDefault();
			setCollapsed((c) => !c);
		}
	};

	useEffect(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('keydown', handleKeyDown);
		}
		return () => {
			if (typeof document !== 'undefined') {
				document.removeEventListener('keydown', handleKeyDown);
			}
		};
	}, [
	]);

	if (isAuthenticated && role === 'USER') {
		return null;
	}

	const menuGroups: MenuGroup[] = [
		{
			title: 'Katalog & Konditionen',
			show: can('catalog:manage') || can('prices:manage') || can('addons:manage') || can('credits:manage'),
			items: [
				...(can('catalog:manage') ? [
					{
						href: '/admin/products',
						label: 'Produkte',
						icon: Box,
					},
				] : [
				]),
				...(can('prices:manage') ? [
					{
						href: '/admin/special-prices',
						label: 'Aktionen',
						icon: Tag,
					},
				] : [
				]),
				...(can('addons:manage') ? [
					{
						href: '/admin/addons',
						label: 'Optionen',
						icon: Layers,
					},
				] : [
				]),
				...(can('credits:manage') ? [
					{
						href: '/admin/credits',
						label: 'Gutschriften',
						icon: Wallet,
					},
				] : [
				]),
			],
		},
		{
			title: 'Organisation',
			show: can('od:manage') || can('locations:manage') || can('teams:manage'),
			items: [
				...(can('od:manage') ? [
					{
						href: '/admin/od-regions',
						label: 'OD-Bereiche',
						icon: Globe,
					},
				] : [
				]),
				...(can('locations:manage') ? [
					{
						href: '/admin/locations',
						label: 'Standorte',
						icon: MapPin,
					},
				] : [
				]),
				...(can('teams:manage') ? [
					{
						href: '/admin/teams',
						label: 'Teams',
						icon: Users,
					},
				] : [
				]),
			],
		},
		{
			title: 'Inhalte',
			show: can('news:create'),
			items: [
				...(can('news:create') ? [
					{
						href: '/admin/news',
						label: 'Neuigkeiten',
						icon: Megaphone,
					},
				] : [
				]),
			],
		},
		{
			title: 'System',
			show: can('users:read') || can('settings:manage'),
			items: [
				...(can('users:read') ? [
					{
						href: '/admin/users',
						label: 'Benutzer',
						icon: Shield,
					},
				] : [
				]),
				...(can('settings:manage') ? [
					{
						href: '/admin/settings',
						label: 'Einstellungen',
						icon: Settings,
					},
					{
						href: '/admin/errors',
						label: 'Fehlerprotokoll',
						icon: Terminal,
					},
					{
						href: '/admin/audit',
						label: 'Aktivitätslog',
						icon: History,
					},
				] : [
				]),
			],
		},
	];

	return (
		<div className="min-h-screen bg-[#f7f8fa] flex text-[#333]">
			<SidebarLayout
				collapsed={collapsed}
				onToggle={() => setCollapsed(!collapsed)}
				catColor="#e20074"
				copyright={`© ${new Date().getFullYear()} buffinteractive.net`}
				footerActions={
					<SidebarAccount collapsed={collapsed} />
				}
			>
				<nav className="flex flex-col mt-2">
					<SidebarGroup title="Navigation" collapsed={collapsed}>
						<SidebarItem
							icon={ArrowLeft}
							label="Zurück zum Sales Tool"
							href="/"
							collapsed={collapsed}
						/>
					</SidebarGroup>

					{isLoading ? (
						<>
							<SidebarGroupSkeleton collapsed={collapsed} />
							<SidebarGroupSkeleton collapsed={collapsed} />
						</>
					) : (
						menuGroups
							.filter((group) => group.show && group.items.length > 0)
							.map((group) => (
								<SidebarGroup
									key={group.title}
									title={group.title}
									collapsed={collapsed}
								>
									{group.items.map((item) => (
										<SidebarItem
											key={item.href}
											icon={item.icon}
											label={item.label}
											href={item.href}
											active={pathname.startsWith(item.href)}
											collapsed={collapsed}
										/>
									))}
								</SidebarGroup>
							))
					)}
				</nav>
			</SidebarLayout>

			{/* Main content */}
			<main
				className={clsx(
					'flex-1 p-8 overflow-y-auto h-screen transition-all duration-300',
					collapsed ? 'ml-0' : 'ml-0', // We are using flex, but the aside is shrink-0. If it was fixed, we'd need margin.
				)}
			>
				<div className="max-w-[1000px] mx-auto">{children}</div>
			</main>

			<DeleteConfirmToast />
			<AdminPasskeyPrompt />
		</div>
	);
}
