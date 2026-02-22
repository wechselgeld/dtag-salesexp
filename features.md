# Telekom Sales Helper - Feature Dokumentation

Dieses Dokument dient als Übersicht und Bedienungsanleitung für den **Telekom Sales Helper**. Es beschreibt die Kernfunktionen, die logischen Abläufe und die administrativen Möglichkeiten des Tools.

---

## 1. Frontend & Verkaufs-Prozess (Agenten-Ansicht)

### 1.1 Dashboard & Navigation

- **Hero-Bereich:** Zeigt aktuelle News, Team-Highlights und Schnellzugriffe auf Produktkategorien.
- **Globale Suche:** Ermöglicht das schnelle Finden von Tarifen, Addons oder News.
- **Sidebar:** Intuitive Navigation durch Kategorien (Mobilfunk, Glasfaser, DSL, Hardware) sowie Zugriff auf FAQ und Einstellungen.

### 1.2 Produkt-Konfigurator

Wird ein Produkt (z.B. MagentaMobil M) ausgewählt, öffnet sich der Konfigurator:

- **Business Case Auswahl:** Der Agent wählt zwischen _Neuaktivierung_, _Umzug_, _Tarifwechsel_ oder _Speed-Up_.
  - **Was passiert?** Die App passt automatisch die Einmalpreise (Bereitstellungsgebühren) und verfügbaren Rabatte basierend auf dem Case an.
- **Addon-System:** Anzeige kompatibler Zusatzoptionen (z.B. Disney+, Multi-SIM).
  - **Logik:** Es werden nur Optionen angezeigt, die für das gewählte Produkt freigegeben sind.
- **MagentaEINS & Spezial-Preise:** Aktivierung von Kombi-Vorteilen.
  - **Was passiert?** Die monatlichen Kosten werden in Echtzeit aktualisiert.
- **Einmalige Gutschriften:** Manuelle Auswahl von Gutschriften (Credits), die das Startguthaben erhöhen.

### 1.3 Preis-Timeline & Warenkorb (Basket)

- **24-Monats-Visualisierung:** Ein interaktiver Zeitstrahl zeigt genau, in welchem Monat welche Kosten anfallen (z.B. wenn Rabatte nach 6 oder 12 Monaten entfallen).
- **Basket-Drawer:** Eine Zusammenfassung aller gewählten Komponenten.
- **PDF-Export:** Generierung eines professionellen Angebots-PDFs per Klick.
  - **Inhalt:** Auflistung aller Kosten, Rabatte, Addons und der kumulierten Ersparnis über 24 Monate.

---

## 2. Admin-Dashboard (Management-Ebene)

Das Admin-Interface ist über `/admin` erreichbar (Login erforderlich) und erlaubt die vollständige Kontrolle über die Datenbasis.

### 2.1 Produkt-Management

- **Katalog-Pflege:** Erstellen, Bearbeiten und Deaktivieren von Tarifen.
- **Technische Details:** Hinterlegung von Bandbreiten, Datenvolumen und Vertragslaufzeiten.
- **Preis-Logik:** Definition von Basispreisen und herkunftsspezifischen Bereitstellungsgebühren.

### 2.2 Addon- & Kompatibilitäts-Manager

- **Globale vs. Produktspezifische Addons:** Definition, ob eine Option für alle oder nur bestimmte Tarife verfügbar ist.
- **Staffelpreise:** Addons können zeitgesteuerte Preise haben (z.B. 0€ für 3 Monate, danach 6,95€).

### 2.3 Spezial-Preise & Rabatt-Aktionen

- **Spezial-Tiers:** Erstellen von komplexen Rabattstrukturen (z.B. "MagentaMobil Young" Vorteil).
- **Bedingungs-Logik:** Rabatte können an bestimmte Voraussetzungen geknüpft werden (z.B. "Nur bei Neuaktivierung").

### 2.4 Team- & News-Management

- **Team-Highlights:** Admins können bestimmte Produkte als "Fokus-Produkte" für Teams markieren, die dann auf dem Dashboard prominent angezeigt werden.
- **Globale News:** Erstellen von Tickern oder Popups für wichtige Informationen (z.B. neue Provisionsmodelle oder Wartungsarbeiten).
- **Wartungsmodus:** Möglichkeit, geplante Wartungen anzukündigen, um Agenten vorab zu informieren.

---

## 3. Technische Highlights & Sicherheit

- **Echtzeit-Berechnung:** Keine Seiten-Reloads nötig; alle Preisänderungen (Zustand: Zustand) werden sofort berechnet.
- **Rollenbasiertes System:** Unterscheidung zwischen Admin (voller Zugriff) und Team-Leader (begrenzter Zugriff).
- **Offline-Fähigkeit (PWA Basis):** Das Tool ist für hohe Performance optimiert, um Verzögerungen im Kundengespräch zu vermeiden.
- **Modernes Design:** Dunkelmodus-Support und Einhaltung der Telekom Branding-Guidelines (TeleNeo Schriftarten, Magenta-Akzente).

---

## 4. Workflows für den Teamleiter (Quick-Start)

1. **Neuen Tarif hinzufügen:** `Admin -> Produkte -> Neu` -> Daten eingeben -> Speichern.
2. **Angebot erstellen:** `Home -> Kategorie wählen -> Tarif konfigurieren -> Basket öffnen -> PDF generieren`.
3. **News veröffentlichen:** `Admin -> News -> Erstellen` -> Betreff & Text eingeben -> Aktivieren.
