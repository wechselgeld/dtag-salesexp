'use client';

import {
	useRouter,
} from 'next/navigation';
import {
	LogOut,
	User,
} from 'lucide-react';
import {
	trpc,
} from '@/lib/trpc';
import {
	Tooltip,
} from './sidebar-tooltip';

interface SidebarAccountProps {
	collapsed: boolean;
}

export function SidebarAccount({
	collapsed,
}: SidebarAccountProps) {
	const router = useRouter();
	const {
		data: currentUser,
	} = trpc.auth.me.useQuery();

	const logoutMutation = trpc.auth.logout.useMutation({
		onSuccess: () => {
			router.push('/');
			router.refresh();
		},
	});

	if (!currentUser) return null;

	const email = currentUser.email || '';
	const firstName = currentUser.firstName || '';
	const lastName = currentUser.lastName || '';
	const name = `${firstName} ${lastName}`.trim() || email;

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	if (collapsed) {
		return (
			<div className="flex flex-col items-center w-full px-3 mt-1.5 shrink-0">
				<Tooltip label={`Abmelden (${email})`} show={true}>
					<button
						onClick={handleLogout}
						disabled={logoutMutation.isPending}
						className="w-10 h-10 rounded-xl bg-transparent hover:bg-red-50 text-[#999] hover:text-[#dc2626] flex items-center justify-center transition-all cursor-pointer border-none focus:outline-none shrink-0"
					>
						<LogOut className="w-4.5 h-4.5" />
					</button>
				</Tooltip>
			</div>
		);
	}

	return (
		<div className="px-3 w-full mt-1.5 shrink-0">
			<div className="bg-[#f7f8fa] rounded-[20px] p-2 flex items-center justify-between gap-3 w-full min-w-0">
				{/* Inner Item Styled like a Sidebar Link */}
				<div className="flex items-center gap-3 px-3 py-2.5 min-w-0 flex-1">
					<User className="w-4 h-4 text-[#444] shrink-0" strokeWidth={2} />
					<div className="flex flex-col min-w-0 leading-tight">
						<span className="font-bold text-[0.8rem] text-[#1a1a2e] truncate">
							{name}
						</span>
						<span className="text-[0.68rem] font-medium text-[#777] truncate mt-0.5">
							{email}
						</span>
					</div>
				</div>

				{/* Logout Action */}
				<div className="pr-1.5 shrink-0">
					<Tooltip label="Abmelden" show={true}>
						<button
							onClick={handleLogout}
							disabled={logoutMutation.isPending}
							className="w-8 h-8 rounded-[10px] bg-transparent hover:bg-red-50 text-[#999] hover:text-[#dc2626] flex items-center justify-center transition-all cursor-pointer border-none focus:outline-none"
						>
							<LogOut className="w-4 h-4" />
						</button>
					</Tooltip>
				</div>
			</div>
		</div>
	);
}
