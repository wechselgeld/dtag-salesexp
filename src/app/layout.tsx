import type {
	Metadata,
} from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';
import Providers from '@/app/providers';
import {
	AppShell,
} from '@/components/layout/app-shell';
import {
	GlobalErrorToast,
} from '@/components/shared/error-toast';
import {
	AnalyticsProvider,
} from '@/components/shared/analytics-provider';

const teleNeo = localFont({
	src: [
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-Thin.woff2',
			weight: '100',
			style: 'normal',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-ThinItalic.woff2',
			weight: '100',
			style: 'italic',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-Regular.woff2',
			weight: '400',
			style: 'normal',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-RegularItalic.woff2',
			weight: '400',
			style: 'italic',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-Medium.woff2',
			weight: '500',
			style: 'normal',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-MediumItalic.woff2',
			weight: '500',
			style: 'italic',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-Bold.woff2',
			weight: '700',
			style: 'normal',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-BoldItalic.woff2',
			weight: '700',
			style: 'italic',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-ExtraBold.woff2',
			weight: '800',
			style: 'normal',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-ExtraBoldItalic.woff2',
			weight: '800',
			style: 'italic',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-Ultra.woff2',
			weight: '900',
			style: 'normal',
		},
		{
			path: '../../public/fonts/TeleNeo/TeleNeoWeb-UltraItalic.woff2',
			weight: '900',
			style: 'italic',
		},
	],
	variable: '--font-teleneo',
});

export const metadata: Metadata = {
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
	title: {
		default: 'Sales Experience',
		template: '%s | Sales Experience',
	},
	description: 'Die Sales Experience für die Deutsche Telekom Service GmbH.',
	icons: {
		icon: '/favicon.ico',
	},
	openGraph: {
		title: 'Sales Experience',
		description: 'Die Sales Experience für die Deutsche Telekom Service GmbH.',
		images: [
			{
				url: '/se-logo.svg',
				width: 1200,
				height: 630,
				alt: 'Sales Experience Logo',
			},
		],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Sales Experience',
		description: 'Die Sales Experience für die Deutsche Telekom Service GmbH.',
		images: ['/se-logo.svg'],
	},
};

import { Syne } from 'next/font/google';

const syne = Syne({
	subsets: ['latin'],
	weight: ['600', '700', '800'],
	variable: '--font-syne',
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de" className={`${teleNeo.variable} ${syne.variable}`} suppressHydrationWarning>
			<body className="antialiased text-[#262626] bg-transparent overflow-hidden h-screen">
				{process.env.NODE_ENV === 'development' && (
					<Script src="https://unpkg.com/react-scan/dist/auto.global.js" crossOrigin="anonymous" strategy="beforeInteractive" />
				)}
				{process.env.NODE_ENV === 'development' && (
					<Script
						src="//unpkg.com/react-grab/dist/index.global.js"
						crossOrigin="anonymous"
						strategy="beforeInteractive"
					/>
				)}
				<AnalyticsProvider />
				<Providers>
					<AppShell>{children}</AppShell>
					<GlobalErrorToast />
				</Providers>
			</body>
		</html>
	);
}
