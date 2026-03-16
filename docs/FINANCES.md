# Finanzen & Kostenübersicht

Dieses Dokument gibt eine realistische Einschätzung der laufenden Kosten für den Betrieb der _Sales Experience_ in Produktion.

> **Nutzungskontext:** Das Tool wird im Produktivbetrieb von ca. **300 Nutzern** täglich verwendet (Vertriebsmitarbeiter bundesweit).

---

## Aktuelles Setup (Oracle Cloud – Self-Hosted)

Das Produktivsystem läuft auf einem **Oracle Cloud ARM-Server**. Dieser ist dauerhaft kostenlos, solange das Oracle-Konto aktiv ist.

| Komponente                  | Anbieter                             | Kosten/Monat          |
| --------------------------- | ------------------------------------ | --------------------- |
| **Compute (VM)**            | Oracle Cloud Free Tier               | **0 €**               |
| **MySQL-Datenbank**         | Selbst gehostet (auf Server)         | **0 €**               |
| **E-Mail-Versand (Resend)** | Resend Free Plan (3.000 Mails/Monat) | **0 €**               |
| **Domain / SSL**            | Eigene Domain + Let's Encrypt        | ~1–2 € (Domain/Monat) |
| **Gesamt (aktuell)**        |                                      | **~1–2 €/Monat**      |

> ⚠️ **Wichtig bei 1.000 Nutzern:** Oracle Free Tier bietet **4 OCPUs und 24 GB RAM** auf ARM-Instanzen. Das deckt den aktuellen Bedarf ab, aber **ohne Redundanz** – ein Serverausfall bedeutet vollständigen Ausfall der App. Für ein produktionskritisches Tool dieser Größe sollte mittelfristig über eine stabilere Infrastruktur nachgedacht werden.

---

## Lastanalyse für 1.000 Nutzer

Bei ~1.000 registrierten Nutzern ergibt sich typischerweise folgende Charakteristik:

| Metrik                          | Schätzung                                            |
| ------------------------------- | ---------------------------------------------------- |
| **Gleichzeitige Nutzer (Peak)** | 50–150 (Beratungsstoßzeiten: 10–13 Uhr, 14–17 Uhr)   |
| **Datenbankabfragen/Sekunde**   | 10–50 (bei gut gecachtem Next.js)                    |
| **Datenbankgröße**              | ~200–500 MB (Tarife, Sessions, Nutzer)               |
| **Benötigte DB-Verbindungen**   | 10–20 gleichzeitig (aktuell: limit=10, ggf. erhöhen) |
| **Mails/Monat (Verifizierung)** | ~500–3.000 (davon viele Wiederholungen)              |

> Das aktuelle **connection_limit=10** könnte bei Peak-Traffic (viele gleichzeitige Beratungen) zu Engpässen führen. Empfehlung: Auf **15–20 erhöhen** und Datenbankserver entsprechend dimensionieren.

---

## Empfohlenes Setup für 1.000 Nutzer

Für eine stabile, produktionsreife Infrastruktur bei dieser Nutzerzahl empfehlen wir:

### Option A: Self-Hosted auf Hetzner _(empfohlen – bestes Preis-Leistungs-Verhältnis)_

| Komponente               | Spezifikation                               | Kosten/Monat       |
| ------------------------ | ------------------------------------------- | ------------------ |
| **App-Server** (Next.js) | Hetzner CPX21 – 3 vCPU, 4 GB RAM            | ~7 €               |
| **Datenbank-Server**     | Hetzner CPX11 – 2 vCPU, 2 GB RAM, 80 GB SSD | ~5 €               |
| **Backups**              | Hetzner automatische Backups (20% Aufpreis) | ~2 €               |
| **Domain & SSL**         | Eigene Domain + Let's Encrypt               | ~1 €               |
| **Resend Pro**           | Bis 50.000 Mails/Monat (bei Bedarf)         | 0–18 €             |
| **Gesamt**               |                                             | **~15–33 €/Monat** |

> 💡 App- und Datenbankserver separat betreiben erhöht Sicherheit und ermöglicht unabhängige Skalierung.

---

### Option B: Managed Hosting (Railway)

