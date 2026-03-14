import type {
	Metadata,
} from 'next';
import NewsClient from './news-client';

export const metadata: Metadata = {
	title: 'Neuigkeiten',
};

export default function Page() {
	return <NewsClient />;
}
