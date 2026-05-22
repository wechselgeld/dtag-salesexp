# Design System & UI-Richtlinien

Dieses Dokument beschreibt die technische Umsetzung des Design-Systems, der Farbvariablen, der Typografie und der Animationskonventionen für das Frontend.

---

## 1. Systemstruktur & CSS-Konfiguration

Das UI basiert auf Tailwind CSS v4. Die Systemvariablen sind über die `@theme`-Direktive in den CSS-Dateien definiert und steuern das einheitliche Erscheinungsbild der Benutzeroberfläche.

### Core-Farben (Telekom Brand)

Feste Farbwerte (Hex-Codes) sind im Code zu vermeiden. Nutze stattdessen die vordefinierten Klassen:

* **Magenta (`--color-primary`)**: `#E20074` – Primäre Aktionsfarbe für Buttons, aktive Zustände und Marken-Highlights.
* **Dark Gray (`--color-ds-text-main`)**: `#262626` – Haupttextfarbe für Fließtext und Titel mit hohem Kontrast.
* **Light Gray (`--color-ds-text-light`)**: `#6A6A6A` – Sekundärer Text für Metadaten und Nebensächlichkeiten.
* **Shell Gray**: `#F7F8FA` – Hintergrundfarbe für Anwendungs-Container und Cards.
* **Border Gray (`--color-ds-border`)**: `#E0E0E0` – Standardfarbe für Trennlinien und Kanten.

### Funktionale Farben

* **Success (Erfolg)**: `#2B8A3E` – Kennzeichnung aktiver Rabatte, positiver Kalkulationsergebnisse und Erfolgsmeldungen.
* **Danger (Gefahr / Fehler)**: `#D9534F` – Kennzeichnung für Validierungsfehler, Ausschlüsse und destruktive Aktionen (z. B. Lösch-Buttons).

---

## 2. Typografie & Schriftfamilien

Das Branding erfordert die Schriftarten-Familie **TeleNeo** und **TeleNeo-Marker**.

* **Titel-Hierarchie (`h1` / `h2`)**: Fettgedruckt mit reduziertem Zeichenabstand (`letter-spacing`).
* **Karten-Überschriften (`h3`)**: Schriftgröße `1.15rem`, Schriftschnitt `Bold` (z. B. in Produkt- und Addon-Karten).
* **Body (Fließtext)**: Standardgröße, hoher Farbkontrast zur Gewährleistung der Barrierefreiheit.
* **Labels & Metriken**: Schriftgröße `0.72rem`, Schriftschnitt `Medium` (z. B. für Laufzeitangaben oder Bandbreiten-Badges).

---

## 3. UI-Elemente & Layout-Spezifikationen

### Eckenradien (Border Radius)

* **Inhaltskarten (Cards) und Haupt-Panels**: Standard-Radius beträgt `20px` (`rounded-[20px]` / `rounded-3xl`).
* **Steuerelemente**: Buttons, Eingabefelder und Dropdown-Menüs nutzen einen einheitlichen Eckenradius von `10px` (`rounded-[10px]` / `rounded-lg`).

### Visuelle Effekte & Overlays

* **Karten-Layouts (Cards)**:
  * Hintergrund-Gradient: `bg-linear-to-br from-white to-[#FCFAFC]`
  * Rahmen: `1px solid #E8E8E8`
  * Hover-Zustand: Schatten-Verstärkung (`shadow-[0_4px_24px_rgba(0,0,0,0.06)]`) und Kanten-Akzentuierung.
* **Glassmorphismus (`.glass`)**:
  * Eingesetzt für Header, Slide-Over Drawers und Modals.
  * Umsetzung über CSS-Backdrop-Filter: `backdrop-filter: blur(12px)` kombiniert mit einer semitransparenten Hintergrundfarbe.

---

## 4. Animationen & Framer Motion

Interaktive Übergänge und Zustandswechsel nutzen **Framer Motion**:

* **Standard-Timing**: Dauer von 400ms (`duration-400 ease-out`) oder nicht-lineare Bewegungskurven über `cubic-bezier(0.16, 1, 0.3, 1)`.
* **Shimmer-Effekt**: Skelett-Ladeplatzhalter pulsieren im Frequenzbereich des Shimmer-Musters mit einer leichten Magenta-Nuance.
* **Border-Glow**: Hervorgehobene Empfehlungen oder Fokusprodukte nutzen einen rotierenden Conic-Gradient-Rahmen (`highlight-glow`).

---

## 5. Beziehungen & Komponenten-Verwendung

Die Design-Vorgaben sind direkt in den wiederverwendbaren UI-Komponenten in `src/components/shared/` umgesetzt:

* **`guard.tsx`**: Nutzt die standardmäßigen Berechtigungsabfragen und passt UI-Elemente (z. B. Sichtbarkeit) an.
* **`premium-pin-input.tsx`**: Setzt den standardisierten Eckenradius von `10px` (`rounded-[10px]`) für die PIN-Zahlenfelder um.
* **`telekom-logo.tsx`**: Kapselt das Vektorlogo der Telekom und rendert es mit der CSS-Markenfarbe `--color-primary`.

---

## 6. Entwickler-Anleitung: Design-System modifizieren

### Core-Branding-Farben anpassen

Die Definition der Farben erfolgt in der globalen CSS-Datei des Projekts. Um beispielsweise den Standard-Farbwert für Magenta anzupassen, modifiziere die CSS-Themen-Konfiguration:

```css
@theme {
  --color-primary: #E20074; /* Neuer HEX-Code für die Primärfarbe */
  --color-ds-border: #E0E0E0; /* Anpassung der Standard-Rahmenfarbe */
}
```

### Custom Tailwind Utility registrieren

Wenn ein neues wiederkehrendes Styling-Muster (z. B. ein weicher Schatten) projektweit verfügbar sein soll, deklariere die Utility-Klasse in der globalen CSS-Datei:

```css
@utility shadow-soft-premium {
  box-shadow: 0 8px 32px rgba(38, 38, 38, 0.04);
}
```
Die Klasse steht anschließend im gesamten JSX-Code als `shadow-soft-premium` zur Verfügung.

### Framer Motion Übergangszeit global ändern

Wenn du die Dauer aller Standard-Einblendungen oder Drawer-Animationen anpassen möchtest, modifiziere die Config-Konstanten der entsprechenden Animationsdatei (z. B. unter `src/lib/constants/` oder direkt in den Motion-Props):

```typescript
// Beispiel für ein zentrales Transition-Config-Objekt
export const DEFAULT_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  duration: 0.4, // Ändere diesen Wert, um das Timing anzupassen
};
```
