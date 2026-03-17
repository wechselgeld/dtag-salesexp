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
	Activity,
	BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import {
	DeleteConfirmToast,
} from '@/components/shared/delete-confirm-toast';
import {
	trpc,
} from '@/lib/trpc';
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

	const role = currentUser?.role;
	const isEditor = currentUser?.isEditor || role === 'ADMIN';

	const menuGroups: MenuGroup[] = [
		{
			title: 'Katalog & Konditionen',
			show: isEditor,
			items: [
				{
					href: '/admin/products',
					label: 'Produkte',
					icon: Box,
				},
				{
					href: '/admin/special-prices',
					label: 'Aktionen',
					icon: Tag,
				},
				{
					href: '/admin/addons',
					label: 'Optionen',
					icon: Layers,
				},
				{
					href: '/admin/credits',
					label: 'Gutschriften',
					icon: Wallet,
				},
			],
		},
		{
			title: 'Organisation',
			show: true,
			items: [
				...(role === 'ADMIN'
					? [
						{
							href: '/admin/od-regions',
							label: 'OD-Bereiche',
							icon: Globe,
						},
					]
					: [
					]),
				...(role === 'ADMIN' || role === 'OD_MANAGER'
					? [
						{
							href: '/admin/locations',
							label: 'Standorte',
							icon: MapPin,
						},
					]
					: [
					]),
				{
					href: '/admin/teams',
					label: 'Teams',
					icon: Users,
				},
				{
					href: '/admin/sessions',
					label: 'Sessions',
					icon: Activity,
				},
				{
					href: '/admin/analytics',
					label: 'Statistiken',
					icon: BarChart3,
				},
			],
		},
		{
			title: 'Inhalte',
			show: true,
			items: [
				{
					href: '/admin/news',
					label: 'Neuigkeiten',
					icon: Megaphone,
				},
			],
		},
		{
			title: 'System',
			show: true,
			items: [
				...(role === 'ADMIN' ||
				role === 'OD_MANAGER' ||
				role === 'LOCATION_MANAGER'
					? [
						{
							href: '/admin/users',
							label: 'Benutzer',
							icon: Shield,
						},
					]
					: [
					]),
				{
					href: '/admin/settings',
					label: 'Einstellungen',
					icon: Settings,
				},
			],
		},
	];

	return (
		<div className="min-h-screen bg-[#f7f8fa] flex text-[#333]">
			<SidebarLayout
				collapsed={collapsed}
				onToggle={() => setCollapsed(!collapsed)}
				catColor="#e20074"
				copyright={`© ${new Date().getFullYear()} Felix Kinze`}
				footerActions={
					<div className="px-3 w-full mb-6">
						<div
							className={clsx(
								'flex flex-col gap-0.5',
								!collapsed && 'bg-[#f7f8fa] rounded-[20px] p-2',
								collapsed && 'items-center gap-1.5',
							)}
						>
							<SidebarItem
								icon={LogOut}
								label="Abmelden"
								onClick={handleLogout}
								collapsed={collapsed}
								variant="danger"
							/>
						</div>
					</div>
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
		</div>
	);
}
