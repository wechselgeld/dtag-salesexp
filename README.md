# Sales Experience (SXP)

**Sales Experience**, kurz SXP, ist ein internes Vertriebsberatungs- und Kalkulationstool für die Deutsche Telekom Service GmbH.

---

## Stack

*   **Framework**: Next.js 16 (App Router, React 19)
*   **Datenbank**: PostgreSQL via Prisma ORM
*   **Caching**: Dragonfly (Redis) via `ioredis`
*   **API-Layer**: tRPC (v11) mit vollständiger TypeScript-Typisierung
*   **Styling**: Tailwind CSS v4 & Framer Motion
*   **Mailing**: Resend

---

## Dokumentation

Die vollständige technische Dokumentation befindet sich im Ordner `/docs`. 

Bitte starte mit der Hauptseite: **[Doc Home](./docs/README.md)**

Dort findest du:
1. Einen **[Entwickler-Quickstart](./docs/README.md#%EF%B8%8F-entwickler-quickstart)** zur Einrichtung.
2. Eine Liste aller **[Env Variables](./docs/README.md#%EF%B8%8F-umgebungsvariablen-environments)**.
3. Die Liste aller verfügbaren **[Scripts](./docs/README.md#-cli--npm-befehlsübersicht)**.
4. Tiefgehende Einblicke in die **[Berechtigungsen](./docs/architecture/rbac-architecture.md)** (RBAC/RLS) und den **[Datenbank-Betrieb](./docs/operations/database.md)**.
