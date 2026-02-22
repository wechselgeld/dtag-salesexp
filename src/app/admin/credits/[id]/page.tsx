"use client";

import { CreditForm } from "@/components/admin/credit-form";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";

export default function EditCreditPage() {
	const params = useParams();
	const id = params.id as string;
	const { data: credit, isLoading } = trpc.admin.oneTimeCredit.getById.useQuery(
		{ id }
	);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<div className="animate-spin h-8 w-8 border-4 border-magenta-600 border-t-transparent rounded-full" />
			</div>
		);
	}

	if (!credit) return <div>Gutschrift nicht gefunden</div>;

	return <CreditForm initialData={credit} isEditMode />;
}
