'use client';

import React, {
	useState, useEffect, useRef, useCallback,
} from 'react';
import {
	createPortal,
} from 'react-dom';
import {
	motion, AnimatePresence,
} from 'framer-motion';
import {
	X, MessageSquare, Send, RefreshCw, ShoppingCart, Trash2, ShieldAlert,
	Check,
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
	useBasketStore,
} from '@/lib/store/basket-store';
import {
	useBasketLogic,
} from '@/hooks/use-basket-logic';
import {
	ScreenHeader,
	PremiumButton,
} from '@/components/shared/form/form-suite';
import {
	useSettingsStore,
} from '@/lib/store/settings-store';

function MiniSpinner({
	className,
}: {
	className?: string;
}) {
	return (
		<div className={clsx('w-3.5 h-3.5 border-[1.5px] border-gray-300 border-t-[#e20074] rounded-full animate-spin shrink-0', className)} />
	);
}

interface ToolCallStatus {
	id: string;
	name: string;
	status: 'running' | 'done';
	payload: string;
}

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	toolCalls?: ToolCallStatus[];
}

interface SalesTipsModalProps {
	isOpen: boolean;
	onClose: () => void;
}


function replaceCursorMarker(children: React.ReactNode): React.ReactNode {
	if (!children) return children;

	if (typeof children === 'string') {
		if (children.endsWith('[CURSOR]')) {
			const cleaned = children.slice(0, -8); // remove '[CURSOR]'
			return (
				<>
					{cleaned}
					<span className="inline-block w-1.5 h-4 bg-[#e20074] ml-1 rounded-full animate-pulse align-middle shrink-0" />
				</>
			);
		}
		return children;
	}

	if (Array.isArray(children)) {
		return React.Children.map(children, (child) => replaceCursorMarker(child));
	}

	if (React.isValidElement(children)) {
		const element = children as React.ReactElement<{ children?: React.ReactNode }>;
		if (element.props && 'children' in element.props) {
			return React.cloneElement(element, {
				...element.props,
				children: replaceCursorMarker(element.props.children),
			});
		}
	}

	return children;
}

