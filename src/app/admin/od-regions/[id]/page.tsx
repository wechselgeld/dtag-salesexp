import {
	OdRegionForm,
} from '@/components/features/admin/od-region-form';
import {
	prisma,
} from '@/lib/prisma';
import {
	notFound,
} from 'next/navigation';

export const metadata = {
	title: 'OD-Bereich bearbeiten | Admin',
};

export default async function EditOdRegionPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	const region = await prisma.odRegion.findUnique({
		where: {
			id: resolvedParams.id,
		},
	});

	if (!region) {
		notFound();
	}

	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<h1 className="text-[1.8rem] font-extrabold text-[#1a1a2e] tracking-tight mb-8">
				OD-Bereich <span className="text-[#e20074]">bearbeiten</span>
			</h1>
			<OdRegionForm
				mode="edit"
				id={region.id}
				initialData={{
					name: region.name,
					isActive: region.isActive,
				}}
			/>
		</main>
	);
}
