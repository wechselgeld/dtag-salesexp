# Hosting & Infrastruktur

Dieses Dokument beschreibt, was zum Betrieb der _Sales Experience_ benötigt wird – von den Serveranforderungen bis zur Software-Installation.

---

## Voraussetzungen

### 1. Laufzeit

| Anforderung        | Mindest      | Empfohlen             |
| ------------------ | ------------ | --------------------- |
| **Node.js**        | 20 LTS       | 22 LTS                |
| **pnpm**           | 9.x          | 9.x                   |
| **Betriebssystem** | Ubuntu 22.04 | Ubuntu 24.04          |
| **RAM**            | 512 MB       | 1–2 GB                |
| **CPU**            | 1 vCPU       | 1–2 vCPU              |
| **Speicher**       | 5 GB         | 10+ GB (Logs, Builds) |

> Die App ist eine serverseitig gerenderte **Next.js-Fullstack-Anwendung**. Node.js ist der einzige zwingend benötigte Laufzeit-Prozess.

---

### 2. Datenbank

- **MySQL 8.0+** (MySQL 5.7 wird von Prisma unterstützt, wird aber nicht empfohlen)
- Muss erreichbar sein über eine Standard-TCP-Verbindung (Port 3306)
- Zwei Datenbanken empfohlen: `_prod` und `_dev`

> Alternativ funktionieren auch **PlanetScale** (Serverless MySQL) oder **Railway** managed MySQL. Diese lösen den eigenen MySQL-Server-Betrieb auf Wunsch ab.

---

### 3. E-Mail-Dienst

- **Resend** (https://resend.com) für den E-Mail-Versand der Kunden-Verifizierungs-E-Mails
- Benötigt einen API Key (`RESEND_API_KEY`)
- Benötigt eine verifizierte Absender-Domain (`EMAIL_FROM`)

---

### 4. Umgebungsvariablen (`.env.production`)

Folgende Variablen müssen auf dem Produktionsserver gesetzt sein:

```env
DATABASE_URL="mysql://user:pass@host:3306/db_prod?connection_limit=10&pool_timeout=20"
JWT_SECRET="mindestens-64-zeichen-langer-geheimer-schluessel"
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@deine-domain.de"
NEXT_PUBLIC_APP_URL="https://deine-app-url.de/"
```

---

## Empfohlenes Hosting-Setup (Self-Hosted)

Das aktuelle Setup nutzt einen **Oracle Cloud ARM-Server**:

```
Compute (VM):
  - Shape: VM.Standard.A1.Flex (ARM)
  - OCPUs: 1
  - RAM: 6 GB
  - OS: Ubuntu 22.04

Datenbank (MySQL):
  - Separat auf gleichem oder weiterem Server
  - Oder: Managed MySQL (z.B. Aiven Free / Railway)
```

Das reicht für den aktuellen Nutzungsumfang (interne Nutzer, kein öffentlicher Traffic) vollständig aus.

---

## Prozessverwaltung

Empfohlen wird **PM2** für den dauerhaften Betrieb:

```bash
# Build erstellen
pnpm run build

# Mit PM2 starten
pm2 start "pnpm run start" --name saleshelper

# Autostart bei Server-Neustart
pm2 startup
pm2 save
```

---

## Deployment-Ablauf (manuell)

```bash
# 1. Neuesten Code holen
git pull origin master

# 2. Abhängigkeiten installieren
pnpm install

# 3. Datenbankschema anwenden
pnpm run db:push:prod

# 4. Neuen Build erstellen
pnpm run build

# 5. Server neu starten
pm2 restart
```

---

## Reverse Proxy (Nginx)

Die App läuft auf Port 3000 (oder 3001) und sollte über einen Nginx-Reverse-Proxy mit SSL (Let's Encrypt) exponiert werden:

```nginx
server {
    listen 443 ssl;
    server_name sales-exp.prod.flxk.nz;

    ssl_certificate /etc/letsencrypt/live/.../fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/.../privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Alternativen zu Self-Hosting

| Plattform         | Notizen                                                                          | Kostenschätzung |
| ----------------- | -------------------------------------------------------------------------------- | --------------- |
| **Vercel**        | Out-of-the-box Next.js Support, kein eigener Server nötig, aber DB selbst hosten | 0 € (Hobby)     |
| **Railway**       | App + MySQL in einem, einfaches Deployment                                       | ~5–10 €/Monat   |
| **Render**        | Node.js Web Service + MySQL Add-on                                               | ~7–14 €/Monat   |
| **Hetzner Cloud** | Günstigste europäische VPS-Option für Self-Hosting                               | ~4–6 €/Monat    |
