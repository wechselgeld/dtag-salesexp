# Technische Dokumentation SXP

Dieses Verzeichnis enthält die technische Dokumentation der Sales Experience (SXP), dem internen Vertriebsberatungstool der Deutschen Telekom Service GmbH.

Die SXP ist ein eigenständiges Tool, das nicht mit anderen Telekom-Schnittstellen verbunden ist. Derzeit findet der Einsatz des Tools ausschließlich im Callcenter-Umfeld (Inbound & Outbound) in Live-Kontakten statt.

---

## Dokumentations-Übersicht

Die Dokumentation ist in folgende Abschnitte unterteilt:

### 1. Grundlagen

* **[overview.md](./overview.md)**: Systemarchitektur, Tech Stack, Verzeichnisstruktur und Betriebsumgebungen.

### 2. Software-Architektur

* **[architecture/rbac-architecture.md](./architecture/rbac-architecture.md)**: Rollenbasierte Zugriffskontrolle (RBAC), Row-Level Security (RLS) über Prisma-Erweiterungen, hierarchische Scope-Validierung und Session-Widerruf.
* **[architecture/audit-log.md](./architecture/audit-log.md)**: Aktivitätslog, transaktionssichere Revert Engine, request-scoped Session-Erfassung über AsyncLocalStorage und Prisma-Interceptor.
* **[architecture/design-system.md](./architecture/design-system.md)**: Design-Vorgaben basierend auf der Telekom-Identität (Schriftart TeleNeo, Farbvariablen, Framer Motion Motion-Timings).

### 3. Betrieb & Infrastruktur

* **[operations/database.md](./operations/database.md)**: PostgreSQL-Schema-Setup, Dragonfly-Redis (Caching-Topologie) und tRPC-Query-Performance-Optimierungen.
* **[operations/hosting.md](./operations/hosting.md)**: Deployment über Coolify (Docker), PM2-Prozessmanager, Nginx-Reverse-Proxy-Konfiguration und SMTP/Resend-Integration.
* **[operations/automation.md](./operations/automation.md)**: Wartungsroutinen, Mitarbeiter-Verifizierung und automatisierte PostgreSQL-Datenbankbereinigungen.
* **[operations/privacy.md](./operations/privacy.md)**: Technische DSGVO-Checkliste, Datensparsamkeit, Cookie-Spezifikationen und OpenPanel-Ereignistracking.

---

## Entwickler-Quickstart

Für die lokale Entwicklung werden **Node.js LTS (v20 oder v22)** und **pnpm** benötigt.

Führe die folgenden Schritte aus, um das Projekt lokal aufzusetzen:

```bash
# 1. Repository klonen und in das Verzeichnis wechseln
git clone <repo-url> sxp
cd sxp

# 2. Abhängigkeiten installieren
pnpm install

# 3. Lokale Umgebungsvariablen konfigurieren
cp .env.development .env

# 4. Datenbank-Schema in die Dev-Datenbank pushen (Prisma)
pnpm run db:push:dev

# 5. Lokalen Entwicklungs-Server starten
pnpm run dev
```

---

## Umgebungsvariablen (Environments)

Die Steuerung der Konfiguration erfolgt über Umgebungsvariablen. Jede Umgebung (`.env.development`, `.env.staging`, `.env.production`) benötigt die folgenden Definitionen:

| Variable | Beschreibung | Standardwert / Beispiel |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL-Verbindungs-String mit Connection-Pool-Limit. | `postgresql://user:pass@host:5432/db_name?connection_limit=20&pool_timeout=30` |
| `REDIS_URL` | Dragonfly/Redis-Verbindungs-String für Session-Caching. | `redis://localhost:6379/2` (Dev) oder `/0` (Prod) |
| `JWT_SECRET` | Geheimer Schlüssel zur Signierung der Custom JWTs. | Zufälliger String (mindestens 64 Zeichen) |
| `RESEND_API_KEY` | API-Schlüssel für den E-Mail-Dienst (Resend). | `re_123456789...` |
| `EMAIL_FROM` | Absenderadresse für Verifizierungs- und Willkommens-Mails. | `Sales Experience <noreply@deine-domain.de>` |
| `FEEDBACK_RECIPIENT_EMAIL` | Empfängeradresse für das In-App Feedback-System. | `hello@flxk.nz` |
| `NEXT_PUBLIC_APP_URL` | Öffentlich erreichbare Basis-URL der App (relevant für WebAuthn). | `https://sales-exp.prod.flxk.nz/` |

---

## CLI & npm Befehlsübersicht

Im Projekt sind verschiedene npm-Skripte vordefiniert:

### Entwicklungs-Befehle

* `pnpm run dev`: Startet den Next.js-Entwicklungsserver unter `http://localhost:3000`.
* `pnpm run build`: Erstellt einen optimierten Produktions-Build (Standalone-Ausgabe in `.next/standalone`).
* `pnpm run start`: Startet die gebaute Anwendung aus dem Standalone-Ordner.
* `pnpm run lint`: Prüft die Syntax und Code-Richtlinien über ESLint.

### Prisma & Datenbank-Befehle

* `pnpm run db:push:dev`: Synchronisiert das Prisma-Schema direkt mit der lokalen Entwicklungsdatenbank (`dtag_dev`).
* `pnpm run db:push:staging`: Synchronisiert das Schema mit der Staging-Datenbank.
* `pnpm run db:push:prod`: Synchronisiert das Schema mit der Produktions-Datenbank (`dtag`).
* `pnpm run db:migrate:dev`: Erstellt und wendet eine versionierte Datenbank-Migration für die Entwicklungsdatenbank an.
* `pnpm run db:migrate:staging`: Wendet ausstehende Migrationen auf der Staging-Umgebung an.
* `pnpm run db:migrate:prod`: Wendet ausstehende Migrationen auf der Produktions-Umgebung an.
* `pnpm run db:seed:dev`: Befüllt die Entwicklungsdatenbank mit vordefinierten Testdaten (Tarife, Standorte, Teams, Demobenutzer).
* `pnpm run db:seed:staging`: Befüllt die Staging-Datenbank mit initialen Systemwerten.
* `pnpm run db:seed:prod`: Führt das minimale Produktions-Seeding (Grundeinstellungen, Systemkeys) aus.

### Administrative Utility-Befehle

* `pnpm run manage-admins`: Startet das CLI-Tool zur Erstellung und Verwaltung von administrativen Benutzern in der Datenbank.
* `pnpm run db:sync:catalog`: Skript zum Synchronisieren von Tarifdaten.
