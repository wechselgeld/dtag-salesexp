import { TeamForm } from "@/components/features/admin/team-form";

export const metadata = {
	title: "Team erstellen | Admin"
};

export default function NewTeamPage() {
	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<TeamForm mode="create" />
		</main>
	);
}
