'use client';

import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	X,
	Calculator,
} from 'lucide-react';
import {
	useState, useEffect,
} from 'react';
import {
	createPortal,
} from 'react-dom';

import {
	StreamingComparison,
} from './streaming-comparison';

interface SavingsCalculatorModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function StreamingCalculatorModal({
	isOpen,
	onClose,
}: SavingsCalculatorModalProps) {
	const [
		mounted,
		setMounted,
	] = useState(false);

	useEffect(() => setMounted(true), [
]);

	if (!mounted) { return null; }

	const content = (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-8">
					<motion.div
						initial={{
 opacity: 0,
}}
						animate={{
 opacity: 1,
}}
						exit={{
 opacity: 0,
}}
						onClick={onClose}
						className="absolute inset-0 bg-white/60 backdrop-blur-md"
					/>

					<motion.div
						layout
						initial={{
 opacity: 0,
scale: 0.95,
y: 20,
}}
						animate={{
 opacity: 1,
scale: 1,
y: 0,
}}
						exit={{
 opacity: 0,
scale: 0.95,
y: 20,
}}
						transition={{
 type: 'spring',
damping: 25,
stiffness: 300,
}}
						className="relative w-full max-w-7xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#eaedf0] overflow-hidden flex flex-col max-h-[92vh] min-h-[50vh]"
					>
						{/* Header with Tabs */}
						<div className="flex flex-col md:flex-row md:items-center justify-between px-8 md:px-10 py-5 border-b border-[#f0f0f0] gap-4 md:gap-0">
							<div className="flex items-center gap-5">
								<div className="w-11 h-11 rounded-2xl bg-[#e20074]/10 text-[#e20074] flex items-center justify-center shadow-sm shrink-0">
									<Calculator className="w-5.5 h-5.5" />
								</div>
								<div>
									<h2 className="text-[1.25rem] font-extrabold text-[#1a1a2e] mb-0 tracking-tight leading-none">
										Sparvorteil-Rechner
									</h2>
									<p className="text-[0.8rem] text-[#888] font-medium leading-none mt-2">
										Kundenpotenziale erkennen & aufzeigen
									</p>
								</div>
							</div>

							<div className="flex items-center gap-6">
								{/* Tab Switcher - Removed Tarif-Check */}
								<div className="flex bg-telekom-gray-50 p-1 rounded-xl">
									<div className="px-6 py-2 rounded-lg text-sm font-bold bg-white text-[#e20074] shadow-sm">
										Streaming-Check
									</div>
								</div>

								<button
									onClick={onClose}
									className="w-10 h-10 rounded-full bg-telekom-gray-50 border border-[#eaedf0] flex items-center justify-center text-[#888] hover:text-[#e20074] hover:bg-white hover:border-[#e20074]/20 transition-all cursor-pointer shadow-sm active:scale-95 group shrink-0"
								>
									<X className="w-5 h-5 group-hover:scale-110 transition-transform" />
								</button>
							</div>
						</div>

						{/* Content Area */}
						<div className="flex-1 flex flex-col min-h-0 relative">
							<div className="w-full h-full flex flex-col">
								<StreamingComparison isVisible={true} />
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);

	return createPortal(content, document.body);
}
