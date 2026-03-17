'use client';

import {
	useState, useCallback, useRef,
} from 'react';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	X, MessageSquare, Send, Upload, File as FileIcon, Trash2, CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import {
	trpc,
} from '@/lib/trpc';

interface FeedbackModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface FileData {
	name: string;
	content: string;
}

export function FeedbackModal({
	isOpen, onClose,
}: FeedbackModalProps) {
	const [
		text,
		setText,
	] = useState('');
	const [
		files,
		setFiles,
	] = useState<FileData[]>([
	]);
	const [
		isDragging,
		setIsDragging,
	] = useState(false);
	const [
		isSuccess,
		setIsSuccess,
	] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const submitFeedback = trpc.feedback.submit.useMutation({
		onSuccess: () => {
			setIsSuccess(true);
			setTimeout(() => {
				onClose();
				// Reset after closing animation
				setTimeout(() => {
					setIsSuccess(false);
					setText('');
					setFiles([
]);
				}, 500);
			}, 2000);
		},
	});

	const processFiles = (fileList: File[]) => {
		fileList.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				setFiles((prev) => [
					...prev,
					{
						name: file.name,
						content,
					},
				]);
			};
			reader.readAsDataURL(file);
		});
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;
		if (selectedFiles) {
			processFiles(Array.from(selectedFiles));
		}
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, [
	]);

	const onDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, [
	]);

	const onDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const droppedFiles = e.dataTransfer.files;
		if (droppedFiles) {
			processFiles(Array.from(droppedFiles));
		}
	}, [
	]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim() || submitFeedback.isPending) { return; }

		submitFeedback.mutate({
			text,
			files: files.length > 0 ? files : undefined,
		});
	};

	return (
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
						className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-[#eaedf0] overflow-hidden flex flex-col"
					>
						{/* Header */}
						<div className="flex items-center justify-between px-8 py-5 border-b border-[#f0f0f0]">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-xl bg-[#e20074]/10 text-[#e20074] flex items-center justify-center">
									<MessageSquare className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-[1.15rem] font-extrabold text-[#1a1a2e] tracking-tight leading-none">
										Feedback geben
									</h2>
									<p className="text-[0.75rem] text-[#888] font-medium mt-1.5">
										Hilf uns, die Sales Experience zu verbessern.
									</p>
								</div>
							</div>
							<button
								onClick={onClose}
								className="w-9 h-9 rounded-full bg-telekom-gray-50 border border-[#eaedf0] flex items-center justify-center text-[#888] hover:text-[#e20074] transition-all"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Content */}
						<div className="p-8">
							{isSuccess ? (
								<motion.div
									initial={{
										opacity: 0,
										scale: 0.9,
									}}
									animate={{
										opacity: 1,
										scale: 1,
									}}
									className="flex flex-col items-center justify-center py-12 text-center"
								>
									<div className="w-20 h-20 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-6">
										<CheckCircle2 className="w-10 h-10" />
									</div>
									<h3 className="text-[1.5rem] font-extrabold text-[#1a1a2e] mb-2">
										Vielen Dank!
									</h3>
									<p className="text-[#888] font-medium max-w-xs">
										Dein Feedback wurde erfolgreich übermittelt.
									</p>
								</motion.div>
							) : (
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<label className="text-[0.85rem] font-bold text-[#1a1a2e] ml-1">
											Deine Nachricht
										</label>
										<textarea
											value={text}
											onChange={(e) => setText(e.target.value)}
											placeholder="Wie möchtest Du die Welt heute verbessern? Oder das Tool... Das reicht für's Erste."
											className="w-full min-h-[160px] p-5 rounded-2xl border border-[#eaedf0] bg-[#fbfcff] text-[#1a1a2e] text-[0.95rem] font-medium outline-none focus:border-[#e20074] focus:ring-4 focus:ring-[#e20074]/5 transition-all resize-none"
											required
										/>
									</div>

									<div className="space-y-2">
										<label className="text-[0.85rem] font-bold text-[#1a1a2e] ml-1">
											Dateien (optional)
										</label>
										<div
											onDragOver={onDragOver}
											onDragLeave={onDragLeave}
											onDrop={onDrop}
											onClick={() => fileInputRef.current?.click()}
											className={clsx(
												'relative group cursor-pointer border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center',
												isDragging
													? 'border-[#e20074] bg-[#e20074]/5'
													: 'border-[#eaedf0] hover:border-[#e20074]/30 hover:bg-[#fbfcff]',
											)}
										>
											<input
												type="file"
												ref={fileInputRef}
												onChange={handleFileChange}
												className="hidden"
												multiple
											/>
											<div className="w-12 h-12 rounded-full bg-telekom-gray-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
												<Upload className="w-5.5 h-5.5 text-[#888] group-hover:text-[#e20074]" />
											</div>
											<p className="text-[0.9rem] font-bold text-[#1a1a2e]">
												Datei hierher ziehen oder klicken
											</p>
											<p className="text-[0.75rem] text-[#888] font-medium mt-1">
												Dateigröße max. 10MB
											</p>
										</div>

										{files.length > 0 && (
											<div className="grid grid-cols-2 gap-3 mt-4">
												{files.map((file, idx) => (
													<div
														key={idx}
														className="flex items-center justify-between p-3 rounded-xl bg-telekom-gray-50 border border-[#eaedf0]"
													>
														<div className="flex items-center gap-2 overflow-hidden">
															<FileIcon className="w-4 h-4 text-[#e20074] shrink-0" />
															<span className="text-[0.8rem] font-semibold text-[#1a1a2e] truncate">
																{file.name}
															</span>
														</div>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																removeFile(idx);
															}}
															className="p-1.5 rounded-lg hover:bg-white text-[#888] hover:text-red-500 transition-all"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												))}
											</div>
										)}
									</div>

									<div className="pt-2">
										<button
											type="submit"
											disabled={!text.trim() || submitFeedback.isPending}
											className={clsx(
												'w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-white font-extrabold text-[1rem] shadow-lg shadow-[#e20074]/20 active:scale-[0.98] transition-all',
												!text.trim() || submitFeedback.isPending
													? 'bg-[#ccc] cursor-not-allowed shadow-none'
													: 'bg-[#e20074] hover:bg-[#c10063]',
											)}
										>
											{submitFeedback.isPending ? (
												<div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
											) : (
												<>
													<Send className="w-4.5 h-4.5" />
													<span>Feedback senden</span>
												</>
											)}
										</button>
									</div>
								</form>
							)}
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
