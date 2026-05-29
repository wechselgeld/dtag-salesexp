import {
	UserForm,
} from '@/components/features/admin/user-form';
import {
	prisma,
} from '@/lib/prisma';
import {
	notFound,
	redirect,
} from 'next/navigation';
import {
	getSession,
} from '@/lib/auth';
import {
	canManageUser,
	type SessionUser,
} from '@/lib/rbac';

export const metadata = {
	title: 'Admin bearbeiten | Admin',
};

export default async function EditUserPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getSession();
	if (!session) {
		redirect('/api/auth/logout');
	}

	const resolvedParams = await params;
	const user = await prisma.user.findUnique({
		where: {
			id: resolvedParams.id,
		},
		include: {
			team: {
				include: {
					location: true,
				},
			},
			location: true,
		},
	});

	if (!user) {
		notFound();
	}

	const effectiveLocationId = user.locationId || user.team?.locationId || null;
	const effectiveOdRegionId = user.odRegionId || user.location?.odRegionId || user.team?.location?.odRegionId || null;

	const currentUserForCheck: SessionUser = {
		id: session.sub,
		role: session.role,
		email: session.email,
		isEditor: session.isEditor,
		odRegionId: session.odRegionId,
		locationId: session.locationId,
		teamId: session.teamId,
	};

	if (session.sub !== user.id && !canManageUser(currentUserForCheck, user.role, effectiveOdRegionId, effectiveLocationId)) {
		redirect('/admin/users');
	}

	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<UserForm
				mode="edit"
				userId={user.id}
				initialData={{
					email: user.email,
					role: user.role as
						| 'ADMIN'
						| 'OD_MANAGER'
						| 'LOCATION_MANAGER'
						| 'TEAM_LEADER'
						| 'USER',
					isEditor: user.isEditor,
					odRegionId: user.odRegionId,
					locationId: user.locationId,
					teamId: user.teamId,
				}}
			/>
		</main>
	);
}