// Simple, secure local formatter for full markdown rendering (supports lists, bold, italics, code, quotes, and GFM tables)
function formatMessageContent(text: string, isGeneratingLast: boolean = false, isAi: boolean = true): React.ReactNode {
	if (!text) {
		return null;
	}

	const processedText = isGeneratingLast ? text + ' [CURSOR]' : text;

	const renderChildrenWithCursor = (children: React.ReactNode) => {
		return replaceCursorMarker(children);
	};

	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				h1: ({ children }) => <h1 className={clsx("text-lg font-extrabold mt-4 mb-2 first:mt-0", isAi ? "text-[#1a1a2e]" : "text-white")}>{renderChildrenWithCursor(children)}</h1>,
				h2: ({ children }) => <h2 className={clsx("text-md font-extrabold mt-3.5 mb-1.5 first:mt-0", isAi ? "text-[#1a1a2e]" : "text-white")}>{renderChildrenWithCursor(children)}</h2>,
				h3: ({ children }) => <h3 className={clsx("text-sm font-bold mt-3 mb-1 first:mt-0", isAi ? "text-[#1a1a2e]" : "text-white")}>{renderChildrenWithCursor(children)}</h3>,
				p: ({ children }) => <p className={clsx("mb-2.5 last:mb-0 leading-relaxed font-medium", isAi ? "text-gray-800" : "text-white/90")}>{renderChildrenWithCursor(children)}</p>,
				ul: ({ children }) => <ul className="list-disc pl-5 mb-3.5 space-y-1">{children}</ul>,
				ol: ({ children }) => <ol className="list-decimal pl-5 mb-3.5 space-y-1">{children}</ol>,
				li: ({ children }) => <li className={clsx("leading-relaxed font-medium", isAi ? "text-gray-800" : "text-white/90")}>{renderChildrenWithCursor(children)}</li>,
				strong: ({ children }) => <strong className={clsx("font-extrabold", isAi ? "text-[#1a1a2e]" : "text-white")}>{renderChildrenWithCursor(children)}</strong>,
				em: ({ children }) => <em className={clsx("italic", isAi ? "text-gray-700" : "text-white/85")}>{renderChildrenWithCursor(children)}</em>,
				blockquote: ({ children }) => (
					<blockquote className={clsx(
						"border-l-4 pl-4 py-1.5 italic rounded-r-xl my-3",
						isAi 
							? "border-[#e20074]/30 text-gray-600 bg-gray-50/50" 
							: "border-white/30 text-white/70 bg-white/10"
					)}>
						{renderChildrenWithCursor(children)}
					</blockquote>
				),
				code: ({ children }) => (
					<code className={clsx(
						"px-1.5 py-0.5 rounded-md text-[0.85em] font-mono font-semibold",
						isAi 
							? "bg-[#f0f2f5] text-[#e20074]" 
							: "bg-white/15 text-pink-300"
					)}>
						{renderChildrenWithCursor(children)}
					</code>
				),
				a: ({ href, children }) => (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className={clsx("font-semibold hover:underline", isAi ? "text-[#e20074]" : "text-pink-300")}
					>
						{renderChildrenWithCursor(children)}
					</a>
				),
				table: ({ children }) => (
					<div className="overflow-x-auto my-4 w-full">
						<table className={clsx(
							"border-collapse text-left rounded-xl overflow-hidden border",
							isAi 
								? "w-full bg-white border-[#eaedf0] shadow-sm" 
								: "min-w-full bg-white/5 border-white/10"
						)}>
							{children}
						</table>
					</div>
				),
				thead: ({ children }) => (
					<thead className={clsx(
						"border-b",
						isAi ? "bg-[#f0f2f5] border-[#eaedf0]" : "bg-white/10 border-white/10"
					)}>
						{children}
					</thead>
				),
				tbody: ({ children }) => (
					<tbody className={clsx(
						"divide-y",
						isAi ? "divide-[#eaedf0]" : "divide-white/10"
					)}>
						{children}
					</tbody>
				),
				tr: ({ children }) => (
					<tr className={clsx(
						"transition-colors",
						isAi ? "hover:bg-[#f7f8fa]/50" : "hover:bg-white/5"
					)}>
						{children}
					</tr>
				),
				th: ({ children }) => (
					<th className={clsx(
						"px-4 py-3 text-xs font-extrabold uppercase tracking-wider",
						isAi ? "text-[#1a1a2e]" : "text-white"
					)}>
						{renderChildrenWithCursor(children)}
					</th>
				),
				td: ({ children }) => (
					<td className={clsx(
						"px-4 py-2.5 text-[0.875rem] font-medium align-middle",
						isAi ? "text-gray-800" : "text-white/90"
					)}>
						{renderChildrenWithCursor(children)}
					</td>
				)
			}}
		>
			{processedText}
		</ReactMarkdown>
	);
}


function ToolCallProgress({
	toolCalls,
}: { toolCalls: ToolCallStatus[] }) {
	if (!toolCalls || toolCalls.length === 0) return null;

	return (
		<div className="flex flex-col gap-2 mb-3.5 w-full select-none px-2 text-left">
			{toolCalls.map((tool) => {
				const isRunning = tool.status === 'running';

				let text: string;

				switch (tool.name) {
					case 'get_basket_context':
						text = 'Analysiere aktuellen Warenkorb...';
						if (tool.status === 'done') text = 'Warenkorb analysiert';
						break;
					case 'search_products':
						text = `Suche nach "${tool.payload}"...`;
						if (tool.status === 'done') text = `Produktkatalog nach "${tool.payload}" durchsucht`;
						break;
					case 'get_product_details':
						text = 'Rufe Produktspezifikationen ab...';
						if (tool.status === 'done') text = `Spezifikationen für "${tool.payload}" geladen`;
						break;
					case 'get_one_time_credits':
						text = 'Prüfe einmalige Gutschriften und Angebote...';
						if (tool.status === 'done') text = 'Gutschriften und Angebote geprüft';
						break;
					case 'key_rotation':
						text = `NVIDIA NIM Rate-Limit erreicht (Status 429). Wechsle zu alternativem API-Key und versuche es erneut (Versuch ${tool.payload})...`;
						if (tool.status === 'done') text = 'Erfolgreich zu alternativem API-Key gewechselt';
						break;
					case 'api_retry_429':
						text = `Verbindung ausgelastet (429). Warte auf Freigabe und versuche es erneut (Versuch ${tool.payload})...`;
						if (tool.status === 'done') text = 'Verbindung erfolgreich wiederhergestellt';
						break;
					default:
						if (tool.name.startsWith('api_retry_')) {
							const code = tool.name.replace('api_retry_', '');
							text = `Server überlastet (Status ${code}). Reconnect-Versuch und versuche es erneut (Versuch ${tool.payload})...`;
							if (tool.status === 'done') text = 'Verbindung erfolgreich wiederhergestellt';
						} else {
							text = `Führe Abfrage ${tool.name} aus...`;
							if (tool.status === 'done') text = `Abfrage ${tool.name} abgeschlossen`;
						}
				}

				return (
					<motion.div
						key={tool.id}
						initial={{
							opacity: 0,
							y: 2,
						}}
						animate={{
							opacity: 1,
							y: 0,
						}}
						className="flex items-center gap-2 text-[0.8rem]"
					>
						{isRunning ? (
							<MiniSpinner className="w-3.5 h-3.5" />
						) : (
							<Check className="w-3.5 h-3.5 text-gray-400 shrink-0" />
						)}
						<span className={clsx(
							isRunning ? 'text-[#1a1a2e] font-semibold' : 'text-[#888] font-medium',
						)}>
							{text}
						</span>
					</motion.div>
				);
			})}
		</div>
	);
}

