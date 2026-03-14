import type {
	Metadata,
} from 'next';
import TeamsClient from './teams-client';

export const metadata: Metadata = {
	title: 'Teams verwalten',
};

export default function Page() {
	return <TeamsClient />;
}
