# Sales Experience – Projektübersicht

> Internes Vertriebsberatungstool für Telekom Partner-Shops. **Nur für internen Gebrauch – keine Weitergabe an Dritte.**

---

## Was ist das Tool?

Die **Sales Experience** ist eine vollständig webbasierte, interne Anwendung, die Vertriebsberaterinnen und -berater bei der täglichen Arbeit unterstützt.

Konkret ermöglicht das Tool:

- **Produktübersicht & Beratung** – Strukturierte Anzeige aller aktiven Tarife (Mobilfunk, Glasfaser, Festnetz, MagentaTV, Endgeräte) mit Preisen, Aktionsrabatten, Zubuchoptionen und Verkaufsargumenten
- **Kunden-Verifizierung (Sales-Sessions)** – Mitarbeiter geben Name und E-Mail ein und verifizieren sich per E-Mail. Eine Session ist auf eine begrenzte Zeit aktiv.
- **Angebots-Export (PDF)** – Berater können einen maßgeschneiderten Warenkorb konfigurieren und als formatiertes PDF-Angebot exportieren.
- **Team-Highlights** – Jedes Vertriebsteam kann bestimmte Tarife oder Kategorien als Fokus priorisieren, die in der Übersicht hervorgehoben werden.
- **Admin-Panel** – Vollständiges Backend für Admins: Nutzer-, Produkt-, Standort-, Team-, Aktions- und Nachrichtenverwaltung.

---

## Zielgruppe

| Rolle              | Beschreibung                                                           |
| ------------------ | ---------------------------------------------------------------------- |
| `ADMIN`            | Vollzugriff auf alle Bereiche                                          |
| `OD_MANAGER`       | Verwaltung des eigenen OD-Bereichs (Standorte, Teams, Nutzer darunter) |
| `LOCATION_MANAGER` | Verwaltung des eigenen Standorts und zugehöriger Teams & Nutzer        |
| `TEAM_LEADER`      | Zugriff auf das eigene Team, keine Admin-Bereiche                      |

---

## Tech Stack

| Schicht              | Technologie                     | Version  |
| -------------------- | ------------------------------- | -------- |
| **Framework**        | Next.js (App Router)            | 16.1.6   |
| **Sprache**          | TypeScript                      | ^5       |
| **React**            | React 19                        | 19.2.3   |
| **API-Layer**        | tRPC v11                        | ^11.10.0 |
| **State Management** | TanStack Query + Zustand        | v5       |
| **ORM**              | Prisma                          | 6.1.0    |
| **Datenbank**        | MySQL 8                         | —        |
| **Auth**             | JWT via `jose`, HttpOnly Cookie | —        |
| **Passwort-Hashing** | bcryptjs                        | —        |
| **E-Mail-Versand**   | Resend                          | —        |
| **UI/Styling**       | Tailwind CSS v4, Framer Motion  | —        |
| **Formulare**        | React Hook Form + Zod           | —        |
| **PDF-Export**       | jsPDF + jsPDF-Autotable         | —        |
| **Paketmanager**     | pnpm                            | —        |
| **Linting**          | ESLint 9                        | —        |

---

## Projektstruktur

```
/
├── docs/                   # Diese Dokumentation
├── prisma/
│   ├── schema.prisma       # Datenbankschema (alle Tabellen)
│   └── seed.ts             # Initiales Seeding
├── public/                 # Statische Assets (Logos, Bilder)
├── scripts/
│   └── manage-admins.ts    # CLI-Skript für Admin-Verwaltung
└── src/
    ├── app/                # Next.js App Router (Seiten)
    ├── components/         # Wiederverwendbare UI-Komponenten
    ├── hooks/              # Custom React Hooks
    ├── lib/                # Utilities (Prisma, Auth, tRPC)
    └── server/routers/     # tRPC Backend-Router
```

---

## Deployments

Die App wird im **Self-Hosted-Betrieb** auf einem eigenen Linux-Server betrieben.

| Umgebung    | URL                               | Datenbank             |
| ----------- | --------------------------------- | --------------------- |
| Production  | `https://sales-exp.prod.flxk.nz/` | `dtag_sales-exp_prod` |
| Development | `http://localhost:3000`           | `dtag_sales-exp_dev`  |

Der Development-Server läuft lokal per `pnpm run dev`. Die Produktionsumgebung wird per `next build && next start` (o.Ä. via PM2 / systemd) betrieben.

---

## Wichtige npm-Skripte

| Befehl                   | Funktion                            |
| ------------------------ | ----------------------------------- |
| `pnpm run dev`           | Lokaler Dev-Server starten          |
| `pnpm run build`         | Produktions-Build erstellen         |
| `pnpm run start`         | Produktions-Server starten          |
| `pnpm run db:push:dev`   | Schema in Dev-Datenbank übertragen  |
| `pnpm run db:push:prod`  | Schema in Prod-Datenbank übertragen |
| `pnpm run db:seed:dev`   | Dev-Datenbank befüllen              |
| `pnpm run manage-admins` | Admin-Nutzer via CLI verwalten      |