export function SalesTipsModal({
	isOpen, onClose,
}: SalesTipsModalProps) {
	const [
		mounted,
		setMounted,
	] = useState(false);
	const [
		messages,
		setMessages,
	] = useState<Message[]>([
		{
			id: 'welcome',
			role: 'assistant',
			content: 'Der **SXP Scout** unterstützt dich in Echtzeit bei der Argumentation und Einwandbehandlung.\n\nDer Kontext deines aktuellen Warenkorbs wurde automatisch geladen, um die Argumente optimal anzupassen. Stelle eine Frage zu Produkten oder gib einen Kunden-Einwand ein.',
		},
	]);
	const [
		inputValue,
		setInputValue,
	] = useState('');
	const [
		isGenerating,
		setIsGenerating,
	] = useState(false);
	const [
		streamStatus,
		setStreamStatus,
	] = useState<'idle' | 'starting' | 'receiving' | 'stalled'>('idle');
	const [
		apiError,
		setApiError,
	] = useState<string | null>(null);

	const lastChunkTimestampRef = useRef<number>(0);

	useEffect(() => {
		if (!isGenerating) {
			setStreamStatus('idle');
			return;
		}
		setStreamStatus('starting');
		lastChunkTimestampRef.current = Date.now();

		const interval = setInterval(() => {
			const timeSinceLastChunk = Date.now() - lastChunkTimestampRef.current;
			if (timeSinceLastChunk > 3500) {
				setStreamStatus('stalled');
			} else {
				setStreamStatus((prev) => (prev === 'stalled' ? 'receiving' : prev));
			}
		}, 500);

		return () => clearInterval(interval);
	}, [isGenerating]);

	const handleAbort = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		setIsGenerating(false);
	}, []);

	// Retrieve active context from Zustand basket store
	const acceptedAiDisclaimer = useSettingsStore((state) => state.acceptedAiDisclaimer);
	const setAcceptedAiDisclaimer = useSettingsStore((state) => state.setAcceptedAiDisclaimer);

	const basketItems = useBasketStore((state) => state.items);
	const activeBasketId = useBasketStore((state) => state.activeBasketId);
	const {
		totals, combinedSteps, totalOneTime, totalCredits,
	} = useBasketLogic(activeBasketId);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Auto-scroll logic with smooth animation
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({
			behavior: 'smooth',
		});
	}, [
	]);

	useEffect(() => {
		if (isOpen) {
			scrollToBottom();
		}
	}, [
		isOpen,
		messages,
		isGenerating,
		scrollToBottom,
	]);

	useEffect(() => {
		setMounted(true);
		return () => {
			// Clean up active abort controllers on unmount
			abortControllerRef.current?.abort();
		};
	}, [
	]);

	// Intercept onClose to abort streaming connections immediately (Edge-case prevention)
	const handleCloseAndAbort = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		setIsGenerating(false);
		onClose();
	}, [
		onClose,
	]);

	const clearChat = useCallback(() => {
		setMessages([
			{
				id: 'welcome',
				role: 'assistant',
				content: 'Der Chatverlauf wurde zurückgesetzt. Ich bin bereit für deine nächste Frage zum geladenen Warenkorb-Kontext.',
			},
		]);
		setApiError(null);
	}, [
	]);

	const handleSend = useCallback(async (textToSend: string) => {
		const trimmedText = textToSend.trim();
		if (!trimmedText || isGenerating) return;

		setInputValue('');
		setApiError(null);
		setIsGenerating(true);

		// Append user message
		const userMsgId = `msg-${Date.now()}-user`;
		const newMessages: Message[] = [
			...messages,
			{
				id: userMsgId,
				role: 'user',
				content: trimmedText,
			},
		];
		setMessages(newMessages);

		// Prep abort controller
		const controller = new AbortController();
		abortControllerRef.current = controller;

		// Create placeholder for assistant streaming message
		const assistantMsgId = `msg-${Date.now()}-assistant`;
		setMessages((prev) => [
			...prev,
			{
				id: assistantMsgId,
				role: 'assistant',
				content: '',
			},
		]);

		try {
			// Build clean context payload from basket state
			const activeCategory = basketItems[0]?.product.category || null;

			const serializedBasketItems = basketItems.map(item => {
				// 1. Business Case Label
				let businessCaseLabel = 'Neuvertrag';
				if (item.config.businessCase === 'MOVE') businessCaseLabel = 'Umzug';
				else if (item.config.businessCase === 'PLAN_CHANGE') businessCaseLabel = 'Tarifwechsel';
				else if (item.config.businessCase === 'SPEED_UP') businessCaseLabel = 'Upgrade (Geschwindigkeitserhöhung)';

				// 2. MagentaTV Options
				let magentaTVText = null;
				if (item.config.magentaTVPackage) {
					const pkg = item.config.magentaTVPackage;
					let price = 0;
					if (pkg === 'smart') price = 10;
					else if (pkg === 'smartstream') price = 17;
					else if (pkg === 'megastream') price = 30;
					magentaTVText = `MagentaTV ${pkg.toUpperCase()} (+${price.toFixed(2).replace('.', ',')} €)`;
				}

				// 3. Selected Addons / Options
				const selectedAddons: string[] = [
				];
				if (item.config.selectedAddonIds && item.product.compatibleAddons) {
					item.product.compatibleAddons.forEach(addon => {
						if (addon.tiers) {
							addon.tiers.forEach(tier => {
								if (item.config.selectedAddonIds.includes(tier.id)) {
									selectedAddons.push(`${addon.name}${addon.tiers.length > 1 ? ` - ${tier.name}` : ''} (+${tier.price.toFixed(2).replace('.', ',')} €)`);
								}
							});
						}
					});
				}

				// 4. PlusKarten Count
				if (item.config.plusKartenCount && item.config.plusKartenCount > 0) {
					const pkCount = item.config.plusKartenCount;
					const firstPrice = 19.95;
					const followingPrice = 9.95;
					const totalPlusKartenPrice = firstPrice + (pkCount - 1) * followingPrice;
					selectedAddons.push(`${pkCount}x PlusKarte(n) (Gesamt +${totalPlusKartenPrice.toFixed(2).replace('.', ',')} €)`);
				}

				// 5. Hardware Tier Surcharge
				if (item.config.hardwareTier && item.config.hardwareTier !== 'none') {
					const tier = item.config.hardwareTier;
					let surcharge = 0;
					if (tier === 'smartphone') surcharge = 10;
					else if (tier === 'top') surcharge = 20;
					else if (tier === 'premium') surcharge = 30;
					else if (tier === 'premium_plus') surcharge = 40;
					selectedAddons.push(`Endgerät Option (${tier}) (+${surcharge.toFixed(2).replace('.', ',')} €)`);
				}

				// 6. Hardware Purchase Type
				if (item.product.category === 'DEVICE') {
					const pType = item.config.hardwarePurchaseType || 'RENT';
					selectedAddons.push(pType === 'BUY' ? 'Endgerät Kauf' : 'Endgerät Miete');
				}

				// 7. Selected Special Prices
				const selectedSpecialPrices: string[] = [
				];
				if (item.config.selectedSpecialPriceIds && item.product.specialPrices) {
					item.product.specialPrices.forEach(sp => {
						if (item.config.selectedSpecialPriceIds.includes(sp.id)) {
							selectedSpecialPrices.push(sp.name);
						}
					});
				}

				return {
					id: item.id,
					name: item.product.name,
					price: item.product.basePrice,
					category: item.product.category,
					businessCase: businessCaseLabel,
					magentaTV: magentaTVText,
					selectedAddons,
					selectedSpecialPrices,
				};
			});

			const pricingSteps = combinedSteps.map(
				step => `Monat ${step.start}-${step.end}: ${step.total.toFixed(2).replace('.', ',')} €`,
			);

			const response = await fetch('/api/sales-tips/stream', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: newMessages.map(msg => ({
						role: msg.role,
						content: msg.content,
					})),
					activeCategory,
					basketItems: serializedBasketItems,
					totalPrice: totals.monthly,
					averagePrice: totals.monthly,
					dailyPrice: totals.daily,
					totalOneTime,
					totalCredits,
					pricingSteps,
				}),
				signal: controller.signal,
			});

			if (!response.ok) {
				const errorJson = await response.json().catch(() => ({
				}));
				throw new Error(errorJson.error || 'Serverfehler beim Laden der Argumente.');
			}

			const stream = response.body;
			if (!stream) {
				throw new Error('Empfangsdaten-Stream konnte nicht geöffnet werden.');
			}

			const reader = stream.getReader();
			const decoder = new TextDecoder('utf-8');
			let accumulatedResponse = '';
			let buffer = '';

			while (true) {
				const {
					done, value,
				} = await reader.read();

				lastChunkTimestampRef.current = Date.now();
				setStreamStatus('receiving');

				// Decode chunk and append to the buffer
				const chunk = value ? decoder.decode(value, {
					stream: !done,
				}) : decoder.decode();
				buffer += chunk;

				const lines = buffer.split('\n');
				// Pop the last line to process it only if it is completely received
				const incompleteLine = lines.pop() ?? '';
				buffer = done ? '' : incompleteLine;

				for (const line of lines) {
					const trimmedLine = line.trim();
					if (trimmedLine.startsWith('data: ')) {
						const rawData = trimmedLine.slice(6);
						if (rawData === '[DONE]') continue;

						try {
							const parsed = JSON.parse(rawData) as {
								choices?: {
									delta?: {
										content?: string;
										tool_call_status?: {
											name: string;
											status: 'running' | 'done';
											payload: string;
										};
									};
								}[];
							};
							const delta = parsed.choices?.[0]?.delta;
							if (delta?.tool_call_status) {
								const {
									name, status, payload,
								} = delta.tool_call_status;
								setMessages((prev) =>
									prev.map((msg) => {
										if (msg.id !== assistantMsgId) return msg;
										const existingCalls = msg.toolCalls || [
										];
										const idx = existingCalls.findIndex((c) => c.name === name);
										const newCalls = [
											...existingCalls,
										];
										if (idx > -1) {
											newCalls[idx] = {
												...newCalls[idx],
												status,
												payload: payload || newCalls[idx].payload,
											};
										}
										else {
											newCalls.push({
												id: `tool-${Date.now()}-${Math.random()}`,
												name,
												status,
												payload,
											});
										}
										return {
											...msg,
											toolCalls: newCalls,
										};
									}),
								);
							}
							else if (delta?.content) {
								let contentChunk = delta.content;
								if (accumulatedResponse === '') {
									// Remove any leading BOM (Byte Order Mark) or replacement character (U+FFFD)
									contentChunk = contentChunk.replace(/^[\ufeff\ufffd\u0000]+/, '');
								}
								if (contentChunk) {
									accumulatedResponse += contentChunk;
									setMessages((prev) =>
										prev.map((msg) =>
											msg.id === assistantMsgId
												? {
													...msg,
													content: accumulatedResponse,
												}
												: msg,
										),
									);
								}
							}
						}
						catch (e) {
							console.warn('Failed to parse SSE JSON line:', trimmedLine, e);
						}
					}
				}

				if (done) {
					// Handle any leftover in the last incomplete line
					const lastTrimmed = incompleteLine.trim();
					if (lastTrimmed.startsWith('data: ')) {
						const rawData = lastTrimmed.slice(6);
						if (rawData !== '[DONE]') {
							try {
								const parsed = JSON.parse(rawData) as {
									choices?: {
										delta?: {
											content?: string;
											tool_call_status?: {
												name: string;
												status: 'running' | 'done';
												payload: string;
											};
										};
									}[];
								};
								const delta = parsed.choices?.[0]?.delta;
								if (delta?.tool_call_status) {
									const {
										name, status, payload,
									} = delta.tool_call_status;
									setMessages((prev) =>
										prev.map((msg) => {
											if (msg.id !== assistantMsgId) return msg;
											const existingCalls = msg.toolCalls || [
											];
											const idx = existingCalls.findIndex((c) => c.name === name);
											const newCalls = [
												...existingCalls,
											];
											if (idx > -1) {
												newCalls[idx] = {
													...newCalls[idx],
													status,
													payload: payload || newCalls[idx].payload,
												};
											}
											else {
												newCalls.push({
													id: `tool-${Date.now()}-${Math.random()}`,
													name,
													status,
													payload,
												});
											}
											return {
												...msg,
												toolCalls: newCalls,
											};
										}),
									);
								}
								else if (delta?.content) {
									const contentChunk = delta.content;
									accumulatedResponse += contentChunk;
									setMessages((prev) =>
										prev.map((msg) =>
											msg.id === assistantMsgId
												? {
													...msg,
													content: accumulatedResponse,
												}
												: msg,
										),
									);
								}
							}
							catch (e) {
								console.warn('Failed to parse trailing SSE line:', lastTrimmed, e);
							}
						}
					}
					break;
				}
			}

			// 1) For test purposes, log the finished response to the console.
			console.log('Finished AI Response:', accumulatedResponse);

		}
		catch (err: unknown) {
			if (err instanceof Error && err.name === 'AbortError') {
				// Request was aborted intentionally by the user or timeout, do not show visual error
				console.log('Stream request aborted.');
				return;
			}
			console.error('Error fetching stream response:', err);
			setApiError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.');
			// Remove the empty or partial assistant message on fail
			setMessages((prev) => prev.filter((msg) => msg.id !== assistantMsgId));
		}
		finally {
			setIsGenerating(false);
			abortControllerRef.current = null;
		}
	}, [
		messages,
		basketItems,
		totals,
		combinedSteps,
		totalOneTime,
		totalCredits,
		isGenerating,
	]);

	if (!mounted) return null;

	if (isOpen && !acceptedAiDisclaimer) {
		return createPortal(
			<AnimatePresence>
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
					<div className="flex flex-col items-center gap-4 w-full max-w-md">
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
							className="bg-white rounded-3xl border border-[#eaedf0] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-8 w-full flex flex-col gap-6 text-center relative"
						>
							<div className="flex flex-col items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-[#e20074]/10 text-[#e20074] flex items-center justify-center shrink-0">
									<ShieldAlert className="w-6 h-6" />
								</div>
								<h3 className="text-[1.2rem] font-extrabold text-[#1a1a2e] tracking-tight">
									Sales Tipps mit KI aktivieren?
								</h3>
								<p className="text-[0.875rem] text-[#666] leading-relaxed max-w-sm">
									Der SXP Scout unterstützt Dich in Echtzeit mit künstlicher Intelligenz. <br /><strong>Er analysiert Deine Nachricht und antwortet mit dem besten Sales Tipp.</strong> Er kann auch Tarife und Deinen Warenkorb durchsuchen.<br /><br />Bitte beachte, dass die KI Fehler machen kann, <strong>oft langsam antwortet oder die Übertragung abbrechen kann</strong>. Wir arbeiten an einer Lösung. Weitere Details findest Du in unseren{' '}
									<Link
										href="/ai-info"
										target="_blank"
										className="text-[#e20074] hover:underline font-semibold"
									>
										Hinweisen zur KI-Nutzung
									</Link>
									.
								</p>
							</div>

							<div className="flex flex-col gap-2 pt-2">
								<PremiumButton
									onClick={() => setAcceptedAiDisclaimer(true)}
									className="w-full"
								>
									Aktivieren &amp; Zustimmen
								</PremiumButton>
							</div>
						</motion.div>

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
							transition={{
								delay: 0.1,
								duration: 0.25,
							}}
						>
							<PremiumButton
								variant="ghost"
								onClick={onClose}
								className="text-xs text-white/80 hover:text-white hover:bg-transparent font-medium py-1 h-auto cursor-pointer"
							>
								Nicht aktivieren, abbrechen
							</PremiumButton>
						</motion.div>
					</div>
				</div>
			</AnimatePresence>,
			document.body
		);
	}

	const content = (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
					{/* Overlay Background */}
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
						onClick={handleCloseAndAbort}
						className="absolute inset-0 cursor-pointer"
					/>

					{/* Card Window */}
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
						className="relative w-full max-w-7xl bg-white rounded-4xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#eaedf0] overflow-hidden flex flex-col h-[90vh] md:h-[85vh]"
					>
						{/* Header */}
						<div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-5 border-b border-[#eaedf0] gap-4 shrink-0">
							<ScreenHeader
								icon={<MessageSquare className="w-5.5 h-5.5 text-[#e20074]" />}
								title="Sales Tipps mit KI"
								subtitle="Kontextbasierter Argumentationstrainer & Einwandbehandlung"
							/>

							<div className="flex items-center gap-4">
								{messages.length > 1 && (
									<button
										onClick={clearChat}
										disabled={isGenerating}
										className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer outline-none border border-[#eaedf0] disabled:opacity-50"
										title="Verlauf löschen"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								)}

								<button
									onClick={handleCloseAndAbort}
									className="w-10 h-10 rounded-full flex items-center justify-center text-[#888] hover:bg-[#f7f8fa] hover:text-[#1a1a2e] transition-colors cursor-pointer outline-none border border-[#eaedf0]"
									title="Schließen"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
						</div>

						{/* Body Panel (Split Pane) */}
						<div className="flex-1 flex flex-col md:flex-row min-h-0 relative bg-white">
							{/* Left Column: Interactive Chat (full width) */}
							<div className="flex-1 flex flex-col min-h-0">
								{/* Message Area */}
								<div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 custom-scrollbar">
									<AnimatePresence initial={false}>
										{messages.map((msg) => {
											const isAi = msg.role === 'assistant';
											const runningTool = isAi ? msg.toolCalls?.find((tc) => tc.status === 'running') : null;
											const showBubble = !isAi || msg.content !== '' || isGenerating;
											const isLastMsg = msg.id === messages[messages.length - 1].id;

											return (
												<motion.div
													key={msg.id}
													initial={{
														opacity: 0,
														y: 12,
														scale: 0.98,
													}}
													animate={{
														opacity: 1,
														y: 0,
														scale: 1,
													}}
													transition={{
														duration: 0.2,
													}}
													className={clsx(
														'flex w-full max-w-[85%] flex-col',
														isAi ? 'self-start items-start' : 'self-end items-end',
													)}
												>
													<div className="text-[0.75rem] font-semibold text-gray-400 mb-1 px-2">
														{isAi ? 'SXP Scout' : 'Berater'}
													</div>

													{isAi && msg.toolCalls && msg.toolCalls.length > 0 && (
														<ToolCallProgress toolCalls={msg.toolCalls} />
													)}

													{showBubble && (
														<div
															className={clsx(
																'px-5 py-3.5 rounded-2xl text-[0.95rem] leading-relaxed font-sans',
																isAi
																	? 'bg-[#f7f8fa] text-gray-800 border border-[#eaedf0] rounded-tl-sm font-medium'
																	: 'bg-[#1a1a2e] text-white rounded-tr-sm font-medium',
															)}
														>
															{msg.content === '' && isGenerating ? (
																<div className="flex items-center gap-2 py-0.5 select-none text-gray-500 font-medium">
																	<MiniSpinner className="w-4 h-4 border-2" />
																	<span className="text-[0.85rem]">
																		{streamStatus === 'starting' && 'Verbindung wird aufgebaut...'}
																		{streamStatus === 'stalled' && 'Die Verbindung dauert ungewöhnlich lang...'}
																		{streamStatus === 'receiving' && (
																			runningTool ? (
																				runningTool.name === 'get_basket_context'
																					? 'Warenkorb wird analysiert...'
																					: runningTool.name === 'search_products'
																						? `Produktkatalog wird nach "${runningTool.payload || ''}" durchsucht...`
																						: runningTool.name === 'get_product_details'
																							? 'Produktspezifikationen werden abgerufen...'
																							: runningTool.name === 'get_one_time_credits'
																								? 'Einmalige Gutschriften werden geprüft...'
																								: `Werkzeug ${runningTool.name} wird ausgeführt...`
																			) : (
																				'Antwort wird generiert...'
																			)
																		)}
																		{streamStatus === 'idle' && 'Antwort wird generiert...'}
																	</span>
																</div>
															) : (
																formatMessageContent(msg.content, isAi && isLastMsg && isGenerating, isAi)
															)}

															{isAi && isLastMsg && isGenerating && msg.content !== '' && (
																<div className="mt-2.5 pt-2 border-t border-[#eaedf0]/50 flex items-center gap-2 text-[0.8rem] text-gray-400 select-none">
																	<MiniSpinner className="w-3 h-3" />
																	<span>
																		{streamStatus === 'starting' && 'Verbindung wird aufgebaut...'}
																		{streamStatus === 'receiving' && 'Antwort wird generiert...'}
																		{streamStatus === 'stalled' && (
																			runningTool
																				? `Warte auf Ergebnisse für "${runningTool.payload || ''}"...`
																				: 'SXP Scout benötigt für die Antwort ungewöhnlich viel Zeit...'
																		)}
																	</span>
																</div>
															)}
														</div>
													)}
												</motion.div>
											);
										})}
									</AnimatePresence>

									{/* API Error Block */}
									{apiError && (
										<motion.div
											initial={{
												opacity: 0,
												scale: 0.95,
											}}
											animate={{
												opacity: 1,
												scale: 1,
											}}
											className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 max-w-[85%] self-start font-medium shadow-sm"
										>
											<ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
											<div className="text-[0.9rem]">
												<div className="font-extrabold text-red-800 mb-1">Übertragungsfehler</div>
												{apiError}
												<button
													onClick={() => {
														const lastUserMsg = [
															...messages,
														].reverse().find(m => m.role === 'user');
														if (lastUserMsg) {
															handleSend(lastUserMsg.content);
														}
													}}
													className="mt-2.5 flex items-center gap-1.5 text-[0.8rem] font-extrabold text-[#e20074] hover:text-[#c70066] transition-colors uppercase tracking-wider underline cursor-pointer"
												>
													<RefreshCw className="w-3.5 h-3.5" /> Wiederholen
												</button>
											</div>
										</motion.div>
									)}

									<div ref={messagesEndRef} />
								</div>

								{/* Custom Prompt Input Bar */}
								<div className="px-8 py-4 bg-white border-t border-[#eaedf0] shrink-0">
									<form
										onSubmit={(e) => {
											e.preventDefault();
											if (!isGenerating) {
												handleSend(inputValue);
											}
										}}
										className="flex items-center gap-3.5"
									>
										<input
											type="text"
											value={inputValue}
											onChange={(e) => setInputValue(e.target.value)}
											disabled={isGenerating}
											placeholder="Kunden-Einwand oder Frage eingeben..."
											className="flex-1 h-[48px] px-5 rounded-xl border border-[#eaedf0] bg-[#f7f8fa] text-[0.95rem] text-[#1a1a2e] font-medium placeholder:text-gray-400 focus:outline-none focus:border-[#e20074] focus:ring-1 focus:ring-[#e20074]/30 focus:bg-white transition-all disabled:opacity-50"
										/>
										<button
											type={isGenerating ? 'button' : 'submit'}
											onClick={isGenerating ? handleAbort : undefined}
											disabled={!isGenerating && !inputValue.trim()}
											className="w-[48px] h-[48px] rounded-xl flex items-center justify-center bg-[#e20074] hover:bg-[#c70066] text-white disabled:bg-[#f7f8fa] disabled:text-[#ccc] disabled:border disabled:border-[#eaedf0] transition-all shadow-[0_6px_16px_-4px_rgba(226,0,116,0.3)] disabled:shadow-none cursor-pointer active:scale-95 disabled:active:scale-100 shrink-0"
											title={isGenerating ? 'Generierung stoppen' : 'Nachricht senden'}
										>
											{isGenerating ? (
												<div className="w-3.5 h-3.5 bg-white rounded-xs shrink-0 animate-pulse" />
											) : (
												<Send className="w-4.5 h-4.5" />
											)}
										</button>
									</form>
									<div className="mt-3 flex flex-col sm:flex-row sm:justify-between items-center text-[0.7rem] text-gray-400 gap-2 font-semibold select-none">
										<span className="flex items-center">
											<ShieldAlert className="w-3.5 h-3.5 text-gray-400 shrink-0" />
											Die KI kann Fehler machen. Bitte überprüfe wichtige Informationen (
											<Link href="/ai-info" target="_blank" className="underline text-gray-500 hover:text-[#e20074] transition-colors">
												KI-Nutzung & Datensicherheit
											</Link>
											).
										</span>
										<span>Nur für interne Schulungs- und Vertriebszwecke.</span>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);

	return createPortal(content, document.body);
}
