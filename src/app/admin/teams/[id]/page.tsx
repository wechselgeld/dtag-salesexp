import { TeamForm } from "@/components/features/admin/team-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
	title: "Team bearbeiten | Admin"
};

export default async function EditTeamPage({
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const team = await prisma.team.findUnique({
		where: { id: resolvedParams.id }
	});

	if (!team) {
		notFound();
	}

	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<TeamForm
				mode="edit"
				teamId={team.id}
				initialData={{ name: team.name, email: team.email }}
			/>
		</main>
	);
}
