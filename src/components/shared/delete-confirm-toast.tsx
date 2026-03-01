"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import clsx from "clsx";

interface DeleteConfirmState {
	id: string;
	name: string;
	onConfirm: () => void;
}

let showDeleteConfirmGlobal: ((state: DeleteConfirmState) => void) | null =
	null;

/**
 * Call this anywhere to trigger the delete confirm toast.
 * Example: confirmDelete({ id: "123", name: "MagentaZuhause M", onConfirm: () => mutation.mutate({ id }) })
 */
export function confirmDelete(state: DeleteConfirmState) {
	showDeleteConfirmGlobal?.(state);
}

/**
 * Render this once in your admin layout.
 */
export function DeleteConfirmToast() {
	const [pending, setPending] = useState<DeleteConfirmState | null>(null);

	useEffect(() => {
		showDeleteConfirmGlobal = (state) => {
			setPending(state);
		};
		return () => {
			showDeleteConfirmGlobal = null;
		};
	}, []);

	return (
		<div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-overlay flex flex-col gap-4 w-[500px] pointer-events-none">
			<AnimatePresence>
				{pending && (
					<DeleteConfirmToastItem
						pending={pending}
						onDismiss={() => setPending(null)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}

function DeleteConfirmToastItem({
	pending,
	onDismiss
}: {
	pending: DeleteConfirmState;
	onDismiss: () => void;
}) {
	const [progress, setProgress] = useState(0);
	const accumulatedTimeRef = useRef(0);
	const [isPaused, setIsPaused] = useState(false);
	const isPausedRef = useRef(isPaused);

	useEffect(() => {
		isPausedRef.current = isPaused;
	}, [isPaused]);

	useEffect(() => {
		let animationFrame: number;
		let lastTime = performance.now();
		const DURATION = 5000;

		const tick = (currentTime: number) => {
			const delta = currentTime - lastTime;
			lastTime = currentTime;

			if (!isPausedRef.current) {
				accumulatedTimeRef.current += delta;
				const p = Math.min((accumulatedTimeRef.current / DURATION) * 100, 100);
				setProgress(p);

				if (accumulatedTimeRef.current >= DURATION) {
					onDismiss(); // Cancel
					return;
				}
			}
			animationFrame = requestAnimationFrame(tick);
		};

		animationFrame = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(animationFrame);
	}, [onDismiss]);

	const handleConfirm = () => {
		pending.onConfirm();
		onDismiss();
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 50, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.95 }}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			className={clsx(
				"relative pointer-events-auto rounded-2xl p-4 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/95",
				"border-[3px]"
			)}
			style={{
				borderColor: "#dc2626"
			}}
		>
			<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-red-500/10 to-transparent blur-xl pointer-events-none rounded-full" />

			<div className="absolute top-3 right-3 flex items-center gap-2 z-10">
				<div
					className="relative w-5 h-5 flex items-center justify-center transition-opacity duration-300"
					title={isPaused ? "Pausiert" : "Schließt in kürze..."}
				>
					<svg
						className="w-full h-full -rotate-90"
						style={{ color: "#dc2626" }}
					>
						<circle
							cx="10"
							cy="10"
							r="8"
							stroke="currentColor"
							strokeWidth="2.5"
							fill="none"
							className="opacity-20"
						/>
						<circle
							cx="10"
							cy="10"
							r="8"
							stroke="currentColor"
							strokeWidth="2.5"
							fill="none"
							strokeDasharray={2 * Math.PI * 8}
							strokeDashoffset={
								2 * Math.PI * 8 - (2 * Math.PI * 8 * progress) / 100
							}
							className="transition-none"
						/>
					</svg>
				</div>
				<button
					onClick={onDismiss}
					className="p-1 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-[#1a1a2e]/60 hover:text-[#1a1a2e] cursor-pointer border-none"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			<div className="flex gap-3 align-start relative z-10 pr-14 flex-col">
				<div className="flex gap-3 align-start">
					<div
						className="shrink-0 flex items-center justify-center text-white mt-0.5 p-2 rounded-xl"
						style={{ backgroundColor: "#dc2626" }}
					>
						<Trash2 className="w-5 h-5" />
					</div>

					<div>
						<div className="flex items-center gap-2 mb-1">
							<h4
								className="font-bold text-[0.95rem] m-0"
								style={{
									color: "#1a1a2e"
								}}
							>
								Löschen bestätigen
							</h4>
						</div>
						<p className="text-[0.8rem] text-[#1a1a2e]/70 m-0 leading-relaxed">
							<span className="font-semibold text-[#1a1a2e]">
								{pending.name}
							</span>{" "}
							wirklich löschen?
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 mt-2 ml-11">
					<button
						onClick={handleConfirm}
						className="px-4 py-2 rounded-lg bg-[#dc2626] text-white text-[0.78rem] font-semibold hover:bg-[#b91c1c] transition-all duration-150 cursor-pointer border-none active:scale-95 flex items-center gap-1.5 shadow-sm"
					>
						<Trash2 className="w-4 h-4" />
						Ja, löschen
					</button>
					<button
						onClick={onDismiss}
						className="px-4 py-2 rounded-lg font-semibold text-[0.78rem] text-[#1a1a2e] hover:bg-black/5 transition-all duration-150 cursor-pointer border-none bg-transparent active:scale-95"
					>
						Abbrechen
					</button>
				</div>
			</div>
		</motion.div>
	);
}
