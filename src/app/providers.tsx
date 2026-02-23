"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MotionConfig } from "framer-motion";
import { useSettingsStore } from "@/hooks/use-settings-store";

function SettingsWrapper({ children }: { children: React.ReactNode }) {
	const { reduceAnimations } = useSettingsStore();
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
		if (reduceAnimations) {
			document.body.classList.add("reduce-animations");
		} else {
			document.body.classList.remove("reduce-animations");
		}
	}, [reduceAnimations]);

	return (
		<MotionConfig
			reducedMotion={hydrated && reduceAnimations ? "always" : "user"}
		>
			{children}
		</MotionConfig>
	);
}

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: "/api/trpc"
				})
			]
		})
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				<SettingsWrapper>{children}</SettingsWrapper>
			</QueryClientProvider>
		</trpc.Provider>
	);
}
