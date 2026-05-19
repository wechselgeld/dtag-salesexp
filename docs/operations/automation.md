# Automatisierung & Systemwartung

Dieses Dokument beschreibt die automatisierten Abläufe im System, die manuellen Administrationsprozesse, die E-Mail-Kommunikationsketten und die Routine-Wartungsarbeiten.

---

## 1. Übersicht der Wartungs- & Pflegeaufgaben

Um das System auf einem aktuellen Stand zu halten, teilen sich die Aufgaben wie folgt auf:

### ⚙️ Automatische Prozesse
*   **Mitarbeiter-Verifizierung**: Vollautomatisch. Der Benutzer registriert sich, erhält einen Verifizierungslink per E-Mail und wird nach Klick verifiziert.
*   **Sitzungs-Ablauf (TTL)**: Sessions verfallen automatisch nach 30 Tagen (oder 4 Stunden für administrative Rollen), definiert durch das `expiresAt`-Feld im Cookie und der Datenbank.
*   **Cache-Verwaltung**: Redis-Cache wird bei jeder Änderung an Tarifen oder Einstellungen automatisch invalidiert.

### ✍️ Manuelle Administrationsaufgaben
*   **Produktdatenpflege**: Neue Tarife einpflegen, Preise aktualisieren, veraltete Optionen deaktivieren (monatlich / bei Tarifwechseln der Telekom).
*   **Aktionen & Rabattstufen**: Laufende Sonderaktionen pflegen und priorisieren (monatlich).
*   **Benutzerverwaltung**: Sperren von Accounts ausgeschiedener Mitarbeiter, Rollenanpassungen bei Beförderungen (z. B. Beförderung zum Teamleiter).
*   **System-News**: Verfassen von Ankündigungen über neue Features oder Tarifänderungen im Admin-Panel (bei Bedarf).

---

## 2. E-Mail-Kommunikationsabläufe (`src/lib/email.ts`)

Das System versendet transaktionale E-Mails an Mitarbeiter über die **Resend**-API. Folgende E-Mail-Typen sind implementiert:

### A. Registrierungs-Verifizierung (`VerificationEmail`)
*   **Trigger**: Wird ausgelöst, wenn sich ein neuer Mitarbeiter auf der Login-Seite registriert (`sessionRouter.requestVerification`).
*   **Inhalt**: Ein einmaliger Registrierungslink mit einem Token (Gültigkeit: 1 Stunde).
*   **Ziel**: Verifizierung, dass der Mitarbeiter Zugriff auf das Telekom-Postfach hat.

### B. Willkommens-Mail (`WelcomeEmail`)
*   **Trigger**: Wird ausgelöst, wenn ein Administrator einen neuen Benutzer manuell im Admin-Panel anlegt (`adminUsersRouter.create`).
*   **Inhalt**: Zugangsdaten (Benutzername und temporäres Passwort) sowie ein Link zum Login.

### C. Account-Löschung (`GoodbyeEmail`)
*   **Trigger**: Wird ausgelöst, wenn ein Administrator einen Benutzer aus dem System löscht (`adminUsersRouter.delete`).
*   **Inhalt**: Information über die Löschung des Accounts und die Löschung der zugehörigen Daten.

---

## 3. Datenbank-Bereinigung (UserSession-Cleanup)

Durch die Registrierung und Anmeldung vieler Mitarbeiter wächst die `UserSession`-Tabelle kontinuierlich an. Veraltete Sitzungsdaten sollten regelmäßig gelöscht werden.

### PostgreSQL Cron-Job (Empfohlen)
Richte auf dem PostgreSQL-Server einen täglichen Cron-Job ein, um Sitzungen, die älter als 30 Tage sind, automatisch zu löschen.

1.  Öffne das Cron-Verzeichnis auf dem Server:
    ```bash
    crontab -e
    ```
2.  Füge folgende Zeile hinzu, um den Cleanup täglich um 03:00 Uhr nachts auszuführen:
    ```bash
    0 3 * * * PGPASSWORD="dein-db-passwort" psql -h localhost -U postgres -d dtag -c "DELETE FROM \"UserSession\" WHERE \"createdAt\" < NOW() - INTERVAL '30 days';"
    ```

*(Hinweis: Ersetze `dein-db-passwort` und den Datenbanknamen `dtag` entsprechend deiner Konfiguration in `.env.production`.)*
