'use client';

import {
	AddonForm,
} from '@/components/features/admin/addon-form';
import {
	trpc,
} from '@/lib/trpc';
import {
	useParams,
} from 'next/navigation';

export default function EditAddonPage() {
	const params = useParams();
	const id = params.id as string;
	const {
		data: addon, isLoading,
	} = trpc.addon.getById.useQuery({
		id,
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<div className="animate-spin h-6 w-6 border-2 border-[#e20074] border-t-transparent rounded-full" />
			</div>
		);
	}

	if (!addon) { return <div>Zubuchoption nicht gefunden</div>; }

	return <AddonForm initialData={addon} isEditMode />;
}
