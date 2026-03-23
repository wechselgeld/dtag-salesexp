'use client';

import React, {
	useState, useEffect, useCallback,
} from 'react';
import {
	motion,
} from 'framer-motion';
import {
	ChevronRight,
	ChevronLeft,
	Sparkles,
	LayoutGrid,
	Search,
	Calculator,
	ShoppingBag,
	ShieldCheck,
	MousePointerClick,
	Swords,
	FileText,
	Tag,
	PlusCircle,
	TrendingUp,
	PiggyBank,
	ShoppingCart,
	Tv,
	MessageSquare,
	X,
	Hand,
	Receipt,
} from 'lucide-react';
import {
	useRouter,
} from 'next/navigation';
import {
	useBasketStore,
} from '@/hooks/use-basket-store';

/* ──────────────────────────────────────────────
   Constants
   ────────────────────────────────────────────── */

const EASE_OUT_EXPO: [number, number, number, number] = [
	0.16,
	1,
	0.3,
	1,
];
const LS_KEY_FIRST_NAME = 'setup-user-firstName';
const LS_KEY_ONBOARDING = 'onboarding-completed-v3';

/* ──────────────────────────────────────────────
   Step definitions
   ────────────────────────────────────────────── */

interface Step {
	targetId: string;
	title: string;
	content: string;
	icon: React.ElementType;
	position: 'right' | 'left' | 'top' | 'bottom' | 'center';
	/** Optional hint shown as a small tag below the content */
	hint?: string;
	/** Optional action label for the primary button (overrides default) */
	actionLabel?: string;
}

