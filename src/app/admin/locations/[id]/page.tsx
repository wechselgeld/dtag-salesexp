import { LocationForm } from "@/components/features/admin/location-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
	title: "Standort bearbeiten | Admin"
};

export default async function EditLocationPage({
	params
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const location = await prisma.location.findUnique({
		where: { id: resolvedParams.id }
	});

	if (!location) {
		notFound();
	}

	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<h1 className="text-[1.8rem] font-extrabold text-[#1a1a2e] tracking-tight mb-8">
				Standort <span className="text-[#e20074]">bearbeiten</span>
			</h1>
			<LocationForm
				mode="edit"
				id={location.id}
				initialData={{
					name: location.name,
					isActive: location.isActive,
					odRegionId: location.odRegionId
				}}
			/>
		</main>
	);
}
