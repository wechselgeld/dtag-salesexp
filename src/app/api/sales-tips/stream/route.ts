import OpenAI from 'openai';
import {
	type NextRequest,
} from 'next/server';
import {
	z,
} from 'zod';
import type {
	Prisma,
} from '@/lib/prisma';
import {
	prisma,
} from '@/lib/prisma';

// Strong types for agent messages and tool calls (Zero use of 'any')
interface AgentToolCall {
	id: string;
	type: 'function';
	function: {
		name: string;
		arguments: string;
	};
}

interface AgentMessage {
	role: 'system' | 'user' | 'assistant' | 'tool';
	content: string | null;
	tool_calls?: AgentToolCall[];
	tool_call_id?: string;
	name?: string;
}

// Configuration constants to prevent magic numbers
const STREAM_TIMEOUT_MS = 25000;
const MAX_TOOL_LOOPS = 5;

/**
 * Detects AI generation loops and text repetition at the active tail of the stream.
 * Employs two complementary heuristics:
 * 1. Exact substring consecutive repetitions (O(1) sliding window tail check).
 * 2. Sentence-based frequency within recent history (detects alternating/nested loops).
 */
function detectRepetition(text: string): boolean {
	const len = text.length;
	if (len >= 45) {
		const maxL = Math.min(300, Math.floor(len / 3));
		for (let L = 15; L <= maxL; L++) {
			const p1 = text.slice(len - L);
			const p2 = text.slice(len - 2 * L, len - L);
			const p3 = text.slice(len - 3 * L, len - 2 * L);
			if (p1 === p2 && p2 === p3) {
				return true;
			}
		}
	}

	// Split by punctuation followed by space/newline, or just newlines to extract sentences
	const sentences = text
		.split(/(?:[.\!?]+(?:\s+|\n+))|\n+/)
		.map(s => s.trim())
		.filter(s => s.length > 0);

	if (sentences.length >= 3) {
		const recent = sentences.slice(-6);

		// Check consecutive loop for medium-sized sentences (length >= 15)
		const last = recent[recent.length - 1];
		const prev1 = recent[recent.length - 2];
		const prev2 = recent[recent.length - 3];
		if (last.length >= 15 && last === prev1 && last === prev2) {
			return true;
		}

		// Check frequency in recent window for longer sentences (length >= 20)
		const counts: Record<string, number> = {};
		for (const s of recent) {
			if (s.length >= 20) {
				counts[s] = (counts[s] || 0) + 1;
				if (counts[s] >= 3) {
					return true;
				}
			}
		}
	}

	return false;
}

const SalesTipsRequestSchema = z.object({
	messages: z.array(
		z.object({
			role: z.enum([
				'user',
				'assistant',
			]),
			content: z.string().min(1, 'Inhalt darf nicht leer sein'),
		}),
	),
	activeCategory: z.string().nullable().optional(),
	basketItems: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			price: z.number().optional(),
			category: z.string().optional(),
			businessCase: z.string().optional(),
			magentaTV: z.string().nullable().optional(),
			selectedAddons: z.array(z.string()).optional(),
			selectedSpecialPrices: z.array(z.string()).optional(),
		}),
	).optional(),
	totalPrice: z.number().optional(),
	averagePrice: z.number().optional(),
	dailyPrice: z.number().optional(),
	totalOneTime: z.number().optional(),
	totalCredits: z.number().optional(),
	pricingSteps: z.array(z.string()).optional(),
});

// Zod schemas for tool arguments validation to enforce strict type checking
const SearchProductsArgsSchema = z.object({
	search: z.string().optional(),
	category: z.string().optional(),
});

const GetProductDetailsArgsSchema = z.object({
	productId: z.string(),
});

