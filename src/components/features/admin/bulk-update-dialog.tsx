'use client';

import {
	useState,
} from 'react';
import {
	trpc,
} from '@/lib/trpc';
import {
	X, TrendingUp, TrendingDown, Loader2, Calculator,
} from 'lucide-react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import clsx from 'clsx';

const CATEGORY_LABELS: Record<string, string> = {
	MOBILE: 'Mobilfunk',
	FIBER: 'Glasfaser',
	DSL: 'Festnetz',
	MAGENTA_TV_OTT: 'MagentaTV — OTT',
	DEVICE: 'Endgeräte',
};

const CATEGORY_COLORS: Record<string, string> = {
	MOBILE: '#e20074',
	FIBER: '#0090d0',
	DSL: '#7b61ff',
	MAGENTA_TV_OTT: '#ff6b00',
	DEVICE: '#00a878',
	ADDON: '#e67e22',
};

interface BulkUpdateDialogProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function BulkUpdateDialog({
	open,
	onClose,
	onSuccess,
}: BulkUpdateDialogProps) {
	const [
		category,
		setCategory,
	] = useState('MOBILE');
	const [
		mode,
		setMode,
	] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
	const [
		value,
		setValue,
	] = useState('');
	const [
		error,
		setError,
	] = useState('');

	const mutation = trpc.admin.bulkUpdatePrices.useMutation({
		onSuccess: () => {
			onSuccess();
			onClose();
			setValue('');
			setError('');
		},
		onError: (err) => {
			setError(err.message);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const numValue = parseFloat(value);
		if (isNaN(numValue) || numValue === 0) {
			setError('Bitte gib einen gültigen Wert ein (nicht 0).');
			return;
		}
		setError('');
		mutation.mutate({
			category,
			mode,
			value: numValue,
		});
	};

	const numValue = parseFloat(value) || 0;
	const isIncrease = numValue > 0;
	const catColor = CATEGORY_COLORS[category] || '#e20074';

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
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
						className="fixed inset-0 bg-black/30 z-50"
						onClick={onClose}
					/>

					{/* Dialog */}
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
							duration: 0.2,
							ease: [
								0.23,
								1,
								0.32,
								1,
							],
						}}
						className="fixed inset-0 z-50 flex items-center justify-center p-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#eaedf0]">
							{/* Header */}
							<div className="flex items-center justify-between px-7 py-5 border-b border-[#f0f0f0]">
								<div className="flex items-center gap-3">
									<div
										className="w-10 h-10 rounded-xl flex items-center justify-center"
										style={{
											backgroundColor: `${catColor}10`,
										}}
									>
										<Calculator
											className="w-5 h-5"
											style={{
												color: catColor,
											}}
										/>
									</div>
									<div>
										<h2 className="text-[1.1rem] font-bold text-[#1a1a2e] m-0">
											Massenpreisänderung
										</h2>
										<p className="text-[0.75rem] text-[#999] m-0 mt-0.5">
											Alle Produkte einer Kategorie anpassen
										</p>
									</div>
								</div>
								<button
									onClick={onClose}
									className="p-2 rounded-xl hover:bg-[#f7f8fa] text-[#ccc] hover:text-[#999] transition-colors cursor-pointer border-none bg-transparent"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Form */}
							<form onSubmit={handleSubmit} className="p-7 space-y-5">
								{/* Category Picker */}
								<div>
									<label className="text-[0.72rem] uppercase tracking-wider text-[#aaa] font-bold mb-2 block">
										Kategorie
									</label>
									<div className="flex flex-wrap gap-2">
										{Object.entries(CATEGORY_LABELS).map(
											([
												key,
												label,
											]) => {
												const isSelected =
													category === key;
												const color =
													CATEGORY_COLORS[key] ||
													'#e20074';
												return (
													<button
														key={key}
														type="button"
														onClick={() =>
															setCategory(key)
														}
														className={clsx(
															'px-4 py-2 rounded-xl text-[0.78rem] font-semibold transition-all cursor-pointer border',
															isSelected
																? 'text-white border-transparent'
																: 'bg-white border-[#eaedf0] text-[#666] hover:bg-[#f7f8fa]',
														)}
														style={
															isSelected
																? {
																	backgroundColor: color,
																}
																: {
																}
														}
													>
														{label}
													</button>
												);
											},
										)}
									</div>
								</div>

								{/* Mode Toggle */}
								<div>
									<label className="text-[0.72rem] uppercase tracking-wider text-[#aaa] font-bold mb-2 block">
										Änderungsart
									</label>
									<div className="grid grid-cols-2 gap-2">
										<button
											type="button"
											onClick={() => setMode('FIXED')}
											className={clsx(
												'px-4 py-3 rounded-xl text-[0.82rem] font-semibold transition-all cursor-pointer border',
												mode === 'FIXED'
													? 'bg-[#1a1a2e] text-white border-transparent'
													: 'bg-white text-[#666] border-[#eaedf0] hover:bg-[#f7f8fa]',
											)}
										>
											Fester Betrag (€)
										</button>
										<button
											type="button"
											onClick={() =>
												setMode('PERCENTAGE')
											}
											className={clsx(
												'px-4 py-3 rounded-xl text-[0.82rem] font-semibold transition-all cursor-pointer border',
												mode === 'PERCENTAGE'
													? 'bg-[#1a1a2e] text-white border-transparent'
													: 'bg-white text-[#666] border-[#eaedf0] hover:bg-[#f7f8fa]',
											)}
										>
											Prozentual (%)
										</button>
									</div>
								</div>

								{/* Value Input */}
								<div>
									<label className="text-[0.72rem] uppercase tracking-wider text-[#aaa] font-bold mb-2 block">
										Wert{' '}
										<span className="normal-case tracking-normal text-[#ccc] font-medium">
											(positiv = Erhöhung, negativ =
											Senkung)
										</span>
									</label>
									<div className="relative">
										<input
											type="number"
											step="0.01"
											value={value}
											onChange={(e) =>
												setValue(e.target.value)
											}
											placeholder={
												mode === 'FIXED'
													? 'z.B. 5.00 oder -2.50'
													: 'z.B. 10 oder -5'
											}
											className="w-full px-4 py-3 rounded-xl border border-[#eaedf0] focus:outline-none focus:border-[#e20074]/30 focus:shadow-[0_0_0_3px_rgba(226,0,116,0.06)] transition-all text-[0.9rem] pr-12"
										/>
										<span className="absolute right-4 top-1/2 -translate-y-1/2 text-[0.85rem] font-bold text-[#ccc]">
											{mode === 'FIXED' ? '€' : '%'}
										</span>
									</div>
								</div>

								{/* Preview */}
								{numValue !== 0 && (
									<div
										className={clsx(
											'flex items-center gap-2 px-4 py-3 rounded-xl text-[0.82rem] font-medium',
											isIncrease
												? 'bg-[#dcfce7] text-[#15803d]'
												: 'bg-[#fee2e2] text-[#dc2626]',
										)}
									>
										{isIncrease ? (
											<TrendingUp className="w-4 h-4" />
										) : (
											<TrendingDown className="w-4 h-4" />
										)}
										Alle{' '}
										<strong>
											{CATEGORY_LABELS[category]}
										</strong>
										-Produkte werden um{' '}
										<strong>
											{mode === 'FIXED'
												? `${Math.abs(numValue).toFixed(2)} €`
												: `${Math.abs(numValue)}%`}
										</strong>{' '}
										{isIncrease ? 'erhöht' : 'gesenkt'}.
									</div>
								)}

								{/* Error */}
								{error && (
									<div className="text-[0.82rem] text-[#dc2626] bg-[#fee2e2] px-4 py-3 rounded-xl font-medium">
										{error}
									</div>
								)}

								{/* Submit */}
								<div className="flex justify-end gap-3 pt-2">
									<button
										type="button"
										onClick={onClose}
										className="px-5 py-2.5 rounded-xl text-[0.82rem] font-semibold text-[#666] bg-[#f7f8fa] border border-[#eaedf0] hover:bg-[#eee] transition-all cursor-pointer"
									>
										Abbrechen
									</button>
									<button
										type="submit"
										disabled={
											mutation.isPending || !value
										}
										className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.82rem] font-semibold text-white bg-[#e20074] hover:bg-[#c70066] transition-all shadow-[0_4px_14px_rgba(226,0,116,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
									>
										{mutation.isPending && (
											<Loader2 className="w-4 h-4 animate-spin" />
										)}
										Preise anpassen
									</button>
								</div>
							</form>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
