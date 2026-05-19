# Server-Hosting & Infrastruktur

Dieses Dokument beschreibt die Hosting-Voraussetzungen, die Konfiguration des Produktions-Servers, den Deployment-Prozess und die Kostenszenarien.

---

## 1. Systemvoraussetzungen (Hardware-Sizing)

Für den reibungslosen Betrieb mit ca. 1.000 registrierten Mitarbeitern und 50–150 zeitgleichen Peak-Nutzern werden folgende Hardwareressourcen benötigt:

| Ressource | Mindestwert | Empfohlen |
| :--- | :--- | :--- |
| **Node.js-Laufzeit** | v20 LTS | v22 LTS |
| **Betriebssystem** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **Arbeitsspeicher (RAM)** | 1 GB | 2 GB (wegen Next.js-Builds) |
| **CPU** | 1 vCPU (ARM oder x86) | 2 vCPU |
| **Festplattenspeicher** | 10 GB | 20+ GB (für Docker-Images & Logs) |

---

## 2. Infrastruktur-Komponenten

### A. PostgreSQL-Datenbank
Die Anwendung erfordert eine PostgreSQL-Datenbank (Version 15 oder 16).
*   **Verbindungs-Optimierung**: Die Verbindungs-URLs hängen standardmäßig `?connection_limit=20&pool_timeout=30` an. Der PostgreSQL-Server muss so konfiguriert sein, dass er mindestens 50 gleichzeitige Clientverbindungen zulässt (`max_connections = 100`).

### B. Dragonfly (Redis) Caching-Layer
Dragonfly (oder ein Standard-Redis-Server) wird als In-Memory-Cache verwendet. Der Zugriff erfolgt über die `REDIS_URL`. Es ist keine Persistenz zwingend notwendig, da es sich um flüchtige Cache-Daten handelt.

### C. E-Mail-Dienst (Resend)
Der E-Mail-Versand (z. B. für Passkey-Registrierungen und Welcome-Nachrichten) läuft über **Resend**.
*   Erfordert einen `RESEND_API_KEY`.
*   Erfordert die Einrichtung einer verifizierten Domain (`EMAIL_FROM`), um Spam-Filterung zu vermeiden.

---

## 3. Empfohlene Deployments

### Option A: Self-Hosted via Coolify (Docker)
Das Projekt besitzt eine Standalone-Konfiguration in `next.config.ts` (`output: 'standalone'`). Dies reduziert die Docker-Image-Größe von ca. 1 GB auf **~150 MB**, da nur die absolut notwendigen Node-Module gepackt werden.

*   **Dockerfile-Pfad**: `./Dockerfile`
*   **Pre-Deployment-Command** (in Coolify eintragen, um Prisma-Migrationen vor dem Start auszuführen):
    ```bash
    npx prisma migrate deploy
    ```
*   **Port & Healthcheck**: Die Anwendung lauscht auf Port `3000`. Der Healthcheck kann auf den Pfad `/` oder `/login` gerichtet werden.

---

### Option B: PM2 (Direkt auf Ubuntu-Server)
Falls die Anwendung ohne Docker betrieben wird, empfiehlt sich **PM2** zur Prozessüberwachung:

```bash
# 1. Neuesten Code holen
git pull origin main

# 2. Abhängigkeiten installieren
pnpm install

# 3. Datenbank-Migrationen einspielen
pnpm run db:push:prod

# 4. Next.js App bauen (erstellt Standalone-Assets)
pnpm run build

# 5. Prozess in PM2 registrieren und starten
pm2 start "node .next/standalone/server.js" --name saleshelper

# 6. Autostart bei Serverneustart sichern
pm2 startup
pm2 save
```

---

## 4. Nginx Reverse-Proxy & SSL

Die App sollte über einen Nginx Reverse Proxy mit SSL-Terminierung (Let's Encrypt) an das Internet angebunden werden:

```nginx
server {
    listen 443 ssl http2;
    server_name sales-exp.prod.flxk.nz;

    ssl_certificate /etc/letsencrypt/live/sales-exp.prod.flxk.nz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sales-exp.prod.flxk.nz/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Kostenübersicht für 1.000 Benutzer

| Hosting-Variante | Anbieter / Tarif | Kosten/Monat | Eignung / Stabilität |
| :--- | :--- | :--- | :--- |
| **Self-Hosted (Hetzner)** | 1x Cloud Server CPX21 (App)<br>1x Cloud Server CPX11 (PostgreSQL + Redis) | **~12–15 €** | **Empfohlen**: Sehr stabil, Backups inklusive, hervorragende europäische Latenzen. |
| **Free Tier (Oracle ARM)** | Oracle Cloud VM.Standard.A1.Flex | **0 €** | Gut für Entwicklung/Staging, birgt jedoch das Risiko unangekündigter Free-Tier-Terminierungen. |
| **Managed (Railway)** | Railway Web Service + Database | **~25–40 €** | Sehr einfacher Betrieb, automatische Skalierung, aber teurer als dedizierte Server. |
| **Serverless (Vercel)** | Vercel Pro Plan + Supabase Postgres | **~30–50 €** | Exzellentes Edge-Caching, aber potenziell hohe Serverless-Cold-Start-Latenzen bei tRPC-Batching. |
