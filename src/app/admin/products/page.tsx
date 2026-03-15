import type {
	Metadata,
} from 'next';
import ProductsClient from './products-client';

export const metadata: Metadata = {
	title: 'Produkte verwalten',
};

export default function Page() {
	return <ProductsClient />;
}
