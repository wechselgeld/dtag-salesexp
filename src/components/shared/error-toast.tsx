'use client';

import {
	useState, useEffect, Suspense,
} from 'react';
import {
	AnimatePresence,
} from 'framer-motion';
import {
	AlertCircle, Copy, Check,
} from 'lucide-react';
import {
	useSearchParams, useRouter, usePathname,
} from 'next/navigation';
import {
	Toast,
} from './ui/toast';

interface ErrorToastState {
	title: string;
	message: string;
	traceId?: string;
}

let showErrorGlobal: ((state: ErrorToastState) => void) | null = null;

export function showErrorToast(title: string, message: string, traceId?: string) {
	showErrorGlobal?.({
		title,
		message,
		traceId,
	});
}

function SearchParamsErrorTracker() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const errorId = searchParams.get('error_id');
		if (errorId) {
			showErrorToast(
				'Sitzung abgelaufen',
				'Deine Sitzung ist ungültig oder abgelaufen. Bitte melde Dich erneut an.',
				errorId,
			);

			// Clean up parameter so a manual refresh doesn't re-trigger the toast
			const params = new URLSearchParams(searchParams.toString());
			params.delete('error_id');
			const query = params.toString() ? `?${params.toString()}` : '';
			router.replace(`${pathname}${query}`);
		}
	}, [
		searchParams,
		pathname,
		router,
	]);

	return null;
}

export function GlobalErrorToast() {
	const [
		error,
		setError,
	] = useState<ErrorToastState | null>(null);
	const [
		copied,
		setCopied,
	] = useState(false);

	useEffect(() => {
		setCopied(false);
	}, [
		error,
	]);

	useEffect(() => {
		showErrorGlobal = (state) => {
			setError(state);
		};
		return () => {
			showErrorGlobal = null;
		};
	}, [
	]);

	const handleCopy = async (e: React.MouseEvent, text: string) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
		catch (err) {
			console.error('Failed to copy Trace ID:', err);
		}
	};

	return (
		<>
			<Suspense fallback={null}>
				<SearchParamsErrorTracker />
			</Suspense>
			<div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-4 w-[400px] pointer-events-none">
				<AnimatePresence>
					{error && (
						<Toast
							duration={8000}
							color="#ef4444"
							onDismiss={() => setError(null)}
							className="border-[2px] bg-white text-[#1a1a2e]"
							style={{
								borderColor: '#ef4444',
							}}
						>
							<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-red-500/10 to-transparent blur-xl pointer-events-none rounded-full" />
							<div className="flex gap-3 align-start">
								<div className="shrink-0 flex items-center justify-center text-[#ef4444] mt-0.5 p-2 rounded-xl bg-red-500/10">
									<AlertCircle className="w-5 h-5" />
								</div>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-1">
										<h4 className="font-bold text-[0.95rem] m-0 text-[#1a1a2e]">
											{error.title}
										</h4>
									</div>
									<p className="text-[0.8rem] text-[#1a1a2e]/70 m-0 leading-relaxed">
										{error.message}
									</p>

									{error.traceId && (
										<button
											onClick={(e) => handleCopy(e, error.traceId!)}
											className="mt-3 px-3 py-1.5 rounded-xl border border-red-500/10 bg-red-500/5 text-[#ef4444] hover:bg-red-500/10 hover:border-red-500/20 active:scale-95 text-[0.7rem] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer pointer-events-auto"
											title="Trace ID kopieren"
										>
											{copied ? (
												<>
													<Check className="w-3.5 h-3.5" />
													<span>Kopiert!</span>
												</>
											) : (
												<>
													<Copy className="w-3.5 h-3.5" />
													<span className="mt-0.5">Trace-ID: {error.traceId}</span>
												</>
											)}
										</button>
									)}
								</div>
							</div>
						</Toast>
					)}
				</AnimatePresence>
			</div>
		</>
	);
}

