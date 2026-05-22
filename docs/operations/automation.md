# Automatisierung & Systemwartung

Dieses Dokument beschreibt die automatisierten Hintergrundprozesse, manuelle Administrationsabläufe, transaktionale E-Mail-Kommunikationsketten und die Einrichtung von Datenbank-Bereinigungen.

---

## 1. System-Wartungsaufgaben

Die Wartung des Systems ist in automatisierte Abläufe und manuelle Eingriffe unterteilt:

### Automatische Prozesse

* **Mitarbeiter-Verifizierung**: Ein neuer Mitarbeiter registriert sich, das System versendet einen zeitlich begrenzten Verifizierungslink per E-Mail, und nach dem Klick wird der Status des Nutzers in der Datenbank aktualisiert.
* **Sitzungs-Verfall (TTL)**: Sitzungen werden nach vordefinierten Zeiträumen ungültig (30 Tage für Vertriebsberater, 4 Stunden für administrative Rollen). Dies wird über das Feld `expiresAt` in der Session-Tabelle gesteuert.
* **Cache-Invalidierung**: Der Redis-Cache wird bei jeder Änderung an Tarifen oder Systemeinstellungen über Event-Hooks automatisch bereinigt.

### Manuelle Administrationsaufgaben

* **Tarifdatenpflege**: Aktualisierung von Preisen, Einpflege neuer Tarife und Deaktivierung abgelaufener Optionen über das administrative Web-Interface (monatlich / bei Tarifänderungen der Telekom).
* **Benutzerverwaltung**: Anpassung von Berechtigungsstufen (Rollen) und die Sperrung ausgeschiedener Mitarbeiter.
* **System-News**: Erstellung und Veröffentlichung von Systemankündigungen direkt im Admin-Panel.

---

## 2. E-Mail-Kommunikationsabläufe (`src/lib/email.ts`)

Das System nutzt die Resend-API zur Übermittlung transaktionaler E-Mails an Mitarbeiter. Folgende E-Mail-Typen sind implementiert:

### Registrierungs-Verifizierung (`VerificationEmail`)
* **Trigger**: Wird über den tRPC-Endpoint `sessionRouter.requestVerification` ausgelöst, wenn ein neuer Mitarbeiter sich registriert.
* **Payload**: Enthält ein einmaliges Verifizierungstoken (Gültigkeit: 1 Stunde) als URL-Parameter.
* **Zweck**: Verifiziert die Zugriffsberechtigung auf das geschäftliche Telekom-Postfach.

### Willkommens-Mail (`WelcomeEmail`)
* **Trigger**: Wird über `adminUsersRouter.create` ausgelöst, wenn ein Administrator ein neues Profil manuell anlegt.
* **Payload**: Enthält die initialen Zugangsdaten (E-Mail und temporäres Passwort).

### Account-Löschung (`GoodbyeEmail`)
* **Trigger**: Wird über `adminUsersRouter.delete` ausgelöst, wenn ein Administrator ein Benutzerkonto löscht.
* **Zweck**: Bestätigung des Löschvorgangs und der Entfernung personenbezogener Daten aus dem System.

---

## 3. Datenbank-Bereinigung (Cleanup)

Das kontinuierliche Wachstum der `UserSession`-Tabelle erfordert eine regelmäßige Bereinigung abgelaufener Sitzungsdaten.

### Cron-Job-Konfiguration (PostgreSQL)

Richte einen systemseitigen Cron-Job auf dem PostgreSQL-Server ein, um Einträge zu löschen, die älter als 30 Tage sind.

1. Öffne die Crontab-Konfiguration des Servers über das Terminal:
   ```bash
   crontab -e
   ```
2. Füge die folgende Zeile hinzu, um die Bereinigung täglich um 03:00 Uhr Serverzeit auszuführen:
   ```bash
   0 3 * * * PGPASSWORD="dein-datenbank-passwort" psql -h localhost -U postgres -d dtag -c "DELETE FROM \"UserSession\" WHERE \"createdAt\" < NOW() - INTERVAL '30 days';"
   ```

*(Ersetze `dein-datenbank-passwort` und den Datenbanknamen `dtag` gemäß der Konfiguration in der jeweiligen `.env`-Datei).*
