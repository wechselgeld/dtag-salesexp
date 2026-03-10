# Datenbankabfragen – Analyse & Optimierungspotenzial

> Ergebnis einer vollständigen Codeanalyse aller tRPC-Router und Frontend-Komponenten.

---

## Übersicht: Abfragen pro Seitenaufruf

### 🏠 Startseite `/products`

| Abfrage                   | Endpoint                                               | Tabellen                                            |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| Session laden             | `session.getCurrent`                                   | `SalesSession` → join `Team` → join `TeamHighlight` |
| Alle Produkte (Übersicht) | `product.getAllProducts`                               | `Product`                                           |
| Design-Einstellungen      | `settings.getDesignSettings`                           | `SystemSetting` (7 Keys)                            |
| Header-Design             | `settings.getDesignSettings` (doppelt)                 | `SystemSetting` (via `hero-header.tsx`)             |
| Neuigkeiten               | `news.listActive`                                      | `News`                                              |
| Neuigkeiten (nochmal)     | `news.listActive` (via `global-news-notification.tsx`) | `News`                                              |

**Gesamtzahl: ~6 Abfragen** pro Seitenaufruf.

> ⚠️ **Problem 1**: `news.listActive` wird **zweimal abgerufen** – von `NewsCarousel` UND `GlobalNewsNotification`. TanStack Query dedupliziert diese Anfragen zwar serverseitig, aber nur wenn beide im selben Render-Zyklus aufgerufen werden.
>
> ⚠️ **Problem 2**: `settings.getDesignSettings` wird von der Hauptseite und von der `HeroHeader`-Komponente **unabhängig** abgefragt – ebenfalls eine potenzielle Doppelabfrage.

---

### 📋 Kategorie-Seite `/products/[category]`

| Abfrage                   | Endpoint                        | Tabellen                                                                         |
| ------------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| Session laden             | `session.getCurrent`            | `SalesSession` + Joins                                                           |
| Produkte der Kategorie    | `product.getProductsByCategory` | `Product` → join `SpecialPrice` → join `SpecialPriceTier` → join `SalesArgument` |
| Such-Produkte (SearchBar) | `product.getAllProducts`        | `Product`                                                                        |

**Gesamtzahl: ~3 Abfragen** + **1 separater Metadaten-Fetch** für den Seitentitel im `page.tsx` (Server-Side, nur `name` Feld).

> ⚠️ **Problem 3**: Die `SearchBar` ruft `getAllProducts` (alle Produkte, kein Include) ab, obwohl `getProductsByCategory` (mit allen Includes) bereits geladen wurde. Das ist eine **redundante Abfrage**.

---

### 📄 Produkt-Detailseite `/products/[category]/[id]`

| Abfrage               | Endpoint                         | Tabellen                                                                                  |
| --------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| **Metadata (Server)** | Direkt prisma (generateMetadata) | `Product` (nur `name`)                                                                    |
| Session laden         | `session.getCurrent`             | `SalesSession` + Joins                                                                    |
| Produkt-Details       | `product.getProductById`         | `Product` → `SpecialPrice` → `SpecialPriceTier` → `Addon` → `AddonTier` → `SalesArgument` |
| Globale Addons        | (in `getProductById`)            | `Addon` → `AddonTier`                                                                     |
| Design-Einstellungen  | `settings.getDesignSettings`     | `SystemSetting`                                                                           |

**Gesamtzahl: ~5 Abfragen** (davon 2 innerhalb von `getProductById`).

> ⚠️ **Problem 4**: `getProductById` führt intern **zwei sequenzielle Abfragen** aus (`findUnique` für das Produkt, dann `findMany` für globale Addons). Das könnte mit einem einzigen JOIN gelöst werden.

---

### 🛒 Warenkorb / Basket Drawer (global, überall)

Der `BasketDrawer` ist global und auf allen Produktseiten immer geöffnet/abrufbar:

| Abfrage      | Endpoint                    | Tabellen               |
| ------------ | --------------------------- | ---------------------- |
| Gutschriften | `product.getOneTimeCredits` | `OneTimeCredit`        |
| Session      | `session.getCurrent`        | `SalesSession` + Joins |

**Gesamtzahl: ~2 Abfragen** (werden gecacht durch TanStack Query, da dieselbe Query bereits auf der Seite aktiv ist).

---

### ⚡ Gesamtabfragen pro typischer Nutzer-Journey

| Schritt                           | Abfragen                   |
| --------------------------------- | -------------------------- |
| Login/Setup-Page                  | 2–3 (systemSetting checks) |
| OD-Region / Standort / Team laden | 3–4                        |
| Startseite                        | 6                          |
| Kategorie-Seite (z.B. Mobilfunk)  | 3                          |
| Produkt-Detail                    | 5                          |
| Warenkorb öffnen                  | 0 (gecacht)                |
| **Gesamt (ein typischer Besuch)** | **~19–21 Abfragen**        |

---

## Kritische Probleme & Verbesserungspotenzial

### 🔴 Problem 1: Mehrfach-Abfrage `news.listActive`

