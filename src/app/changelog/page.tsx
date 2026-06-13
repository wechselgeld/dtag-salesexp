'use client';

import {
	ArrowLeft,
} from 'lucide-react';
import {
	motion,
} from 'framer-motion';
import {
	useEffect,
} from 'react';
import {
	GlobalFooter,
} from '@/components/shared/global-footer';
import clsx from 'clsx';
import { PageHeader } from '@/components/shared/page-header';
import {
	CHANGELOG_DATA,
} from '@/lib/data/changelog-data';
import {
	useChangelogStore,
} from '@/lib/store/changelog-store';

export default function ChangelogPage() {
	const setLastSeenChangelogId = useChangelogStore((state) => state.setLastSeenChangelogId);

	useEffect(() => {
		const latestId = CHANGELOG_DATA[0]?.id;
		if (latestId) {
			setLastSeenChangelogId(latestId);
		}
	}, [
		setLastSeenChangelogId,
	]);

	return (
		<div className="min-h-screen py-16 px-4 sm:px-6 bg-[#fafafa] selection:bg-[#e20074]/10 selection:text-[#e20074]">
			<div className="max-w-2xl mx-auto">
				{/* ─── Header / Branding ─── */}
				<PageHeader
					title="Änderungsverlauf"
					description="Aktuelle Neuerungen, Optimierungen und Ankündigungen der Sales Experience."
					className="mb-16"
				/>

				{/* ─── Timeline Feed ─── */}
				<div className="relative border-l border-slate-200 ml-3 sm:ml-6 pl-6 sm:pl-10 space-y-16 mb-20 pb-4">
					{CHANGELOG_DATA.map((category, catIdx) => (
						<motion.section
							key={category.id}
							initial={{
								opacity: 0,
								y: 16,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								duration: 0.5,
								delay: catIdx * 0.05,
								ease: [
									0.16,
									1,
									0.3,
									1,
								],
							}}
							className="relative group"
						>
							{/* Timeline Dot/Node */}
							<div className="absolute -left-[31px] sm:-left-[47px] top-2 w-3 h-3 rounded-full bg-white border-2 border-slate-300 z-10 transition-all duration-300 group-hover:border-[#e20074] group-hover:bg-[#e20074] group-hover:shadow-[0_0_8px_rgba(226,0,116,0.5)]" />

							{/* Release Date Header */}
							<div className="flex items-center gap-3 mb-6">
								<h2 className="text-[1.25rem] sm:text-[1.35rem] font-bold text-[#111] m-0 tracking-tight">
									{category.title}
								</h2>
								{category.isMajor && (
									<span className="text-[10px] font-bold text-[#e20074] uppercase tracking-wider bg-[#e20074]/5 px-2 py-0.5 rounded border border-[#e20074]/10">
										Major Update
									</span>
								)}
							</div>

							{/* Release Content Card */}
							<div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)] transition-all duration-300 group-hover:border-slate-200/80 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
								<div className="divide-y divide-slate-100">
									{category.items.map((item, idx) => {
										const isAdded = item.q === 'Hinzugefügt';
										const isChanged = item.q === 'Geändert';
										const isRemoved = item.q === 'Entfernt';
										return (
											<div
												key={idx}
												className="py-4.5 first:pt-0 last:pb-0 flex items-start gap-4"
											>
												{/* Action Badge */}
												<div className="shrink-0 pt-0.5 min-w-[90px]">
													<span className={clsx(
														'inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded',
														isAdded && 'text-[#e20074] bg-[#e20074]/5',
														isChanged && 'text-[#3b82f6] bg-[#3b82f6]/5',
														isRemoved && 'text-[#64748b] bg-[#64748b]/5',
													)}>
														{item.q}
													</span>
												</div>

												{/* Description */}
												<p className="text-[0.925rem] text-[#444] leading-relaxed m-0 font-normal">
													{item.a}
												</p>
											</div>
										);
									})}
								</div>
							</div>
						</motion.section>
					))}
				</div>

				<div className="flex justify-center mb-24">
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1a1a2e] hover:bg-black text-white text-[0.95rem] font-bold rounded-xl transition-all cursor-pointer border-none shadow-md hover:shadow-lg active:scale-[0.98] gap-2 group"
					>
						<ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
						Zurück zur App
					</button>
				</div>

				<GlobalFooter
					className="pt-10 pb-0 mt-4 text-[#aaa]"
					linkColor="text-[#aaa]"
				/>
			</div>
		</div>
	);
}
