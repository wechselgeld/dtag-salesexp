const { dotenv } = require('dotenv');
require('dotenv').config();

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const systemPrompt = `Du bist der "Telekom Sales Copilot" – ein genialer, psychologisch geschulter Top-Closer und die KI-Echtzeitassistenz für Telekom-Verkäufer im direkten Kundengespräch.

KONTEXT DES AKTUELLEN GESPRÄCHS:
- Der Verkäufer befindet sich auf der Hauptübersicht und hat keine Produktkategorie ausgewählt.
- Der Verkäufer hat keine Produkte dem Warenkorb hinzugefügt.
- Zielgruppe: Privatkunden (B2C).

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
*Philosophie:* Telekom ist Premium. Verkaufe den WERT (Sorgenfreiheit, Ausfallsicherheit, Qualität). Nutze Verkaufspsychologie (Verlustaversion, Reziprozität, Framing, Einwand-Isolation). Rabatte sind nur der "Beschleuniger", nicht das Hauptargument.

Antworte IMMER in exakt diesen 3 kurzen Blöcken (Lesezeit < 3 Sekunden, extrem scannbar):

💡 **Taktik:** [Max. 1 Satz: Welcher psychologische Hebel wird genutzt? (z.B. Reframing, Schmerzpunkt, Verkleinerung)]
💬 **Pitch:** ["Wörtliches, psychologisch optimiertes Zitat für den Kunden. Nutze die Sie-Form für den Kunden. Kontere den Einwand charmant aber glasklar."]
🎯 **Next Step:** ["Eine präzise Alternativ- oder Bestätigungsfrage, um den Einwand to isolieren oder den Sack zuzumachen (z.B. 'Wenn wir das Datenvolumen verdoppeln, passt es dann für Sie?')."]

---

[MODUS 2: ALLGEMEINER MODUS (KONTROLLIERTES WISSEN)]
- Antworte direkt, faktenbasiert, ohne Verkaufs-Framing, ohne Pitch und ohne Abschlussfrage.
- Halte dich extrem kurz: Maximal 2-3 prägnante Bulletpoints oder Sätze.

---

VERHALTENSREGELN & AUSGABEFORMAT:
1. Keine Begrüßung, kein Smalltalk, keine Einleitung ("Hier ist dein Pitch:"). Starte direkt mit dem Format.
2. Du duzt den Verkäufer (in der Taktik). Der 'Pitch' und 'Next Step' müssen jedoch in der Höflichkeitsform (Sie/Ihr) für den Endkunden formuliert sein.
3. FORMATIERUNG: Nutze NUR **fettgedruckte Worte**, einfache Aufzählungszeichen (-) und Emojis. KEINE Code-Blöcke (\`\`\`), keine Markdown-Übersichten (###).`;

const TOOL_DEFINITIONS = [
	{
		type: 'function',
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
		type: 'function',
		function: {
			name: 'search_products',
			description: 'Sucht im Telekom-Produktkatalog nach Tarifen, Optionen oder Geräten. Gibt Name, ID, Kategorie, Beschreibung, Download/Upload-Geschwindigkeit, Datenvolumen und Basispreis zurück.',
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
		type: 'function',
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
				required: ['productId'],
			},
		},
	},
	{
		type: 'function',
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

async function run() {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Was kann ich dem Kunden anbieten, wenn er aktuell DSL nutzt?' }
    ];

    try {
        console.log("--- TURN 1 ---");
        let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages,
                tools: TOOL_DEFINITIONS,
                tool_choice: 'auto',
                temperature: 0.7,
                max_tokens: 1200,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("GROQ ERROR HTTP TURN 1:", response.status);
            console.error(errText);
            return;
        }

        const data = await response.json();
        const choice = data.choices[0];
        const message = choice.message;
        console.log("Turn 1 assistant message:", JSON.stringify(message, null, 2));

        // Push the assistant message
        messages.push({
            role: 'assistant',
            content: message.content || null,
            tool_calls: message.tool_calls
        });

        // Simulate tool execution for search_products (category: FIBER)
        if (message.tool_calls && message.tool_calls.length > 0) {
            console.log("\n--- SIMULATING TOOL EXECUTION ---");
            const toolCall = message.tool_calls[0];
            const result = {
                products: [
                    {
                        id: "fiber-100",
                        name: "Glasfaser 100",
                        description: "Giga-schnelles Glasfaser-Internet",
                        category: "FIBER",
                        basePrice: 44.95,
                        dataVolume: "Flatrate",
                        downloadSpeed: "100 MBit/s",
                        uploadSpeed: "50 MBit/s"
                    },
                    {
                        id: "fiber-250",
                        name: "Glasfaser 250",
                        description: "Highspeed Glasfaser-Tarif für Familien",
                        category: "FIBER",
                        basePrice: 49.95,
                        dataVolume: "Flatrate",
                        downloadSpeed: "250 MBit/s",
                        uploadSpeed: "100 MBit/s"
                    }
                ]
            };

            messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                name: toolCall.function.name,
                content: JSON.stringify(result)
            });

            console.log("\n--- TURN 2 ---");
            console.log("Sending messages to Groq:", JSON.stringify(messages, null, 2));

            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model,
                    messages,
                    tools: TOOL_DEFINITIONS,
                    tool_choice: 'auto',
                    temperature: 0.7,
                    max_tokens: 1200,
                    stream: false,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("GROQ ERROR HTTP TURN 2:", response.status);
                console.error(errText);
                return;
            }

            const data2 = await response.json();
            console.log("Turn 2 Response SUCCESS:", JSON.stringify(data2, null, 2));
        } else {
            console.log("No tool calls generated in Turn 1.");
        }
    } catch (e) {
        console.error("Request failed:", e);
    }
}

run();
