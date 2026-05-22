# Server-Hosting & Infrastruktur-Setup

Dieses Dokument beschreibt die Systemvoraussetzungen, die Konfiguration der Systemkomponenten sowie die empfohlenen Deployment-Verfahren für den Produktionsbetrieb.

---

## 1. Systemvoraussetzungen

Die folgenden Hardwareressourcen sind für den Betrieb mit ca. 1.000 registrierten Benutzern und einer Peak-Last von 50 bis 150 zeitgleichen Sitzungen ausgelegt:

| Ressource | Mindestanforderung | Empfohlene Spezifikation |
| :--- | :--- | :--- |
| **Node.js-Laufzeit** | v20 LTS | v22 LTS |
| **Betriebssystem** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **Arbeitsspeicher (RAM)** | 1 GB | 2 GB (Erforderlich für Next.js-Builds auf dem Server) |
| **Prozessor (CPU)** | 1 vCPU | 2 vCPU |
| **Speicherplatz** | 10 GB | 20 GB oder mehr (Abhängig von Docker-Images und Log-Rotations) |

---

## 2. Infrastruktur-Konfiguration

### PostgreSQL-Datenbank
Das System erfordert eine PostgreSQL-Datenbank (Version 15 oder 16).
* **Verbindungs-Parameter**: An die Verbindungs-URL sind standardmäßig die Parameter `?connection_limit=20&pool_timeout=30` anzuhängen. Der PostgreSQL-Server muss auf mindestens 50 gleichzeitige Clientverbindungen ausgelegt sein (`max_connections = 100`).

### Dragonfly Redis
Ein Dragonfly- oder Standard-Redis-Server fungiert als In-Memory-Cache. Der Zugriff erfolgt über die Umgebungsvariable `REDIS_URL`. Es ist keine Persistierung der Redis-Daten erforderlich (flüchtige Cache-Daten).

### E-Mail-Dienst (Resend)
Der transaktionale E-Mail-Versand (z. B. für Passkey-Verifizierungen) läuft über die Resend-API.
* Erfordert die Hinterlegung des `RESEND_API_KEY`.
* Setzt eine verifizierte Domain (`EMAIL_FROM`) voraus, um die Zustellbarkeit zu sichern.

---

## 3. Deployment-Verfahren

### Option A: Deployment über Coolify (Docker Standalone)

Die Next.js-App nutzt das Standalone-Build-Feature (`output: 'standalone'` in `next.config.ts`), welches die Größe des finalen Docker-Images auf ca. 150 MB minimiert.

* **Dockerfile**: Befindet sich im Root-Verzeichnis unter `./Dockerfile`.
* **Pre-Deployment-Befehl**: Führe vor dem Anwendungsstart ausstehende Prisma-Migrationen aus:
  ```bash
  npx prisma migrate deploy
  ```
* **Port & Healthcheck**: Die Anwendung läuft auf Port `3000`. Setze den Healthcheck-Pfad auf `/` oder `/login`.

---

### Option B: Direktes Deployment mit PM2 (Bare Ubuntu)

Führe für ein Bare-Metal- oder VM-basiertes Deployment ohne Docker die folgenden CLI-Befehle auf dem Zielserver aus:

```bash
# 1. Repository klonen und aktualisieren
git pull origin main

# 2. NodeJS-Abhängigkeiten installieren
pnpm install

# 3. Datenbank-Migrationen einspielen (Produktion)
pnpm run db:push:prod

# 4. Next.js Applikation bauen (generiert Standalone-Assets)
pnpm run build

# 5. Prozess über PM2 registrieren und starten
pm2 start "node .next/standalone/server.js" --name sxp

# 6. PM2-Autostart bei Systemneustart konfigurieren
pm2 startup
pm2 save
```

---

## 4. Nginx Reverse-Proxy-Konfiguration

Zur SSL-Terminierung (z. B. Let's Encrypt) ist ein Nginx Reverse-Proxy vorzuschalten. Nutze die folgende Server-Konfiguration:

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
