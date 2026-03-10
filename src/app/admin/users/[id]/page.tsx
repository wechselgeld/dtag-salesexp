import { UserForm } from "@/components/features/admin/user-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
	title: "Admin bearbeiten | Admin"
};

export default async function EditUserPage({
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const user = await prisma.user.findUnique({
		where: { id: resolvedParams.id }
	});

	if (!user) {
		notFound();
	}

	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<UserForm
				mode="edit"
				userId={user.id}
				initialData={{
					email: user.email,
					role: user.role as
						| "ADMIN"
						| "OD_MANAGER"
						| "LOCATION_MANAGER"
						| "TEAM_LEADER",
					isEditor: user.isEditor,
					odRegionId: user.odRegionId,
					locationId: user.locationId,
					teamId: user.teamId
				}}
			/>
		</main>
	);
}
