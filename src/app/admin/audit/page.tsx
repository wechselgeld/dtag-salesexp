import type {
	Metadata,
} from 'next';
import AuditClient from './audit-client';

export const metadata: Metadata = {
	title: 'Aktivitätslog',
};

export default function Page() {
	return <AuditClient />;
}
