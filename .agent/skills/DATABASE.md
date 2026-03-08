---
name: DATABASE
description: Workflow für die Datenbanken
---

# 🚀 Datenbank-Workflow (Prisma & Oracle MySQL)

Dieses Projekt nutzt zwei getrennte Datenbank-Instanzen auf Oracle Cloud (MySQL). Um sicher zwischen Entwicklung (Dev) und Produktion (Prod) zu wechseln, folge diesem Leitfaden.

## 1. Setup & Dateien

Wir nutzen zwei `.env`-Dateien für die unterschiedlichen Umgebungen:

- `.env.development`: Zeigt auf die Dev-Datenbank (`dtag_sales-exp_dev`)
- `.env.production`: Zeigt auf die Prod-Datenbank (`dtag_sales-exp_prod`)

> **Hinweis:** In Vercel müssen die Umgebungsvariablen (`DATABASE_URL`, `JWT_SECRET`, etc.) manuell im Dashboard unter **Settings -> Environment Variables** hinterlegt werden.

---

## 2. Änderungen am Schema vornehmen

Wenn du ein neues Feld in der `schema.prisma` hinzufügst:

1. Passe die `prisma/schema.prisma` an.
2. Führe folgenden Befehl aus, um deine **Dev-Datenbank** zu aktualisieren:
   ```bash
   pnpm db:push:dev
   ```
3. Teste die Änderungen lokal (`pnpm dev`).

---

## 3. Datenbank-Befehle (Helper Scripts)

Ich habe in der `package.json` Abkürzungen hinterlegt, damit du nicht versehentlich die falsche DB überschreibst.

| Befehl              | Aktion                 | Umgebung |
| :------------------ | :--------------------- | :------- |
| `pnpm db:push:dev`  | Schema synchronisieren | **DEV**  |
| `pnpm db:push:prod` | Schema synchronisieren | **PROD** |
| `pnpm db:seed:dev`  | Testdaten einspielen   | **DEV**  |
| `pnpm db:seed:prod` | Testdaten einspielen   | **PROD** |

---

## 4. Deployment Checkliste (Produktion)

Wenn du deine Änderungen live schalten willst:

1. **Schema-Sync:** Falls du die `schema.prisma` geändert hast, führe einmalig von deinem Rechner aus aus:
   ```bash
   pnpm db:push:prod
   ```
2. **Code Push:** Push deinen Code zu GitHub. Vercel startet automatisch den Build.
3. **Automatisierung:** Der Befehl `prisma generate` läuft bei Vercel automatisch bei jedem Deployment (durch das `postinstall`-Script).

---

## 5. Fehlersuche

- **"Module @prisma/client not found":** Falls Vercel beim Build meckert, stelle sicher, dass `postinstall: "prisma generate"` in der `package.json` steht.
- **Verbindungsprobleme:** Stelle sicher, dass deine IP-Adresse in der Oracle Cloud für den Zugriff auf Port 3306 freigeschaltet ist (falls keine Wildcard-Regel existiert).
- **Vercel IPs:** Vercel nutzt dynamische IPs. Die Oracle-DB sollte so konfiguriert sein, dass sie Zugriffe von Vercel (Cloudflare) erlaubt.
