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
                    'DOCSIS 3.1 Probleme in vielen Gebieten dokumentiert. Häufige Verbindungsabbrüche, besonders zur Stoßzeit.',
			},
			{
				icon: PhoneOff,
				title: 'Service im Ausland',
				detail:
                    'Kundenservice teils nach Indien/Rumänien ausgelagert. Sprachbarrieren und lange Wartezeiten.',
			},
			{
				icon: DollarSign,
				title: 'Versteckte Preiserhöhungen',
				detail:
                    'Nach der Erstvertragslaufzeit steigen die Preise oft deutlich – intransparent kommuniziert.',
			},
			{
				icon: Construction,
				title: 'Keine Glasfaser-Investition',
				detail:
                    'Kein eigener FTTH-Ausbau. Vodafone setzt weiter auf die Kabel-Altstruktur von Unitymedia/Kabel Deutschland und baut nur wenig aus - mit Hilfe eines Joint Ventures.',
			},
		],
		telekomArguments: [
			{
				icon: Star,
				title: '💛 Emotionaler Marker: Zuverlässigkeit',
				detail:
                    '"Wenn Sie abends einen Film schauen oder im Homeoffice arbeiten, wollen Sie sich auf Ihre Verbindung verlassen können. Bei Kabel schwankt die Leitung, wenn die Nachbarn auch online sind – bei Glasfaser nicht."',
			},
			{
				icon: Trophy,
				title: '15× Connect-Testsieger in Folge',
				detail:
                    'Die Telekom holte im connect Netztest 2026 zum 15. Mal in Folge den Titel "Überragend" – Vodafone erreicht nur "Sehr gut" auf Platz 2. Kein anderer Anbieter hat diese Konstanz.',
				source: 'connect Netztest 11/2025',
			},
			{
				icon: Wifi,
				title: 'Glasfaser statt Kabel-Sharing',
				detail:
                    'Telekom FTTH ist ein dediziertes Medium – jeder Kunde hat seine eigene Faser. Bei Vodafone Kabel teilen sich bis zu 500 Haushalte ein Segment. Abends merkt man das deutlich; aber nicht bei der Telekom.',
			},
			{
				icon: Headphones,
				title: 'Service aus Deutschland – persönlich',
				detail:
                    'Über 500 Telekom-Shops, Rückruf-Service und telefonische Beratung aus deutschen Standorten. Vodafone hat Service-Teile ins Ausland verlagert. Kunden berichten von Sprachbarrieren und fehlender Lösungskompetenz.',
			},
			{
				icon: Shield,
				title: 'Eigenes Netz = schnellere Hilfe',
				detail:
                    'Bei Störungen greift die Telekom direkt auf ihr eigenes Kernnetz zu. Vodafone muss bei Kabel-Problemen teils auf Altinfrastruktur zurückgreifen – das kostet wertvolle Zeit.',
			},
			{
				icon: Zap,
				title: '30 Mrd. € Glasfaser-Investment bis 2030',
				detail:
                    '860.000 km Glasfasernetz, 12,6 Mio. buchbare Anschlüsse Ende 2025, 2,5 Mio. neue pro Jahr. Vodafone investiert kaum in FTTH und setzt weiter auf veraltetes Koax-Kabel.',
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
                    'Netzabdeckung ländlich deutlich schwächer als Telekom. Große Versorgungslücken außerhalb von Städten.',
			},
			{
				icon: SignalZero,
				title: '5G weit hinterher',
				detail:
                    'Telekom hat 3× so viele 5G-Standorte. o2 bietet in vielen Regionen noch gar kein 5G.',
			},
			{
				icon: Unplug,
				title: 'Kein eigenes Festnetz',
				detail:
                    'o2 nutzt Telekom-Leitungen als Reseller. Kein direkter Zugriff bei Festnetz-Störungen.',
			},
			{
				icon: TrendingDown,
				title: 'Dauerhaft Platz 3',
				detail:
                    'In jedem großen Netztest (connect, CHIP, Stiftung Warentest) schneidet o2 als Letzter ab.',
			},
			{
				icon: Construction,
				title: 'E-Plus-Altlasten',
				detail:
                    'Die E-Plus-Integration verursacht teilweise noch technische Probleme im Netz.',
			},
		],
		telekomArguments: [
			{
				icon: Star,
				title: '💛 Emotionaler Marker: Auf dem Land versorgt',
				detail:
                    'Frage Deinen Kunden: Fährt er manchmal raus aufs Land? Zu Verwandten, in den Urlaub? Mit o2 hat er dort oft kein Netz. Mit der Telekom ist er auch auf der Landstraße erreichbar.',
			},
			{
				icon: Signal,
				title: '99% LTE + größtes 5G-Netz',
				detail:
                    'Die Telekom erreicht 99% der Bevölkerung mit LTE und betreibt das größte 5G-Netz Deutschlands. o2 hat vor allem in ländlichen Gebieten deutliche Lücken – dort gibt es oft gar kein Netz.',
				source: 'Bundesnetzagentur',
			},
			{
				icon: Trophy,
				title: 'Dauerhaft Platz 1 vs. Platz 3',
				detail:
                    'Im connect Netztest 2026 schafft es o2 erstmals gleichauf mit Vodafone – aber immer noch deutlich hinter der Telekom. In 15 Jahren Tests war o2 nie besser als Platz 3.',
				source: 'connect Netztest 11/2025',
			},
			{
				icon: Zap,
				title: 'Echte Glasfaser statt Mietleitung',
				detail:
                    'o2 hat kein eigenes Festnetz. Kunden bekommen eine Telekom-Leitung – aber ohne den vollen Telekom-Service, ohne MagentaTV-Integration und ohne direkten Zugriff bei Störungen.',
			},
			{
				icon: Headphones,
				title: 'Premium-Service vs. Discount-Betreuung',
				detail:
                    'Die Telekom bietet persönliche Beratung in 500+ Shops und Rückruf-Service. o2 setzt verstärkt auf Chatbots und Self-Service – bei komplexen Problemen fehlt der persönliche Ansprechpartner.',
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
				title: 'Reiner Reseller',
				detail:
                    'Kein eigenes Festnetz. 1&1 mietet Telekom- oder Vodafone-Leitungen und hat keinen direkten Netzzugriff.',
			},
			{
				icon: Clock,
				title: 'Wochen Wartezeit',
				detail:
                    'Berüchtigt für wochenlange Bereitstellungszeiten bei Neuanschlüssen – teils mehrere Monate.',
			},
			{
				icon: SignalZero,
				title: 'Mobilfunknetz im Aufbau',
				detail:
                    'Das 4. deutsche Mobilfunknetz hat unter 1.000 Standorte. Kaum Abdeckung außerhalb von Großstädten.',
			},
			{
				icon: PhoneOff,
				title: 'Kein direkter Support',
				detail:
                    'Bei Störungen muss 1&1 erst den Netzbetreiber kontaktieren. Kunden warten doppelt.',
			},
			{
				icon: Smartphone,
				title: 'Schwache Hardware',
				detail:
                    'Sehr begrenzte Router-Auswahl und eingeschränkte Eigenleistung bei Endgeräten.',
			},
		],
		telekomArguments: [
			{
				icon: Headphones,
				title: '💛 Emotionaler Marker: Sicherheit',
				detail:
                    '“Stellen Sie sich vor, Ihr Internet fällt aus und Sie warten Wochen auf einen Techniker. Bei uns gibt\'s das nicht – wir kommen direkt, weil es unser Netz ist.”',
			},
			{
				icon: Shield,
				title: 'Eigenes Netz = keine Mittelmänner',
				detail:
                    'Die Telekom besitzt und betreibt Deutschlands größtes Telko-Netz. 1&1 mietet nur Leitungen – bei einem Problem muss 1&1 erst den Netzbetreiber kontaktieren. Das dauert.',
			},
			{
				icon: Zap,
				title: 'Bereitstellung in Tagen, nicht Wochen',
				detail:
                    'Als Netzbetreiber steuert die Telekom Bereitstellungen direkt. 1&1-Kunden berichten regelmäßig von 4–8 Wochen Wartezeit – im schlimmsten Fall monatelang.',
			},
			{
				icon: Star,
				title: 'Alles aus einer Hand',
				detail:
                    'Mobilfunk + Festnetz + TV – gebündelt mit ggf. Rabatt und einem Ansprechpartner. 1&1 kann keine echte Konvergenz bieten, da das eigene Mobilfunknetz noch kaum existiert.',
			},
			{
				icon: Signal,
				title: '5G flächendeckend vs. noch im Aufbau',
				detail:
                    'Das 1&1-Mobilfunknetz ist das 4. deutsche Netz und hat bisher unter 1.000 Standorte. Das Telekom-5G-Netz ist mit Abstand das größte und erreicht bereits über 95% der Bevölkerung.',
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
                    'Discount-Marke der Telekom – gleiche Leitung, aber nachrangig behandelt im Netz.',
			},
			{
				icon: SignalZero,
				title: 'Kein 5G',
				detail:
                    'Nur LTE verfügbar, oft auf 50 Mbit/s gedrosselt. Kein Zugang zum 5G-Netz.',
			},
			{
				icon: UserX,
				title: 'Kein Ansprechpartner',
				detail:
                    'Kein persönlicher Berater – nur Online-Self-Service und App. Keine Shops.',
			},
			{
				icon: Smartphone,
				title: 'Eingeschränkte Geräteauswahl',
				detail:
                    'Keine Premium-Endgeräte mit Ratenzahlung. Nur eine Handvoll Geräte verfügbar.',
			},
		],
		telekomArguments: [
			{
				icon: Headphones,
				title: 'Persönliche Beratung in 500+ Shops',
				detail:
                    'Telekom-Kunden haben einen echten Ansprechpartner – in jedem Shop, am Telefon oder per Rückruf. congstar bietet nur Online-Self-Service. Wenn\'s mal komplex wird, steht man allein da.',
			},
			{
				icon: Star,
				title: '5G SA + volle Netzpriorität',
				detail:
                    'Telekom-Tarife surfen mit voller Netzpriorität und 5G Standalone. congstar ist auf LTE beschränkt und wird im Netz nachrangig behandelt. Der Unterschied ist in der Stadt zur Stoßzeit deutlich spürbar.',
			},
			{
				icon: Shield,
				title: 'Premium-Geräte & MagentaTV-Bundles',
				detail:
                    'Apple iPhone, Samsung Galaxy, Google Pixel – sogar mit Ratenzahlung. congstar bietet nur eine Handvoll Geräte an, keine Premium-Geräte.',
			},
			{
				icon: Zap,
				title: '💛 Emotionaler Marker: Mehr verdient',
				detail:
                    '“congstar ist gut für den Einstieg – aber Sie verdienen mehr als Discount. Premium-Netz, persönlicher Service und Geräte nach Wahl: Das ist der Telekom-Unterschied.”',
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
                    'Nur in ausgewählten ländlichen Regionen verfügbar. Kein bundesweites Netz.',
			},
			{
				icon: Clock,
				title: '1–5 Jahre Wartezeit',
				detail:
                    'Zwischen Vertragsabschluss und Anschluss vergehen oft ein bis fünf Jahre.',
			},
			{
				icon: PhoneOff,
				title: 'Schlechter Kundenservice',
				detail:
                    'Schwer erreichbar, wenig kompetent. Tickets werden teils ohne Lösung geschlossen.',
			},
			{
				icon: Lock,
				title: 'Monopolstellung',
				detail:
                    'In Ausbaugebieten oft einziger Glasfaser-Anbieter. Keine Alternative bei Problemen.',
			},
			{
				icon: Ban,
				title: 'Kein Mobilfunk',
				detail:
                    'Kein Mobilfunkangebot – keine Konvergenz möglich. Kunden brauchen einen zweiten Vertrag.',
			},
			{
				icon: Construction,
				title: 'Baustellenprobleme',
				detail:
                    'Beschwerden über schlecht reparierte Straßen und lange Bauzeiten in Gemeinden.',
			},
		],
		telekomArguments: [
			{
				icon: Zap,
				title: '💛 Emotionaler Marker: Vertrauen',
				detail:
                    '“Deutsche Glasfaser ist ein junges Unternehmen. Die Telekom baut seit über 25 Jahren Netze – Sie wissen, dass wir auch in 10 Jahren noch da sind.”',
			},
			{
				icon: Signal,
				title: 'Glasfaser + Mobilfunk + TV = ein Anbieter',
				detail:
                    'Die Telekom bietet Glasfaser, Mobilfunk und MagentaTV aus einer Hand mit einem Ansprechpartner. Deutsche Glasfaser hat kein Mobilfunkangebot – Kunden brauchen einen zweiten Vertrag.',
			},
			{
				icon: Shield,
				title: 'Das größte Glasfasernetz Deutschlands',
				detail:
                    '860.000 km Glasfasernetz, 12,6 Mio. buchbare Anschlüsse, 2,5 Mio. neue pro Jahr. Die Telekom baut deutschlandweit – Deutsche Glasfaser nur in ausgewählten Gebieten.',
				source: 'Telekom Geschäftsbericht 2025',
			},
			{
				icon: Headphones,
				title: 'Erreichbarer, kompetenter Service',
				detail:
                    'Deutsche Glasfaser kämpft mit Service-Beschwerden: lange Wartezeiten, Tickets die ohne Lösung geschlossen werden. Die Telekom bietet 500+ Shops und telefonischen Rückruf-Service.',
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
                    'Kleines Kabelnetz – nur in Ostdeutschland, Berlin und Teilen von NRW.',
			},
			{
				icon: TrendingDown,
				title: '-40% TV-Kunden verloren',
				detail: 'Massiver Kundenverlust nach Wegfall des Nebenkostenprivilegs.',
			},
			{
				icon: Star,
				title: '1,6/5 Sterne Bewertung',
				detail:
                    'Sehr schlechte Kundenbewertungen auf allen großen Bewertungsportalen.',
			},
			{
				icon: WifiOff,
				title: 'Häufige Totalausfälle',
				detail:
                    'Internet, Telefonie und TV fallen gleichzeitig aus. Rückkanalstörungen häufig.',
			},
			{
				icon: Zap,
				title: 'Nur 20% der gebuchten Speed',
				detail:
                    'Tatsächliche Geschwindigkeiten oft drastisch unter der beworbenen Bandbreite.',
			},
			{
				icon: Unplug,
				title: 'Veraltetes Shared Medium',
				detail:
                    'Kabel-Sharing wie Vodafone, aber noch kleineres und älteres Netz.',
			},
		],
		telekomArguments: [
			{
				icon: Zap,
				title: '💛 Emotionaler Marker: Frustfrei',
				detail:
                    '“Viele PYUR-Kunden kommen zu uns, weil sie am Abend kaum noch surfen konnten. Mit Telekom-Glasfaser ist Schluss mit Shared Medium – Ihre Leitung gehört nur Ihnen.”',
			},
			{
				icon: Trophy,
				title: 'Bundesweit verfügbar, nicht nur regional',
				detail:
                    'PYUR ist nur in wenigen Regionen verfügbar. Die Telekom versorgt ganz Deutschland – bei Umzug behält man seinen Anbieter und muss nichts kündigen.',
			},
			{
				icon: Wifi,
				title: 'Glasfaser vs. veraltetes Kabelnetz',
				detail:
                    'PYUR basiert auf einem kleinen, teilweise veralteten Kabelnetz. Die Telekom investiert in echte Glasfaser bis in die Wohnung (FTTH) – zukunftssicher und ohne Sharing-Probleme.',
			},
			{
				icon: Headphones,
				title: 'Service mit Bestnoten statt 1,6 Sterne',
				detail:
                    'PYUR wird auf Bewertungsportalen mit 1,6/5 Sternen bewertet. Die Telekom gewinnt regelmäßig Kundenservice-Awards und bietet persönliche Betreuung in 500+ Shops.',
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
                    'Kein eigenes Netz. Nutzt Telekom, Vodafone oder o2 im Hintergrund.',
			},
			{
				icon: EyeOff,
				title: 'Netz-Lotterie',
				detail:
                    'Kunden wissen oft nicht, in welchem Netz sie landen. Intransparente Zuordnung.',
			},
			{
				icon: DollarSign,
				title: 'Aggressives Upselling',
				detail:
                    'Bekannt für versteckte Zusatzoptionen und aggressive Vertriebsmethoden.',
			},
			{
				icon: Scissors,
				title: 'Einseitige Kündigungen',
				detail:
                    'Berichte über Vertragskündigungen durch freenet ohne Vorwarnung – sogar 3 Monate nach Abschluss.',
			},
			{
				icon: PhoneOff,
				title: 'Kein technischer Support',
				detail:
                    'Bei Netzproblemen kann freenet nicht helfen – kein eigener Zugriff auf die Infrastruktur.',
			},
			{
				icon: Lock,
				title: 'Schwierige Kündigung',
				detail:
                    'Kündigungsprozesse kompliziert und mangelnde Transparenz bei Vertragsdetails.',
			},
		],
		telekomArguments: [
			{
				icon: Star,
				title: '💛 Emotionaler Marker: Klarheit',
				detail:
                    '“Bei uns gibt\'s keine versteckten Kosten und keine Netz-Lotterie. Sie bekommen das beste Netz Deutschlands – direkt, ohne Mittelsmann.”',
			},
			{
				icon: Shield,
				title: 'Transparenz: Sie wissen, was Sie bekommen',
				detail:
                    'Bei der Telekom buchen Sie das Telekom-Netz – garantiert. Bei freenet wissen Kunden oft nicht, ob sie im Telekom-, Vodafone- oder o2-Netz landen. Und bei Problemen ist niemand zuständig.',
			},
			{
				icon: Signal,
				title: 'Volle Netzqualität, keine Restposten',
				detail:
                    'Reseller wie freenet kaufen Kapazitäten ein und verkaufen sie weiter. Telekom-Direktkunden surfen mit voller Priorität und profitieren sofort von jedem Netzausbau.',
			},
			{
				icon: Headphones,
				title: 'Ehrlicher Service statt Upselling',
				detail:
                    'freenet ist für aggressive Vertriebsmethoden bekannt. Die Telekom berät ehrlich und transparent – unsere Berater werden an Kundenzufriedenheit gemessen, nicht an Upselling-Quoten.',
			},
		],
	},
	{
		id: 'drillisch',
		name: 'Drillisch-Marken (PremiumSIM, smartmobil, winSIM, sim.de)',
		color: '#7b2d8e',
		logoText: 'DR',
		weaknesses: [
			{
				icon: SignalZero,
				title: 'o2-Netz = Platz 3',
				detail:
                    'PremiumSIM, smartmobil, winSIM, sim.de – alle nutzen das o2-Netz. Dauerhaft letzter Platz.',
			},
			{
				icon: Unplug,
				title: 'Kein eigenes Netz',
				detail:
                    'Kein eigener technischer Support. Bei Problemen wird an den Netzbetreiber verwiesen.',
			},
			{
				icon: UserX,
				title: 'Keine Shops',
				detail:
                    'Nur Online – keine persönliche Beratung, kein Ansprechpartner vor Ort.',
			},
			{
				icon: Ban,
				title: 'Kein 5G',
				detail: 'Die meisten Drillisch-Tarife haben keinen Zugang zum 5G-Netz.',
			},
			{
				icon: PhoneOff,
				title: 'Bare-Bones-Service',
				detail: 'Minimal-Support: Bei Problemen wird man im Kreis geschickt.',
			},
			{
				icon: Building2,
				title: '1&1/United Internet',
				detail:
                    'Gehören zum gleichen Konzern – teilen dessen Infrastruktur-Schwächen.',
			},
		],
		telekomArguments: [
			{
				icon: Shield,
				title: '💛 Emotionaler Marker: Qualität zahlt sich aus',
				detail:
                    '“Billig ist nicht günstig. Was nützt ein 5€-Tarif im o2-Netz, wenn man auf dem Land kein Netz hat? Für wenige Euro mehr gibt\'s das beste Netz Deutschlands und echten Service.”',
			},
			{
				icon: Trophy,
				title: 'Bestes Netz vs. günstigstes Netz',
				detail:
                    'Drillisch-Marken nutzen das o2-Netz – dauerhaft Platz 3 in jedem Netztest. Für ein paar Euro mehr im Monat bekommt der Kunde das Telekom-Netz: 15× Testsieger, überall erreichbar.',
			},
			{
				icon: Headphones,
				title: 'Shops & Beratung vs. reine Online-Marke',
				detail:
                    'Drillisch hat keinen einzigen Shop in Deutschland. Bei der Telekom können Kunden jederzeit persönlich vorbeikommen, Geräte anfassen und sich beraten lassen.',
			},
			{
				icon: Signal,
				title: '5G inklusive, nicht als Aufpreis',
				detail:
                    'Viele Drillisch-Tarife haben kein 5G. Bei der Telekom ist 5G in allen aktuellen Tarifen inklusive – mit dem größten 5G-Netz Deutschlands.',
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
                    'Kein eigenes Netz. Nutzt wahlweise Telekom-, Vodafone- oder o2-Kapazitäten.',
			},
			{
				icon: EyeOff,
				title: 'Unübersichtliche Verträge',
				detail:
                    'Abschlüsse oft über Drittplattformen – wenig Transparenz über Vertragsinhalte.',
			},
			{
				icon: PhoneOff,
				title: 'Eingeschränkter Service',
				detail:
                    'Sehr limitierter Kundenservice. Keine Problemlösung vor Ort möglich.',
			},
			{
				icon: UserX,
				title: 'Keine Shops',
				detail:
                    'Keine persönliche Beratung, kein physischer Anlaufpunkt für Kunden.',
			},
			{
				icon: Ban,
				title: 'Kein eigener Tech-Support',
				detail:
                    'Bei Netzproblemen kann klarmobil nicht helfen – kein Zugriff auf die Infrastruktur.',
			},
		],
		telekomArguments: [
			{
				icon: Headphones,
				title: '💛 Emotionaler Marker: Einer für alles',
				detail:
                    '“Warum drei verschiedene Anbieter für Handy, Internet und TV? Bei der Telekom bekommen Sie alles aus einer Hand – einen Vertrag, eine Rechnung, ein Ansprechpartner.”',
			},
			{
				icon: Shield,
				title: 'Direktvertrag statt Mittelsmann',
				detail:
                    'klarmobil ist ein freenet-Reseller. Bei der Telekom haben Sie einen Direktvertrag mit dem Netzbetreiber – keine Drittpartei zwischen Ihnen und Ihrem Netz.',
			},
			{
				icon: Star,
				title: 'Vollständiges Ökosystem',
				detail:
                    'Mobilfunk, Festnetz, Glasfaser, MagentaTV, Smart-Home – alles von einem Anbieter. klarmobil bietet nur Mobilfunk. Kein Festnetz, kein TV, keine Bundles.',
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
				title: 'Abgewertete Netze',
				detail:
                    'Alle Discount-MVNOs nutzen das o2- oder Vodafone-Netz – nie das beste.',
			},
			{
				icon: SignalZero,
				title: 'Niedrigste Netzpriorität',
				detail:
                    'ALDI TALK/Blau: o2-Netz mit niedrigster Priorität. Als erste gedrosselt bei Überlastung.',
			},
			{
				icon: WifiOff,
				title: 'Lidl: Kein Premium-Netz',
				detail:
                    'Lidl Connect nutzt Vodafone-Netz, aber ohne volle Netzpriorität.',
			},
			{
				icon: Ban,
				title: 'Kein 5G, keine Features',
				detail:
                    'Kein 5G, keine Premium-Features, keine Beratung – reines Billig-Angebot.',
			},
			{
				icon: UserX,
				title: 'Null Service',
				detail:
                    'Nur Prepaid-Automation. Kein Ansprechpartner bei Problemen – man steht allein da.',
			},
			{
				icon: Smartphone,
				title: 'Kein Ökosystem',
				detail:
                    'Keine Endgeräte-Auswahl, keine Bundles, kein Zusammenspiel zwischen Produkten.',
			},
		],
		telekomArguments: [
			{
				icon: Zap,
				title: '💛 Emotionaler Marker: Das Beste für die Familie',
				detail:
                    '“Für sich selbst könnte man Discount nehmen. Aber für die Familie will man Verlässlichkeit – dass die Kinder im Notfall anrufen können, dass das Homeoffice nicht abbricht. Das ist die Telekom.”',
			},
			{
				icon: Trophy,
				title: 'Premium-Netz für den Alltag',
				detail:
                    'Discount-Marken nutzen immer die schwächsten Netz-Kapazitäten. Telekom-Kunden surfen mit voller Priorität auf Deutschlands bestem Netz – der Unterschied zeigt sich bei Großevents, in der Stadt und auf Reisen.',
			},
			{
				icon: Headphones,
				title: 'Mensch statt Maschine',
				detail:
                    'Kein Chatbot, keine endlose FAQ-Suche: Telekom bietet echte Menschen in echten Shops. Discount-MVNOs bieten keine Beratung – wer Hilfe braucht, steht allein da.',
			},
			{
				icon: Signal,
				title: 'Zukunftssicher mit 5G & Glasfaser',
				detail:
                    'Discount-Marken haben kein 5G und werden es so schnell nicht bekommen. Die Telekom bietet 5G in allen Tarifen und investiert 30 Mrd. € in Glasfaser bis 2030.',
			},
		],
	},
];