| Komponente        | Spezifikation        | Kosten/Monat       |
| ----------------- | -------------------- | ------------------ |
| **Next.js App**   | Railway Web Service  | ~10–20 €           |
| **MySQL Managed** | Railway MySQL Add-on | ~5–15 €            |
| **Resend**        | Free oder Pro        | 0–18 €             |
| **Domain**        | Eigene Domain        | ~1 €               |
| **Gesamt**        |                      | **~16–54 €/Monat** |

> Railway eignet sich gut für einfaches Deployment ohne eigene Serverkenntnisse. Für 1.000 Nutzer sollte der Hobby-Plan auf den Pro-Plan (Team) upgegraded werden.

---

### Option C: Vercel + Managed MySQL

| Komponente                        | Spezifikation                    | Kosten/Monat       |
| --------------------------------- | -------------------------------- | ------------------ |
| **Vercel Pro** (ab 1 Team-Member) | Serverless Next.js, globales CDN | ~18 €              |
| **MySQL** (Aiven/PlanetScale)     | Managed, automatische Backups    | ~10–20 €           |
| **Resend**                        | Free Plan                        | 0 €                |
| **Domain**                        | Eigene Domain                    | ~1 €               |
| **Gesamt**                        |                                  | **~29–39 €/Monat** |

> Vercel bietet bei Next.js die beste Out-of-the-box-Performance durch Edge-Caching und weltweite CDN-Verteilung. Für eine interne App ohne internationalen Traffic ist das jedoch Overkill.

---

## Datenbank-Anforderungen (bei 1.000 Nutzern)

| Anforderung          | Aktuell | Empfohlen                                  |
| -------------------- | ------- | ------------------------------------------ |
| **MySQL-Version**    | 8.0     | 8.0+                                       |
| **Speicher**         | ~500 MB | 1–5 GB (mit Session-Wachstum)              |
| **RAM**              | 512 MB  | 1–2 GB dediziert                           |
| **Connection Limit** | 10      | **15–20**                                  |
| **Backup**           | Manuell | **Täglich automatisch** (Cron + mysqldump) |
| **Read Replica**     | Nein    | Optional, wenn Lesezugriffe zunehmen       |

---

## E-Mail-Kosten (Resend)

| Plan | Mails/Monat | Kosten        | Empfehlung                               |
| ---- | ----------- | ------------- | ---------------------------------------- |
| Free | 3.000       | 0 €           | Ausreichend, wenn Nutzer selten rotieren |
| Pro  | 50.000      | ~18 $ (~17 €) | Bei häufiger Session-Neuverifizierung    |

Bei 1.000 Nutzern, die je nach Beratungsintensität täglich 1–3 Sessions starten: **~500–3.000 Mails/Monat** → Free Plan meist ausreichend.

---

## Kostenvergleich auf einen Blick

| Szenario           | Setup                  | Kosten/Monat | Stabilität         |
| ------------------ | ---------------------- | ------------ | ------------------ |
| **Aktuell**        | Oracle Cloud Free Tier | ~1–2 €       | ⚠️ Keine Redundanz |
| **Empfohlen (A)**  | Hetzner Self-Hosted    | ~15–33 €     | ✅ Gut             |
| **Einfach (B)**    | Railway Managed        | ~16–54 €     | ✅ Sehr gut        |
| **Enterprise (C)** | Vercel + Managed DB    | ~29–39 €     | ✅ Exzellent       |

---

## Skalierung & Risiken

| Risiko                                  | Wahrscheinlichkeit      | Lösung                                   |
| --------------------------------------- | ----------------------- | ---------------------------------------- |
| Oracle Free Tier wird terminiert        | ⚠️ Möglich              | Migration zu Hetzner vorbereiten         |
| DB-Verbindungspool erschöpft bei Peak   | ⚠️ Bei hoher Last       | `connection_limit` auf 15–20 erhöhen     |
| Resend Free Limit überschritten         | ✅ Gering               | Auf Resend Pro upgraden (~17 €/Monat)    |
| Datenbankausfall / Datenverlust         | ⚠️ Bei fehlendem Backup | Tägliche automatische Backups einrichten |
| Serverausfall (Single Point of Failure) | ⚠️ Aktuell vorhanden    | Redundanter Server oder Managed Hosting  |
