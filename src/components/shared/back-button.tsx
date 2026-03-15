'use client';

import {
	ArrowLeft,
} from 'lucide-react';

export function BackButton() {
	return (
		<button
			onClick={() => window.history.back()}
			className="inline-flex items-center justify-center px-6 py-3 bg-[#f7f8fa] hover:bg-[#eaedf0] text-[#1a1a2e] font-bold rounded-xl transition-colors cursor-pointer border-none"
		>
			<ArrowLeft className="w-4 h-4 mr-2" />
			Zurück
		</button>
	);
}
