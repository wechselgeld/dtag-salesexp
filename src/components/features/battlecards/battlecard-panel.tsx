'use client';

import {
	useState, useMemo, useRef, useEffect,
} from 'react';
import {
	createPortal,
} from 'react-dom';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	Swords,
	Search,
	X,

	ChevronDown,
	Zap,
	CheckCircle2,
	AlertTriangle,
	Check,
} from 'lucide-react';
import clsx from 'clsx';
import {
	useOpenPanel,
} from '@openpanel/nextjs';
import {
	ScreenHeader,
} from '@/components/shared/form/form-suite';

import type {
	Competitor, Objection,
} from '@/types/battlecards';
import {
	COMPETITORS, OBJECTIONS,
} from '@/lib/constants/battlecards-data';

// ─── Modal Component ─────────────────────────────────────────────

interface BattlecardModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function BattlecardModal({
	isOpen, onClose,
}: BattlecardModalProps) {
	const op = useOpenPanel();
	const [
		activeTab,
		setActiveTab,
	] = useState<'battlecards' | 'objections'>(
		'battlecards',
	);
	const [
		searchQuery,
		setSearchQuery,
	] = useState('');
	const [
		selectedCompetitorId,
		setSelectedCompetitorId,
	] = useState<
		string | null
	>(COMPETITORS[0].id);
	const [
		selectedObjectionId,
		setSelectedObjectionId,
	] = useState<string | null>(
		OBJECTIONS[0].id,
	);
	const [
		mounted,
		setMounted,
	] = useState(false);
	const searchRef = useRef<HTMLInputElement>(null);
	const sidebarRef = useRef<HTMLDivElement>(null);
	const hasTrackedOpenRef = useRef(false);
	const [
		showScrollHint,
		setShowScrollHint,
	] = useState(true);

	const handleSidebarScroll = () => {
		if (!sidebarRef.current) { return; }
		const {
			scrollTop, scrollHeight, clientHeight,
		} = sidebarRef.current;
		// Hide hint when user has scrolled near the bottom (within 20px)
		if (scrollTop + clientHeight >= scrollHeight - 20) {
			setShowScrollHint(false);
		}
		else {
			setShowScrollHint(true);
		}
	};

	useEffect(() => {
		const checkScroll = () => {
			if (sidebarRef.current) {
				const {
					scrollTop, scrollHeight, clientHeight,
				} = sidebarRef.current;
				setShowScrollHint(
					scrollHeight > clientHeight &&
						scrollTop + clientHeight < scrollHeight - 20,
				);
			}
		};

		// Check on mount and when tab changes or search query changes
		setMounted(true);
		checkScroll();
		window.addEventListener('resize', checkScroll);
		return () => window.removeEventListener('resize', checkScroll);
	}, [
		activeTab,
		searchQuery,
		isOpen,
	]);

	// Focus search on open
	useEffect(() => {
		if (isOpen && !hasTrackedOpenRef.current) {
			setActiveTab('battlecards');
			setSelectedCompetitorId(COMPETITORS[0].id);
			setSelectedObjectionId(OBJECTIONS[0].id);
			setSearchQuery('');
			op.track('battlecards_opened', {
				tab: 'battlecards',
			});
			hasTrackedOpenRef.current = true;
		}
		else if (!isOpen) {
			hasTrackedOpenRef.current = false;
		}
	}, [
		isOpen,
		op,
	]);

	// Focus search on tab change to battlecards
	useEffect(() => {
		if (isOpen && activeTab === 'battlecards' && !selectedCompetitorId) {
			setTimeout(() => searchRef.current?.focus(), 100);
		}
	}, [
		isOpen,
		activeTab,
		selectedCompetitorId,
	]);

	const filteredCompetitors = useMemo(() => {
		if (!searchQuery.trim()) { return COMPETITORS; }
		const q = searchQuery.toLowerCase();
		return COMPETITORS.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.weaknesses.some(
					(w) =>
						w.title.toLowerCase().includes(q) ||
						w.detail.toLowerCase().includes(q),
				) ||
				c.telekomArguments.some(
					(a) =>
						a.title.toLowerCase().includes(q) ||
						a.detail.toLowerCase().includes(q),
				),
		);
	}, [
		searchQuery,
	]);

	const filteredObjections = useMemo(() => {
		if (!searchQuery.trim()) { return OBJECTIONS; }
		const q = searchQuery.toLowerCase();
		return OBJECTIONS.filter(
			(o) =>
				o.title.toLowerCase().includes(q) ||
				o.coreArgument.toLowerCase().includes(q) ||
				o.exampleText.toLowerCase().includes(q) ||
				o.tip.toLowerCase().includes(q),
		);
	}, [
		searchQuery,
	]);

	if (!mounted) { return null; }

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
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
						onClick={onClose}
						className="absolute inset-0 cursor-pointer"
					/>

					{/* Flex Wrapper for Card and Outside Footer */}
					<div className="relative w-full max-w-6xl flex flex-col items-center gap-4 z-10">
						{/* Modal */}
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
							className="relative w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#eaedf0] overflow-hidden flex flex-col h-[85vh]"
						>
							{/* Header */}
							<div className="flex items-center justify-between px-8 md:px-10 py-5 border-b border-[#eaedf0]">
							<ScreenHeader
								icon={<Swords className="w-5.5 h-5.5 text-[#e20074]" />}
								title="Battlecards"
								subtitle="Argumentationshilfen & Strategien"
							/>

							<div className="flex items-center gap-6">
								<div className="flex p-1 bg-[#f7f8fa] rounded-xl border border-[#eaedf0]">
									<button
										onClick={() => {
											if (activeTab !== 'battlecards') {
												setActiveTab('battlecards');
												op.track('battlecards_tab_changed', {
													tab: 'battlecards',
												});
											}
										}}
										className={clsx(
											'px-6 py-2 rounded-lg text-sm font-extrabold transition-all',
											activeTab === 'battlecards'
												? 'bg-white text-[#e20074] shadow-sm'
												: 'text-[#666] hover:text-[#1a1a2e]',
										)}
									>
										Anbieter
									</button>
									<button
										onClick={() => {
											if (activeTab !== 'objections') {
												setActiveTab('objections');
												op.track('battlecards_tab_changed', {
													tab: 'objections',
												});
											}
										}}
										className={clsx(
											'px-6 py-2 rounded-lg text-sm font-extrabold transition-all',
											activeTab === 'objections'
												? 'bg-white text-[#e20074] shadow-sm'
												: 'text-[#666] hover:text-[#1a1a2e]',
										)}
									>
										Einwände
									</button>
								</div>

								<button
									onClick={onClose}
									className="w-10 h-10 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e] transition-colors cursor-pointer outline-none shrink-0"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
						</div>

						{/* Main Layout Body */}
						<div className="flex-1 flex overflow-hidden">
							{/* Sidebar (Left) */}
							<div className="w-[380px] border-r border-[#f0f0f0] flex flex-col bg-[#fcfdfe] relative">
								<div className="p-6 pb-2 shrink-0">
									<div className="relative">
										<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb] pointer-events-none" />
										<input
											type="text"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											placeholder={
												activeTab === 'objections'
													? 'Suche Einwand...'
													: 'Suche Anbieter...'
											}
											className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#eaedf0] bg-white text-[0.9rem] text-[#1a1a2e] placeholder:text-[#bbb] focus:outline-none focus:ring-4 focus:ring-[#e20074]/5 transition-all"
										/>
									</div>
								</div>

								<div
									ref={sidebarRef}
									onScroll={handleSidebarScroll}
									className="flex-1 overflow-y-auto p-6 space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
								>
									{activeTab === 'battlecards' ? (
										filteredCompetitors.length > 0 ? (
											filteredCompetitors.map((c) => (
												<button
													key={c.id}
													onClick={() => setSelectedCompetitorId(c.id)}
													className={clsx(
														'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 text-left group relative',
														selectedCompetitorId === c.id
															? 'border-[#e20074] bg-[#e20074]/2 ring-1 ring-[#e20074] shadow-md shadow-[#e20074]/5'
															: 'border-[#eaedf0] bg-white hover:border-[#d0d0d0] shadow-sm',
													)}
												>
													<div
														className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-sm"
														style={{
															backgroundColor: c.color,
														}}
													>
														{c.logoText}
													</div>
													<div className="flex-1 min-w-0">
														<p
															className={clsx(
																'text-[1.05rem] font-extrabold tracking-tight leading-none mb-1',
																selectedCompetitorId === c.id
																	? 'text-[#e20074]'
																	: 'text-[#1a1a2e]',
															)}
														>
															{c.name}
														</p>
														<p className="text-[0.75rem] font-bold text-[#888] tracking-wider">
															{c.weaknesses.length} Kritikpunkte
														</p>
													</div>
													{selectedCompetitorId === c.id && (
														<div className="w-6 h-6 rounded-full bg-[#e20074] flex items-center justify-center shadow-lg shadow-[#e20074]/20">
															<Check
																className="w-3.5 h-3.5 text-white"
																strokeWidth={4}
															/>
														</div>
													)}
												</button>
											))
										) : (
											<div className="text-center py-10 opacity-40">
												Kein Anbieter gefunden
											</div>
										)
									) : filteredObjections.length > 0 ? (
										filteredObjections.map((o) => (
											<button
												key={o.id}
												onClick={() => setSelectedObjectionId(o.id)}
												className={clsx(
													'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300 text-left group relative',
													selectedObjectionId === o.id
														? 'border-[#e20074] bg-[#e20074]/2 ring-1 ring-[#e20074] shadow-md shadow-[#e20074]/5'
														: 'border-[#eaedf0] bg-white hover:border-[#d0d0d0] shadow-sm',
												)}
											>
												<div
													className={clsx(
														'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors shadow-sm',
														selectedObjectionId === o.id
															? 'bg-[#e20074]/10 border-[#e20074]/20 text-[#e20074]'
															: 'bg-gray-50 border-[#eaedf0] text-[#888] group-hover:border-[#e20074]/30',
													)}
												>
													<o.icon className="w-6 h-6" />
												</div>
												<div className="flex-1 min-w-0">
													<p
														className={clsx(
															'text-[1.05rem] font-extrabold tracking-tight leading-none mb-1',
															selectedObjectionId === o.id
																? 'text-[#e20074]'
																: 'text-[#1a1a2e]',
														)}
													>
														{o.title}
													</p>
													<p className="text-[0.75rem] font-bold text-[#888] tracking-wider truncate">
														{o.coreArgument.split(',')[0]}
													</p>
												</div>
												{selectedObjectionId === o.id && (
													<div className="w-6 h-6 rounded-full bg-[#e20074] flex items-center justify-center shadow-lg shadow-[#e20074]/20">
														<Check
															className="w-3.5 h-3.5 text-white"
															strokeWidth={4}
														/>
													</div>
												)}
											</button>
										))
									) : (
										<div className="text-center py-10 opacity-40">
											Kein Einwand gefunden
										</div>
									)}
								</div>

								{/* Scroll Hint Animation */}
								<AnimatePresence>
									{showScrollHint && (
										<motion.div
											initial={{
												opacity: 0,
												y: 10,
											}}
											animate={{
												opacity: 1,
												y: 0,
											}}
											exit={{
												opacity: 0,
												y: 10,
											}}
											className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#fcfdfe] via-[#fcfdfe]/80 to-transparent pointer-events-none flex items-end justify-center pb-4"
										>
											<motion.div
												animate={{
													y: [
														0,
														8,
														0,
													],
												}}
												transition={{
													repeat: Infinity,
													duration: 2,
													ease: 'easeInOut',
												}}
												className="flex flex-col items-center gap-1"
											>
												<ChevronDown
													className="w-5 h-5 text-[#e20074]/50"
													strokeWidth={3}
												/>
											</motion.div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Content Area (Right) */}
							<div className="flex-1 overflow-y-auto bg-white p-10 custom-scrollbar">
								{activeTab === 'battlecards' ? (
									selectedCompetitorId ? (
										<CompetitorDetail
											competitor={
												COMPETITORS.find((c) => c.id === selectedCompetitorId)!
											}
										/>
									) : (
										<div className="h-full flex items-center justify-center text-[#bbb]">
											Wähle einen Anbieter aus
										</div>
									)
								) : selectedObjectionId ? (
									<div className="max-w-3xl mx-auto">
										<ObjectionDetail
											objection={
												OBJECTIONS.find((o) => o.id === selectedObjectionId)!
											}
										/>
									</div>
								) : (
									<div className="h-full flex items-center justify-center text-[#bbb]">
										Wähle einen Einwand aus
									</div>
								)}
							</div>
						</div>
					</motion.div>

					{/* Notice Outside the Card */}
						<motion.p
							initial={{
								opacity: 0,
								y: 10,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								y: 10,
							}}
							transition={{
								delay: 0.1,
								duration: 0.25,
							}}
							className="text-[0.75rem] text-white/70 font-medium m-0 text-center max-w-xl"
						>
							Diese Liste strebt keinen Anspruch auf Vollständigkeit oder
							Richtigkeit an.
						</motion.p>
					</div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	);
}