const STEPS: Step[] = [
	{
		targetId: 'welcome',
		title: 'Willkommen! 👋🏻',
		content:
			'Lass uns gemeinsam die wichtigsten Funktionen entdecken, damit Du Deine Kunden perfekt beraten kannst.',
		icon: Sparkles,
		position: 'center',
		actionLabel: 'Tour starten',
	},
	{
		targetId: 'tour-sidebar',
		title: 'Workflow-Navigation',
		content:
			'Hier behältst Du den Überblick über den Beratungsprozess. Du kannst von jeder Seite aus auf "Startseite" klicken, um zurückzukehren.',
		icon: LayoutGrid,
		position: 'right',
	},
	{
		targetId: 'tour-calculator',
		title: 'Sparvorteil-Rechner',
		content:
			'Hier prüfst Du, ob und wie viel Dein Kunde spart, wenn er bereits Streamingdienste oder HD-Fernsehen nutzt.',
		icon: Calculator,
		position: 'right',
		hint: 'Das ist ein starkes Verkaufsargument!',
	},
	{
		targetId: 'tour-battlecards',
		title: 'Wettbewerbs-Battlecards',
		content:
			'Schlagkräftige Argumente gegen jeden Wettbewerber. Schwachstellen, Telekom-Vorteile und emotionale Formulierungen.',
		icon: Swords,
		position: 'right',
		hint: 'Das ist Deine Geheimwaffe im Gespräch.',
	},
	{
		targetId: 'tour-nps',
		title: 'NPS-Erinnerung',
		content:
			'Vergiss nie, Deine Kunden auf die SMS-Umfrage hinzuweisen! Hier findest Du auch Formulierungshilfen.',
		icon: MessageSquare,
		position: 'right',
		hint: 'Klick drauf, wenn Du die Ansprache getätigt hast. Nach zwei Minuten wirst Du wieder daran erinnert.',
	},
	{
		targetId: 'tour-admin',
		title: 'Verwaltung',
		content:
			'Mit Admin-Rechten kannst Du hier Produkte, Preise und Team-Highlights pflegen.',
		icon: ShieldCheck,
		position: 'top',
		hint: 'Neu: Verwalte globale Bilder und Design-Elemente jetzt im Reiter \'Design\'.',
	},
	{
		targetId: 'tour-search',
		title: 'Schnellsuche',
		content: 'Suche blitzschnell nach Tarifen, Hardware oder Kategorien.',
		icon: Search,
		position: 'bottom',
		hint: 'Tipp: Drücke Strg + K, um die Suche von überall aus zu öffnen.',
	},
	{
		targetId: 'tour-categories',
		title: 'Produktauswahl',
		content:
			'Wähle die passende Kategorie für Deinen Kunden. Im Team-Fokus siehst Du die aktuellen Teamziele.',
		icon: LayoutGrid,
		position: 'right',
		actionLabel: 'Kategorie öffnen →',
	},
	{
		targetId: 'tour-product-0',
		title: 'Tarif auswählen',
		content:
			'Hier siehst Du alle verfügbaren Tarife. Klicke auf einen Tarif, um ihn zu konfigurieren.',
		icon: MousePointerClick,
		position: 'right',
		actionLabel: 'Tarif öffnen →',
		hint: 'Tarife kannst Du auf dem + auch direkt hinzufügen, ohne sie erst konfigurieren zu müssen.',
	},
	{
		targetId: 'tour-config-business-case',
		title: 'Vertragsart',
		content:
			'Wähle, ob es sich um einen Neuvertrag, Tarifwechsel, SpeedUp oder Umzug handelt.',
		icon: FileText,
		position: 'right',
	},
	{
		targetId: 'tour-config-entertainment',
		title: 'MagentaTV buchen',
		content:
			'Hier kannst Du MagentaTV direkt zum Tarif hinzubuchen. Es wird nun visuell ansprechend mit einem Hintergrundbild hervorgehoben.',
		icon: Tv,
		position: 'right',
	},
	{
		targetId: 'tour-config-special-prices',
		title: 'Aktionen & Rabatte',
		content: 'Wende aktive Aktionen an, wie z. B. einen Cashback oder Rabatte.',
		icon: Tag,
		position: 'right',
	},
	{
		targetId: 'tour-config-addons',
		title: 'Zusatzoptionen',
		content:
			'Buche Optionen wie Streamingdienste, Leistungsmerkmale und mehr dazu.',
		icon: PlusCircle,
		position: 'right',
	},
	{
		targetId: 'tour-config-timeline',
		title: 'Kostenübersicht',
		content:
			'Erhalte einen sofortigen Überblick über die wichtigsten Preispunkte: Ø Monatlich, Regulär, Gesamt und Täglich.',
		icon: TrendingUp,
		position: 'left',
		hint: 'Die neuen Preiskarten helfen Dir, die Zahlen schnell zu erfassen.',
	},
	{
		targetId: 'tour-config-daily-price',
		title: 'Täglicher Preis',
		content:
			'Präsentiere den Preis als kleinen, täglichen Betrag – oft so günstig wie ein Kaffee!',
		icon: PiggyBank,
		position: 'left',
		hint: 'Nutze diesen psychologischen Anker im Verkaufsgespräch. Die Karte hebt diesen Wert nun besonders hervor.',
	},
	{
		targetId: 'tour-config-action',
		title: 'In den Warenkorb',
		content:
			'Nach der Konfiguration legst Du alles hier in den Warenkorb. Dort kannst Du auch ein PDF erstellen und per E-Mail versenden.',
		icon: ShoppingCart,
		position: 'left',
		actionLabel: 'Jetzt in den Warenkorb legen →',
	},
	{
		targetId: 'tour-basket',
		title: 'Der Warenkorb',
		content:
			'Hier siehst Du die Preisentwicklung über 24 Monate und alle Details übersichtlich aufgeschlüsselt.',
		icon: ShoppingBag,
		position: 'left',
	},
	{
		targetId: 'tour-offer-action',
		title: 'Angebot erstellen',
		content:
			'Mit einem Klick erstellst Du ein fertiges PDF-Angebot und kannst es Deinem Kunden direkt per E-Mail senden.',
		icon: Receipt,
		position: 'left',
		actionLabel: 'Verstanden',
	},
	{
		targetId: 'welcome',
		title: 'Bereit für den Start!',
		content:
			'Wenn Du Hilfe brauchst, wende Dich einfach an deinen Teamleiter oder Kollegen.',
		icon: Sparkles,
		position: 'center',
		actionLabel: 'Los geht\'s! 🚀',
		hint: 'Dieses Tool entwickelt sich konstant weiter. Feedback ist immer willkommen! Reiche dieses gerne direkt an den Entwickler per Mail weiter: felix.kinze@telekom.de',
	},
];

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export function OnboardingTutorial() {
	const [
		currentStep,
		setCurrentStep,
	] = useState<number | null>(null);
	const [
		coords,
		setCoords,
	] = useState<{
		x: number;
		y: number;
		w: number;
		h: number;
	}>({
		x: 0,
		y: 0,
		w: 0,
		h: 0,
	});
	const [
		isVisible,
		setIsVisible,
	] = useState(false);
	const [
		retryCount,
		setRetryCount,
	] = useState(0);
	const [
		firstName,
		setFirstName,
	] = useState('');
	const router = useRouter();
	const clearBasket = useBasketStore((state) => state.clearBasket);

	// Startup: check if user has seen onboarding
	useEffect(() => {
		const hasSeen = localStorage.getItem(LS_KEY_ONBOARDING);
		const storedName = localStorage.getItem(LS_KEY_FIRST_NAME) ?? '';
		setFirstName(storedName);

		if (!hasSeen) {
			clearBasket(); // Start with a clean slate

			const lastSeenStr = localStorage.getItem('splash-timestamp');
			const lastSeen = lastSeenStr ? parseInt(lastSeenStr, 10) : 0;
			const now = Date.now();
			const hoursPassed = (now - lastSeen) / (1000 * 60 * 60);
			const secondsSinceLastSplash = (now - lastSeen) / 1000;

			const delay =
				hoursPassed >= 10 || secondsSinceLastSplash < 5 ? 4200 : 800;

			const timer = setTimeout(() => {
				setIsVisible(true);
				setCurrentStep(0);
			}, delay);
			return () => clearTimeout(timer);
		}
	}, [
	]);

	// Coordinate tracking for spotlight
	const updateCoords = useCallback(() => {
		if (currentStep === null || currentStep === 0) {
			setCoords({
				x: 0,
				y: 0,
				w: 0,
				h: 0,
			});
			return;
		}

		const step = STEPS[currentStep];
		if (step.position === 'center') {
			setCoords({
				x: 0,
				y: 0,
				w: 0,
				h: 0,
			});
			return;
		}

		let el: HTMLElement | null = null;
		let multiElements: NodeListOf<Element> | null = null;

		if (step.targetId === 'tour-categories') {
			multiElements = document.querySelectorAll('.tour-category-card');
		}
		else {
			el = document.getElementById(step.targetId);
		}

		if ((el || (multiElements && multiElements.length > 0)) && isVisible) {
			let rect: DOMRect;

			if (multiElements && multiElements.length > 0) {
				// Calculate a bounding box that contains all elements
				let minX = Infinity,
					minY = Infinity,
					maxX = -Infinity,
					maxY = -Infinity;

				multiElements.forEach((node) => {
					const r = node.getBoundingClientRect();
					if (r.width > 0 && r.height > 0) {
						minX = Math.min(minX, r.left);
						minY = Math.min(minY, r.top);
						maxX = Math.max(maxX, r.right);
						maxY = Math.max(maxY, r.bottom);
					}
				});

				if (minX === Infinity) {
					if (retryCount < 40) {
						setTimeout(() => setRetryCount((prev) => prev + 1), 150);
					}
					return;
				}

				rect = {
					left: minX,
					top: minY,
					right: maxX,
					bottom: maxY,
					width: maxX - minX,
					height: maxY - minY,
					x: minX,
					y: minY,
					toJSON() {
						return {
							x: this.x,
							y: this.y,
							width: this.width,
							height: this.height,
							top: this.top,
							right: this.right,
							bottom: this.bottom,
							left: this.left,
						};
					},
				};
			}
			else if (el) {
				rect = el.getBoundingClientRect();
				if (rect.width === 0 && retryCount < 5) {
					setTimeout(() => setRetryCount((prev) => prev + 1), 100);
					return;
				}
			}
			else {
				// No target found
				setCoords({
					x: 0,
					y: 0,
					w: 0,
					h: 0,
				});
				if (retryCount < 40) {
					setTimeout(() => setRetryCount((prev) => prev + 1), 150);
				}
				return;
			}

			setCoords({
				x: rect.left,
				y: rect.top,
				w: rect.width,
				h: rect.height,
			});

			const isInViewport =
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= window.innerHeight &&
				rect.right <= window.innerWidth;

			if (!isInViewport) {
				const scrollTarget = el || (multiElements && multiElements[0]);
				if (scrollTarget) {
					scrollTarget.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					});
					setTimeout(() => {
						// Re-run measurement after scroll
						updateCoords();
					}, 500);
				}
			}
		}
		else {
			setCoords({
				x: 0,
				y: 0,
				w: 0,
				h: 0,
			});
			if (retryCount < 40) {
				setTimeout(() => setRetryCount((prev) => prev + 1), 150);
			}
		}
	}, [
		currentStep,
		retryCount,
		isVisible,
	]);

	useEffect(() => {
		updateCoords();
		window.addEventListener('resize', updateCoords);
		window.addEventListener('scroll', updateCoords, true);
		return () => {
			window.removeEventListener('resize', updateCoords);
			window.removeEventListener('scroll', updateCoords, true);
		};
	}, [
		updateCoords,
	]);

	useEffect(() => {
		setRetryCount(0);
	}, [
		currentStep,
	]);

	/* ── Interactive actions ── */

	const handleCartAction = useCallback(() => {
		// Simulate clicking the "Add to Cart" button on the product detail page
		const addBtn = document.getElementById('tour-config-action');
		if (addBtn) {
			const clickable =
				addBtn.querySelector('button') ?? addBtn.querySelector('a');
			if (clickable) {
				clickable.click();
			}
			else {
				addBtn.click();
			}
		}
	}, [
	]);

	/* ── Navigation handlers ── */

	const handleEnd = useCallback(() => {
		localStorage.setItem(LS_KEY_ONBOARDING, 'true');
		clearBasket(); // Clean up after tutorial
		setIsVisible(false);
		setCurrentStep(null);
		router.push('/');
	}, [
		router,
		clearBasket,
	]);

	const handleNext = useCallback(() => {
		if (currentStep === null) { return; }

		if (currentStep >= STEPS.length - 1) {
			handleEnd();
			return;
		}

		const nextStepIdx = currentStep + 1;
		const nextStep = STEPS[nextStepIdx];
		const currentStepData = STEPS[currentStep];

		// Interactive: add to cart when leaving the cart step
		if (currentStepData.targetId === 'tour-config-action') {
			handleCartAction();
		}

		// Auto-navigation for dynamic elements
		if (nextStep.targetId === 'tour-product-0') {
			router.push('/products/FIBER');
		}
		else if (nextStep.targetId === 'tour-config-business-case') {
			const firstProductLink = document.querySelector<HTMLAnchorElement>(
				'a[href^="/products/FIBER/"]',
			);
			if (firstProductLink?.getAttribute('href')) {
				router.push(firstProductLink.getAttribute('href') as string);
			}
			else {
				router.push('/products/FIBER');
			}
		}

		setCurrentStep(nextStepIdx);
	}, [
		currentStep,
		router,
		handleCartAction,
		handleEnd,
	]);

	const handleBack = useCallback(() => {
		if (currentStep === null || currentStep <= 0) { return; }

		const prevStepIdx = currentStep - 1;
		const currentStepData = STEPS[currentStep];

		if (currentStepData.targetId === 'tour-config-business-case') {
			router.push('/products/FIBER');
		}
		else if (currentStepData.targetId === 'tour-product-0') {
			router.push('/products');
		}

		setCurrentStep(prevStepIdx);
	}, [
		currentStep,
		router,
	]);

	// Keyboard navigation
	useEffect(() => {
		if (!isVisible) { return; }

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight' || e.key === 'Enter') {
				e.preventDefault();
				handleNext();
			}
			else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				handleBack();
			}
			else if (e.key === 'Escape') {
				e.preventDefault();
				handleEnd();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [
		isVisible,
		handleNext,
		handleBack,
		handleEnd,
	]);

	if (!isVisible || currentStep === null) { return null; }

	const step = STEPS[currentStep];
	const Icon = step.icon;
	const isWelcome = step.position === 'center';
	const progress = ((currentStep + 1) / STEPS.length) * 100;

	return (
		<div className="fixed inset-0 z-9999 flex items-center justify-center pointer-events-none">
			{/* ─── Overlay ─── */}
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
				className={`absolute inset-0 transition-all duration-300 ${
					isWelcome || (currentStep > 0 && coords.w === 0)
						? 'bg-black/60 backdrop-blur-[3px] pointer-events-auto'
						: 'bg-transparent pointer-events-none'
				}`}
			/>

			{/* ─── Spotlight panels ─── */}
			{currentStep > 0 && coords.w > 0 && (
				<>
					<motion.div
						initial={false}
						animate={{
							height: Math.max(0, coords.y - 12),
						}}
						transition={{
							type: 'spring',
							damping: 30,
							stiffness: 200,
						}}
						className="absolute top-0 left-0 right-0 backdrop-blur-[3px] z-9998"
					/>
					<motion.div
						initial={false}
						animate={{
							top: coords.y + coords.h + 12,
						}}
						transition={{
							type: 'spring',
							damping: 30,
							stiffness: 200,
						}}
						className="absolute bottom-0 left-0 right-0 backdrop-blur-[3px] z-9998"
					/>
					<motion.div
						initial={false}
						animate={{
							top: coords.y - 12,
							height: coords.h + 24,
							width: Math.max(0, coords.x - 12),
						}}
						transition={{
							type: 'spring',
							damping: 30,
							stiffness: 200,
						}}
						className="absolute left-0 backdrop-blur-[3px] z-9998"
					/>
					<motion.div
						initial={false}
						animate={{
							top: coords.y - 12,
							height: coords.h + 24,
							left: coords.x + coords.w + 12,
						}}
						transition={{
							type: 'spring',
							damping: 30,
							stiffness: 200,
						}}
						className="absolute right-0 backdrop-blur-[3px] z-9998"
					/>
				</>
			)}

			{/* ─── Spotlight ring ─── */}
			{currentStep > 0 && coords.w > 0 && (
				<motion.div
					initial={false}
					animate={{
						left: coords.x - 12,
						top: coords.y - 12,
						width: coords.w + 24,
						height: coords.h + 24,
						opacity: 1,
					}}
					transition={{
						type: 'spring',
						damping: 30,
						stiffness: 200,
					}}
					className="absolute border-2 border-[#e20074] rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none z-10000"
				>
					<div className="absolute inset-0 bg-[#e20074]/5 blur-2xl rounded-3xl" />
				</motion.div>
			)}

			{/* ─── Content Card ─── */}
			<motion.div
				initial={{
					opacity: 0,
					scale: 0.92,
				}}
				animate={{
					opacity: 1,
					scale: 1,
					...(currentStep > 0 && coords.w > 0
						? getCardPosition(step.position, coords)
						: {
							left: '50%',
							top: '50%',
							x: '-50%',
							y: '-50%',
						}),
				}}
				transition={{
					type: 'spring',
					damping: 28,
					stiffness: 220,
					mass: 0.8,
				}}
				className="fixed bg-white rounded-4xl p-7 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4)] w-[380px] pointer-events-auto z-10001 border border-[#eaedf0]"
			>
				{/* Progress bar + Close button row */}
				<div className="flex items-center gap-3 mb-6">
					<div className="flex-1 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
						<motion.div
							className="h-full bg-[#e20074] rounded-full"
							initial={{
								width: 0,
							}}
							animate={{
								width: `${progress}%`,
							}}
							transition={{
								duration: 0.4,
								ease: EASE_OUT_EXPO,
							}}
						/>
					</div>
					<button
						onClick={handleEnd}
						className="w-7 h-7 rounded-full bg-[#f7f8fa] border border-[#eaedf0] flex items-center justify-center text-[#ccc] hover:text-[#e20074] hover:border-[#e20074]/30 transition-all cursor-pointer outline-none shrink-0"
						title="Tour beenden (Esc)"
					>
						<X className="w-3.5 h-3.5" strokeWidth={2.5} />
					</button>
				</div>

				{/* Step counter */}
				<div className="text-[0.7rem] font-bold text-[#ccc] uppercase tracking-[0.15em] mb-4">
					Schritt {currentStep + 1} von {STEPS.length}
				</div>

				{/* Icon + Title */}
				<div className="flex items-start gap-3 mb-3">
					<div className="w-10 h-10 rounded-xl bg-[#e20074]/10 flex items-center justify-center shrink-0">
						<Icon className="w-5 h-5 text-[#e20074]" strokeWidth={2} />
					</div>
					<div className="pt-1.5">
						<h3 className="text-[1.2rem] font-extrabold text-[#1a1a2e] tracking-tight leading-tight m-0">
							{step.title === 'Willkommen! 👋🏻' && firstName
								? `Willkommen, ${firstName}! 👋🏻`
								: step.title}
						</h3>
					</div>
				</div>

				{/* Content */}
				<p className="text-[0.88rem] text-[#666] leading-relaxed m-0 mb-4 min-h-[2.5em]">
					{step.content}
				</p>

				{/* Optional hint */}
				{step.hint && (
					<div className="bg-[#f7f8fa] border border-[#eaedf0] rounded-xl px-4 py-2.5 mb-5 text-[0.78rem] text-[#888] font-medium">
						{step.hint}
					</div>
				)}

				{/* Actions */}
				<div className="flex flex-col gap-2.5 mt-1">
					{/* Primary button */}
					<button
						onClick={handleNext}
						className="w-full bg-[#e20074] text-white font-bold py-3 px-5 rounded-xl hover:bg-[#c70066] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-none cursor-pointer shadow-[0_6px_16px_-4px_rgba(226,0,116,0.3)] text-[0.9rem] outline-none"
					>
						{step.actionLabel ??
							(currentStep === STEPS.length - 1 ? 'Los geht\'s! 🚀' : 'Weiter')}
						{!step.actionLabel && currentStep < STEPS.length - 1 && (
							<ChevronRight className="w-4 h-4" strokeWidth={2.5} />
						)}
					</button>

					{/* Secondary controls */}
					<div className="flex items-center justify-between px-1">
						{currentStep > 0 ? (
							<button
								onClick={handleBack}
								className="flex items-center gap-1 text-[0.72rem] font-bold text-[#bbb] hover:text-[#e20074] transition-colors bg-transparent border-none cursor-pointer uppercase tracking-widest outline-none"
							>
								<ChevronLeft className="w-3.5 h-3.5" />
								Zurück
							</button>
						) : (
							<div />
						)}

						<button
							onClick={handleEnd}
							className="text-[0.72rem] font-bold text-[#bbb] hover:text-[#1a1a2e] transition-colors uppercase tracking-widest bg-transparent border-none cursor-pointer outline-none"
						>
							Überspringen
						</button>
					</div>
				</div>

				{/* Keyboard hint */}
				{currentStep > 0 && (
					<div className="mt-4 pt-3 border-t border-[#f0f0f0] flex items-center justify-center gap-3 text-[0.65rem] text-[#ccc] font-medium">
						<span className="flex items-center gap-1">
							<kbd className="px-1.5 py-0.5 rounded bg-[#f7f8fa] border border-[#eaedf0] text-[0.6rem] font-mono">
								←
							</kbd>
							<kbd className="px-1.5 py-0.5 rounded bg-[#f7f8fa] border border-[#eaedf0] text-[0.6rem] font-mono">
								→
							</kbd>
							Navigation
						</span>
						<span className="w-0.5 h-0.5 rounded-full bg-[#ddd]" />
						<span className="flex items-center gap-1">
							<kbd className="px-1.5 py-0.5 rounded bg-[#f7f8fa] border border-[#eaedf0] text-[0.6rem] font-mono">
								Esc
							</kbd>
							Beenden
						</span>
					</div>
				)}
			</motion.div>

			{/* ─── Welcome mouse hint ─── */}
			{currentStep === 0 && (
				<motion.div
					initial={{
						opacity: 0,
						y: 10,
					}}
					animate={{
						opacity: 1,
						y: 0,
					}}
					transition={{
						delay: 0.5,
						duration: 0.4,
						ease: EASE_OUT_EXPO,
					}}
					className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex items-center gap-2 text-[0.8rem] font-medium"
				>
					<Hand className="w-4 h-4" />
					<span>Klicke auf &quot;Tour starten&quot; um zu beginnen</span>
				</motion.div>
			)}
		</div>
	);
}

