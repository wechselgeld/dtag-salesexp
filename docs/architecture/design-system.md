# Design System & UI-Richtlinien

Dieses Dokument beschreibt die Design-Philosophie, die visuelle Sprache und die Styling-Konventionen für die **Sales Experience**-Plattform. 

Das Design folgt einer Ästhetik, die die offizielle Deutsche Telekom Identität mit modernen Web-Interaktionen und flüssigen Animationen kombiniert.

---

## 1. Visuelle Philosophie

*   **Verlässliche Wertigkeit**: Klare Abgrenzungen, großzügiges Spacing und gut lesbare Schriftbilder.
*   **Dynamische Zustände**: Visuelle Rückmeldung bei Nutzerinteraktionen (Hover-Effekte, selektierte Kanten, weiche Einblendungen).
*   **Kategorien-Fokus**: Farblich aufeinander abgestimmte Badges und Icons, um den Vertrieblern die Unterscheidung von Mobilfunk, Festnetz und MagentaTV zu erleichtern.
*   **Ein-Seiten-Gefühl**: Minimierung ganzer Seiten-Reloads durch flüssig reagierende Slider, Slide-Over Drawers und Modals.

---

## 2. Farbpalette & CSS-Variablen

Das UI greift die offizielle Telekom Farbpalette auf. Die Farbvariablen sind in der `@theme`-Direktive der CSS-Dateien definiert.

### Core-Farben (Telekom Brand)

*   **Magenta**: `#E20074` (`--color-primary`) – Primäre Aktionsfarbe, Buttons und Highlights.
*   **Dark Gray**: `#262626` (`--color-ds-text-main`) – Haupttext.
*   **Light Gray**: `#6A6A6A` (`--color-ds-text-light`) – Sekundärer Text / Meta-Angaben.
*   **Shell Gray**: `#F7F8FA` – Hintergrund für App-Container.
*   **Border Gray**: `#E0E0E0` (`--color-ds-border`) – Standard-Rahmenlinien.

### Funktionale Farben

*   **Success (Erfolg)**: `#2B8A3E` (z. B. für aktive Rabatte oder fertige Berechnungen)
*   **Danger (Gefahr / Fehler)**: `#D9534F` (z. B. für ungültige Auswahlausschlüsse oder Lösch-Buttons)

---

## 3. Typographie

Die Applikation nutzt die **TeleNeo** und **TeleNeo-Marker** Schriftarten-Familie für ein einheitliches Telekom-Branding.

*   **Titel-Hierarchie (`h1` / `h2`)**: Fettgedruckt, mit reduziertem Zeichenabstand für markantes Branding.
*   **Karten-Überschriften (`h3`)**: `1.15rem`, Bold (z. B. in Tarif- und Addon-Cards).
*   **Body (Fließtext)**: Standardgröße, hoher Kontrast auf hellem Hintergrund.
*   **Labels / Stats**: `0.72rem`, Medium (z. B. Laufzeit-Angaben, Bandbreiten-Badges).

---

## 4. UI-Elemente & Komponenten

### Karten-Layouts & Eckenradien
*   **Karten-Ecken**: Der Standard für Inhaltskarten und Panels liegt bei **`20px`** (`rounded-3xl` / `rounded-[20px]`).
*   **Kompakte Steuerelemente**: Kleine UI-Elemente wie Buttons, Eingabefelder und Dropdowns nutzen **`10px`** (`rounded-lg` / `rounded-[10px]`).

### Standard-Karten-Effekte (Cards)
*   **Hintergrund**: `bg-linear-to-br from-white to-[#FCFAFC]`.
*   **Kante**: `1px solid #E8E8E8`.
*   **Hover-Effekt**: Sanfte Schatten-Verstärkung (`shadow-[0_4px_24px_rgba(0,0,0,0.06)]`) und Kanten-Hervorhebung.

### Glassmorphismus (Unschärfe-Overlays)
*   Für Header, Drawer-Hintergründe und Modals wird ein Blur-Effekt genutzt:
    *   Klasse: `.glass`
    *   CSS: `backdrop-filter: blur(12px)` kombiniert mit einer leicht transparenten Hintergrundfarbe.

---

## 5. Animationen & Bewegungsmuster

Alle Interface-Wechsel verwenden **Framer Motion** für weiche Animationen.

*   **Standard-Übergänge**: `duration-400 ease-out` oder exponentielles Ausfaden mittels `cubic-bezier(0.16, 1, 0.3, 1)`.
*   **Shimmer (Skelett-Ladeeffekt)**: Während Daten geladen werden, zeigt die App ein sanft pulsierendes Shimmer-Muster mit leichtem Magenta-Stich.
*   **Highlight-Glow**: Ausgewählte Tarife oder Fokusprodukte nutzen einen rotierenden Conic-Glow-Effekt an den Rändern (`highlight-glow`).

---

## 6. Tailwind CSS v4 Richtlinien

Im Code sollten feste Farbwerte vermieden werden. Verwende stattdessen die vordefinierten Klassen:

*   **Textfarben**: `text-ds-text-main`, `text-ds-text-light`.
*   **Rahmen**: `border-ds-border`.
*   **Abgerundete Ecken**: `rounded-[20px]` (Karten) oder `rounded-[10px]` (Buttons).
*   **Eigene Utilities**:
    *   `.scrollbar-none`: Versteckt Scrollbalken in horizontalen Tarif-Scrollbars.
    *   `.animate-fade-slide-up`: Weiches Einfliegen von Listeninhalten von unten nach oben.
