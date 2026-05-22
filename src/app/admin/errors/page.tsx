import type {
	Metadata,
} from 'next';
import ErrorsClient from './errors-client';

export const metadata: Metadata = {
	title: 'Fehlerprotokoll',
};

export default function Page() {
	return <ErrorsClient />;
}
