# Technical Documentation Hub – DTS SalesHelper

Willkommen in der technischen Dokumentations-Zentrale der **Sales Experience** – dem internen Vertriebsberatungstool der Deutschen Telekom Service GmbH.

Dieses Verzeichnis dient als Single Source of Truth für Entwickler und technische Administratoren.

---

## 🗺️ Dokumentations-Übersicht

Die technische Dokumentation ist in folgende Bereiche gegliedert:

### 1. Grundlagen

- **[OVERVIEW.md](./overview.md)**: Einführung in das System, den Tech Stack, die Verzeichnungsstruktur und die Betriebsumgebungen.

### 2. Software-Architektur

- **[architecture/rbac-architecture.md](./architecture/rbac-architecture.md)**: Das Berechtigungssystem (RBAC), die Row-Level Security (RLS) via Prisma Extension, die hierarchische Scope-Validierung und Session-Revocation-Mechanismen.
- **[architecture/audit-log.md](./architecture/audit-log.md)**: Das Audit-Log-System (Aktivitätslog), die request-scoped Session-Erfassung via AsyncLocalStorage, der Prisma Interceptor und die transaktionssichere Revert Engine.
- **[architecture/design-system.md](./architecture/design-system.md)**: Der Design-Leitfaden basierend auf der Telekom-Identität (TeleNeo Schriftart, Farbvariablen, Abrundungen, Framer Motion Motion-Timings).

### 3. Betrieb & Infrastruktur

- **[operations/database.md](./operations/database.md)**: PostgreSQL-Schema-Setup, Dragonfly-Redis (Caching-Topologie) und die tRPC-Query-Performance-Optimierungen.
- **[operations/hosting.md](./operations/hosting.md)**: Coolify Cloud Deployment-Setup, Dockerfile, Nginx-Reverse-Proxy Konfiguration, PM2 Prozessmanager und SMTP/E-Mail Integrationen.
- **[operations/automation.md](./operations/automation.md)**: Wartungsroutinen, die Mitarbeiter-Authentifizierung (WebAuthn Passkeys & Resend Mail) und automatisierte PostgreSQL DB-Cleanups.
- **[operations/privacy.md](./operations/privacy.md)**: DSGVO-Empfehlungen, Datensparsamkeit, employee-focused Privacy-Informationen und sichere Token-Gültigkeitsbereiche.

---

## ⚡ Entwickler-Quickstart

Stelle sicher, dass du **Node.js LTS (v20 oder v22)** und **pnpm** installiert hast.

```bash
# 1. Repository klonen und in das Verzeichnis wechseln
git clone <repo-url> dts_saleshelper
cd dts_saleshelper

# 2. Abhängigkeiten installieren
pnpm install

# 3. Lokale Umgebungsvariablen einrichten (siehe unten)
cp .env.development .env

# 4. Datenbank-Schema in die Dev-Datenbank pushen (Prisma)
pnpm run db:push:dev

# 5. Lokalen Entwicklungs-Server starten
pnpm run dev
```

---

## ⚙️ Umgebungsvariablen (Environments)

Die Konfiguration wird über Umgebungsvariablen gesteuert. Jede Umgebung (`.env.development`, `.env.staging`, `.env.production`) benötigt folgende Definitionen:

| Variable                   | Beschreibung                                                            | Beispiel / Standardwert                                                        |
| :------------------------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| `DATABASE_URL`             | PostgreSQL-Verbindungs-String (inkl. Connection Pool Limit)             | `postgresql://user:pass@host:5432/db_name?connection_limit=20&pool_timeout=30` |
| `REDIS_URL`                | Dragonfly/Redis Verbindungs-String für Session-Caching                  | `redis://localhost:6379/2` (Dev) oder `/0` (Prod)                              |
| `JWT_SECRET`               | Geheimer Schlüssel zur Signierung der custom JWTs                       | Mindestens 64 Zeichen langer zufälliger String                                 |
| `RESEND_API_KEY`           | API-Schlüssel für den E-Mail-Dienst (Resend)                            | `re_123456789...`                                                              |
| `EMAIL_FROM`               | Absenderadresse für Verifizierungs- und Welcome-Mails                   | `Sales Experience <noreply@deine-domain.de>`                                   |
| `FEEDBACK_RECIPIENT_EMAIL` | Empfängeradresse für das In-App Feedback-System                         | `hello@flxk.nz`                                                                |
| `NEXT_PUBLIC_APP_URL`      | Die öffentlich erreichbare Basis-URL der App (wichtig für Passkey APIs) | `https://sales-exp.prod.flxk.nz/`                                              |

---

## 🛠️ CLI & npm Befehlsübersicht

Im Projekt stehen verschiedene vordefinierte npm-Skripte zur Verfügung:

### Entwicklungs-Befehle

- `pnpm run dev`: Startet den Next.js-Entwicklungsserver unter `http://localhost:3000`.
- `pnpm run build`: Erstellt einen optimierten Produktions-Build der Next.js-App (generiert Standalone-Ausgabe in `.next/standalone`).
- `pnpm run start`: Startet die gebaute Anwendung aus dem Standalone-Ordner.
- `pnpm run lint`: Führt ESLint aus, um Syntax- und Stilfehler zu prüfen.

### Prisma & Datenbank-Befehle

- `pnpm run db:push:dev`: Synchronisiert das Prisma-Schema direkt mit der lokalen Entwicklungsdatenbank (`dtag_dev`).
- `pnpm run db:push:staging`: Synchronisiert das Schema mit der Staging-Datenbank.
- `pnpm run db:push:prod`: Synchronisiert das Schema mit der Produktions-Datenbank (`dtag`).
- `pnpm run db:migrate:dev`: Erstellt und wendet eine versionierte Datenbank-Migration für die Entwicklungsdatenbank an.
- `pnpm run db:migrate:staging`: Wendet ausstehende Migrationen auf der Staging-Umgebung an.
- `pnpm run db:migrate:prod`: Wendet ausstehende Migrationen auf der Produktions-Umgebung an.
- `pnpm run db:seed:dev`: Befüllt die Entwicklungsdatenbank mit vordefinierten Testdaten (Tarife, Standorte, Teams, Demobenutzer).
- `pnpm run db:seed:staging`: Befüllt die Staging-Datenbank mit initialen Systemwerten.
- `pnpm run db:seed:prod`: Führt das minimale Produktions-Seeding (Grundeinstellungen, Systemkeys) aus.

### Administrative Utility-Befehle

- `pnpm run manage-admins`: Startet das CLI-Tool zur Erstellung und Verwaltung von administrativen Benutzern in der Datenbank.
- `pnpm run db:sync:catalog`: _(Optional / Veraltet)_ Skript zum Synchronisieren von Tarifdaten.

---

> Bei technischen Fragen oder Problemen wende dich direkt an den betreuenden Entwickler oder erstelle ein Issue im Git-Repository.
