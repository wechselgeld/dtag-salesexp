import type { Metadata } from 'next';
import ShutdownClient from './shutdown-client';

export const metadata: Metadata = {
	title: 'System vorübergehend deaktiviert',
};

export default function Page() {
	return <ShutdownClient />;
}
