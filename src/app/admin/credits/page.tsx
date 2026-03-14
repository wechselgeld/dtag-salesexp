import type {
	Metadata,
} from 'next';
import CreditsClient from './credits-client';

export const metadata: Metadata = {
	title: 'Gutschriften',
};

export default function Page() {
	return <CreditsClient />;
}
