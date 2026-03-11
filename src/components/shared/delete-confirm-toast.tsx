"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Toast } from "./ui/toast";
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
	const handleConfirm = () => {
		pending.onConfirm();
		onDismiss();
	};

	return (
		<Toast
			duration={5000}
			color="#dc2626"
			onDismiss={onDismiss}
			className="border-[3px] bg-white/95 text-[#1a1a2e]"
			style={{ borderColor: "#dc2626" }}
		>
			<div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-red-500/10 to-transparent blur-xl pointer-events-none rounded-full" />

			<div className="flex gap-3 align-start">
				<div
					className="shrink-0 flex items-center justify-center text-white mt-0.5 p-2 rounded-xl"
					style={{ backgroundColor: "#dc2626" }}
				>
					<Trash2 className="w-5 h-5" />
				</div>

				<div>
					<div className="flex items-center gap-2 mb-1">
						<h4 className="font-bold text-[0.95rem] m-0 text-[#1a1a2e]">
							Löschen bestätigen
						</h4>
					</div>
					<p className="text-[0.8rem] text-[#1a1a2e]/70 m-0 leading-relaxed">
						<span className="font-semibold text-[#1a1a2e]">{pending.name}</span>{" "}
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
		</Toast>
	);
}
