import { OdRegionForm } from "@/components/features/admin/od-region-form";

export const metadata = {
	title: "OD-Bereich erstellen | Admin"
};

export default function NewOdRegionPage() {
	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<h1 className="text-[1.8rem] font-extrabold text-[#1a1a2e] tracking-tight mb-8">
				OD-Bereich <span className="text-[#e20074]">erstellen</span>
			</h1>
			<OdRegionForm mode="create" />
		</main>
	);
}
