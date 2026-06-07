import { useEffect } from 'react';

export function useSearchHotkey(inputRef: React.RefObject<HTMLInputElement | null>) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === '/' && document.activeElement !== inputRef.current) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [inputRef]);
}
