# System-Übersicht (Sales Experience)

Diese Dokumentation beschreibt die grundlegende Systemarchitektur, den Tech Stack und die Verzeichnisstruktur des Sales Experience Vertriebsberatungstools.

## 1. Systemarchitektur

Die Anwendung ist als Fullstack Next.js Applikation konzipiert und kommuniziert über tRPC zwischen Client und Server.

### Datenfluss & Kommunikationswege

1. **Client (Browser)**: Der Client rendert die Benutzeroberfläche mit React 19 und verwaltet lokale Zustände. API-Anfragen an das Backend erfolgen typsicher über tRPC.
2. **Backend (Next.js Server)**: tRPC-Prozeduren verarbeiten die Anfragen auf dem Server. Hier greifen Authentifizierungs- und Autorisierungs-Middlewares (RBAC & RLS).
3. **Caching (Dragonfly Redis)**: Sitzungsdaten, News-Feeds und Stammdaten-Listen werden im In-Memory-Cache (Dragonfly) abgelegt, um wiederholte PostgreSQL-Abfragen zu vermeiden.
4. **Datenbank (PostgreSQL)**: Prisma ORM fungiert als Abstraktionsschicht zur relationalen PostgreSQL-Datenbank.

---

## 2. Tech Stack

Folgende Kerntechnologien kommen in diesem Projekt zum Einsatz:

* **Framework**: Next.js 15 (App Router)
* **Laufzeitumgebung**: Node.js v20 / v22 LTS
* **Programmiersprache**: TypeScript
* **Datenbank-ORM**: Prisma ORM
* **Datenbank**: PostgreSQL 15 / 16
* **Cache-Datenbank**: Dragonfly Redis
* **API-Protokoll**: tRPC (TanStack Query im Frontend)
* **Styling**: Tailwind CSS v4
* **Animationen**: Framer Motion
* **E-Mail-Dienst**: Resend API

---

## 3. Verzeichnisstruktur

Die Codebasis ist im `src/`-Verzeichnis wie folgt strukturiert:

| Verzeichnis | Beschreibung | Relevante Kerndateien / Konzepte |
| :--- | :--- | :--- |
| `src/app/` | Next.js App Router Pages, API-Routen | Layouts, administrative Seiten unter `src/app/admin/` |
| `src/components/` | Wiederverwendbare UI-Komponenten | Telekom-Logo, Steuerelemente, administrative Formulare |
| `src/hooks/` | Custom React Hooks | Berechnungslogik, Basket-Logik, Permission-Hooks |
| `src/lib/` | Globale Hilfsfunktionen und Bibliotheken-Konfiguration | `prisma.ts`, `redis.ts`, `cache.ts`, `permissions.ts`, `rbac.ts` |
| `src/server/` | tRPC-API-Schnittstellen | `trpc.ts` (Context/Prozeduren), Routers, Middlewares |
| `src/types/` | Globale TypeScript-Typdefinitionen | Schema-Erweiterungen, API-Typen |

---

## 4. Betriebsumgebungen (Environments)

Das System läuft in drei logisch getrennten Umgebungen auf derselben PostgreSQL-Instanz über separate Datenbanken. Die Steuerung erfolgt über die jeweilige `.env`-Datei im Projekt-Root:

* **Development (lokal)**: Nutzt `.env.development` und die Datenbank `dtag_dev`. Der Redis-Cache läuft lokal unter der Redis-Datenbank `/2`.
* **Staging (Testumgebung)**: Nutzt `.env.staging` und die Datenbank `dtag_staging`. Der Redis-Cache läuft unter der Redis-Datenbank `/1`.
* **Production (Live-Betrieb)**: Nutzt `.env.production` und die Datenbank `dtag`. Der Redis-Cache läuft unter der Redis-Datenbank `/0`.
