export default function Loading() {
	return (
		<div className="flex h-[50vh] w-full items-center justify-center">
			<div className="flex flex-col items-center space-y-4">
				<div className="h-12 w-12 animate-spin rounded-full border-4 border-magenta-200 border-t-magenta-600" />
				<p className="text-sm font-medium text-zinc-500 animate-pulse">
					Lade Inhalte...
				</p>
			</div>
		</div>
	);
}
