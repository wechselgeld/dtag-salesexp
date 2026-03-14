import type {
	Metadata,
} from 'next';
import LoginClient from './login-client';

export const metadata: Metadata = {
	title: 'Admin Login',
};

export default function Page() {
	return <LoginClient />;
}
