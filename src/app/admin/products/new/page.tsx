'use client';

import {
	ProductForm,
} from '@/components/features/admin/product-form';

export default function NewProductPage() {
	return (
		<div>
			<h1 className="text-2xl font-bold text-zinc-900 mb-8">
				Neues Produkt anlegen
			</h1>
			<ProductForm mode="create" />
		</div>
	);
}
