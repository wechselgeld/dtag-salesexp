export interface ChangelogItem {
	q: string; // Action category e.g., 'Hinzugefügt', 'Geändert', 'Entfernt'
	a: string; // Description text
}

export interface ChangelogRelease {
	id: string;          // Unique ID
	title: string;       // User-friendly date, e.g., '22. Mai 2026'
	isMajor: boolean;    // If true, triggers the "What's New" popup modal for returning users
	featuredKey?: string; // Optional feature key (like 'sales-tips') that can be triggered/opened directly
	items: ChangelogItem[];
}

export const CHANGELOG_DATA: ChangelogRelease[] = [
	{
		id: 'june-07-26',
		title: '7. Juni 2026',
		isMajor: true,
		featuredKey: 'sales-tips',
		items: [
			{
				q: 'Hinzugefügt',
				a: 'Sales Tipps mit KI: Du erhältst nun im Gespräch in Echtzeit maßgeschneiderte Verkaufsargumente und Unterstützung bei der Einwandbehandlung basierend auf Deinem aktuellen Warenkorb!',
			},
			{
				q: 'Hinzugefügt',
				a: 'Neues Changelog-System: Verpasse nie wieder tolle neue Funktionen. Wichtige Neuerungen werden Dir nun direkt beim Start der App vorgestellt.',
			},
		],
	},
	{
		id: 'may-22-26',
		title: '22. Mai 2026',
		isMajor: false,
		items: [
			{
				q: 'Hinzugefügt',
				a: 'Vergleichsmodus (Comparison Mode) für Warenkorbkonfigurationen hinzugefügt, damit Du verschiedene Tarife speichern und schnell vergleichen kannst; PINs & Passwörter zu Accounts verpflichtend gemacht; ...und noch viel mehr',
			},
			{
				q: 'Geändert',
				a: 'Produktkarten und -Konfiguration sind nun für kleinere Bildschirme optimiert; Fehlerlog hinzugefügt, damit wir die Anwendung stetig und schneller verbessern können; Das Design einiger Elemente wurde verbessert',
			},
			{
				q: 'Entfernt',
				a: 'Es wurde nichts entfernt',
			},
		],
	},
	{
		id: 'may-16-26',
		title: '16. Mai 2026',
		isMajor: false,
		items: [
			{
				q: 'Hinzugefügt',
				a: 'Du kannst Dich nun über Passkeys anmelden; Im Admin-Bereich gibt es nun eine Standort- und Team-basierte Filterung für Sales-Sessions; Vor- und Nachnamen werden bei der Registrierung nun automatisch korrekt großgeschrieben',
			},
			{
				q: 'Geändert',
				a: 'Bessere Übersicht der Einmalkosten im Warenkorb; Erhebliche Optimierungen des Systems',
			},
			{
				q: 'Entfernt',
				a: 'Es wurde nichts entfernt',
			},
		],
	},
	{
		id: 'march-22-25',
		title: '22. März 2025',
		isMajor: false,
		items: [
			{
				q: 'Hinzugefügt',
				a: 'Jeder Preis kann nun auf einen eigenen historischen Zustand gesetzt werden - dies wird im PDF-Angebot als Bestandstarif widergespiegelt; Es gibt nun einen Tarif-Preisvergleich',
			},
			{
				q: 'Geändert',
				a: 'Der Server ist nun viel leistungsstärker; Es wurden viele Datenbank-Verbesserungen geschrieben; Neuerungen können ab sofort viel schneller bereitgestellt werden',
			},
			{
				q: 'Entfernt',
				a: 'Es wurde nichts entfernt',
			},
		],
	},
	{
		id: 'march-18-25',
		title: '18. März 2025',
		isMajor: false,
		items: [
			{
				q: 'Hinzugefügt',
				a: 'Es wurde nichts hinzugefügt',
			},
			{
				q: 'Geändert',
				a: 'Der Offer Generator (PDF-Export) wurde überarbeitet und optimiert.',
			},
			{
				q: 'Entfernt',
				a: 'Es wurde nichts entfernt',
			},
		],
	},
	{
		id: 'march-17-25',
		title: '17. März 2025',
		isMajor: false,
		items: [
			{
				q: 'Hinzugefügt',
				a: 'Zu Mobilfunk-Tarifen können nun Smartphones hinzugebucht werden; Es gibt nun ein Feedback-Modal; Es gibt nun einen Changelog',
			},
			{
				q: 'Geändert',
				a: 'Die Ansicht der Zubuchoptionen (UI) wurde optimiert; Die Preiskachel "Regulär" zeigt nun immer den korrekten Preis an; Es wurden schwerwiegende Performanceprobleme behoben; Die Sonderpreis- und Optionslogik wurde übearbeitet; Die Suchleiste wurde überarbeitet (UI)',
			},
			{
				q: 'Entfernt',
				a: 'Es wurde nichts entfernt',
			},
		],
	},
];