// ─── Competitor List ─────────────────────────────────────────────

// ─── Competitor Detail ───────────────────────────────────────────

function CompetitorDetail({
	competitor,
}: { competitor: Competitor }) {
	return (
		<div className="flex flex-col gap-10">
			{/* Two column layout on wider screens */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
				{/* Left: Schwachstellen */}
				<div>
					<div className="flex items-center gap-2 mb-3">
						<AlertTriangle className="w-4 h-4 text-red-500" />
						<span className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-wider">
							Schwachstellen
						</span>
					</div>
					<div className="flex flex-col gap-2.5">
						{competitor.weaknesses.map((w, i) => {
							const WIcon = w.icon;
							return (
								<motion.div
									key={i}
									initial={{
										opacity: 0,
										x: -10,
									}}
									animate={{
										opacity: 1,
										x: 0,
									}}
									transition={{
										delay: i * 0.05,
									}}
									className="px-4 py-3.5 rounded-2xl border border-red-100 bg-white hover:border-red-200 hover:shadow-sm transition-all duration-200"
								>
									<div className="flex items-center gap-3 mb-1.5">
										<div className="w-7 h-7 rounded-lg bg-red-500/8 flex items-center justify-center shrink-0">
											<WIcon className="w-3.5 h-3.5 text-red-500" />
										</div>
										<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
											{w.title}
										</span>
									</div>
									<p className="text-[0.78rem] text-[#666] leading-relaxed m-0 ml-10">
										{w.detail}
									</p>
								</motion.div>
							);
						})}
					</div>
				</div>

				{/* Right: Telekom Argumente */}
				<div>
					<div className="flex items-center gap-2 mb-3">
						<CheckCircle2 className="w-4 h-4 text-[#e20074]" />
						<span className="text-[1rem] font-extrabold text-[#1a1a2e] tracking-wider">
							Telekom-Vorteile
						</span>
					</div>
					<div className="flex flex-col gap-2.5">
						{competitor.telekomArguments.map((arg, i) => {
							const Icon = arg.icon;
							return (
								<motion.div
									key={i}
									initial={{
										opacity: 0,
										x: 10,
									}}
									animate={{
										opacity: 1,
										x: 0,
									}}
									transition={{
										delay: i * 0.06,
									}}
									className="px-4 py-3.5 rounded-2xl border border-[#eaedf0] bg-white hover:border-[#e20074]/20 hover:shadow-sm transition-all duration-200"
								>
									<div className="flex items-center gap-3 mb-1.5">
										<div className="w-7 h-7 rounded-lg bg-[#e20074]/8 flex items-center justify-center shrink-0">
											<Icon className="w-3.5 h-3.5 text-[#e20074]" />
										</div>
										<span className="text-[0.85rem] font-bold text-[#1a1a2e]">
											{arg.title}
										</span>
									</div>
									<p className="text-[0.78rem] text-[#666] leading-relaxed m-0 ml-10">
										{arg.detail}
									</p>
									{arg.source && (
										<div className="ml-10 mt-2">
											<span className="text-[0.65rem] text-[#bbb] bg-[#f7f8fa] px-2.5 py-1 rounded-full font-medium">
												Quelle: {arg.source}
											</span>
										</div>
									)}
								</motion.div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Objection Detail ───────────────────────────────────────────

function ObjectionDetail({
	objection,
}: { objection: Objection }) {
	return (
		<motion.div
			key={objection.id}
			initial={{
				opacity: 0,
				y: 10,
			}}
			animate={{
				opacity: 1,
				y: 0,
			}}
			transition={{
				duration: 0.4,
			}}
			className="max-w-3xl mx-auto"
		>
			{/* Header Section */}
			<div className="text-center mb-10">
				<h3 className="text-[2.5rem] font-extrabold text-[#1a1a2e] m-0 tracking-tight leading-none mb-4">
					{objection.title}
				</h3>
				<div className="flex justify-center gap-2">
					{objection.coreArgument.split(',').map((arg, i) => (
						<span
							key={i}
							className="px-4 py-1.5 bg-white border border-[#eaedf0] text-[0.75rem] font-bold text-[#666] uppercase tracking-wider rounded-xl shadow-sm"
						>
							{arg.trim()}
						</span>
					))}
				</div>
			</div>

			{/* Strategy & Dialogue Body */}
			<div className="bg-white rounded-[2.5rem] border border-[#eaedf0] overflow-hidden shadow-2xl shadow-gray-200/50">
				{/* The Hint/Strategy */}
				<div className="bg-telekom-gray-50 p-8 md:p-10 border-b border-[#eaedf0]">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center text-white text-sm shadow-md shadow-black/10">
							<Zap className="w-4 h-4" />
						</div>
						<span className="text-[0.85rem] font-extrabold text-[#1a1a2e] uppercase tracking-widest">
							Die Strategie
						</span>
					</div>
					<p className="text-[1.15rem] font-medium text-[#444] leading-relaxed m-0 italic">
						{objection.tip}
					</p>
				</div>

				{/* The Script/Dialogue */}
				<div className="p-8 md:p-10 mt-5">
					<div className="relative">
						<div className="absolute -left-1 opacity-10 text-[6rem] -top-10 font-serif text-[#e20074] pointer-events-none select-none leading-none">
							&ldquo;
						</div>
						<div className="text-[1.5rem] font-bold text-[#1a1a2e] leading-[1.4] tracking-tight relative z-10">
							{objection.exampleText}
						</div>
					</div>
				</div>
			</div>

			<p className="text-center mt-8 text-[0.8rem] text-[#bbb] font-medium italic">
				Tipp: Bleibe authentisch und passe den Leitfaden deinem eigenen Stil an.
			</p>
		</motion.div>
	);
}
