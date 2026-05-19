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
	LogOut,
	Wallet,
	Users,
	ArrowLeft,
	Megaphone,
	Layers,
	Shield,
	MapPin,
	Globe,
} from 'lucide-react';
import clsx from 'clsx';
import {
	DeleteConfirmToast,
} from '@/components/shared/delete-confirm-toast';
import {
	GlobalErrorToast,
} from '@/components/shared/error-toast';
import {
	trpc,
} from '@/lib/trpc';
import {
	usePermissions,
} from '@/hooks/use-permissions';
import type {
	LucideIcon,
} from 'lucide-react';
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
} from '@/components/admin/passkey-prompt';

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
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const logoutMutation = trpc.auth.logout.useMutation({
		onSuccess: () => {
			router.push('/login');
			router.refresh();
		},
	});

	const {
		data: currentUser,
	} = trpc.auth.me.useQuery();

	const { can, role, isAuthenticated } = usePermissions();

	useEffect(() => {
		if (!isAuthenticated) return;
		if (role === 'USER') {
			router.push('/');
		}
	}, [isAuthenticated, role, router]);

	const handleLogout = () => {
		logoutMutation.mutate();
	};

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
				...(can('catalog:manage') ? [{ href: '/admin/products', label: 'Produkte', icon: Box }] : []),
				...(can('prices:manage') ? [{ href: '/admin/special-prices', label: 'Aktionen', icon: Tag }] : []),
				...(can('addons:manage') ? [{ href: '/admin/addons', label: 'Optionen', icon: Layers }] : []),
				...(can('credits:manage') ? [{ href: '/admin/credits', label: 'Gutschriften', icon: Wallet }] : []),
			],
		},
		{
			title: 'Organisation',
			show: can('od:manage') || can('locations:manage') || can('teams:manage'),
			items: [
				...(can('od:manage') ? [{ href: '/admin/od-regions', label: 'OD-Bereiche', icon: Globe }] : []),
				...(can('locations:manage') ? [{ href: '/admin/locations', label: 'Standorte', icon: MapPin }] : []),
				...(can('teams:manage') ? [{ href: '/admin/teams', label: 'Teams', icon: Users }] : []),
			],
		},
		{
			title: 'Inhalte',
			show: can('news:create'),
			items: [
				...(can('news:create') ? [{ href: '/admin/news', label: 'Neuigkeiten', icon: Megaphone }] : []),
			],
		},
		{
			title: 'System',
			show: can('users:read') || can('settings:manage'),
			items: [
				...(can('users:read') ? [{ href: '/admin/users', label: 'Benutzer', icon: Shield }] : []),
				...(can('settings:manage') ? [{ href: '/admin/settings', label: 'Einstellungen', icon: Settings }] : []),
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

					{menuGroups
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
						))}
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
			<GlobalErrorToast />
			<AdminPasskeyPrompt />
		</div>
	);
}
