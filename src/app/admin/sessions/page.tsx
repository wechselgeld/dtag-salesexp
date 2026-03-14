import SessionsClient from './sessions-client';

export const metadata = {
	title: 'Sessions | Admin Dashboard',
	description: 'Verwalte die aktiven Sales-Sessions.',
};

export default function SessionsPage() {
	return <SessionsClient />;
}
