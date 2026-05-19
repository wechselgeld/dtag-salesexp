import type {
	Metadata,
} from 'next';
import CategoryClient from './category-client';

interface Props {
	params: Promise<{ category: string }>;
}

const CATEGORY_NAMES: Record<string, string> = {
	MOBILE: 'Mobilfunk',
	FIBER: 'Glasfaser',
	DSL: 'DSL',
	MAGENTA_TV_OTT: 'MagentaTV',
	DEVICE: 'Geräte',
	ADDON: 'Datentarife',
};

export async function generateMetadata({
	params,
}: Props): Promise<Metadata> {
	const category = (await params).category;
	const name = CATEGORY_NAMES[category] || category;
	return {
		title: `${name} Tarife`,
	};
}

export default async function Page({
	params,
}: Props) {
	await params;
	return <CategoryClient />;
}
