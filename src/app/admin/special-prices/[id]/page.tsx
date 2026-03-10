"use client";

import { SpecialPriceForm } from "@/components/features/admin/special-price-form";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditSpecialPricePage() {
	const params = useParams();
	const id = params.id as string;
	const {
		data: sp,
		isLoading,
		error
	} = trpc.admin.getSpecialPriceById.useQuery({ id });

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<Loader2 className="w-8 h-8 animate-spin text-magenta-600" />
			</div>
		);
	}

	if (error || !sp) {
		return (
			<div className="text-center py-12 text-red-500">
				Aktion konnte nicht geladen werden.
			</div>
		);
	}

	return <SpecialPriceForm mode="edit" initialData={sp} />;
}
