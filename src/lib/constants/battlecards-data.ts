import {
	WifiOff,
	Unplug,
	PhoneOff,
	DollarSign,
	Construction,
	Star,
	Trophy,
	Wifi,
	Headphones,
	Shield,
	Zap,
	MapPinOff,
	SignalZero,
	TrendingDown,
	Signal,
	Clock,
	Smartphone,
	UserX,
	Lock,
	Ban,
	EyeOff,
	Scissors,
	Building2,
	CheckCircle2,
	AlertTriangle,
} from 'lucide-react';
import type {
	Competitor, Objection,
} from '@/types/battlecards';

export const COMPETITORS: Competitor[] = [
	{
		id: 'vodafone',
		name: 'Vodafone',
		color: '#e60000',
		logoText: 'VF',
		weaknesses: [
			{
				icon: WifiOff,
				title: 'Kabel-Sharing (Shared Medium)',
				detail:
					'Bandbreite bricht abends massiv ein, wenn die Nachbarn streamen. Bis zu 500 Haushalte teilen sich ein Koax-Segment.',
			},
			{
				icon: Unplug,
				title: 'Hohe Fehlerraten & Abbrüche',
				detail:
					'DOCSIS 3.1 Probleme führen abends zur Stoßzeit zu extremen Latenzen und Paketverlusten (Gaming/Homeoffice ruckelt).',
			},
			{
				icon: PhoneOff,
				title: 'Service im Ausland',
				detail:
					'Kundenservice teils nach Indien/Rumänien ausgelagert. Sprachbarrieren und lange Wartezeiten bei Störungen.',
			},
			{
				icon: DollarSign,
				title: 'Versteckte Preiserhöhungen',
				detail:
					'Nach der Erstvertragslaufzeit steigen die Preise oft deutlich und intransparent – Lockvogelangebote werden schnell teuer.',
			},
			{
				icon: Construction,
				title: 'Kabelnetz statt echte Glasfaser (FTTH)',
				detail:
					'Vodafone setzt primär auf ihr Koax-Kabelnetz (Shared Medium) statt echte Glasfaser (FTTH) direkt ins Haus zu legen. Der Ausbau läuft schleppend.',
			},
		],
		telekomArguments: [
			{
				icon: Star,
				title: '💛 Emotionaler Marker: Zuverlässigkeit (Das Autobahn-Bild)',
				detail:
					'„Ich verstehe, dass Sie bisher bei Vodafone sind. Genau das ist aber der Punkt bei Kabel-Internet: Stellen Sie sich das Kabelnetz wie eine Autobahn vor. Tagsüber haben Sie freie Fahrt, aber abends um 20 Uhr wollen alle nach Hause – Stau. Bei Vodafone teilen Sie sich die Leitung mit der Nachbarschaft, bei der Telekom haben Sie Ihre eigene Spur. So surfen Sie abends ohne Einbrüche. Nutzen Sie das Internet abends eher für Netflix oder für Videocalls?“',
			},
			{
				icon: Trophy,
				title: '15× Connect-Testsieger in Folge',
				detail:
					'„Absolut richtig, die Netzqualität muss stimmen. Genau deshalb gewinnen wir seit 15 Jahren in Folge den connect Netztest als überragend, während Vodafone auf Platz 2 zurückbleibt. Bei uns zahlen Sie rund 30 Cent mehr am Tag für die stabilste Verbindung Deutschlands. Richten wir den Anschluss direkt auf Ihren Namen ein – nutzen wir Ihre aktuelle Adresse oder haben Sie eine abweichende?“',
				source: 'connect Netztest 11/2025',
			},
			{
				icon: Wifi,
				title: 'Glasfaser statt Kabel-Sharing',
				detail:
					'„Das verstehe ich vollkommen, man will die volle Geschwindigkeit. Genau das ist der Vorteil unserer Glasfaser: Es ist eine eigene Leitung direkt in Ihre Wohnung, kein geteiltes Kabel. So kommt Ihre gebuchte Leistung ohne Einbrüche an. Welche Schreibweise ist richtig bei Ihrem Nachnamen...?“',
			},
			{
				icon: Headphones,
				title: 'Service aus Deutschland – persönlich',
				detail:
					'„Absolut richtig, guter Service spart Zeit. Genau deshalb bietet die Telekom echten Support aus deutschen Standorten und 500 Shops vor Ort. Wir lösen Ihr Problem direkt beim ersten Anruf, ohne Warteschleifen im Ausland. Wie lautet Ihre korrekte E-Mail-Adresse für unsere Service-Vormerkung?“',
			},
			{
				icon: Shield,
				title: 'Eigenes Netz = schnellere Hilfe',
				detail:
					'„Das verstehe ich vollkommen, ein Ausfall ist extrem ärgerlich. Genau deshalb ist es entscheidend, direkt beim Netzeigentümer zu sein. Bei einer Störung schicken wir sofort eigene Techniker los, während Vodafone Dritte beauftragen muss. Lassen Sie uns Ihren Anschluss direkt zukunftssicher auf Telekom-Technik umstellen. Wie lautet Ihr Geburtsdatum?“',
			},
			{
				icon: Zap,
				title: '30 Mrd. € Glasfaser-Investment bis 2030',
				detail:
					'„Absolut richtig, das Internet muss zukunftssicher sein. Genau deshalb investieren wir 30 Milliarden Euro in echte Glasfaser bis in die Wohnung, während Vodafone auf alte TV-Kabel setzt. Wir machen das jetzt kurz für Sie fertig, damit Sie direkt vom Ausbau profitieren. Welche Hausnummer hat Ihre Adresse?“',
				source: 'Telekom Geschäftsbericht 2025',
			},
		],
	},
	{
		id: 'o2',
		name: 'o2 / Telefónica',
		color: '#0090d9',
		logoText: 'O2',
		weaknesses: [
			{
				icon: MapPinOff,
				title: 'Funklöcher auf dem Land',
				detail:
					'Netzabdeckung ländlich deutlich schwächer als Telekom. Große Versorgungslücken außerhalb von Städten, auf Landstraßen und Zügen.',
			},
			{
				icon: SignalZero,
				title: '5G weit hinterher',
				detail:
					'Telekom hat 3× so viele 5G-Standorte. o2 bietet in vielen ländlichen Regionen noch gar kein 5G und deutlich geringere Bandbreiten.',
			},
			{
				icon: Unplug,
				title: 'Kein eigenes Festnetz',
				detail:
					'o2 nutzt Telekom-Leitungen als Reseller. Kein direkter Zugriff und keine eigene Netzkontrolle bei Festnetz-Störungen.',
			},
			{
				icon: TrendingDown,
				title: 'Dauerhaft Platz 3',
				detail:
					'In jedem großen Netztest (connect, CHIP, Stiftung Warentest) schneidet o2 im Mobilfunk und Festnetz seit Jahren als Letzter ab.',
			},
			{
				icon: Construction,
				title: 'E-Plus-Altlasten',
				detail:
					'Die E-Plus-Integration verursacht teilweise noch technische Probleme und Frequenzengpässe im Netz.',
			},
		],
		telekomArguments: [
			{
				icon: Star,
				title: '💛 Emotionaler Marker: Auf dem Land versorgt',
				detail:
					'„Absolut richtig, in der Stadt läuft das o2-Netz gut. Genau das ist aber das Problem, wenn Sie aufs Land fahren oder reisen. Mit o2 haben Sie dort oft Funklöcher, mit der Telekom sind Sie auch auf der Landstraße oder im Zug erreichbar. Sind Sie beruflich oder privat viel außerhalb der Stadt unterwegs?“',
			},
			{
				icon: Signal,
				title: '99% LTE + größtes 5G-Netz',
				detail:
					'„Das verstehe ich völlig, man will überall Netz haben. Genau deshalb betreiben wir das größte Mobilfunknetz Deutschlands mit 99% Abdeckung. Bei uns zahlen Sie die 30 Cent mehr am Tag für die Gewissheit, überall erreichbar zu sein. Lassen Sie uns das Angebot jetzt direkt sichern. Welche Rufnummer möchten Sie mitnehmen?“',
				source: 'Bundesnetzagentur',
			},
			{
				icon: Trophy,
				title: 'Dauerhaft Platz 1 vs. Platz 3',
				detail:
					'„Absolut richtig, der Preis ist wichtig. Genau das ist aber der Punkt: Warum für fast dasselbe Geld den Drittplatzierten wählen? Die Telekom gewinnt jeden Zuverlässigkeitstest, während o2 dauerhaft auf Platz 3 landet. Ich richte Ihnen das jetzt direkt ein. Wie lautet Ihre E-Mail-Adresse?“',
				source: 'connect Netztest 11/2025',
			},
			{
				icon: Zap,
				title: 'Original-Leitung statt Reseller (Warteschlangen-Effekt)',
				detail:
					'„Ich verstehe, dass o2 günstige Preise anbietet. Genau hier liegt aber der Unterschied bei Störungen. o2 mietet unsere Leitungen an. Bei Störungen hat ein Telekom-Direktkunde immer Vorrang bei der Entstörung. Als o2-Kunde stehen Sie in der Warteschlange ganz hinten. Wollen Sie die Leitung direkt aus erster Hand beziehen?“',
			},
			{
				icon: Headphones,
				title: 'Premium-Service vs. Discount-Betreuung',
				detail:
					'„Das verstehe ich vollkommen, man will sich nicht mit Chatbots herumärgern. Genau deshalb bietet die Telekom echten Support am Telefon und vor Ort in 500+ Shops. Bei o2 landen Sie meist bei digitalen Assistenten. Wie schreibt sich Ihr Nachname für die Bestätigung?“',
			},
		],
	},
	{
		id: '1und1',
		name: '1&1',
		color: '#003c78',
		logoText: '1&1',
		weaknesses: [
			{
				icon: Unplug,
				title: 'Reiner Reseller im Festnetz',
				detail:
					'Kein eigenes Festnetz. 1&1 mietet Telekom-Leitungen und hat keinen direkten Netzzugriff bei Störungen.',
			},
			{
				icon: Clock,
				title: 'Wochen Wartezeit',
				detail:
					'Berüchtigt für wochenlange Bereitstellungszeiten (4 bis 8 Wochen) bei Neuanschlüssen und Technikerterminen.',
			},
			{
				icon: SignalZero,
				title: 'Netzwechsel & Akku-Drain durch Roaming',
				detail:
					'Das Mobilfunknetz ist extrem klein. Außerhalb von Städten schaltet das Handy ständig auf Vodafone-Roaming um. Das führt zu Verbindungsabbrüchen und hohem Akkuverbrauch.',
			},
			{
				icon: PhoneOff,
				title: 'Kein direkter Support',
				detail:
					'Bei Störungen muss 1&1 erst den Netzbetreiber kontaktieren. Das verzögert jeden Servicefall, Kunden warten doppelt.',
			},
			{
				icon: Smartphone,
				title: 'Schwache Hardware',
				detail:
					'Sehr begrenzte Router-Auswahl und eingeschränkte Eigenleistung bei Endgeräten im Vergleich zu Telekom-Mietgeräten.',
			},
		],
		telekomArguments: [
			{
				icon: Headphones,
				title: '💛 Emotionaler Marker: Der Untermieter-Effekt',
				detail:
					'„Absolut richtig, 1&1 macht viel Werbung mit Service. Genau das ist aber der Punkt: 1&1 besitzt kein eigenes Festnetz und ist nur Untermieter. Wenn Ihre Leitung gestört ist, darf 1&1 sie nicht reparieren, sondern muss uns kontaktieren. Das dauert Tage. Sparen Sie sich den Mittelsmann und gehen Sie direkt zum Netzeigentümer. Ist Ihr aktueller Vertrag schon gekündigt?“',
			},
			{
				icon: Shield,
				title: 'Eigenes Netz = keine Mittelmänner',
				detail:
					'„Das verstehe ich völlig, man will im Ernstfall schnelle Hilfe. Genau deshalb betreiben wir unser eigenes Netz und schicken unsere eigenen Techniker direkt zu Ihnen. Bei uns zahlen Sie rund 30 Cent mehr am Tag für die Gewissheit, dass Hilfe sofort kommt. Richten wir den Anschluss direkt ein. Wie lautet Ihr Geburtsdatum?“',
			},
			{
				icon: Zap,
				title: 'Bereitstellung in Tagen, nicht Wochen',
				detail:
					'„Absolut richtig, niemand will wochenlang auf Internet warten. Genau deshalb steuern wir als Netzbetreiber die Schaltungen direkt. Bei 1&1 warten Sie oft monatelang auf einen freien Technikertermin. Welches Datum für den Wechsel würde Ihnen am besten passen?“',
			},
			{
				icon: Star,
				title: 'Alles aus einer Hand & MagentaEINS',
				detail:
					'„Das verstehe ich vollkommen, ein Vertrag für alles ist praktischer. Genau deshalb bietet die Telekom echte Kombi-Vorteile mit MagentaEINS, bei denen Sie Mobilfunk, Festnetz und TV bündeln und sparen. 1&1 kann diese Konvergenz nicht bieten. Wie viele Handykarten nutzen Sie in Ihrer Familie?“',
			},
			{
				icon: Signal,
				title: 'Echtes 5G-Netz vs. im Aufbau befindliches Rumpfnetz',
				detail:
					'„Ich verstehe, dass 1&1 günstige Tarife anbietet. Genau das ist aber das Problem bei der Netzabdeckung: Das eigene Netz von 1&1 hat kaum Standorte, die Telekom versorgt bereits über 97% der Bevölkerung mit echtem 5G. Lassen Sie uns das Angebot jetzt sichern. Welche E-Mail-Adresse nutzen Sie für die Bestätigung?“',
			},
		],
	},
	{
		id: 'congstar',
		name: 'congstar',
		color: '#ff7c00',
		logoText: 'CS',
		weaknesses: [
			{
				icon: TrendingDown,
				title: 'Gedrosselte Netzpriorität',
				detail:
					'Discount-Marke der Telekom – gleiche Leitung, aber bei hoher Netzauslastung (Stoßzeit/Events) nachrangig behandelt.',
			},
			{
				icon: SignalZero,
				title: 'Kein 5G Standalone',
				detail:
					'Nur LTE oder gedrosseltes 5G verfügbar (oft auf 50 Mbit/s beschränkt). Kein Zugang zu neuen Netzinnovationen.',
			},
			{
				icon: UserX,
				title: 'Eingeschränkter Vor-Ort-Support',
				detail:
					'Reine Digital-Marke ohne eigene Shops. Support läuft primär online oder per App. Telekom-Shops bieten für Congstar-Kunden nur sehr eingeschränkte Hilfe.',
			},
			{
				icon: Smartphone,
				title: 'Kein Smartwatch-Support (eSIM-MultiSIM)',
				detail:
					'Unterstützt keine MultiSIM für Smartwatches (Apple Watch LTE). Zudem fehlen echte Familienrabatte und die MagentaEINS Kombivorteile.',
			},
		],
		telekomArguments: [
			{
				icon: Zap,
				title: '💛 Emotionaler Marker: Die Holzklasse-Metapher',
				detail:
					'„Klasse, Congstar ist eine gute Marke für den Einstieg. Genau das ist aber der Punkt: Congstar nutzt zwar unser Netz, aber Sie fahren dort Holzklasse. Bei hoher Netzauslastung werden Congstar-Kunden gedrosselt, damit die Premium-Kunden der Telekom freie Fahrt haben. Gönnen Sie sich das Original mit 5G und voller Netzpriorität. Nutzen Sie Ihr Smartphone hauptsächlich unterwegs für Social Media oder Navigation?“',
			},
			{
				icon: Headphones,
				title: 'Persönliche Beratung in 500+ Shops',
				detail:
					'„Das verstehe ich vollkommen, Congstar ist günstig. Genau deshalb wird dort aber am Service gespart: Sie haben keine Shops vor Ort und keine Hotline bei Störungen. Bei der Telekom haben Sie echte Ansprechpartner an Ihrer Seite. Sollen wir Ihren Vertrag auf Premium-Service umstellen? Wie schreibt sich Ihr Nachname?“',
			},
			{
				icon: Star,
				title: 'Volle Netzpriorität & 5G SA',
				detail:
					'„Absolut richtig, das Handy muss schnell sein. Genau deshalb bieten die Original-Telekom-Tarife volle Netzpriorität und 5G Standalone ohne künstliche Bremsen. Wir machen das jetzt kurz für Sie fertig, damit Sie ohne Verzögerung surfen. Wie lautet Ihre E-Mail-Adresse?“',
			},
			{
				icon: Shield,
				title: 'Premium-Geräte & MagentaTV-Bundles',
				detail:
					'„Ich verstehe, dass Sie sparen möchten. Genau deshalb lohnt sich das Telekom-Ökosystem: Nur hier bekommen Sie echte Kombi-Rabatte mit MagentaTV und Mobilfunk aus einer Hand. Congstar bietet keine echten TV-Pakete. Welche Fernsehprogramme schauen Sie am liebsten?“',
			},
		],
	},
	{
		id: 'deutsche-glasfaser',
		name: 'Deutsche Glasfaser',
		color: '#00a550',
		logoText: 'DG',
		weaknesses: [
			{
				icon: MapPinOff,
				title: 'Begrenztes Ausbaugebiet',
				detail:
					'Nur in ausgewählten, vorab gebündelten ländlichen Regionen verfügbar. Kein flächendeckendes Netz.',
			},
			{
				icon: Clock,
				title: '1–5 Jahre Wartezeit (Bauverzögerung)',
				detail:
					'Zwischen Vertragsabschluss und tatsächlichem Anschluss vergehen oft Jahre – viele Projekte werden verschoben.',
			},
			{
				icon: PhoneOff,
				title: 'Schlechter Kundenservice',
				detail:
					'Schwer erreichbar, Tickets werden oft unbearbeitet oder ungelöst geschlossen. Mangelnde Kommunikation auf Baustellen.',
			},
			{
				icon: Lock,
				title: 'Monopolstellung',
				detail:
					'In Ausbaugebieten oft der einzige Glasfaser-Betreiber. Keine Wahlfreiheit bei Problemen oder Tariferhöhungen.',
			},
			{
				icon: Ban,
				title: 'Kein Mobilfunk',
				detail:
					'Kein Mobilfunkangebot – keine Konvergenzrabatte möglich. Kunden müssen Verträge bei mehreren Anbietern verwalten.',
			},
			{
				icon: Construction,
				title: 'Baustellenprobleme',
				detail:
					'Häufige Beschwerden über schlecht reparierte Straßen, beschädigte Einfahrten und unkoordinierte Tiefbauarbeiten.',
			},
		],
		telekomArguments: [
			{
				icon: Zap,
				title: '💛 Emotionaler Marker: Das Luftschloss',
				detail:
					'„Verstehe ich absolut, Glasfaser klingt super. Genau das ist aber das Problem bei Deutsche Glasfaser: Die sammeln Verträge und bauen oft erst Jahre später – wenn überhaupt. Lassen Sie uns Ihre Versorgung jetzt sichern: Wir liefern Ihnen sofort stabiles Internet und stornieren den DG-Vertrag wegen Fristüberschreitung für Sie. Wie lautet Ihre genaue Adresse?“',
			},
			{
				icon: Signal,
				title: 'Glasfaser + Mobilfunk + TV = MagentaEINS',
				detail:
					'„Ich verstehe, dass Sie schnelles Internet möchten. Genau das ist der Vorteil bei der Telekom: Sie bekommen Internet, Mobilfunk und MagentaTV aus einer Hand und sparen monatlich durch MagentaEINS. DG bietet keinen Mobilfunk an. Welche Mobilfunkverträge laufen aktuell in Ihrem Haushalt?“',
			},
			{
				icon: Shield,
				title: 'Größtes und zuverlässigstes Glasfasernetz',
				detail:
					'„Das verstehe ich vollkommen, der Bau soll schnell gehen. Genau deshalb baut die Telekom seit Jahrzehnten zuverlässig Netze und repariert Baustellen sofort. DG hat oft mit Baustopps zu kämpfen. Sichern wir Ihnen die Original-Leitung der Telekom. Wie lautet Ihr Geburtsdatum?“',
			},
			{
				icon: Headphones,
				title: 'Erreichbarer, kompetenter Service vor Ort',
				detail:
					'„Absolut richtig, bei Störungen braucht man schnelle Hilfe. Genau das ist der Punkt: DG hat keinen Support vor Ort. Wir haben über 500 Shops und Techniker direkt in Ihrer Nähe. Wir machen das jetzt unkompliziert fertig. Wie lautet Ihre E-Mail-Adresse?“',
			},
		],
	},
	{
		id: 'pyur',
		name: 'PYUR',
		color: '#00b8e0',
		logoText: 'PY',
		weaknesses: [
			{
				icon: MapPinOff,
				title: 'Nur regional verfügbar',
				detail:
					'Kleines Kabelnetz – vorwiegend in Ostdeutschland, Berlin und Teilen von NRW verfügbar. Problem bei Umzügen.',
			},
			{
				icon: TrendingDown,
				title: '-40% TV-Kunden verloren',
				detail:
					'Massiver Kundenverlust nach Wegfall des Nebenkostenprivilegs deutet auf mangelnde Kundenbindung hin.',
			},
			{
				icon: Star,
				title: '1,6/5 Sterne Bewertung',
				detail:
					'Sehr schlechte Kundenbewertungen auf allen großen Verbraucherportalen hinsichtlich Stabilität und Hotline.',
			},
			{
				icon: WifiOff,
				title: 'Häufige Totalausfälle',
				detail:
					'Internet, Telefonie und TV fallen gleichzeitig aus. Lange Behebungszeiten durch veraltete Technik.',
			},
			{
				icon: Zap,
				title: 'Nur Bruchteil der gebuchten Speed',
				detail:
					'Tatsächliche Geschwindigkeiten liegen oft drastisch unter der beworbenen Bandbreite (abends oft nur 20%).',
			},
			{
				icon: Unplug,
				title: 'Veraltetes Shared Medium',
				detail:
					'Gleiches Kabel-Sharing-Problem wie Vodafone, jedoch in einem noch älteren, schlechter gewarteten Netz.',
			},
		],
		telekomArguments: [
			{
				icon: Zap,
				title: '💛 Emotionaler Marker: Frustfrei',
				detail:
					'„Ich verstehe vollkommen, dass Sie mit PYUR sparen wollten. Genau das ist aber der Grund für die ständigen Störungen: Das Kabelnetz von PYUR ist veraltet. Sie teilen sich die Leitung abends mit der halben Straße und die Geschwindigkeit bricht ein. Bei der Telekom bekommen Sie Ihre eigene Glasfaserleitung ohne Sharing. Ruckelt Ihr Bild abends beim Fernsehen auch manchmal?“',
			},
			{
				icon: Trophy,
				title: 'Bundesweit verfügbar',
				detail:
					'„Absolut richtig, man will flexibel bleiben. Genau das wird bei PYUR zum Problem: Die sind nur regional verfügbar. Die Telekom versorgt ganz Deutschland – bei Umzug nehmen Sie Ihren Anschluss einfach mit. Wann steht bei Ihnen der nächste Umzug an?“',
			},
			{
				icon: Wifi,
				title: 'Echtes FTTH vs. veraltetes Kabelnetz',
				detail:
					'„Das verstehe ich vollkommen, die Technik muss modern sein. Genau deshalb bauen wir echte Glasfaser direkt in Ihre Wohnung (FTTH), während PYUR auf altes TV-Kabel setzt. Das ist die sicherste Verbindung für Sie. Richten wir das jetzt risikofrei ein. Wie lautet Ihre E-Mail-Adresse?“',
			},
			{
				icon: Headphones,
				title: 'Kundenservice mit Bestnoten statt 1,6 Sterne',
				detail:
					'„Das tut mir leid, mit schlechtem Service will sich niemand herumschlagen. Genau deshalb gewinnt die Telekom regelmäßig Kundenservice-Awards, während PYUR auf Portalen abgestraft wird. Wir machen das jetzt direkt fertig für Sie. Wie schreibt sich Ihr Nachname?“',
			},
		],
	},
	{
		id: 'freenet',
		name: 'freenet Mobilfunk',
		color: '#00457c',
		logoText: 'FN',
		weaknesses: [
			{
				icon: Unplug,
				title: 'Reiner Reseller',
				detail:
					'Kein eigenes Mobilfunk- oder Festnetz. Nutzt im Hintergrund Kapazitäten von Telekom, Vodafone oder o2.',
			},
			{
				icon: EyeOff,
				title: 'Netz-Lotterie',
				detail:
					'Kunden wissen oft nicht, in welchem Netz sie landen, da Tarife intransparent zugeordnet und gewechselt werden.',
			},
			{
				icon: DollarSign,
				title: 'Aggressives Upselling',
				detail:
					'Bekannt für versteckte Zusatzoptionen, kostenpflichtige Testabos im Kleingedruckten und aggressive Werbeanrufe.',
			},
			{
				icon: Scissors,
				title: 'Einseitige Kündigungen',
				detail:
					'Berichte über Vertragskündigungen durch freenet ohne Vorwarnung bei Überschreitung bestimmter Nutzungsgrenzen.',
			},
			{
				icon: PhoneOff,
				title: 'Kein technischer Support',
				detail:
					'Bei Netzproblemen kann freenet nicht helfen – kein eigener Zugriff auf die Netzinfrastruktur der Betreiber.',
			},
			{
				icon: Lock,
				title: 'Schwierige Kündigung',
				detail:
					'Komplizierte Kündigungsprozesse und mangelnde Transparenz bei Verträgen, die über Drittportale laufen.',
			},
		],
		telekomArguments: [
			{
				icon: Star,
				title: '💛 Emotionaler Marker: Klarheit',
				detail:
					'„Verstehe ich absolut, freenet lockt mit billigen Preisen. Genau das ist aber das Problem mit der Netz-Lotterie: Sie wissen oft nicht, in welchem Netz Sie landen und werden ungefragt verschoben. Bei der Telekom bekommen Sie das beste Netz Deutschlands direkt und garantiert. Wie viel Datenvolumen benötigen Sie im Monat?“',
			},
			{
				icon: Shield,
				title: 'Garantierte Netzqualität ohne Restposten',
				detail:
					'„Das verstehe ich völlig, man will überall surfen können. Genau deshalb surfen Sie als Telekom-Direktkunde immer mit voller Netzpriorität. Reseller wie freenet werden bei hoher Auslastung gedrosselt. Sichern wir Ihnen die volle Leistung für Ihr Smartphone. Wie lautet Ihr Geburtsdatum?“',
			},
			{
				icon: Signal,
				title: 'Direktvertrag mit dem Netzbesitzer',
				detail:
					'„Absolut richtig, im Störungsfall zählt jede Minute. Genau deshalb ist der Direktvertrag mit uns die beste Wahl: Wir entstören direkt, während freenet nur Tickets weiterleitet. Ich richte Ihnen das jetzt direkt ein. Wie lautet Ihre E-Mail-Adresse?“',
			},
			{
				icon: Headphones,
				title: 'Ehrlicher Service statt Abos im Kleingedruckten',
				detail:
					'„Ich verstehe, dass Sie günstige Verträge schätzen. Genau deshalb berät die Telekom transparent: Bei uns gibt es keine versteckten Testabos im Kleingedruckten. Wir machen das jetzt kurz fertig. Wie lautet Ihr Nachname?“',
			},
		],
	},
	{
		id: 'drillisch',
		name: 'Drillisch-Marken (PremiumSIM, winSIM, sim.de, etc.)',
		color: '#7b2d8e',
		logoText: 'DR',
		weaknesses: [
			{
				icon: SignalZero,
				title: 'o2-Netz = Platz 3',
				detail:
					'PremiumSIM, winSIM, sim.de, smartmobil – alle nutzen das o2-Netz, das dauerhaft den letzten Platz belegt.',
			},
			{
				icon: Unplug,
				title: 'Kein eigenes Netz',
				detail:
					'Kein eigener technischer Support. Bei Netzproblemen wird der Kunde im Kreis geschickt, da kein physischer Zugriff besteht.',
			},
			{
				icon: UserX,
				title: 'Keine Shops vor Ort',
				detail:
					'Reine Online-Discounter. Keine persönliche Beratung, kein Ansprechpartner bei Gerätedefekten.',
			},
			{
				icon: Ban,
				title: 'Gedrosseltes 5G & kein 5G Standalone',
				detail:
					'Drillisch-Tarife sind geschwindigkeitsgedrosselt (meist max. 50 Mbit/s) und haben keinen Zugang zum modernen 5G Standalone (5G+) Netz.',
			},
			{
				icon: PhoneOff,
				title: 'Minimal-Support',
				detail:
					'Eingeschränkter Kundenservice. Lange Warteschleifen und keine individuelle Betreuung bei Problemen.',
			},
		],
		telekomArguments: [
			{
				icon: Shield,
				title: '💛 Emotionaler Marker: Qualität zahlt sich aus',
				detail:
					'„Ich verstehe vollkommen, dass ein 5€-Tarif verlockend klingt. Genau das ist aber das Problem auf dem Land oder im Zug: Drillisch nutzt das leistungsschwächste o2-Netz und hat massive Funklöcher. Für wenige Euro mehr bekommen Sie das Testsieger-Netz der Telekom mit echter Erreichbarkeit. Fahren Sie manchmal aus der Stadt raus?“',
			},
			{
				icon: Trophy,
				title: 'Bestes Netz vs. Billig-Netz',
				detail:
					'„Absolut richtig, der Preisunterschied ist spürbar. Genau das ist aber der Punkt: Drillisch nutzt das o2-Netz, das in jedem Netztest auf Platz 3 landet. Bei uns zahlen Sie knapp 30 Cent mehr am Tag für das beste Netz Deutschlands. Lassen Sie uns das Angebot jetzt sichern. Wie lautet Ihre E-Mail-Adresse?“',
			},
			{
				icon: Headphones,
				title: 'Vor-Ort-Service vs. Anonyme Online-Marke',
				detail:
					'„Das verstehe ich, man will einfach nur telefonieren. Genau deshalb ist Drillisch so billig: Sie haben keinen einzigen Shop und keinen Ansprechpartner bei Geräteschäden. Bei uns gehen Sie einfach in den nächsten Shop und bekommen sofort Hilfe. Dürfen wir Ihre Rufnummer jetzt zu uns übertragen? Wie schreibt sich Ihr Nachname?“',
			},
			{
				icon: Signal,
				title: 'Echtes 5G inklusive',
				detail:
					'„Ich verstehe, dass Sie sparen möchten. Genau deshalb ist unser Tarif zukunftssicher: Bei der Telekom ist echtes 5G in allen Tarifen inklusive, während Drillisch Sie oft auf langsames LTE drosselt. Wir machen das jetzt direkt fertig für Sie. Welches Smartphone nutzen Sie aktuell?“',
			},
		],
	},
	{
		id: 'klarmobil',
		name: 'klarmobil',
		color: '#38a832',
		logoText: 'KM',
		weaknesses: [
			{
				icon: Unplug,
				title: 'freenet-Reseller',
				detail:
					'Kein eigenes Netz. Miete von Kapazitäten bei Telekom, Vodafone oder o2 ohne Einfluss auf Netzparameter.',
			},
			{
				icon: EyeOff,
				title: 'Unübersichtliche Verträge',
				detail:
					'Vertrieb erfolgt oft über Drittplattformen mit unklaren Mindestlaufzeiten und automatischen Preiserhöhungen.',
			},
			{
				icon: PhoneOff,
				title: 'Eingeschränkter Support',
				detail:
					'Sehr begrenzter Kundenservice. Keine schnelle Fehlerbehebung oder Vor-Ort-Hilfe möglich.',
			},
			{
				icon: UserX,
				title: 'Keine Filialen',
				detail:
					'Keine persönliche Beratung, kein physischer Anlaufpunkt für Kunden bei Störungen.',
			},
		],
		telekomArguments: [
			{
				icon: Headphones,
				title: '💛 Emotionaler Marker: Einer für alles',
				detail:
					'„Verstehe ich absolut, klarmobil wirbt viel. Genau das ist aber der Punkt: Warum drei Verträge bei verschiedenen Anbietern für Handy, Internet und TV haben? Bei der Telekom bekommen Sie alles aus einer Hand – einen Vertrag, eine Rechnung, einen Servicepartner. Ist Ihr Internetanschluss aktuell auch bei klarmobil?“',
			},
			{
				icon: Shield,
				title: 'Direktvertrag statt Reseller-Umweg',
				detail:
					'„Das verstehe ich, man sucht nach günstigen Tarifen. Genau hier liegt aber das Problem: klarmobil ist nur ein Reseller. Bei Störungen müssen Sie den Umweg über klarmobil gehen. Bei der Telekom haben Sie einen echten Direktvertrag für bevorzugte Entstörung. Sichern wir das jetzt direkt für Sie ab. Wie lautet Ihre E-Mail-Adresse?“',
			},
			{
				icon: Star,
				title: 'Vollständiges Ökosystem',
				detail:
					'„Absolut richtig, alles muss zusammenpassen. Genau deshalb bietet die Telekom Mobilfunk, Festnetz und MagentaTV perfekt abgestimmt aus einer Hand. klarmobil hat kein echtes TV-Angebot. Wir machen das jetzt kurz fertig. Wie lautet Ihr Geburtsdatum?“',
			},
		],
	},
	{
		id: 'discount',
		name: 'Blau / ALDI TALK / Lidl',
		color: '#555555',
		logoText: '$$',
		weaknesses: [
			{
				icon: TrendingDown,
				title: 'Abgewertete Netzkapazitäten',
				detail:
					'Discount-MVNOs nutzen das o2- oder Vodafone-Netz, erhalten jedoch immer die niedrigste Bandbreiten-Priorität.',
			},
			{
				icon: SignalZero,
				title: 'Niedrigste Netzpriorität',
				detail:
					'Bei hoher Netzauslastung (Events, Hauptverkehrszeit) werden Prepaid-Karten als Erstes gedrosselt.',
			},
			{
				icon: Ban,
				title: 'Gedrosseltes Netz & kein Smartwatch-Support',
				detail:
					'Kein Zugang zu echtem 5G Standalone (5G+), gedrosselte Geschwindigkeit (meist 25–50 Mbit/s) und kein Smartwatch-Support (eSIM-MultiSIM).',
			},
			{
				icon: UserX,
				title: 'Kein Kundenservice',
				detail:
					'Reiner Prepaid-Automatensupport. Bei Problemen steht der Kunde komplett ohne Hilfe da.',
			},
			{
				icon: Smartphone,
				title: 'Kein Ökosystem',
				detail:
					'Keine Endgeräte-Auswahl, keine Kombi-Vorteile (wie MagentaEINS), kein Zusammenspiel von Produkten.',
			},
		],
		telekomArguments: [
			{
				icon: Zap,
				title: '💛 Emotionaler Marker: Das Beste für die Familie',
				detail:
					'„Ich verstehe vollkommen, für sich selbst reicht Prepaid oft aus. Genau das ist aber der Punkt, wenn es um die Familie geht: Sie wollen Verlässlichkeit, damit die Kinder im Notfall immer erreichbar sind und das Homeoffice stabil steht. Das bietet nur das Telekom-Premiumnetz. Wie viele Personen nutzen das Internet bei Ihnen zu Hause?“',
			},
			{
				icon: Trophy,
				title: 'Premium-Netz für den Alltag',
				detail:
					'„Absolut richtig, man will flexibel sein. Genau deshalb werden Prepaid-Karten bei hoher Auslastung im Netz als Erstes gedrosselt. Als Telekom-Vertragskunde surfen Sie immer mit voller Priorität. Lassen Sie uns das Angebot jetzt sichern. Wie lautet Ihre E-Mail-Adresse?“',
			},
			{
				icon: Headphones,
				title: 'Mensch statt Maschine',
				detail:
					'„Das verstehe ich, man sucht nach der einfachsten Lösung. Genau deshalb ist Discount bei Störungen so frustrierend: Sie haben nur Chatbots. Bei uns haben Sie 500+ Shops und direkte Hilfe. Wir machen das jetzt unkompliziert fertig. Wie schreibt sich Ihr Nachname?“',
			},
			{
				icon: Signal,
				title: 'Zukunftssicher mit 5G & Glasfaser',
				detail:
					'„Absolut richtig, die Technik schreitet voran. Genau deshalb bietet die Telekom echtes 5G und Glasfaser, während Discount-Karten jahrelang hinterherhinken. Wir richten das jetzt zukunftssicher für Sie ein. Wie lautet Ihr Geburtsdatum?“',
			},
		],
	},
];

