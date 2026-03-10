# Sales Experience – Dokumentation

Willkommen in der technischen Dokumentation des **Sales Experience** – einem internen Vertriebsberatungstool für Telekom Partner-Shops.

---

## 📚 Inhalt

| Dokument                                   | Beschreibung                                                                   |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| [OVERVIEW.md](./OVERVIEW.md)               | Projektübersicht, Tech Stack, Datenbankschema-Überblick, Deployment-Umgebungen |
| [HOSTING.md](./HOSTING.md)                 | Hosting-Anforderungen, Server-Setup, Reverse Proxy, Deployment-Prozess         |
| [FINANCES.md](./FINANCES.md)               | Kostenübersicht, Server-Optionen, Datenbankkosten, Skalierungsszenarien        |
| [DATENSCHUTZ.md](./DATENSCHUTZ.md)         | Datenschutz, gespeicherte Daten, DSGVO-Empfehlungen, Auth-Sicherheit           |
| [AUTOMATISIERUNG.md](./AUTOMATISIERUNG.md) | Automatisierungspotenzial, Pflegeaufwand, CI/CD-Optionen                       |
| [DB_WORKFLOW.md](./DB_WORKFLOW.md)         | Datenbankworkflow, Migrationen, Seeding                                        |

---

## 🔑 Schnellreferenz

### Produktionsserver

- **URL**: `https://sales-exp.prod.flxk.nz/`
- **Server**: Oracle Cloud ARM (Always Free)
- **DB**: MySQL 8 (Self-Hosted)
- **E-Mail**: Resend (Free Plan)

### Wichtige Befehle

```bash
pnpm run dev              # Dev-Server starten
pnpm run build            # Produktions-Build
pnpm run db:push:prod     # Schema in Prod-DB schreiben
pnpm run manage-admins    # Admin-Nutzer verwalten (CLI)
```

### Umgebungsvariablen

```env
DATABASE_URL=...
JWT_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=...
NEXT_PUBLIC_APP_URL=...
```

---

> Für Fragen zum Projekt: Wende dich an den zuständigen Entwickler.
