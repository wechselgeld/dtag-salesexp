# Datenschutz & Datensicherheit

> ⚠️ Dieses Dokument ist eine technische Übersicht der Datenschutzpraktiken des Tools. Es ersetzt **keine rechtliche Datenschutzberatung** und ist kein Ersatz für eine offizielle Datenschutzerklärung oder ein DSGVO-Konzept.

---

## Grundprinzipien

Das Tool verfolgt folgende Datenschutzgrundsätze:

- **Datensparsamkeit**: Es werden nur die Daten gespeichert, die für den Betrieb zwingend notwendig sind.
- **Keine Drittanbieter mit personenbezogenen Daten**: Außer Resend (für den E-Mail-Versand) und Cloudflare (Sicherheit/CDN) werden keine Daten an externe Dienste übermittelt.
- **Kein internes Tracking**: Es findet kein serverseitiges Tracking des Nutzerverhaltens statt. Es wird lediglich ein datenschutzfreundliches Statistik-Skript für anonyme Seitenaufrufe genutzt.
- **Interner Betrieb only**: Das Tool ist ausschließlich für interne Nutzer bestimmt.

---

## Welche Daten werden gespeichert?

### Admin-Nutzer (Systemnutzer)

| Feld                      | Zweck               | Gespeichert                                |
| ------------------------- | ------------------- | ------------------------------------------ |
| `email`                   | Login-Identifikator | ✅ Ja                                      |
| `password`                | Login-Sicherheit    | ✅ Ja, **bcrypt-gehashed** (kein Klartext) |
| `role`                    | Zugriffssteuerung   | ✅ Ja                                      |
| `createdAt` / `updatedAt` | Verwaltung          | ✅ Ja                                      |

Passwörter werden ausschließlich als **bcrypt-Hash** (Costfaktor 10) gespeichert. Ein Wiederherstellen des Klartexts ist nicht möglich.

---

### Sales Sessions (Verifizierung)

Bei einer Kundenberatung erstellt das System eine temporäre **Sales Session**:

| Feld                    | Zweck                            | Gespeichert     |
| ----------------------- | -------------------------------- | --------------- |
| `firstName`, `lastName` | Kundenidentifikation             | ✅ Ja, temporär |
| `email`                 | Zustellung Verifizierungs-E-Mail | ✅ Ja, temporär |
| `ip`                    | Absicherung der Session          | ✅ Ja           |
| `userAgent`             | Browser-Identifikation           | ✅ Ja           |
| `verificationToken`     | Einmaliger Verifizierungs-Link   | ✅ Ja, temporär |
| `isVerified`            | Verifizierungsstatus             | ✅ Ja           |
| `expiresAt`             | Session-Ablauf                   | ✅ Ja           |

> **Wichtig**: Sales Sessions enthalten Mitarbeiterdaten. Deren Speicherung sollte durch interne IT/Datenschutz-Richtlinien geregelt sein. Eine automatische Löschung nach einer definierten Frist (z.B. 30 Tage) wird empfohlen.

---

### Was wird NICHT gespeichert?

- Keine Mitarbeiterdaten langfristig (außer temporär in laufenden Sessions)
- Keine Bankdaten oder Zahlungsinformationen
- Keine Vertragsabschlüsse (die App dient nur zur Beratung)
- Kein Tracking-Cookies oder andere Tracking-Dienste (z.B. Google)
- Kein serverseitiges Personenbezogenes Nutzerverhalten

---

## Statistiken

Um die generelle Nutzung des Tools anonymisiert zu messen, ist ein datenschutzfreundliches Statistik-Skript eingebunden.

**Eigenschaften:**
- **Keine Identifizierbarkeit:** Es werden keine IP-Adressen oder individuellen Nutzerprofile gespeichert.
- **Nur anonyme Aufrufe:** Es werden lediglich Seitenaufrufe und Kategorien anonymisiert gezählt.
- **Keine Verknüpfung:** Die Daten werden nicht mit den Nutzer-Sessions in der Datenbank verknüpft.

---

## Authentifizierung & Sessions (Admin-Login)

- Admin-Login erfolgt über ein **JWT (JSON Web Token)**
- Das Token wird als **HttpOnly Cookie** gesetzt (kein Zugriff aus JavaScript, XSS-Schutz)
- Das JWT ist mit einem starken geheimen Schlüssel signiert (`JWT_SECRET`, min. 64 Zeichen)
- Token-Expiry: Standardmäßig begrenzt (abhängig von `jose` Konfiguration)

---

## E-Mail-Versand via Resend

- Für die Kundenverifizierung werden E-Mails über **Resend** verschickt
- Resend ist ein US-amerikanischer Anbieter (Serverstandort EU wählbar)
- Resend verarbeitet dabei temporär die Empfänger-E-Mail-Adresse
- Es werden keine Marketing-Mails, kein Tracking und kein E-Mail-Monitoring durchgeführt

> Für ein vollständiges DSGVO-Konzept sollte mit Resend ein **Auftragsverarbeitungsvertrag (AVV)** abgeschlossen werden.

---

## Verbindungssicherheit

- Die Produktions-App ist ausschließlich über **HTTPS (TLS 1.2/1.3)** erreichbar (abgesichert via Cloudflare und Traefik/Coolify)
- Die Datenbankverbindung erfolgt über eine interne Docker-Netzwerkverbindung (kein öffentlich exponierter PostgreSQL-Port)
- Connection Pooling ist für die PostgreSQL-Datenbank eingerichtet

---

## Empfehlungen für DSGVO-Konformität

| Maßnahme                                      | Status                   | Empfehlung                            |
| --------------------------------------------- | ------------------------ | ------------------------------------- |
| Passwörter gehashed (bcrypt)                  | ✅ Umgesetzt             | —                                     |
| HTTPS in Produktion                           | ✅ Umgesetzt             | —                                     |
| AVV mit Resend abschließen                    | ⚠️ Ausstehend            | Vor Go-Live prüfen                    |
| Automatische Session-Löschung nach 30 Tagen   | ⚠️ Ausstehend            | Cron-Job empfohlen                    |
| Datenschutzerklärung auf `/privacy`           | ✅ Seite vorhanden       | Inhalt rechtlich prüfen lassen        |
| Rechtsgrundlage für Kundendaten dokumentieren | ⚠️ Offen                 | Interne IT/Recht konsultieren         |
| Zugangsprotokolle / Audit Log                 | ⚠️ Nur in Admin-Sessions | Bei Bedarf erweiterbar                |
| Backup-Verschlüsselung                        | ⚠️ Offen                 | Bei Backups mit Kundendaten empfohlen |

---

## Zuständigkeit & Verantwortlichkeit

Das Tool ist als **internes Hilfsmittel** klassifiziert und verarbeitet nur im Kontext der Kundenberatung personenbezogene Daten. Der Verantwortliche im Sinne der DSGVO ist das Unternehmen / die Organisation, die das Tool betreibt.
