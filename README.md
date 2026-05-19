# Sales Experience – Technical Repository

Dieses Repository enthält den Quellcode der **Sales Experience**, einem internen Vertriebsberatungs- und Kalkulationstool für die Deutsche Telekom Service GmbH.

---

## 🚀 Technologie-Stack

*   **Framework**: Next.js 16 (App Router, React 19)
*   **Datenbank**: PostgreSQL via Prisma ORM
*   **Caching**: Dragonfly (Redis) via `ioredis`
*   **API-Layer**: tRPC (v11) mit vollständiger TypeScript-Typisierung
*   **Styling**: Tailwind CSS v4 & Framer Motion
*   **Mailing**: Resend API

---

## 📚 Dokumentation

Die vollständige technische Dokumentation befindet sich im Ordner `/docs`. 

Bitte starte mit der Hauptseite:
👉 **[DTS SalesHelper Dokumentations-Zentrale](./docs/README.md)**

Dort findest du:
1. Einen **[Entwickler-Quickstart](./docs/README.md#%EF%B8%8F-entwickler-quickstart)** zur lokalen Einrichtung.
2. Die Erklärung aller **[Umgebungsvariablen](./docs/README.md#%EF%B8%8F-umgebungsvariablen-environments)**.
3. Die Liste aller verfügbaren **[npm/pnpm-Befehle](./docs/README.md#-cli--npm-befehlsübersicht)**.
4. Tiefgehende Einblicke in die **[Berechtigungs-Architektur](./docs/architecture/rbac-architecture.md)** (RBAC/RLS) und den **[Datenbank-Betrieb](./docs/operations/database.md)**.
