# Datenbank & Cache-Betrieb (PostgreSQL & Dragonfly Redis)

Dieses Dokument beschreibt die Datenbankstruktur, die logische Isolation der Umgebungen, die Caching-Architektur über Dragonfly Redis sowie Richtlinien zur Optimierung von tRPC-Datenbankabfragen.

---

## 1. Relationales Datenmodell (PostgreSQL & Prisma)

Das Datenmodell ist in `prisma/schema.prisma` definiert. Es speichert ausschließlich organisationsinterne Daten der Vertriebsmitarbeiter sowie Tarif- und Rabattstrukturen. Es werden keine Endkundendaten in der Datenbank gespeichert.

### Datenbank-Tabellen im Überblick

* **`User` / `UserSession`**: Speichert Vertriebsmitarbeiter, administrative Profile und deren aktive Sitzungen.
* **`OdRegion` / `Location` / `Team`**: Repräsentiert die organisatorische Hierarchie der Deutschen Telekom Service GmbH zur Durchsetzung von Berechtigungssphären.
* **`Product` / `Addon`**: Bildet den Tarifkatalog (Basistarife, Optionen) ab.
* **`SpecialPrice` / `SpecialPriceTier`**: Verwaltet Aktionspreise und monatliche Rabattstaffeln.
* **`TeamHighlight`**: Steuert teambezogene Produktempfehlungen.
* **`News` / `MaintenanceAnnouncement`**: Speichert Systemankündigungen und geplante Wartungsfenster.
* **`Passkey`**: Enthält WebAuthn-Registrierungsdaten für die passwortlose Authentifizierung.

### Index-Spezifikationen zur Abfragebeschleunigung

Um die Ausführungszeit hochfrequenter tRPC-Leseabfragen zu minimieren, sind folgende Verbundindizes (Compound Indexes) auf dem `Product`-Modell definiert:
* `@@index([category, isActive, priority])`: Optimiert filterbasierte Abfragen im Produktkatalog (`productRouter.list`) bei der Navigation durch Tarifkategorien.
* `@@index([isActive, priority])`: Beschleunigt unbefilterte Auflistungen im Dashboard und in System-Feeds.

---

## 2. Datenbank-Umgebungen

Das System nutzt eine PostgreSQL-Instanz und trennt die Betriebsumgebungen über separate logische Datenbanken sowie dedizierte Redis-Datenbank-Indizes:

| Umgebung | Umgebungsvariablen | Logische Datenbank | Redis-Datenbank-Index |
| :--- | :--- | :--- | :--- |
| **Development** | `.env.development` | `dtag_dev` | `/2` (Datenbank 2) |
| **Staging** | `.env.staging` | `dtag_staging` | `/1` (Datenbank 1) |
| **Production** | `.env.production` | `dtag` | `/0` (Datenbank 0) |

---

## 3. Caching-System (Dragonfly Redis)

Das Caching ist in `src/lib/cache.ts` und `src/lib/redis.ts` implementiert. Es nutzt die `ioredis`-Bibliothek und fängt hochfrequente Datenbank-Lesezugriffe ab.

### Mechanismen und Schutzfunktionen

* **Thundering-Herd-Schutz**: Die Methode `getCached` verwaltet ein In-Process-Register (`inflight`-Map) aktiver Abfragen. Gehen bei einem Cache-Miss zeitgleich identische Leseanfragen ein, wird nur eine einzige Datenbankabfrage ausgelöst. Parallele Anfragen warten auf die Auflösung desselben Promises.
* **Ressourcenschonende Invalidierung**: Zur Cache-Leerung nutzt `invalidateCache` den nicht-blockierenden `SCAN`-Iterator anstelle des blockierenden `KEYS`-Befehls.
* **Fehlertoleranz (Graceful Degradation)**: In `src/lib/redis.ts` ist die Offline-Warteschlange von `ioredis` deaktiviert (`enableOfflineQueue: false`). Bei einem Verbindungsausfall zu Redis schlagen Cache-Anfragen sofort fehl, und das System greift direkt auf PostgreSQL zurück.