export const OBJECTIONS: Objection[] = [
	{
		id: 'too-expensive',
		title: '„Zu teuer“',
		coreArgument:
			'Tagespreis-Rechnung, Nutzenbrücke, Premiumnetz',
		exampleText:
			'„Herr/Frau [Name], Qualität hat ihren Preis – das wissen Sie selbst. Aber lassen Sie uns mal schauen, was Sie dafür sparen: Sie sparen sich die abendlichen Ruckler, den Ärger mit der Hotline und vor allem Ihre wertvolle Zeit. Wir sprechen hier umgerechnet über gerade einmal wenige Cent am Tag Unterschied zu Ihrem alten Anbieter. Dafür haben Sie die absolute Sicherheit im stabilsten Netz Deutschlands. Richten wir den Anschluss direkt auf Ihren Namen ein – nutzen wir Ihre aktuelle Adresse oder haben Sie eine abweichende?“',
		tip: 'Zuerst Wertbrücke bauen. Gesamtpreis entkräften, indem man ihn auf den Tagespreis reduziert und die Kosten von Netzfehlern aufzeigt.',
		icon: DollarSign,
	},
	{
		id: 'dont-need-it',
		title: '„Brauche ich nicht“',
		coreArgument: 'Bedarfsweckung, Smart Home, Zukunftssicherheit',
		exampleText:
			'„Das verstehe ich vollkommen, Herr/Frau [Name]. Man fragt sich natürlich, ob man das braucht. Genau das ist der Punkt: Früher war das Internet nur für E-Mails da. Heute läuft alles darüber. Ihr Fernseher, Ihr Smartphone und Ihre Haushaltsgeräte. Wir richten Ihre Leitung jetzt direkt zukunftssicher ein. So läuft alles ohne Unterbrechung, selbst wenn mehrere Geräte gleichzeitig online sind.“',
		tip: 'Einwand entkräften, indem man die wachsende Anzahl an vernetzten Geräten im Haushalt aufzeigt. Direkt in die Auswahlkupplung gehen.',
		icon: EyeOff,
	},
	{
		id: 'need-to-think',
		title: '„Muss drüber nachdenken“',
		coreArgument: 'Einwand-Isolierung, Sicherheits-Joker, Aktionspreis',
		exampleText:
			'„Das kann ich gut verstehen, Herr/Frau [Name]. Eine gute Entscheidung will gut überlegt sein. Genau darum geht es. Lassen Sie uns das Angebot jetzt sichern, damit die Konditionen für Sie reserviert sind. Wir machen das risikofrei: Ich schicke Ihnen jetzt direkt die Bestätigung per E-Mail. Sie erhalten alle Aktionspreise und haben ab heute 14 Tage Zeit, sich alles in Ruhe auf der Couch anzuschauen. Wenn Sie es doch nicht möchten, reicht ein kurzer Anruf oder Mail. Welche E-Mail-Adresse nutzen Sie aktuell für wichtige Nachrichten?“',
		tip: 'Einwand isolieren (Leistung vs. Preis). Dann das Risiko minimieren durch den Widerrufs-Joker im assumptive close.',
		icon: Clock,
	},
	{
		id: 'im-satisfied',
		title: '„Bin zufrieden“',
		coreArgument: 'Tarif-Optimierung, Moderne Standards',
		exampleText:
			'„Klasse, das freut mich zu hören! Ein neuer, stabiler Anschluss ist Gold wert. Genau deshalb spreche ich das an. Über die Jahre verändern sich ja die Geräte und Anforderungen bei Ihnen zu Hause. Früher reichte eine einfache Leitung. Heute laufen Fernseher, Handys und Homeoffice gleichzeitig. Wir passen Ihr Profil jetzt an die modernen Standards an. Sie erhalten die vierfache Leistung für fast das gleiche Geld. Das läuft ab sofort komplett automatisch. Lassen Sie uns Ihre Kundendaten abgleichen. Wie lautet Ihr Geburtsdatum?“',
		tip: 'Zufriedenheit verstärken. Das Angebot nicht als neuen Verkauf, sondern als Anpassung an moderne Standards und veränderte Haushaltsgeräte framen.',
		icon: CheckCircle2,
	},
	{
		id: 'in-contract',
		title: '„Bin noch im Vertrag“',
		coreArgument: 'Wechsel-Vormerkung, Anschlussgebühr-Erlass, Kündigungsservice',
		exampleText:
			'„Verstehe ich absolut. Niemand möchte doppelt bezahlen oder Stress beim Wechsel haben. Genau deshalb reservieren wir Ihren Anschluss heute schon im Voraus. Wir richten den Wechseltermin exakt auf das Ende Ihrer aktuellen Laufzeit ein. Sie zahlen keinen Cent doppelt. Als Wechsel-Vorteil erlassen wir Ihnen die komplette Bereitstellungsgebühr und wir kündigen automatisch im Hintergrund für Sie. Bei welchem Anbieter sind Sie aktuell und wann läuft der Vertrag dort aus?“',
		tip: 'Angst vor doppelten Kosten nehmen. Den nahtlosen Übergang betonen und den Erlass der Bereitstellungsgebühr als exklusiven Wechsel-Vorteil nutzen.',
		icon: Lock,
	},
	{
		id: 'competitor-cheaper',
		title: '„Wettbewerber ist günstiger“',
		coreArgument: 'Zwei-Klassen-Netz, Priorisierung, TCO',
		exampleText:
			'„Absolut richtig, auf den ersten Blick sieht das günstiger aus. Genau das ist aber der Unterschied zwischen dem Original-Netzbesitzer und einem Untermieter. Billig gekauft ist oft doppelt bezahlt. Andere Anbieter mieten nur unsere Netze oder teilen sich die Leitungen. Bei der Telekom haben Sie Ihre eigene Spur. Bei Störungen haben Sie als Direktkunde oberste Priorität bei unseren Technikern. Das spart Ihnen Zeit und Nerven. Welche DSL-Geschwindigkeit nutzen Sie momentan bei Ihrem aktuellen Anbieter?“',
		tip: 'Den Unterschied zwischen Netzbesitzer und Untermieter/Reseller klar aufzeigen. Die versteckten Kosten von Ausfällen hervorheben.',
		icon: AlertTriangle,
	},
	{
		id: 'no-time',
		title: '„Habe gerade keine Zeit“',
		coreArgument: '45-Sekunden-Pitch, Zukunfts-Vorteil, Bedarfsanalyse',
		exampleText:
			'„Verstehe ich völlig, Ihre Zeit ist kostbar. Genau deshalb machen wir das jetzt ganz kurz und unkompliziert in 45 Sekunden fertig. Ich zeige Ihnen, wie wir Ihre Leitung stabilisieren und Sie ab sofort dauerhaft 10 € sparen. Wenn das für Sie interessant klingt, machen wir das direkt fertig – dann haben Sie das Thema für die nächsten zwei Jahre vom Tisch. Schauen Sie aktuell noch über Kabel oder schon über die Telefonbuchse?“',
		tip: 'Mach dem Kunden klar, dass der Abschluss jetzt schneller geht, als einen neuen Termin auszumachen. Nimm das Tempo auf deine Kappe (z.B. „Ich klicke das hier parallel superschnell ein“).',
		icon: Clock,
	},
	{
		id: 'bad-experience',
		title: '„Schlechte Erfahrungen“',
		coreArgument: 'Persönliche Betreuung, Hotline-Testsieger, Vertrauensaufbau',
		exampleText:
			'„Das tut mir wirklich leid und ich kann den Ärger absolut nachvollziehen. Genau deshalb sitze ich heute als Ihr persönlicher Ansprechpartner hier: Wir haben im Service radikal aufgeräumt – genau aus diesem Grund sind wir wiederholt Testsieger beim connect Hotline-Test geworden. Damit das von damals nie wieder passiert, richte ich Ihnen das heute persönlich ein und bleibe Ihr fester Ansprechpartner. Lassen Sie uns kurz schauen: Woran genau hat es damals bei Ihnen gehakt?“',
		tip: 'Nutze das „Psychologische Konto“. Indem du die Schuld der alten Telekom anerkennst, baust du Vertrauen auf. Geh sofort über in die Fehlerbehebung (Beratung) und von dort direkt in den Auftrag.',
		icon: Headphones,
	},
	{
		id: 'too-much-effort',
		title: '„Zu viel Aufwand“',
		coreArgument: 'Digitaler Vollservice, Rufnummernmitnahme, Datenerfassung',
		exampleText:
			'„Das höre ich oft, aber genau da habe ich die beste Nachricht des Tages für Sie: Den Aufwand gibt es nicht mehr. Wir übernehmen mit unserem Komplett-Wechselservice alles für Sie – von der Kündigung beim alten Anbieter bis zur Rufnummernmitnahme. Sie unterschreiben nichts, Sie müssen nirgendwo anrufen. Wir machen das jetzt in zwei Minuten am Telefon fertig und Sie lehnen sich einfach zurück. Wie lautet der vollständige Name des aktuellen Vertragsinhabers beim alten Anbieter?“',
		tip: 'Nutze die direkte Frage nach dem Vertragsinhaber, um den Buchungsprozess sofort einzuleiten. Das lenkt den Fokus auf die Datenerfassung.',
		icon: Unplug,
	},
	{
		id: 'discuss-partner',
		title: '„Mit Partner besprechen“',
		coreArgument: 'Sicherungs-Option, Widerrufs-Recht, Couch-Bedenkzeit',
		exampleText:
			'„Das zeigt, wie wichtig Ihnen eine gute Entscheidung für die Familie ist. Genau deshalb sichern wir das Angebot heute, damit die Konditionen für Sie reserviert sind. Wir buchen das jetzt fest ein. Sie erhalten alle Unterlagen per E-Mail. Falls Ihr Partner heute Abend sagt: \'Nein, das machen wir nicht\', haben Sie ab heute 14 Tage Zeit. Ein kurzer Anruf bei uns oder das Online-Stornoformular genügt, und wir machen alles rückgängig. So verpassen Sie das Angebot nicht und haben null Risiko. Wie lautet Ihre korrekte E-Mail-Adresse für die Unterlagen?“',
		tip: 'Das gesetzliche Widerrufsrecht (14 Tage bei Fernabsatz) ist im Callcenter deine schärfste Waffe gegen den Partner-Einwand. Du buchst das Angebot ein, stellst aber die unkomplizierte Stornierung per Anruf oder Formular heraus.',
		icon: UserX,
	},
];
