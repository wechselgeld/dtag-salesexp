# 🚀 Datenbank-Workflow (PostgreSQL & Dragonfly Redis)

Dieses Projekt nutzt als Backend-Architektur jetzt **PostgreSQL** für relationale Daten und **Dragonfly (Redis)** als High-Performance Caching Layer. Beide Dienste laufen auf einem Coolify-Server. Um sicher zwischen Entwicklung (Dev), Staging, und Produktion (Prod) zu wechseln, folge diesem Leitfaden.

---

## 1. Setup & Environments

Wir trennen unsere Umgebungen strikt in logische Datenbanken auf denselben Coolify-Instanzen. Das Setup wird über drei `.env`-Dateien gesteuert:

- **`.env.development`** (Lokale Entwicklung)
  - **PostgreSQL:** Greift auf die logische Datenbank `dtag_dev` zu.
  - **Redis:** Nutzt die logische Datenbank `2` (`/2`).
  - *Hinweis:* Nutzt zwingend die **öffentliche** Server-IP, damit Prisma von deinem lokalen Rechner aus läuft.
  
- **`.env.staging`** (Testserver)
  - **PostgreSQL:** Greift auf die logische Datenbank `dtag_staging` zu.
  - **Redis:** Nutzt die logische Datenbank `1` (`/1`).
  - *Hinweis:* Nutzt intern den lokalen Coolify-Link (`postgres://...ehw7rf6u2wnhpitoj87rmw3i...`), verfügt aber für lokale Skripte über eine `PUBLIC_DATABASE_URL` Fallback-Variable.

- **`.env.production`** (Live-Daten)
  - **PostgreSQL:** Greift auf die primäre logische Datenbank `dtag` zu.
  - **Redis:** Nutzt die logische Datenbank `0` (`/0`).
  - *Hinweis:* Nutzt ebenfalls die extrem schnellen und sicheren internen Coolify-Links, und `PUBLIC_DATABASE_URL` als Fallback für lokale Operationen.

---

## 2. Änderungen am Schema vornehmen

Wenn du ein neues Feld in der `schema.prisma` hinzufügst:

1. Passe die `prisma/schema.prisma` an.
2. Führe folgenden Befehl aus, um deine **Dev-Datenbank** (`dtag_dev`) zu aktualisieren:
   ```bash
   pnpm run db:push:dev
   ```
   *Wenn Prisma meldet, dass die Datenbank nicht existiert ("does not exist"), bestätige mit `Y`, damit Prisma sie automatisch frisch anlegt!*
3. Teste alles lokal (`pnpm dev`).

---

## 3. Caching System (Dragonfly Redis)

Früher haben wir Queries mit einer internen `Map` (Memory Cache) zwischengespeichert. Ab sofort nutzen wir dafür global **Dragonfly (Redis)** über `ioredis`. 

Die Implementierung sitzt in `src/lib/cache.ts` und ist ein 1:1 Drop-In Replacement zur alten Logik. **Jede Stelle im Projekt**, die `getCached(...)` aufruft (z.B. alle Produkte in `src/server/routers/product.ts`), profitiert ab sofort von massiv schnelleren Ladezeiten durch den zentralen Redis-Server.

**Beispiel Cache Invalidation:**
```typescript
import { invalidateCache } from '@/lib/cache';
// Löscht alle Cache-Einträge, die mit "product" anfangen (läuft asynchron im Hintergrund, non-blocking!)
invalidateCache('product');
```

---

## 4. Helper Scripts (Datenbank & Migration)

Folgende Helfer-Skripte sind in der `package.json` vordefiniert:

| Befehl | Aktion | Erklärung |
| :--- | :--- | :--- |
| `pnpm run db:push:dev` | Schema synchronisieren | Pusht Schema zu `dtag_dev` |
| `pnpm run db:push:staging` | Schema synchronisieren | Pusht Schema zu `dtag_staging` |
| `pnpm run db:push:prod` | Schema synchronisieren | Pusht Schema zu `dtag` |
| `pnpm run db:migrate:data` | **Daten-Migration MySQL ➔ PostgreSQL** | Verbindet sich mit der alten Oracle MySQL DB (`OLD_MYSQL_URL` in `.env.development`) und migriert alle Tabellen, Relationen und Typen in **alle drei (!) PostgreSQL Umgebungen parallel.** |

---

## 5. Deployment Checkliste (Produktion / Coolify)

1. **Port in Coolify kurz öffnen:** Für das Pushen vom lokalen Rechner aus musst du in Coolify bei der PostgreSQL-Instanz ("postgresql-database-...") unter "Configuration" den Schalter **Make it accessible from the internet** aktivieren.
2. **Push für Staging & Prod:** Führe vom Rechner aus nacheinander `pnpm run db:push:staging` und `pnpm run db:push:prod` aus.
3. **Migration triggern:** Führe `pnpm run db:migrate:data` aus, um die Live-Datenbanken deckungsgleich mit Alt-Daten und Settings zu befüllen.
4. **Port schließen:** Wenn fertig, schalte den Internet-Zugriff in Coolify für Postgres wieder aus (Sicherheitsbest-Practice).
5. **Auto-Deploy:** Git-Push auf Staging/Main triggert den Coolify Build automatisch. Prisma generiert den Client im `postinstall`-Schritt von ganz alleine.

---

## 6. Besonderheiten bei PostgreSQL vs MySQL

- **Connection Limits:** In den neuen URLs hängen wir `?connection_limit=20&pool_timeout=30` an, da Prisma mit PostgreSQL performanter im Connection Pooling arbeitet als mit MySQL.
- **Booleans:** PostgreSQL ist im Gegensatz zu MySQL sehr streng bei Datentypen (`true`/`false` statt `TinyInt 1/0`). Dies fängt unser Migrationsscript für alle Alt-Daten automatisch ab.
- **Relationen (Join-Tables):** Im Gegensatz zu regulären Modellen erfordern m:n-Relationen in Prisma spezielle Fallbacks für Imports. Das Migrations-Skript setzt deshalb temporär `session_replication_role = 'replica'`, um die Daten komplett ohne lästige Foreign Key Exceptions rüberzuziehen.