**Ursache**: `NewsCarousel` und `GlobalNewsNotification` fragen dieselben Daten unabhängig ab.

**Lösung**: TanStack Query dedupliziert dies automatisch, **aber nur wenn beide Komponenten gleichzeitig gemountet sind**. Falls `GlobalNewsNotification` auf anderen Seiten aktiv ist, wird trotzdem neu abgefragt.

→ **Empfehlung**: Daten in einem `useNews()` Custom Hook kapseln oder auf den globalen TanStack-Cache setzen (staleTime erhöhen).

---

### 🔴 Problem 2: `systemSetting` – N Einzelabfragen statt eine

**Aktuelles Problem**: In `session.ts` (requestVerification) werden `allowed_ips` und `require_email_verification` in **zwei separaten** `findUnique`-Aufrufen gelesen:

```typescript
// session.ts – requestVerification (AKTUELL)
const setting = await ctx.prisma.systemSetting.findUnique({
	where: { key: "allowed_ips" }
});
// ... danach nochmal:
const emailVerificationSetting = await ctx.prisma.systemSetting.findUnique({
	where: { key: "require_email_verification" }
});
```

Das sind **2 Abfragen, die eine sein könnten**:

```typescript
// BESSER: Eine Abfrage, alle benötigten Keys auf einmal
const settings = await ctx.prisma.systemSetting.findMany({
	where: { key: { in: ["allowed_ips", "require_email_verification"] } }
});
const allowedIps = settings.find((s) => s.key === "allowed_ips")?.value || "";
const emailRequired =
	settings.find((s) => s.key === "require_email_verification")?.value !==
	"false";
```

---

### 🟡 Problem 3: `getAllProducts` in SearchBar (redundante Abfrage auf Kategorie-Seite)

**Problem**: Auf der Kategorie-Seite laden wir bereits alle Produkte der Kategorie via `getProductsByCategory`. Die `SearchBar` lädt dann zusätzlich **alle Produkte aller Kategorien** für die globale Suche.

**Optionen**:

- ✅ **Option A (einfach)**: `staleTime` auf `getAllProducts` erhöhen, sodass es nicht bei jedem Seitenwechsel neu lädt (derzeit: 0ms).
- ✅ **Option B (besser)**: Die SearchBar auf einem **dedizierten schlanken Endpoint** betreiben, der nur `id, name, category, basePrice` zurückgibt (kein Include).

---

### 🟡 Problem 4: `getProductById` – 2 sequenzielle Abfragen

```typescript
// Aktuell in product.ts:
const product = await prisma.product.findUnique({ ... }); // Abfrage 1
const globalAddons = await prisma.addon.findMany({ where: { isGlobal: true } }); // Abfrage 2
```

**Besser**: Beide parallel mit `Promise.all()`:

```typescript
const [product, globalAddons] = await Promise.all([
    prisma.product.findUnique({ ... }),
    prisma.addon.findMany({ where: { isGlobal: true, isActive: true }, include: { tiers: true } })
]);
```

Das halbiert die Latenz dieser Abfrage.

---

### 🟢 Was gut läuft

| Aspekt                                      | Bewertung                                                                                |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **TanStack Query Caching**                  | ✅ Abfragen werden clientseitig gecacht – kein Re-Fetch bei Navigation innerhalb der App |
| **Pagination auf Listenendpoints**          | ✅ Alle Admin-Listen (Products, Sessions, Teams usw.) sind paginiert                     |
| **Prefetching auf Startseite**              | ✅ Kategorie-Produkte werden beim Hover per `prefetch()` vorgeladen                      |
| **Prisma Singleton**                        | ✅ Verhindert Connection-Leak bei Hot-Reloading                                          |
| **Connection Pooling**                      | ✅ (connection_limit=10 gesetzt)                                                         |
| **Slow Query Logging**                      | ✅ Warnungen ab 500ms in `lib/prisma.ts` eingebaut                                       |
| **select-only Abfrage in generateMetadata** | ✅ Nur `name` wird abgefragt, kein unnötiges Laden aller Felder                          |

---

## Zusammenfassung der empfohlenen Optimierungen

| Priorität   | Maßnahme                                                    | Aufwand     | Einsparung                                    |
| ----------- | ----------------------------------------------------------- | ----------- | --------------------------------------------- |
| 🔴 Hoch     | `systemSetting` in requestVerification zusammenfassen       | Gering      | 1 DB-Abfrage/Login                            |
| 🔴 Hoch     | `getProductById` mit `Promise.all()` parallelisieren        | Gering      | ~50% weniger Wartezeit für Produktdetailseite |
| 🟡 Mittel   | `staleTime` auf häufig abgerufene Queries erhöhen           | Sehr gering | Weniger DB-Last bei schneller Navigation      |
| 🟡 Mittel   | Schlanken Suchendpoint für SearchBar (`id, name, category`) | Mittel      | Weniger Daten übertragen                      |
| 🟢 Optional | Neuigkeiten in Context / globalem Cache zentralisieren      | Mittel      | 1 weniger DB-Abfrage pro Seitenaufruf         |