export const OBJECTIONS: Objection[] = [
	{
		id: 'too-expensive',
		title: '„Zu teuer“',
		coreArgument:
            'Tagespreis-Rechnung, Gegenüberstellung Einzelkosten, Mehrwert',
		exampleText:
            '„Ich verstehe, dass der Preis im ersten Moment hoch wirkt. Wenn wir es aber mal auf den Tag herunterrechnen, sprechen wir hier von wenigen Cent. Dafür bekommen Sie das Telekom-Premiumnetz und sparen sich den Ärger. Ist das nicht den kleinen Aufpreis wert?“',
		tip: 'Zuerst Verständnis zeigen. Dann von Gesamtkosten in kleinere, greifbare Einheiten (z.B. Tagespreis) wechseln.',
		icon: DollarSign,
	},
	{
		id: 'dont-need-it',
		title: '„Brauche ich nicht“',
		coreArgument: 'Bedarfsweckung, aktuelle Nutzung hinterfragen',
		exampleText:
            '„Das höre ich oft. Dachte ich anfangs auch. Haben Sie schon mal erlebt, dass abends das Bild ruckelt? Genau hier hilft nämlich diese Lösung, damit das nicht mehr passiert.“',
		tip: 'Fragen stellen, statt zu argumentieren: „Wie nutzen Sie aktuell...?“, „Was machen Sie, wenn...?“',
		icon: EyeOff,
	},
	{
		id: 'need-to-think',
		title: '„Muss drüber nachdenken“',
		coreArgument: 'Zeitdruck, Angebot anbieten',
		exampleText:
            '„Verstehe ich absolut. Nur zur Info: Die aktuelle Aktion gilt nur noch diese Woche. Sollen wir das heute schon mal fertig machen und Sie haben noch ein Widerrufsrecht, falls Sie es sich anders überlegen?“',
		tip: 'Einwand abfedern, aber Dringlichkeit aufbauen (FOMO = Fear of missing out).',
		icon: Clock,
	},
	{
		id: 'im-satisfied',
		title: '„Bin zufrieden“',
		coreArgument: 'Verbesserungspotential zeigen, Vergleich Alt vs. Neu',
		exampleText:
            '„Das freut mich sehr, Herr [Name]. Deswegen melde ich mich auch. Als treuer Kunde haben sich über die Jahre Ihre Konditionen etwas überholt – ich kann Ihnen heute für fast das gleiche Geld die vierfache Leistung anbieten.“',
		tip: 'Zufriedenheit loben, aber Weiterentwicklung (Update) schmackhaft machen.',
		icon: CheckCircle2,
	},
	{
		id: 'in-contract',
		title: '„Bin noch im Vertrag“',
		coreArgument: 'Vormerkung, MagentaEINS-Vorteil, Wechselzeitpunkt',
		exampleText:
            '“Kein Problem! Das ist sogar perfekt. Wir können den Wechsel jetzt schon kostenlos reservieren, Sie sichern sich die heutigen Aktionspreise, und wir kümmern uns automatisch im Hintergrund um die problemlose Kündigung beim alten Anbieter, sobald die Zeit reif ist.”',
		tip: 'Kunden die Angst vor dem \'Doppelt-Zahlen\' nehmen und auf Bequemlichkeit hinweisen.',
		icon: Lock,
	},
	{
		id: 'competitor-cheaper',
		title: '„Wettbewerber ist günstiger“',
		coreArgument: 'Lösung: Überleitung zu Battlecards',
		exampleText:
            '“Da haben Sie recht, auf dem Papier sieht das günstiger aus. Aber wissen Sie auch, woran dort gespart wird? Oft ist es die Netzqualität am Abend oder der Kundenservice. Welcher Anbieter ist es denn genau?”',
		tip: 'Sofort in die Analyse gehen (\'Welcher Anbieter?\') und dann ins Battlecard-Panel (Tab: Wettbewerb) wechseln.',
		icon: AlertTriangle,
	},
];
