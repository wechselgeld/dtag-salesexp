# Datenbank- & Cache-Betrieb (PostgreSQL & Dragonfly Redis)

Dieses Dokument erläutert das Datenbankmodell, die logische Trennung der Umgebungen, die Caching-Infrastruktur mit Dragonfly (Redis) und die tRPC-Abfrageoptimierung.

---

## 1. Relationales Schema (PostgreSQL & Prisma)

Das Datenmodell ist in `prisma/schema.prisma` definiert. Die Kernentitäten sind:

*   **`User` & `UserSession`**: Speichert Vertriebsmitarbeiter (Admins, Teamleiter, Berater) und deren aktive Sitzungen. Es werden **keine Endkundendaten** in der Datenbank gespeichert.
*   **`OdRegion` / `Location` / `Team`**: Bildet die organisatorische Hierarchie ab, über die Zugriffe und Sichtbarkeiten gesteuert werden.
*   **`Product` & `Addon`**: Bildet den Produktkatalog mit Basistarifen und Zubuchoptionen ab.
*   **`SpecialPrice` & `SpecialPriceTier`**: Speichert Aktionsrabatte und monatliche Preisstaffeln.
*   **`TeamHighlight`**: Steuert, welche Produkte für ein bestimmtes Team als Empfehlung hervorgehoben werden.
*   **`News` & `MaintenanceAnnouncement`**: Systemweite Mitteilungen und Wartungsankündigungen.
*   **`Passkey`**: Speichert Hardware-Sicherheitsschlüssel für die passwortlose Authentifizierung.

---

## 2. Datenbank-Umgebungen (Logical Separation)

Alle Umgebungen werden auf derselben PostgreSQL-Instanz in separaten logischen Datenbanken betrieben:

| Umgebung | Lokale Env-Datei | Logische DB | Redis-Datenbank |
| :--- | :--- | :--- | :--- |
| **Development** | `.env.development` | `dtag_dev` | `/2` (DB 2) |
| **Staging** | `.env.staging` | `dtag_staging` | `/1` (DB 1) |
| **Production** | `.env.production` | `dtag` | `/0` (DB 0) |

---

## 3. Caching-System (Dragonfly Redis)

Die Anwendung verwendet **Dragonfly (Redis)** über die `ioredis`-Bibliothek für das Session- und Produktkatalog-Caching.

### Implementierung (`src/lib/cache.ts`)
*   **Thundering-Herd-Schutz**: Die Methode `getCached` verwaltet ein In-Process-Register (`inflight` Map) laufender Datenbankabfragen. Gehen bei einem Cache-Miss zeitgleich 100 identische Anfragen ein, wird nur eine einzige DB-Abfrage ausgelöst. Die restlichen 99 warten auf dasselbe Promise.
*   **Ressourcenschonende Invalidierung**: Statt des blockierenden O(N) `KEYS *`-Befehls verwendet `invalidateCache` den nicht-blockierenden `SCAN`-Iterator, um alte Cache-Einträge schrittweise zu löschen.
*   **Verbindungs-Fehlertoleranz (`src/lib/redis.ts`)**: Die Offline-Warteschlange von `ioredis` ist deaktiviert (`enableOfflineQueue: false`). Fällt der Redis-Server aus, schlagen Cache-Abfragen sofort fehl und die Anwendung greift direkt auf PostgreSQL zurück. Ein Redis-Ausfall führt somit nicht zum Absturz der Applikation.

---

## 4. tRPC Query-Footprint & Performance-Richtlinien

Basierend auf einer detaillierten Abfrageanalyse wurden folgende Optimierungsmuster implementiert, die bei zukünftigen Änderungen eingehalten werden müssen:

### A. Zusammenfassen von Einstellungen (SystemSettings)
Vermeide N-Einzelabfragen auf Systemeinstellungen. Die Authentifizierungsroutinen cachen die Einstellungen (`allowed_ips`, `require_email_verification`) stundenweise im Speicher via Redis:
```typescript
const setting = await getCached('systemSettings:allowed_ips', SETTINGS_TTL, () => {
    return ctx.prisma.systemSetting.findUnique({ where: { key: 'allowed_ips' } });
});
```

### B. Parallelisierung von Abfragen (`Promise.all`)
Abfragen auf Detailseiten, die voneinander unabhängig sind, müssen parallel und nicht sequenziell ausgeführt werden, um die Latenz zu halbieren.
*   **Negativbeispiel (Sequenziell)**:
    ```typescript
    const product = await prisma.product.findUnique({ ... });
    const globalAddons = await prisma.addon.findMany({ ... });
    ```
*   **Positivbeispiel (Parallel)**:
    ```typescript
    const [product, globalAddons] = await Promise.all([
        prisma.product.findUnique({ ... }),
        prisma.addon.findMany({ ... })
    ]);
    ```

### C. Clientseitiges Query-Caching (TanStack Query)
Häufig abgefragte Stammdaten (wie z. B. alle Produkte in der Suchleiste) nutzen eine erhöhte `staleTime` im Frontend, um unnötige Re-Fetches beim Navigieren durch Kategorien zu verhindern.
