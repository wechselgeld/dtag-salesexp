import { UserForm } from "@/components/features/admin/user-form";

export const metadata = {
	title: "Admin erstellen | Admin"
};

export default function NewUserPage() {
	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<UserForm mode="create" />
		</main>
	);
}
