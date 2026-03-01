import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/app/providers";
import { AppShell } from "@/components/layout/app-shell";
import { GlobalNewsNotification } from "@/components/features/news/global-news-notification";

const teleNeo = localFont({
	src: [
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-Thin.woff2",
			weight: "100",
			style: "normal"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-ThinItalic.woff2",
			weight: "100",
			style: "italic"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-Regular.woff2",
			weight: "400",
			style: "normal"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-RegularItalic.woff2",
			weight: "400",
			style: "italic"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-Medium.woff2",
			weight: "500",
			style: "normal"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-MediumItalic.woff2",
			weight: "500",
			style: "italic"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-Bold.woff2",
			weight: "700",
			style: "normal"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-BoldItalic.woff2",
			weight: "700",
			style: "italic"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-ExtraBold.woff2",
			weight: "800",
			style: "normal"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-ExtraBoldItalic.woff2",
			weight: "800",
			style: "italic"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-Ultra.woff2",
			weight: "900",
			style: "normal"
		},
		{
			path: "../../public/fonts/TeleNeo/TeleNeoWeb-UltraItalic.woff2",
			weight: "900",
			style: "italic"
		}
	],
	variable: "--font-teleneo"
});

export const metadata: Metadata = {
	title: {
		default: "Sales Experience @ Chemnitz",
		template: "%s | Sales Experience"
	},
	description: "Die Sales Experience für Chemnitz.",
	icons: {
		icon: "/favicon.ico"
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de" className={teleNeo.variable} suppressHydrationWarning>
			<body className="antialiased text-[#262626] bg-transparent overflow-hidden h-screen">
				<Providers>
					<AppShell>{children}</AppShell>
					<GlobalNewsNotification />
				</Providers>
			</body>
		</html>
	);
}