/* ──────────────────────────────────────────────
   Card positioning
   ────────────────────────────────────────────── */

function getCardPosition(
	position: Step['position'],
	coords: { x: number; y: number; w: number; h: number },
) {
	const offset = 24;
	const cardWidth = 380;

	switch (position) {
	case 'right':
		return {
			left: Math.min(
				coords.x + coords.w + offset,
				window.innerWidth - cardWidth - 20,
			),
			top: Math.min(
				Math.max(coords.y + coords.h / 2, 200),
				window.innerHeight - 200,
			),
			y: '-50%',
		};
	case 'left':
		return {
			left: Math.max(coords.x - cardWidth - offset, 20),
			top: Math.min(
				Math.max(coords.y + coords.h / 2, 200),
				window.innerHeight - 200,
			),
			y: '-50%',
		};
	case 'bottom':
		return {
			top: Math.min(coords.y + coords.h + offset, window.innerHeight - 300),
			left: Math.min(
				Math.max(coords.x + coords.w / 2, cardWidth / 2 + 20),
				window.innerWidth - cardWidth / 2 - 20,
			),
			x: '-50%',
		};
	case 'top':
		return {
			top: Math.max(coords.y - offset, 20),
			left: Math.min(
				Math.max(coords.x + coords.w / 2, cardWidth / 2 + 20),
				window.innerWidth - cardWidth / 2 - 20,
			),
			x: '-50%',
			y: '-100%',
		};
	default:
		return {
			left: '50%',
			top: '50%',
			x: '-50%',
			y: '-50%',
		};
	}
}
