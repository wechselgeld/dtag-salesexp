'use client';

import {
	useEffect, useState,
} from 'react';
import {
	useParams,
} from 'next/navigation';
import {
	trpc,
} from '@/lib/trpc';
import {
	motion,
} from 'framer-motion';
import {
	TelekomLogo,
} from '@/components/shared/telekom-logo';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import {
	Loader2, CheckCircle2, ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';


export default function VerifyPage() {
	const params = useParams();
	const token = params.token as string;

	const [
		status,
		setStatus,
	] = useState<'loading' | 'success' | 'error'>(
		'loading',
	);
	const [
		errorMessage,
		setErrorMessage,
	] = useState('');

	const verifyMutation = trpc.session.verifyEmail.useMutation({
		onSuccess: (data) => {
			setStatus('success');

			if (typeof window !== 'undefined') {
				if (data.firstName) { localStorage.setItem('setup-user-firstName', data.firstName); }
				if (data.lastName) { localStorage.setItem('setup-user-lastName', data.lastName); }
				if (data.email) { localStorage.setItem('setup-user-email', data.email); }
				localStorage.setItem('setup-completed', new Date().toISOString());
			}

			setTimeout(() => {
				// Versucht, den aktuellen Tab zu schließen, falls vom Browser zugelassen.
				window.close();
			}, 3000);
		},
		onError: (error) => {
			setStatus('error');
			setErrorMessage(
				error.message || 'Die E-Mail konnte nicht bestätigt werden.',
			);
		},
	});

	useEffect(() => {
		if (token) {
			verifyMutation.mutate({
				token,
			});
		}
		else {
			setStatus('error');
			setErrorMessage('Kein Token gefunden.');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		token,
	]);

	return (
		<div className="min-h-screen py-12 px-4 selection:bg-[#e20074]/20 selection:text-[#e20074] flex flex-col items-center justify-center">
			<div className="max-w-md w-full mx-auto">
				<motion.div
					initial={{
						opacity: 0,
						y: 12,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					transition={{
						duration: 0.5,
						ease: [
							0.16,
							1,
							0.3,
							1,
						],
					}}
					className="flex flex-col items-center mb-8 text-center"
				>
					<TelekomLogo className="w-12 h-12 text-[#e20074] mb-6" />
					<h1 className="text-2xl font-extrabold text-[#1a1a2e] tracking-tight m-0">
						Sales Experience
					</h1>
				</motion.div>

				<motion.div
					initial={{
						opacity: 0,
						y: 15,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					transition={{
						duration: 0.5,
						delay: 0.1,
						ease: [
							0.16,
							1,
							0.3,
							1,
						],
					}}
					className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] p-8 text-center"
				>
					{status === 'loading' && (
						<div className="flex flex-col items-center gap-4 py-6">
							<Loader2 className="w-10 h-10 text-[#e20074] animate-spin" />
							<div>
								<h2 className="text-[1.15rem] font-bold text-[#1a1a2e] mb-1">
									E-Mail wird bestätigt...
								</h2>
								<p className="text-[#888] text-[0.9rem]">Einen Moment bitte.</p>
							</div>
						</div>
					)}

					{status === 'success' && (
						<div className="flex flex-col items-center gap-5 py-6">
							<div className="w-16 h-16 bg-[#e20074]/10 rounded-full flex items-center justify-center">
								<CheckCircle2 className="w-8 h-8 text-[#e20074]" />
							</div>
							<div>
								<h2 className="text-[1.25rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
									Erfolgreich bestätigt!
								</h2>
								<p className="text-[#888] text-[0.9rem] leading-relaxed">
									Deine E-Mail-Adresse wurde erfolgreich verifiziert. Du kannst
									diesen Tab nun schließen und zur App zurückkehren.
								</p>
							</div>
							<button
								onClick={() => window.close()}
								className="mt-2 w-full h-[48px] rounded-xl bg-[#e20074] hover:bg-[#c70066] text-white font-bold text-[0.9rem] shadow-[0_4px_14px_rgba(226,0,116,0.25)] transition-all flex items-center justify-center gap-2 outline-none active:scale-[0.98] cursor-pointer"
							>
								Tab schließen
							</button>
						</div>
					)}

					{status === 'error' && (
						<div className="flex flex-col items-center gap-5 py-6">
							<div className="w-16 h-16 bg-[#fdf2f8] rounded-full flex items-center justify-center">
								<ShieldAlert className="w-8 h-8 text-[#e20074]" />
							</div>
							<div>
								<h2 className="text-[1.25rem] font-extrabold text-[#1a1a2e] mb-2 tracking-tight">
									Bestätigung fehlgeschlagen
								</h2>
								<p className="text-[#888] text-[0.9rem] leading-relaxed">
									{errorMessage}
								</p>
							</div>
							<Link
								href="/setup"
								className="mt-2 w-full h-[48px] rounded-xl bg-[#f7f8fa] hover:bg-[#eaedf0] text-[#1a1a2e] font-bold text-[0.9rem] border border-[#eaedf0] transition-all flex items-center justify-center gap-2 outline-none active:scale-[0.98]"
							>
								Zurück zum Setup
							</Link>
						</div>
					)}
				</motion.div>

				<GlobalFooter className="mt-8 text-[#bbb]" linkColor="text-[#bbb]" />
			</div>
		</div>
	);
}
