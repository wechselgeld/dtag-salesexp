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
				title: '💛 Emotionaler Marker: Kein Frust mehr am Feierabend',
				detail:
					'"Stellen Sie sich vor, Sie kommen gestresst von der Arbeit, wollen nur noch Netflix schauen – und das Bild ruckelt wieder. Wollen Sie sich wirklich jeden Abend ärgern, nur um 5 Euro zu sparen? Bei der Telekom haben Sie Ihre eigene Leitung, da gibt es dieses Nachbarschafts-Problem nicht."',
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
				title: 'Testsieger Service statt Warteschleifen',
				detail:
					'Im aktuellen connect Festnetz-Hotline-Test hat die Telekom mit Platz 1 ("sehr gut") abgeschnitten. Vodafone landete mit großem Abstand dahinter. Bei der Telekom spricht man mit echten Menschen in Deutschland, nicht mit Bots oder Call-Centern im Ausland.',
			},
			{
				icon: Shield,
				title: 'Garantierte Stabilität vs Shared Medium',
				detail: 'Gerade im Homeoffice oder beim Online-Gaming zählt Stabilität. Das Kabelnetz ist fehleranfällig und extrem abhängig von der Auslastung im Quartier. Telekom Glasfaser bietet durchgehend die gebuchte Geschwindigkeit, selbst wenn ganz Deutschland streamt.',
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
				title: '💛 Emotionaler Marker: Erreichbarkeit ist Sicherheit',
				detail:
					'"Was bringt Ihnen der günstigste Tarif, wenn Sie im Notfall auf der Landstraße stehen oder Ihre Kinder im Urlaub nicht erreichen können? O2 hat auf dem Land oft Funklöcher. Die Telekom bedeutet Sicherheit für Sie und Ihre Familie überall in Deutschland."',
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
				title: 'CHIP Netztest: Klarer Testsieger vs. Platz 3',
				detail:
					'Im CHIP Netztest bleibt die Telekom mit großem Abstand Testsieger, während o2 den letzten Platz belegt. Besonders auf dem Land und in Gebäuden merken Sie diesen Unterschied jeden Tag.',
				source: 'CHIP Netztest 2025',
			},
			{
				icon: Headphones,
				title: 'Echte Hilfe bei Problemen',
				detail: 'Die Telekom bietet hunderte Shops und einen Testsieger-Support. Bei o2 landen Kunden oft in endlosen Warteschleifen oder Chatbots, wenn es wirklich mal Probleme gibt.',
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
				title: '💛 Emotionaler Marker: Das Original, keine Kopie',
				detail:
					'"1&1 mietet Leitungen nur an. Wenn etwas kaputt geht, müssen die erst uns als Leitungseigentümer anrufen. Wollen Sie wirklich über den Mittelsmann gehen, wenn Sie das Original zum ähnlichen Preis haben können? Direkt bei der Telekom heißt: Direkte Hilfe ohne Wartezeit."',
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
				title: '💛 Emotionaler Marker: Vom Holzklasse- zum First-Class-Service',
				detail:
					'"Congstar ist unsere Discount-Tochter – super für den Einstieg. Aber irgendwann wächst man da raus. Sie wollen echten Service in einem Shop vor Ort, das volle 5G-Netz ohne Drosselung und das neueste Smartphone? Dann sind Sie reif für das Original."',
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
				title: '💛 Emotionaler Marker: Kein Risiko bei Großprojekten',
				detail:
					'"Sie reißen für den Glasfaseranschluss Ihren Vorgarten auf – da wollen Sie doch einen Partner, der Erfahrung hat und morgen noch existiert. Bei der Deutschen Glasfaser häufen sich Baustopps. Die Telekom baut zuverlässig und mit regionalen Partnern."',
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
				title: '💛 Emotionaler Marker: Schluss mit der Kabel-Lotterie',
				detail:
					'"Jeden Abend hoffen, dass die Nachbarn nicht zu viel streamen, damit das eigene Internet noch geht? Das ist Kabel. Mit einem Wechsel zur Telekom kaufen Sie sich Ihren Seelenfrieden zurück: Ihre eigene Leitung, konstante Leistung."',
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
				title: '💛 Emotionaler Marker: Keine bösen Überraschungen',
				detail:
					'"Freenet lockt oft mit extrem niedrigen Einstiegspreisen, die dann stillschweigend steigen. Wollen Sie ständig Ihre Rechnungen kontrollieren müssen? Bei der Telekom haben Sie einen klaren, fairen Vertrag beim Netzbetreiber selbst."',
			},
			{
				icon: Shield,
				title: 'Echtes Telekom-Netz statt Reseller-Labyrinth',
				detail:
					'Freenet verkauft Tarife in verschiedenen Netzen (Telekom, Vodafone, o2). Kunden wissen oft gar nicht, wo sie landen. Bei der Telekom haben Sie zu 100 % das prämierte Telekom-Netz mit voller Netzpriorität.',
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
				title: '💛 Emotionaler Marker: Wer billig kauft, kauft zweimal',
				detail:
					'"Was nützt Ihnen der 5-Euro-Tarif von Drillisch, wenn Sie Google Maps in der Pampa nicht laden können oder der Support nicht ans Telefon geht? Gutes Netz ist wie gute Reifen am Auto: daran sollte man nicht sparen."',
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
				title: '💛 Emotionaler Marker: Alles aus einem Guss',
				detail:
					'"Sie haben Ihr Festnetz bei der Telekom, aber Handy bei Klarmobil? Da verschenken Sie jeden Monat Geld! Mit dem MagentaEINS-Vorteil bündeln wir das. Sie sparen bares Geld, bekommen doppeltes Datenvolumen und haben nur noch eine Rechnung."',
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
				title: '💛 Emotionaler Marker: Sicherheit für Ihre Liebsten',
				detail:
					'"Ein Discounter-Tarif ist okay für das Zweithandy. Aber für Ihre Familie wollen Sie 100 % Zuverlässigkeit. Dass die Kinder Sie auf dem Nachhauseweg immer erreichen können und Sie im Homeoffice keine Abbrüche haben. Das ist das Telekom-Gefühl."',
			},
			{
				icon: Trophy,
				title: 'Vorfahrt im besten Netz',
				detail:
					'Bei Discounter-Marken (wie ALDI oder Blau) sind Sie Kunde zweiter Klasse und surfen mit der niedrigsten Priorität. Wenn das Netz bei einem Konzert oder in der Bahn voll ist, fliegen Sie als Erstes raus. Telekom-Direktkunden haben immer Vorfahrt.',
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

	{
		id: 'no-time',
		title: '„Habe gerade keine Zeit“',
		coreArgument: 'Künstliche Verknappung, 60-Sekunden-Lösung',
		exampleText: '„Verstehe ich absolut, Zeit ist Geld. Genau deshalb mache ich es ganz kurz: Ich sehe hier gerade, dass Ihre Leitung für einen Bruchteil mehr auf die doppelte Leistung hochgestuft werden kann – und ich kann Ihnen die Bereitstellungsgebühr heute komplett erlassen. Das dauert zum Buchen weniger als 60 Sekunden. Sollen wir das direkt für Sie absichern, bevor das Angebot morgen ausläuft?“',
		tip: 'Die „keine Zeit“-Ausrede ernst nehmen, aber eine sofortige Lösung in 60 Sekunden anbieten. Verknappung zwingt zur Entscheidung.',
		icon: Clock,
	},
	{
		id: 'bad-experience',
		title: '„Schlechte Erfahrungen mit der Telekom gemacht“',
		coreArgument: 'Validierung des Schmerzes, Neuanfang, Premium-Argument',
		exampleText: '„Ich verstehe Ihren Ärger vollkommen, das würde mir genauso gehen. Genau aus diesen Fehlern der Vergangenheit haben wir gelernt. Deswegen bin ich heute Ihr persönlicher Ansprechpartner. Unser Netz wurde nicht ohne Grund wieder als das beste Deutschlands ausgezeichnet. Lassen Sie uns die alte Geschichte abhaken: Ich richte Ihnen das System jetzt so ein, dass es ab Tag 1 stabil läuft. Welchen Namen darf ich für die Auftragsbestätigung eintragen?“',
		tip: 'Den Schmerz validieren, aber sofort einen Schlussstrich ziehen („alte Geschichte abhaken“) und in die Abschlussfrage übergehen. Nicht als Bittsteller auftreten.',
		icon: AlertTriangle,
	},
	{
		id: 'too-much-effort',
		title: '„Ein Wechsel ist mir zu viel Aufwand“',
		coreArgument: 'Rundum-Sorglos-Paket, psychologische Entlastung',
		exampleText: '„Genau deshalb rufen Sie mich an – den Papierkram tut sich heute keiner mehr freiwillig an. Das läuft bei uns so: Sie lehnen sich zurück, ich klicke hier auf "Rundum-Sorglos". Wir kündigen für Sie, wir nehmen Ihre Rufnummer mit und wir garantieren, dass das Internet ohne einen einzigen Tag Unterbrechung weiterläuft. Sie müssen nichts tun, außer am Schalttag den neuen Router einzustecken. Brauche ich für den Wechsel Ihre aktuelle Anbieternummer, oder soll ich die kurz für Sie heraussuchen?“',
		tip: 'Das Bild im Kopf von „Arbeit“ auf „Urlaub“ umschalten („Sie lehnen sich zurück“). Die Alternativfrage am Ende führt direkt in den Buchungsprozess.',
		icon: CheckCircle2,
	},
	{
		id: 'partner-decides',
		title: '„Das muss ich mit meinem Partner besprechen“',
		coreArgument: 'Risk Reversal (Widerrufsrecht), Einbeziehung des Partners',
		exampleText: '„Absolut verständlich, wichtige Entscheidungen trifft man zusammen. Wenn Ihr Partner jetzt neben Ihnen stünde: Würde er eher sagen "Hauptsache das Internet läuft endlich stabil" oder "Hauptsache wir sparen beim TV-Paket"? ... Perfekt, genau so habe ich das Angebot nämlich auch konfiguriert. Ich buche Ihnen das jetzt mit einem 14-tägigen Widerrufsrecht ein. Sie besprechen das heute Abend entspannt bei einem Glas Wein – wenn Ihr Partner wider Erwarten "Nein" sagt, reicht ein Klick und alles ist hinfällig. Aber den aktuellen Aktionsrabatt haben Sie sich erst mal gesichert. Schicke ich die Bestätigung an Ihre E-Mail-Adresse?“',
		tip: 'Kunden zum Entscheider machen und das 14-tägige Widerrufsrecht als Sicherheitsnetz nutzen („Risk Reversal“). Abschluss risikofrei machen.',
		icon: UserX,
	},
];