---

## 4. Cache-Schlüssel & Kaskadierende Invalidierung

Um die Konsistenz und Zugriffskontrolle (RBAC) zu sichern, verwendet das System segmentierte Cache-Schlüssel und kaskadierende Löschketten.

### Segmentierte Cache-Schlüssel

1. **Sitzungsdaten (Session-Cache)**:
   * Key-Format: `session:user:${userId}:current`
   * Gültigkeit: 60 Sekunden.
2. **Organisatorische News-Feeds**:
   * Key-Format: `news:active:r_${odRegionId}:l_${locationId}:t_${teamId}`
   * Gewährleistet, dass Benutzer News-Einträge nur dann sehen, wenn diese für ihre jeweilige Organisationseinheit freigegeben sind.
3. **Stammdaten-Listen (OD-Bereiche, Standorte, Teams)**:
   * Die Listenabfragen für administrative Dropdowns werden für 1 Stunde gecacht. Die Schlüssel berücksichtigen Filter- und Rollen-Metadaten:
     * OD-Bereiche: `odRegions:list:role_${role}:od_${userOd}:s_${search}:c_${cursor}:${limit}`
     * Standorte: `locations:list:role_${role}:od_${userOd}:loc_${userLoc}:inp_loc_${inpLoc}:inp_od_${inpOd}:s_${search}:c_${cursor}:${limit}`
     * Teams: `teams:list:role_${role}:od_${userOd}:loc_${userLoc}:team_${userTeam}:inp_loc_${inpLoc}:inp_od_${inpOd}:s_${search}:c_${cursor}:${limit}`

### Kaskadierende Invalidierung (Dependency Mapping)

Schreibende Operationen (Mutationen) lösen kaskadierende Cache-Löschungen aus, da untergeordnete Hierarchie-Listen von Änderungen an übergeordneten Elementen abhängen:

* **Änderung eines Teams**: Invalidiert `teams:list`.
* **Änderung eines Standorts**: Invalidiert `locations:list` und `teams:list`.
* **Änderung eines OD-Bereichs**: Invalidiert `odRegions:list`, `locations:list` und `teams:list`.

---

## 5. Entwickler-Anleitung: Caching anpassen

### TTL-Gültigkeit (Time to Live) ändern

Die Gültigkeitsdauer für Cache-Einträge ist über Konstanten in `src/lib/cache.ts` oder direkt beim Aufruf von `getCached` definiert. Um die TTL einer Abfrage anzupassen, deklariere oder ändere den TTL-Wert in Millisekunden:

```typescript
// Erhöhung der Gültigkeit für Systemeinstellungen auf 24 Stunden (in Millisekunden)
const SETTINGS_TTL = 24 * 60 * 60 * 1000; 

const settings = await getCached("systemSettings", SETTINGS_TTL, () => {
  return prisma.systemSetting.findMany();
});
```

### Neuen Cache-Schlüssel registrieren & invalidieren

Führe folgende Schritte aus, um eine neue Datenstruktur (z. B. `ProductHighlight`) zu cachen:

1. **Abfrage cachen**: Kapsle die Datenbankabfrage in `getCached` unter Verwendung eines eindeutigen Keys:
   ```typescript
   export async function getProductHighlights(teamId: string) {
     const cacheKey = `productHighlights:team:${teamId}`;
     const ONE_HOUR = 60 * 60 * 1000;

     return getCached(cacheKey, ONE_HOUR, () => {
       return prisma.teamHighlight.findMany({
         where: { teamId },
       });
     });
   }
   ```
2. **Invalidierungs-Hook integrieren**: Rufe nach schreibenden Datenbankzugriffen (Erstellung, Update, Löschung) `invalidateCache` auf:
   ```typescript
   // In der entsprechenden tRPC-Mutation:
   await ctx.prisma.teamHighlight.update({
     where: { id: input.id },
     data: input.data,
   });

   // Invalidiert alle Cache-Einträge, die mit dem Namespace beginnen
   await invalidateCache(`productHighlights:team:${input.teamId}`);
   ```
