import {
	NewsForm,
} from '@/components/features/admin/news-form';

export const metadata = {
	title: 'Neuigkeit erstellen | Admin',
};

export default function NewNewsPage() {
	return (
		<main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
			<NewsForm mode="create" />
		</main>
	);
}
