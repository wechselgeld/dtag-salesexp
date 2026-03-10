"use client";

import { ProductForm } from "@/components/features/admin/product-form";
import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
	const params = useParams();
	const id = params.id as string;
	const {
		data: product,
		isLoading,
		error
	} = trpc.admin.getProductById.useQuery({ id });

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<Loader2 className="w-8 h-8 animate-spin text-magenta-600" />
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="text-center py-12 text-red-500">
				Produkt konnte nicht geladen werden.
			</div>
		);
	}

	return <ProductForm mode="edit" initialData={product} />;
}
