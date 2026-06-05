'use client';

import {
 useState, useEffect,
} from 'react';
import {
 SudoPromptModal,
} from './sudo-prompt-modal';

interface DeleteConfirmState {
	id: string;
	name: string;
	requireSudo?: boolean;
	onConfirm: (password: string) => Promise<any>;
}

let showDeleteConfirmGlobal: ((state: DeleteConfirmState) => void) | null = null;

/**
 * Call this anywhere to trigger the delete confirm sudo modal.
 * Example: confirmDelete({ id: "123", name: "MagentaZuhause M", onConfirm: (sudoPassword) => mutation.mutateAsync({ id, sudoPassword }) })
 */
export function confirmDelete(state: DeleteConfirmState) {
	showDeleteConfirmGlobal?.(state);
}

/**
 * Render this once in your admin layout. Wraps SudoPromptModal.
 */
export function DeleteConfirmToast() {
	const [
 pending,
setPending,
] = useState<DeleteConfirmState | null>(null);
	const [
 loading,
setLoading,
] = useState(false);

	useEffect(() => {
		showDeleteConfirmGlobal = (state) => {
			setPending(state);
		};
		return () => {
			showDeleteConfirmGlobal = null;
		};
	}, [
]);

	return (
		<SudoPromptModal
			isOpen={!!pending}
			onClose={() => setPending(null)}
			title={pending?.requireSudo === false ? 'Löschen bestätigen' : 'Löschen bestätigen (Sudo-Modus)'}
			description={pending?.requireSudo === false
				? `Bist Du sicher, dass Du "${pending?.name}" unwiderruflich löschen möchtest?`
				: `Bitte gib Dein Administrator-Passwort ein, um "${pending?.name}" unwiderruflich zu löschen.`}
			requireSudo={pending?.requireSudo}
			loading={loading}
			onConfirm={async (password) => {
				if (!pending) return;
				setLoading(true);
				try {
					await pending.onConfirm(password);
					setPending(null);
				}
 finally {
					setLoading(false);
				}
			}}
		/>
	);
}
