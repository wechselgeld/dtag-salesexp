import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import { AppShell } from "@/components/app-shell";
import { GlobalNewsNotification } from "@/components/global-news-notification";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
	title: "Chemnitz Sales Experience",
	description:
		"Sales support tool for the Deutsche Telekom Service GmbH @ Chemnitz."
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="de" suppressHydrationWarning>
			<body className="antialiased text-[#262626] bg-transparent overflow-hidden h-screen">
				<Providers>
					<AppShell>{children}</AppShell>
					<GlobalNewsNotification />
				</Providers>
			</body>
		</html>
	);
}