// Tool definitions array for OpenAI-compatible NVIDIA NIM API
const TOOL_DEFINITIONS = [
	{
		type: 'function' as const,
		function: {
			name: 'get_basket_context',
			description: 'Gibt den vollständigen Inhalt des aktuellen Warenkorbs des Kunden zurück, inklusive aller Tarife, gebuchter TV-Optionen, Zusatzoptionen, Monatspreise, Tagespreise, einmaligen Kosten, Gutschriften und dem monatlichen Zahlungsverlauf.',
			parameters: {
				type: 'object',
				properties: {
					justification: {
						type: 'string',
						description: 'Optionaler Grund für den Abruf des Warenkorb-Kontexts.',
					},
				},
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'search_products',
			description: 'Sucht im Telekom-Produktkatalog nach Tarifen, Optionen oder Geräten. Gibt Name, ID, Kategorie, Beschreibung, Download/Upload-Geschwindigkeit, Datenvolumen, Basispreis sowie alle anwendbaren Aktionen, Sonderpreise (Special Prices) und deren monatliche Preisschritte zurück.',
			parameters: {
				type: 'object',
				properties: {
					search: {
						type: 'string',
						description: 'Ein Suchbegriff wie "MagentaMobil", "Glasfaser", "VDSL", "Smart", "Netflix", etc.',
					},
					category: {
						type: 'string',
						description: 'Filtert nach einer bestimmten Kategorie (z.B. "MOBILE", "FIBER", "DSL", "MAGENTA_TV_OTT", "DEVICE", "DATA", "ALL"). Groß- und Kleinschreibung ist flexibel.',
					},
				},
			},
		},
	},

	{
		type: 'function' as const,
		function: {
			name: 'get_product_details',
			description: 'Liefert detaillierte Informationen zu einem spezifischen Telekom-Produkt anhand seiner ID, wie z.B. alle kompatiblen Zusatzoptionen (Addons) mit Preisen, Sonderpreisen/Aktionen, Verkaufsargumente und Produktfeatures.',
			parameters: {
				type: 'object',
				properties: {
					productId: {
						type: 'string',
						description: 'Die eindeutige ID des Produkts aus der Suche.',
					},
				},
				required: [
					'productId',
				],
			},
		},
	},
	{
		type: 'function' as const,
		function: {
			name: 'get_one_time_credits',
			description: 'Prüft alle aktiven einmaligen Gutschriften (One Time Credits), die für Kunden eingebucht werden können.',
			parameters: {
				type: 'object',
				properties: {
					justification: {
						type: 'string',
						description: 'Optionaler Grund für die Gutschriftenprüfung.',
					},
				},
			},
		},
	},
];

let globalKeyStartIndex = 0;

export async function POST(request: NextRequest) {
	const apiKey = process.env.NVIDIA_NIM_API_KEY;
	const backupKey1 = process.env.NVIDIA_NIM_BACKUP_API_KEY || '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';
	const backupKey2 = process.env.NVIDIA_NIM_BACKUP_API_KEY_2 || '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';
	const model = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.3-70b-instruct';

	const keysPool = Array.from(
		new Set([apiKey, backupKey1, backupKey2].filter(Boolean) as string[])
	);

	if (keysPool.length === 0) {
		return new Response(
			JSON.stringify({
				error: 'Kein gültiger NVIDIA NIM API-Schlüssel konfiguriert.',
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
	}

	const startKeyIndex = globalKeyStartIndex % keysPool.length;
	// Always advance start index for the next request to rotate keys round-robin
	globalKeyStartIndex = (globalKeyStartIndex + 1) % keysPool.length;

	try {
		const rawBody: unknown = await request.json();
		const validation = SalesTipsRequestSchema.safeParse(rawBody);

		if (!validation.success) {
			return new Response(
				JSON.stringify({
					error: 'Ungültiges Anfrageformat',
					details: validation.error.format(),
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		}

		const {
			messages,
			activeCategory,
			basketItems = [
			],
			totalPrice = 0,
			averagePrice,
			dailyPrice,
			totalOneTime,
			totalCredits,
			pricingSteps = [
			],
		} = validation.data;

		// 1. Build context descriptions for the system prompt
		const categoryContextText = activeCategory
			? `Der Verkäufer befindet sich in der Produktkategorie: "${activeCategory}".`
			: 'Der Verkäufer befindet sich auf der Hauptübersicht und hat keine Produktkategorie ausgewählt.';

		let basketContextText = 'Der Verkäufer hat keine Produkte dem Warenkorb hinzugefügt.';
		if (basketItems.length > 0) {
			const itemsDescription = basketItems.map(item => {
				const details: string[] = [
				];
				if (item.businessCase) details.push(`Geschäftsvorfall: ${item.businessCase}`);
				if (item.magentaTV) details.push(`TV-Option: ${item.magentaTV}`);
				if (item.selectedAddons && item.selectedAddons.length > 0) {
					details.push(`Zusatzoptionen: ${item.selectedAddons.join(', ')}`);
				}
				if (item.selectedSpecialPrices && item.selectedSpecialPrices.length > 0) {
					details.push(`Aktionen/Sonderpreise: ${item.selectedSpecialPrices.join(', ')}`);
				}
				const detailsStr = details.length > 0 ? ` [${details.join(' | ')}]` : '';
				return `- ${item.name}${detailsStr}`;
			}).join('\n');

			const pricingStepsStr = pricingSteps && pricingSteps.length > 0
				? `\nZahlungsverlauf nach Monaten:\n${pricingSteps.map(step => `  * ${step}`).join('\n')}`
				: '';

			const formattedAvgPrice = averagePrice !== undefined ? `${averagePrice.toFixed(2).replace('.', ',')} € / Monat` : `${totalPrice.toFixed(2).replace('.', ',')} € / Monat`;
			const formattedDailyPrice = dailyPrice !== undefined ? `${dailyPrice.toFixed(2).replace('.', ',')} € / Tag` : 'n.a.';
			const formattedOneTime = totalOneTime !== undefined ? `${totalOneTime.toFixed(2).replace('.', ',')} €` : 'n.a.';
			const formattedCredits = totalCredits !== undefined ? `${totalCredits.toFixed(2).replace('.', ',')} €` : 'n.a.';

			basketContextText = `Im aktuellen Warenkorb befinden sich folgende Telekom-Produkte:\n${itemsDescription}

FINANZIELLE PREIS-DATEN (VOLLE DETAILS):
- Durchschnittspreis (Ø Monatlich über 24 Monate): ${formattedAvgPrice}
- Tagespreis (Ø am Tag): ${formattedDailyPrice}
- Einmalige Kosten (One Time Costs): ${formattedOneTime}
- Gutschriften/Rabatte (Credits/Guthaben): ${formattedCredits}${pricingStepsStr}`;
		}

		const customerTypeContext = 'Zielgruppe: Privatkunden (B2C).';

		// 2. Define the main system persona with clear instructions on tool use
		const systemPrompt = `Du bist der "SXP Scout" – ein genialer, psychologisch geschulter Top-Closer und die KI-Echtzeitassistenz für Telekom-Verkäufer im direkten Kundengespräch.

KONTEXT DES AKTUELLEN GESPRÄCHS:
- ${categoryContextText}
- ${basketContextText}
- ${customerTypeContext}

SYSTEM-GRENZEN, ANTI-HALLUZINATION & STRENGE WERKZEUG-RICHTLINIEN:
- Du hast Zugriff auf Echtzeit-Werkzeuge (Tools), um Produktdaten im Katalog zu suchen (search_products), Details abzurufen (get_product_details), den Warenkorb einzusehen (get_basket_context) oder Gutschriften zu prüfen (get_one_time_credits).
- WICHTIG: Nutze diese Werkzeuge zwingend, wenn der Verkäufer nach bestimmten Tarifen, Optionen, Geschwindigkeiten oder Preisen fragt, die nicht im aktuellen Warenkorb liegen! Erfinde NIEMALS Tarife, Preise oder Optionen, die nicht im Kontext stehen oder von Werkzeugen zurückgegeben werden.
- WERKZEUG-AUFRUF-REGEL (SEHR WICHTIG): Wenn du dich entscheidest, ein Werkzeug aufzurufen, darfst du KEINEN normalen Antworttext (wie Taktik, Pitch, Next Step) generieren. Generiere AUSSCHLIESSLICH den Werkzeugaufruf selbst. Erst nachdem das Werkzeug ausgeführt wurde und du das Ergebnis erhalten hast, generierst du im nächsten Schritt die endgültige Antwort für den Verkäufer im passenden Format.
- Verwende für den Parameter 'category' in 'search_products' ausschließlich einen dieser Werte: "MOBILE", "FIBER", "DSL", "MAGENTA_TV_OTT", "DEVICE", "DATA", "ALL".

INTENT-ERKENNUNG & PRIORISIERUNG:
Analysiere die Eingabe des Verkäufers blitzschnell nach folgender Priorität:

1. KUNDEN-EINWAND (Priorität 1): Die Eingabe ist ein Kundenzitat (z.B. "Zu teuer", "Brauche ich nicht", "Muss ich überlegen", "Bin mit Vodafone zufrieden").
   -> AKTION: Modus [VERTRIEBS-MODUS]. Beziehe den Einwand zwingend auf die Produkte im Warenkorb/Kategorie.
   
2. DIREKTE PROMPT-FRAGE (Priorität 2): Der Verkäufer fordert dich auf (z.B. "Wie pitche ich MagentaTV?", "Argumente gegen Vodafone").
   -> AKTION: Modus [VERTRIEBS-MODUS] für das genannte Produkt.
   
3. REINE WISSENSFRAGE (Priorität 3): Technische oder prozessuale Fragen OHNE akuten Einwand (z.B. "Was ist Ping?", "Wie lang ist die MVLZ?").
   -> AKTION: Modus [ALLGEMEINER MODUS].

---

[MODUS 1: VERTRIEBS-MODUS (MAXIMALE CONVERSION)]
*Philosophie:* Telekom ist Premium. Verkaufe den WERT (Sorgenfreiheit, Ausfallsicherheit, Qualität). Nutze Verkaufspsychologie (Verlustaversion, Reziprozität, Framing, Einwand-Isolation). Rabatte sind nur der "Beschleuniger", nicht das Hauptargument. Verkaufe keine Zubuchoptionen, sondern Speedups (höhere Tarife), Neubereitstellungen, Cross-Selling - außer es ist explizit nach Zubuchoptionen gefragt.

Antworte IMMER in exakt diesen 3 kurzen Blöcken (Lesezeit < 3 Sekunden, extrem scannbar):

💡 **Taktik:** [Max. 1 Satz: Welcher psychologische Hebel wird genutzt? (z.B. Reframing, Schmerzpunkt, Verkleinerung)]
💬 **Pitch:** ["Wörtliches, psychologisch optimiertes Zitat für den Kunden. Nutze die Sie-Form für den Kunden. Kontere den Einwand charmant aber glasklar."]
🎯 **Next Step:** ["Eine präzise Alternativ- oder Bestätigungsfrage, um den Einwand zu isolieren oder den Sack zuzumachen (z.B. 'Wenn wir das Datenvolumen verdoppeln, passt es dann für Sie?')."]

---

[MODUS 2: ALLGEMEINER MODUS (KONTROLLIERTES WISSEN)]
- Antworte direkt, faktenbasiert, ohne Verkaufs-Framing, ohne Pitch und ohne Abschlussfrage.
- Halte dich extrem kurz: Maximal 2-3 prägnante Bulletpoints oder Sätze.

---

VERHALTENSREGELN & AUSGABEFORMAT:
1. Keine Begrüßung, kein Smalltalk, keine Einleitung ("Hier ist Dein Pitch:"). Starte direkt mit dem Format.
2. Du DUZT DEN VERKÄUFER (in der Taktik). Der 'Pitch' und 'Next Step' müssen jedoch in der Höflichkeitsform (Sie/Ihr) für den Endkunden formuliert sein.
3. Du kannst volle Markdown-Formattierung verwenden`;

		const apiMessages: AgentMessage[] = [
			{
				role: 'system',
				content: systemPrompt,
			},
			...messages.map(msg => ({
				role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
				content: msg.content,
			})),
		];

		const serverAbortController = new AbortController();
		const timeoutId = setTimeout(() => serverAbortController.abort(), STREAM_TIMEOUT_MS);

		// Custom ReadableStream to orchestrate local tool execution loop & status streaming
		const customStream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				const sendTextChunk = (text: string) => {
					const chunkPayload = JSON.stringify({
						choices: [
							{
								delta: {
									content: text,
								},
							},
						],
					});
					controller.enqueue(encoder.encode(`data: ${chunkPayload}\n\n`));
				};

				const sendToolCallStatus = (name: string, status: 'running' | 'done', payload: string) => {
					const chunkPayload = JSON.stringify({
						choices: [
							{
								delta: {
									tool_call_status: {
										name,
										status,
										payload,
									},
								},
							},
						],
					});
					controller.enqueue(encoder.encode(`data: ${chunkPayload}\n\n`));
				};

				try {
					const currentMessages: AgentMessage[] = [
						...apiMessages,
					];
					let loopCount = 0;
					let finalResponseText = '';
					let repetitionDetected = false;

					while (loopCount < MAX_TOOL_LOOPS) {
						if (serverAbortController.signal.aborted) {
							throw new Error('Timeout oder Benutzerabbruch.');
						}

						let responseStream;
						let retryCount = 0;
						const maxRetries = 3;
						const baseDelay = 1000;

						let activeKeyIndex = startKeyIndex;
						let activeRetryToolName: string | null = null;

						while (true) {
							if (serverAbortController.signal.aborted) {
								throw new Error('Timeout oder Benutzerabbruch.');
							}

							try {
								const activeOpenAI = new OpenAI({
									apiKey: keysPool[activeKeyIndex],
									baseURL: 'https://integrate.api.nvidia.com/v1',
								});

								responseStream = await activeOpenAI.chat.completions.create({
									model,
									messages: currentMessages as any,
									tools: TOOL_DEFINITIONS as any,
									tool_choice: 'auto',
									temperature: 0.6,
									max_tokens: 32000,
									max_completion_tokens: 32000,
									stream: true,
								}, {
									signal: serverAbortController.signal,
								});

								// Successfully established connection! If we did retries/rotations, close them with 'done'
								if (activeRetryToolName) {
									sendToolCallStatus(activeRetryToolName, 'done', `${retryCount}/${maxRetries}`);
									activeRetryToolName = null;
								}
								break; // Success, escape retry loop
							} catch (err: unknown) {
								const status = (err as any)?.status || (err as any)?.statusCode;
								const isRateLimit = status === 429;
								const isTransientError = typeof status === 'number' && status >= 500 && status <= 504;

								if ((isRateLimit || isTransientError) && retryCount < maxRetries) {
									retryCount++;

									// If there was a previous retry/rotation that is being replaced, close it
									if (activeRetryToolName) {
										sendToolCallStatus(activeRetryToolName, 'done', `${retryCount - 1}/${maxRetries}`);
									}

									if (isRateLimit && keysPool.length > 1) {
										activeRetryToolName = 'key_rotation';
										const prevIndex = activeKeyIndex;
										activeKeyIndex = (activeKeyIndex + 1) % keysPool.length;
										console.warn(`429 Rate Limit encountered using key index ${prevIndex}. Rotating key to index ${activeKeyIndex}...`);
										
										// Inform client via tool call status block
										sendToolCallStatus('key_rotation', 'running', `${retryCount}/${maxRetries}`);
									} else {
										activeRetryToolName = `api_retry_${status}`;
										const delay = baseDelay * Math.pow(2, retryCount - 1) + Math.random() * 300;
										console.warn(`completions.create failed with status ${status}. Retrying in ${delay.toFixed(0)}ms... (Attempt ${retryCount}/${maxRetries})`);
										
										// Inform client via tool call status block
										sendToolCallStatus(`api_retry_${status}`, 'running', `${retryCount}/${maxRetries}`);
										
										await new Promise(resolve => setTimeout(resolve, delay));
									}
									continue;
								}
								throw err;
							}
						}

						let content = '';
						const toolCalls: any[] = [];

						for await (const chunk of responseStream) {
							if (serverAbortController.signal.aborted) {
								break;
							}

							const choice = chunk.choices[0];
							if (!choice) continue;

							const delta = choice.delta;
							if (!delta) continue;

							// Stream text content chunks to the client immediately in real-time
							if (delta.content) {
								let chunkText = delta.content;
								if (content === '') {
									// Remove any leading BOM (Byte Order Mark) or replacement character (U+FFFD)
									chunkText = chunkText.replace(/^[\ufeff\ufffd\u0000]+/, '');
								}
								if (chunkText) {
									content += chunkText;
									sendTextChunk(chunkText);

									if (detectRepetition(content)) {
										console.warn('AI repetition loop detected! Terminating stream gracefully.');
										repetitionDetected = true;
										break;
									}
								}
							}

							// Accumulate tool calls from the stream chunk-by-chunk
							if (delta.tool_calls) {
								for (const tc of delta.tool_calls) {
									const index = tc.index;
									if (!toolCalls[index]) {
										toolCalls[index] = {
											id: tc.id || '',
											type: 'function',
											function: {
												name: '',
												arguments: '',
											},
										};
									}
									if (tc.id) {
										toolCalls[index].id = tc.id;
									}
									if (tc.function?.name) {
										toolCalls[index].function.name += tc.function.name;
									}
									if (tc.function?.arguments) {
										toolCalls[index].function.arguments += tc.function.arguments;
									}
								}
							}
						}

						if (repetitionDetected) {
							sendTextChunk('\n\n*⚠️ [Generierung abgebrochen: Eine Wiederholungsschleife wurde im KI-Ausgabestream erkannt. Die Antwort wurde zum Schutz vor Endlosschleifen gestoppt. Bitte verfeinern Sie Ihre Frage oder passen Sie die Produkte im Warenkorb an.]*');
							finalResponseText = content;
							break;
						}

						// Filter out any undefined or partially initialized tool calls
						const activeToolCalls = toolCalls.filter(tc => tc && (tc.id || tc.function?.name));

						if (activeToolCalls.length > 0) {
							// Execute tool calls in parallel to preserve extremely low latency
							const toolExecutionPromises = activeToolCalls.map(async (toolCall) => {
								const {
									name: toolName, arguments: rawArgs,
								} = toolCall.function;
								console.log(`Executing Tool: ${toolName} with Args: ${rawArgs}`);

								let resultString: string;
								let parsedArgs: unknown = {
								};
								try {
									parsedArgs = JSON.parse(rawArgs);
								}
								catch (e) {
									console.error(`Failed to parse arguments for tool ${toolName}:`, rawArgs, e);
								}

								if (toolName === 'get_basket_context') {
									sendToolCallStatus('get_basket_context', 'running', '');
									resultString = JSON.stringify({
										basketContext: basketContextText,
									});
									sendToolCallStatus('get_basket_context', 'done', '');
								}
								else if (toolName === 'search_products') {
									const argValidation = SearchProductsArgsSchema.safeParse(parsedArgs);
									const search = argValidation.success ? argValidation.data.search || '' : '';
									let category = argValidation.success ? argValidation.data.category || 'ALL' : 'ALL';

									// Safely normalize category to uppercase and map common variants
									category = category.trim().toUpperCase();
									if (category === 'FIBER_OPTIC' || category === 'GLASFASER') category = 'FIBER';
									if (category === 'TV' || category === 'MAGENTATV') category = 'MAGENTA_TV_OTT';

									// Verify if normalized category matches active categories in DB
									const validCategories = [
										'MOBILE',
										'FIBER',
										'DSL',
										'MAGENTA_TV_OTT',
										'DEVICE',
										'DATA',
									];
									const isCategoryValid = validCategories.includes(category);

									const queryDisplay = search || (isCategoryValid ? category : 'ALL');
									sendToolCallStatus('search_products', 'running', queryDisplay);

									const searchLower = search.toLowerCase().trim();

									// 1. Correct common typos in brand/product names
									const correctedSearch = searchLower
										.replace(/magent[ae]?zuh[au]*se/g, 'magentazuhause')
										.replace(/magent[ae]?mobil/g, 'magentamobil')
										.replace(/magent[ae]?tv/g, 'magentatv')
										.replace(/glasfas[er]*/g, 'glasfaser')
										.replace(/tarif[fe]*/g, 'tarif')
										.replace(/stream[ing]*/g, 'streaming')
										.replace(/internet[t]*/g, 'internet');

									// 2. Detect intents & broad categories from abstract terms, typos or product families
									const targetCategories: string[] = [];
									const additionalSearchTerms: string[] = [];

									// Fixed-line (DSL/Fiber) detection
									if (
										/zuhause|dsl|fiber|glasfaser|festnetz|broadband|giga|gigabit|leitung|anschluss|vectoring|copper|kupfer|wlan|router/i.test(correctedSearch) ||
										category === 'DSL' || category === 'FIBER'
									) {
										targetCategories.push('DSL', 'FIBER');
										additionalSearchTerms.push('MagentaZuhause');
									}

									// Mobile detection
									if (
										/mobil|handy|sim|lte|5g|data|daten|volume|smartphone|unterwegs|flat|young|prepaid|roam/i.test(correctedSearch) ||
										category === 'MOBILE'
									) {
										targetCategories.push('MOBILE');
										additionalSearchTerms.push('MagentaMobil');
									}

									// TV / Streaming detection
									if (
										/tv|television|stream|streaming|netflix|rtl|disney|fernseh|sender|hd|smart|entertain|ott/i.test(correctedSearch) ||
										category === 'MAGENTA_TV_OTT'
									) {
										targetCategories.push('MAGENTA_TV_OTT');
										additionalSearchTerms.push('MagentaTV');
									}

									// Device / Hardware detection
									if (
										/device|gerät|hardware|router|modem|phone|telefon|fritz|speedport/i.test(correctedSearch) ||
										category === 'DEVICE'
									) {
										targetCategories.push('DEVICE');
									}

									// Determine if the search query is simply a synonym of the category itself
									const isCategorySynonym =
										(category === 'FIBER' && [
											'glasfaser',
											'fiber',
											'glasfaser-tarife',
											'glasfaser tarife',
											'glasfasertarife',
										].includes(searchLower)) ||
										(category === 'DSL' && [
											'dsl',
											'kupfer',
											'dsl-tarife',
											'dsl tarife',
											'dsltarife',
											'kupfer-tarife',
											'kupfer tarife',
										].includes(searchLower)) ||
										(category === 'MOBILE' && [
											'mobil',
											'mobile',
											'mobilfunk',
											'handy',
											'smartphone',
											'mobilfunktarife',
											'tarife',
										].includes(searchLower)) ||
										(category === 'MAGENTA_TV_OTT' && [
											'tv',
											'magentatv',
											'television',
											'streaming',
											'fernsehen',
										].includes(searchLower)) ||
										(category === 'DEVICE' && [
											'device',
											'gerät',
											'router',
											'hardware',
											'modem',
											'handys',
											'smartphones',
										].includes(searchLower));

									const orClauses: Prisma.ProductWhereInput[] = [];

									// Handle specific tariff tier queries (e.g., "MagentaZuhause M", "Mobil S") to pull the entire family
									const tariffTierMatch = correctedSearch.match(/\b(s|m|l|xl|xxl|giga)\b/i);

									if (tariffTierMatch && targetCategories.length > 0) {
										// Match the exact/corrected tier
										orClauses.push({
											name: {
												contains: correctedSearch,
												mode: 'insensitive',
											},
										});
										// ALSO include the family name so we pull other sizes/tiers (e.g. S, L, XL) for upselling!
										additionalSearchTerms.forEach(term => {
											orClauses.push({
												name: {
													contains: term,
													mode: 'insensitive',
												},
											});
										});
									} else if (correctedSearch && !isCategorySynonym) {
										// Standard keyword search
										orClauses.push({
											name: {
												contains: correctedSearch,
												mode: 'insensitive',
											},
										});
										orClauses.push({
											description: {
												contains: correctedSearch,
												mode: 'insensitive',
											},
										});
										orClauses.push({
											features: {
												contains: correctedSearch,
												mode: 'insensitive',
											},
										});
										orClauses.push({
											targetGroups: {
												contains: correctedSearch,
												mode: 'insensitive',
											},
										});

										// Expand standard keyword search to include associated product families
										additionalSearchTerms.forEach(term => {
											orClauses.push({
												name: {
													contains: term,
													mode: 'insensitive',
												},
											});
										});
									}

									const whereClause: Prisma.ProductWhereInput = {
										isActive: true,
									};

									if (orClauses.length > 0) {
										whereClause.OR = orClauses;
									}

									// Apply category filters
									if (targetCategories.length > 0) {
										whereClause.category = {
											in: targetCategories as any,
										};
									} else if (isCategoryValid) {
										whereClause.category = category as any;
									}

									let products = await prisma.product.findMany({
										where: whereClause,
										select: {
											id: true,
											name: true,
											description: true,
											category: true,
											basePrice: true,
											dataVolume: true,
											downloadSpeed: true,
											uploadSpeed: true,
											contractDuration: true,
											features: true,
											targetGroups: true,
											specialPrices: {
												where: {
													isActive: true,
												},
												select: {
													id: true,
													name: true,
													description: true,
													discountTarget: true,
													discountType: true,
													requiresNewActivation: true,
													requiresMove: true,
													tiers: {
														orderBy: {
															fromMonth: 'asc',
														},
														select: {
															price: true,
															fromMonth: true,
															toMonth: true,
														},
													},
												},
											},
										},
										orderBy: {
											priority: 'desc',
										},
										take: 8,
									});


									// Fallback guardrail: If 0 products found but we detected broad categories, return top products from those categories
									if (products.length === 0 && targetCategories.length > 0) {
										products = await prisma.product.findMany({
											where: {
												isActive: true,
												category: {
													in: targetCategories as any,
												},
											},
											select: {
												id: true,
												name: true,
												description: true,
												category: true,
												basePrice: true,
												dataVolume: true,
												downloadSpeed: true,
												uploadSpeed: true,
												contractDuration: true,
												features: true,
												targetGroups: true,
												specialPrices: {
													where: {
														isActive: true,
													},
													select: {
														id: true,
														name: true,
														description: true,
														discountTarget: true,
														discountType: true,
														requiresNewActivation: true,
														requiresMove: true,
														tiers: {
															orderBy: {
																fromMonth: 'asc',
															},
															select: {
																price: true,
																fromMonth: true,
																toMonth: true,
															},
														},
													},
												},
											},
											orderBy: {
												priority: 'desc',
											},
											take: 8,
										});
									}


									resultString = JSON.stringify({
										products,
									});
									sendToolCallStatus('search_products', 'done', queryDisplay);
								}
								else if (toolName === 'get_product_details') {
									const argValidation = GetProductDetailsArgsSchema.safeParse(parsedArgs);
									if (!argValidation.success) {
										resultString = JSON.stringify({
											error: 'Produkt-ID fehlt oder ist ungültig.',
										});
									}
									else {
										const productId = argValidation.data.productId;
										sendToolCallStatus('get_product_details', 'running', productId);

										const product = await prisma.product.findUnique({
											where: {
												id: productId,
											},
											include: {
												specialPrices: {
													where: {
														isActive: true,
													},
													include: {
														tiers: {
															orderBy: {
																fromMonth: 'asc',
															},
														},
													},
												},
												compatibleAddons: {
													where: {
														isActive: true,
													},
													include: {
														tiers: true,
													},
												},
												salesArguments: {
													where: {
														isActive: true,
													},
													orderBy: {
														sortOrder: 'asc',
													},
												},
											},
										});

										if (!product) {
											resultString = JSON.stringify({
												error: `Produkt mit ID ${productId} nicht gefunden.`,
											});
										}
										else {
											resultString = JSON.stringify({
												product,
											});
										}
										sendToolCallStatus('get_product_details', 'done', product?.name || productId);
									}
								}
								else if (toolName === 'get_one_time_credits') {
									sendToolCallStatus('get_one_time_credits', 'running', '');
									const credits = await prisma.oneTimeCredit.findMany({
										where: {
											isActive: true,
										},
										orderBy: {
											createdAt: 'desc',
										},
									});
									resultString = JSON.stringify({
										credits,
									});
									sendToolCallStatus('get_one_time_credits', 'done', '');
								}
								else {
									resultString = JSON.stringify({
										error: `Werkzeug ${toolName} ist unbekannt.`,
									});
								}

								return {
									role: 'tool' as const,
									tool_call_id: toolCall.id,
									name: toolName,
									content: resultString,
								};
							});

							const toolResults = await Promise.all(toolExecutionPromises);

							// Push the assistant message specifying tool calls
							currentMessages.push({
								role: 'assistant',
								content: content || null,
								tool_calls: activeToolCalls,
							});

							// Push the tool results
							currentMessages.push(...toolResults);
							loopCount++;
						}
						else {
							finalResponseText = content;
							break;
						}
					}

					if (loopCount >= MAX_TOOL_LOOPS && !finalResponseText) {
						throw new Error('Sicherheitsschleife unterbrochen: Zu viele verschachtelte Tool-Aufrufe.');
					}

					controller.enqueue(encoder.encode('data: [DONE]\n\n'));
					controller.close();

				}
				catch (err: unknown) {
					console.error('Stream controller execution error:', err);
					const errMsg = err instanceof Error ? err.message : 'Unerwarteter Fehler im Agenten-Verlauf.';
					sendTextChunk(`\n\n**⚠️ Fehler beim Laden:** ${errMsg}`);
					controller.close();
				}
				finally {
					clearTimeout(timeoutId);
				}
			},
		});

		return new Response(customStream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache, no-transform',
				'Connection': 'keep-alive',
			},
		});

	}
	catch (error: unknown) {
		console.error('Sales tips stream error:', error);

		let message = 'Interner Server-Fehler beim Streamen der Sales Tipps.';
		if (error instanceof Error && error.name === 'AbortError') {
			message = 'Die Anfrage an die KI hat das Zeitlimit überschritten.';
		}

		return new Response(
			JSON.stringify({
				error: message,
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
	}
}

