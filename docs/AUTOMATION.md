# Automatisierung & Pflegeaufwand

Dieses Dokument bewertet, wie viel laufende manuelle Arbeit für den Betrieb des Tools nötig ist und welche Bereiche automatisierbar sind.

---

## Ist das Tool automatisierbar?

**Teilweise ja** – aber es gibt Kernbereiche, die weiterhin manuelle Pflege erfordern.

### ✅ Was ist bereits automatisiert?

| Bereich                  | Automatisierung                                                                                      |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Kunden-Verifizierung** | Vollständig automatisch: E-Mail wird versendet, Link verifiziert die Session ohne menschliches Zutun |
| **Session-Management**   | Sessions laufen automatisch aus (TTL / `expiresAt`)                                                  |
| **Datenbankverbindung**  | Connection-Pooling, automatische Wiederverbindung, Query-Retry bei Netzwerkfehlern                   |
| **Build & Deployment**   | Kann per CI/CD (GitHub Actions, etc.) vollständig automatisiert werden                               |
| **SSL-Zertifikate**      | Let's Encrypt mit automatischer Verlängerung (via Certbot)                                           |

---

### ⚠️ Was erfordert regelmäßige manuelle Pflege?

| Bereich                                   | Aufwand                                                    | Frequenz                                            |
| ----------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| **Produktdaten aktualisieren**            | Hoch – neue Tarife, Preisänderungen, Features              | Monatlich oder bei Änderungen (Telekom-Preislisten) |
| **Aktionspreise verwalten**               | Mittel – neue Sonderaktionen einpflegen                    | Monatlich                                           |
| **Zubuchoptionen aktualisieren**          | Gering-Mittel                                              | Quartalsweise oder bei Änderungen                   |
| **Nutzer verwalten**                      | Gering – neue Mitarbeiter anlegen, Passwörter zurücksetzen | Bei Bedarf                                          |
| **Neuigkeiten / Ankündigungen verfassen** | Gering                                                     | Bei Bedarf                                          |
| **Server-Wartung**                        | Gering – Updates, Logs prüfen                              | Monatlich                                           |
| **Datenbankbackups prüfen**               | Gering                                                     | Monatlich                                           |

---

## Haupttreiber des Pflegeaufwands

Der bei weitem größte Aufwand entsteht durch die **manuelle Datenpflege der Tarife und Aktionen**:

1. **Telekom aktualisiert Tarife regelmäßig** (oft monatlich bei Aktionen, quartalsweise bei Basistarifen).
2. Diese Änderungen müssen manuell im Admin-Panel nachgepflegt werden.
3. Es gibt **keine automatische Schnittstelle zur Telekom-Datenseite** – das Tool bezieht seine Daten nicht aus einem Telekom-Backend.

---

## Automatisierungspotenzial (Zukunft)

### Option A: API-Anbindung an interne Telekom-Systeme

Da intern eine Produktdaten-API existiert, könnten Tarife automatisch synchronisiert werden. Das würde den Pflegeaufwand auf nahezu null reduzieren.

### Option B: Web-Scraping / CSV-Import

Tarife könnten halbautomatisch aus CSV-Exporten oder der öffentlichen Telekom-Webseite importiert werden. Dies würde Aufwand reduzieren, erfordert aber Wartung des Import-Skripts.

### Option C: Automatisches Session-Cleanup

Ein einfacher täglicher Cron-Job kann veraltete Sales Sessions (älter als X Tage) aus der Datenbank löschen:

```bash
# Beispiel: Cron-Job dem Server hinzufügen (crontab -e)
0 3 * * * mysql -u user -ppass db_prod -e "DELETE FROM SalesSession WHERE createdAt < NOW() - INTERVAL 30 DAY;"
```

---

## Pflegeaufwand – Realistische Schätzung

| Zeitraum          | Aufwand                                                   | Wer        |
| ----------------- | --------------------------------------------------------- | ---------- |
| **Täglich**       | 0 min (vollständig automatisiert)                         | —          |
| **Wöchentlich**   | 0–15 min (kurze Kontrolle, ggf. Neuigkeiten)              | Admin      |
| **Monatlich**     | 1–4 Stunden (Tarife, Aktionen, Benutzer)                  | Admin      |
| **Quartalsweise** | 1–2 Stunden (Server-Updates, Dependency-Updates)          | Entwickler |
| **Jährlich**      | 4–8 Stunden (größere Features, Audits, Schema-Revisionen) | Entwickler |

---

## Empfehlung

Das Tool ist im aktuellen Zustand sehr gut für den internen Betrieb geeignet, erfordert aber eine **dedizierte Person (Admin)**, die monatlich ca. 1–4 Stunden für die Datenpflege aufwendet. Ohne diese Pflege veralten Preise und Aktionen, was das Tool unbrauchbar macht.

Die größte Effizienzgewinn-Maßnahme wäre eine **automatische Tarifaktualisierung** – entweder per interner API oder CSV-Import-Skript.
