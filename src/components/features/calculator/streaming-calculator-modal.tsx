'use client';

import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	X,
	Calculator,
} from 'lucide-react';
import {
	useState, useEffect, useRef,
} from 'react';
import {
	createPortal,
} from 'react-dom';
import {
	useOpenPanel,
} from '@openpanel/nextjs';

import {
	StreamingComparison,
} from './streaming-comparison';
import {
	ScreenHeader,
} from '@/components/shared/form/form-suite';

interface SavingsCalculatorModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function StreamingCalculatorModal({
	isOpen,
	onClose,
}: SavingsCalculatorModalProps) {
	const op = useOpenPanel();
	const [
		mounted,
		setMounted,
	] = useState(false);
	const hasTrackedOpenRef = useRef(false);

	useEffect(() => {
		if (isOpen && !hasTrackedOpenRef.current) {
			op.track('streaming_calculator_opened');
			hasTrackedOpenRef.current = true;
		}
		else if (!isOpen) {
			hasTrackedOpenRef.current = false;
		}
	}, [
		isOpen,
		op,
	]);

	useEffect(() => setMounted(true), [
	]);

	if (!mounted) { return null; }

	const content = (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
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
						className="absolute inset-0 cursor-pointer"
					/>

					<motion.div
						initial={{
							opacity: 0,
							scale: 0.95,
							y: 10,
						}}
						animate={{
							opacity: 1,
							scale: 1,
							y: 0,
						}}
						exit={{
							opacity: 0,
							scale: 0.95,
							y: 10,
						}}
						transition={{
							duration: 0.25,
							ease: 'easeOut',
						}}
						className="relative w-full max-w-7xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#eaedf0] overflow-hidden flex flex-col max-h-[92vh] min-h-[50vh]"
					>
						{/* Header with Tabs */}
						<div className="flex flex-col md:flex-row md:items-center justify-between px-8 md:px-10 py-5 border-b border-[#eaedf0] gap-4 md:gap-0">
							<ScreenHeader
								icon={<Calculator className="w-5.5 h-5.5 text-[#e20074]" />}
								title="Sparvorteil-Rechner"
								subtitle="Kundenpotenziale erkennen & aufzeigen"
							/>

							<div className="flex items-center gap-6">
								{/* Tab Switcher - Removed Tarif-Check */}
								<div className="flex bg-[#f7f8fa] p-1 rounded-xl border border-[#eaedf0]">
									<div className="px-6 py-2 rounded-lg text-sm font-bold bg-white text-[#e20074] shadow-sm">
										Streaming-Check
									</div>
								</div>

								<button
									onClick={onClose}
									className="w-10 h-10 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e] transition-colors cursor-pointer outline-none shrink-0"
								>
									<X className="w-5 h-5" />
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
