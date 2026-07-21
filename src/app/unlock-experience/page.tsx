'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { GlobalFooter } from '@/components/shared/global-footer';
import { ScreenHeader, PremiumInput, PremiumButton } from '@/components/shared/form/form-suite';
import { useRouter } from 'next/navigation';

export default function UnlockExperiencePage() {
	const router = useRouter();
	const [masterKey, setMasterKey] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!masterKey.trim()) {
			setError('Bitte gib einen Master-Key ein.');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const res = await fetch('/api/bypass-login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ masterKey }),
			});

			const data = await res.json();

			if (res.ok && data.success) {
				router.push('/products');
				router.refresh();
			} else {
				setError(data.error || 'Ungültiger Master-Key.');
			}
		} catch (err) {
			setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="h-screen w-full py-12 px-4 selection:bg-black/10 selection:text-black scrollbar-none overflow-y-auto overflow-x-hidden fixed inset-0 bg-[#f7f8fa] flex items-center justify-center">
			<div className="max-w-md w-full mx-auto">
				{/* Elevated Premium Card matching Onboarding */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] overflow-hidden"
				>
					<div className="p-8 sm:p-10">
						<form onSubmit={handleSubmit} className="space-y-6">
							<ScreenHeader
								icon={<Lock className="w-5 h-5 text-black" />}
								title="Demo-Zugang"
								subtitle="Entsperre die SXP mit einem Admin-Key."
								iconBgClassName="bg-black/5"
							/>

							{error && (
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-[0.875rem] text-red-800"
								>
									<AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
									<span>{error}</span>
								</motion.div>
							)}

							<div className="space-y-4">
								<PremiumInput
									label="Master-Key"
									type="password"
									placeholder="••••••••••••"
									value={masterKey}
									onChange={(e) => setMasterKey(e.target.value)}
									icon={<Key className="w-4 h-4 text-[#ccc]" />}
									disabled={isLoading}
								/>
							</div>

							<PremiumButton
								type="submit"
								loading={isLoading}
								icon={<ArrowRight className="w-4 h-4" />}
								className="w-full"
							>
								Entsperren
							</PremiumButton>
						</form>
					</div>
				</motion.div>

				<GlobalFooter className="pt-8 pb-0 mt-4 text-[#bbb]" linkColor="text-[#bbb]" />
			</div>
		</div>
	);
}
