import { Skeleton } from "@/components/shared/skeleton";

export default function Loading() {
	return (
		<div className="flex flex-col h-full w-full p-4 gap-6 animate-fade-slide-up">
			{/* Top bar skeleton */}
			<div className="flex justify-between items-center">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-10 w-48 rounded-xl" />
			</div>

			<div className="pt-4 mb-2">
				<Skeleton className="h-12 w-2/3 max-w-xl mb-3" />
				<Skeleton className="h-5 w-1/3" />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Skeleton key={i} className="h-64 w-full rounded-2xl" />
				))}
			</div>
		</div>
	);
}
