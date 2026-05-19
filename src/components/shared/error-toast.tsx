'use client';

import {
 useState, useEffect,
} from 'react';
import {
 AnimatePresence,
} from 'framer-motion';
import {
 AlertCircle,
} from 'lucide-react';
import {
 Toast,
} from './ui/toast';

interface ErrorToastState {
	title: string;
	message: string;
}

let showErrorGlobal: ((state: ErrorToastState) => void) | null = null;

export function showErrorToast(title: string, message: string) {
	showErrorGlobal?.({
 title,
message,
});
}

export function GlobalErrorToast() {
	const [
 error,
setError,
] = useState<ErrorToastState | null>(null);

	useEffect(() => {
		showErrorGlobal = (state) => {
			setError(state);
		};
		return () => {
			showErrorGlobal = null;
		};
	}, [
]);

	return (
		<div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-4 w-[400px] pointer-events-none">
			<AnimatePresence>
				{error && (
					<Toast
						duration={6000}
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
							<div>
								<div className="flex items-center gap-2 mb-1">
									<h4 className="font-bold text-[0.95rem] m-0 text-[#1a1a2e]">
										{error.title}
									</h4>
								</div>
								<p className="text-[0.8rem] text-[#1a1a2e]/70 m-0 leading-relaxed">
									{error.message}
								</p>
							</div>
						</div>
					</Toast>
				)}
			</AnimatePresence>
		</div>
	);
}
