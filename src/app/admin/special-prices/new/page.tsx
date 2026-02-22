"use client";

import { SpecialPriceForm } from "@/components/admin/special-price-form";

export default function NewSpecialPricePage() {
	return (
		<div>
			<h1 className="text-2xl font-bold text-zinc-900 mb-8">
				Neue Aktion anlegen
			</h1>
			<SpecialPriceForm mode="create" />
		</div>
	);
}
