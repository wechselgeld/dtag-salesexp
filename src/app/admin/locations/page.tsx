import type {
	Metadata,
} from 'next';
import LocationsClient from './locations-client';

export const metadata: Metadata = {
	title: 'Standorte verwalten',
};

export default function Page() {
	return <LocationsClient />;
}
