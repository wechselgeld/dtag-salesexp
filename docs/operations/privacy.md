# Datenschutz & Datensicherheit

Dieses Dokument beschreibt die technischen Sicherheitsvorkehrungen und Datenschutzpraktiken der Plattform.

> [!WARNING]
> Dieses Dokument stellt keine rechtliche Beratung dar. Vor einem offiziellen Live-Betrieb ist ein DSGVO-Konzept mit der zuständigen Datenschutzabteilung abzubimmmen.

---

## 1. Grundprinzipien

* **Datensparsamkeit**: Es werden ausschließlich Daten erhoben, die für den Betrieb und die Authentifizierung der Vertriebsmitarbeiter erforderlich sind.
* **Keine Endkundendaten**: Das Tool dient rein der Tarifberatung und Angebotskalkulation. Es werden keine Kundennamen, Kundenadressen, Bankdaten oder Vertragsdaten in der Datenbank gespeichert. Der PDF-Export des Warenkorbs wird clientseitig im Browser generiert und nicht auf dem Server abgelegt.
* **Funktionales & Sicherheitsbezogenes Tracking**: Es wird kein klassisches Werbetracking (z. B. Google Analytics oder Marketing-Pixel) geladen. Es findet jedoch ein funktionales und sicherheitsbezogenes Tracking über den datenschutzfreundlichen Analysedienst **OpenPanel** statt, um die Systemsicherheit zu gewährleisten, technische Fehler bei Authentifizierungen (insb. Passkeys) zu analysieren und das Tool bedarfsgerecht zu optimieren.
* **Geschlossenes System**: Die Anwendung ist nicht öffentlich zugänglich. Jeder Benutzer muss einer organisatorischen Einheit (OD-Region, Standort, Team) zugewiesen sein.

---

## 2. Erfasste Mitarbeiterdaten

Das System speichert personenbezogene Daten ausschließlich von Vertriebsmitarbeitern in folgenden Tabellen:

### Tabelle `User`
* `firstName` / `lastName`: Zur Personalisierung der Benutzeroberfläche und des Briefkopfs im PDF-Export.
* `email`: Geschäftliche E-Mail-Adresse als eindeutiger Identifikator für die Authentifizierung.
* `password` / `pin`: Werden ausschließlich als Einweg-Hashes mittels **bcryptjs** (Cost-Faktor 10) in der Datenbank gespeichert. Eine Dekodierung im Klartext ist ausgeschlossen.
* `role` / `isEditor`: Steuert die Autorisierungsgrenzen.
* `odRegionId` / `locationId` / `teamId`: Ermöglicht die organisationsstrukturelle Filterung über die Scope-Engine (RLS).

### Tabelle `UserSession`
* `ip`: Erfassung der IP-Adresse beim Login zur Validierung von IP-Whitelists (autorisierte Telekom-Netzbereiche).
* `userAgent`: Dient der technischen Fehleranalyse und zur Erkennung unberechtigter Zugriffsversuche.
* `deviceId`: Eindeutiger Identifikator zur Wiedererkennung verifizierter Endgeräte (Bypass der doppelten E-Mail-Verifizierung).

---

## 3. Analysedienst & Ereignis-Tracking (OpenPanel)

Zur Erkennung von Sicherheitsvorfällen (z. B. fehlgeschlagenen Anmeldeversuchen) sowie zur kontinuierlichen Plattformoptimierung wird der datenschutzfreundliche Analysedienst **OpenPanel** eingebunden. 

Folgende Ereignisse werden erfasst:
* **Passkey-Registrierung** (`passkey_registration_started`, `passkey_registration_success`, `passkey_registration_failed`, `passkey_setup_skipped`): Erfassung von E-Mail, Benutzerrolle und Quelle zur Fehlerdiagnose bei der WebAuthn-Registrierung.
* **Passkey-Login** (`passkey_login_started`, `passkey_login_success`, `passkey_login_failed`): Erfassung von E-Mail, Quellseite (Login/Setup), Login-Typ (manuell/Conditional UI) und Fehlermeldungen bei fehlgeschlagenen Logins.
* **Allgemeiner Login & Setup** (`admin_login_started`, `admin_login_success`, `admin_login_failed`, `admin_setup_started`, `admin_setup_success`, `admin_setup_failed`, `agent_login_started`, `agent_login_success`, `agent_login_failed`, `agent_setup_started`, `agent_setup_success`, `agent_setup_failed`): Erfassung von E-Mail, Benutzerrolle, Quelle, Anmelde-Typ (Passwort/PIN) und technischen Fehlermeldungen zur Fehlerdiagnose und Systemsicherheitsanalyse.

Dabei werden übermittelt:
* E-Mail-Adresse und Benutzerrolle (`ADMIN` / `USER`) bei Authentifizierungsvorgängen (sofern bekannt).
* Technische Metadaten (Fehlermeldungen des Browsers/Servers).
* Es werden **keinerlei Kundendaten** oder sonstige personenbezogene Daten erfasst.

---

## 4. Cookie-Spezifikationen

Die Authentifizierung erfolgt über signierte JWT-Sitzungsdaten in zustandslosen HTTP-Only-Cookies:

| Cookie-Name | Typ | Ablaufzeit | Attribute | Verwendungszweck |
| :--- | :--- | :--- | :--- | :--- |
| `auth-token` | JWT | 4 Std. (Admins) / 30 Tage (Berater) | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` | Speichert Sitzungsinformationen und Rollen-Claims des Benutzers. |
| `sales-device-id` | JWT | 365 Tage | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` | Identifiziert verifizierte Endgeräte zur Vermeidung wiederholter E-Mail-Verifizierungen. |

---

## 5. Technische Verbindungssicherheit

* **Verschlüsselung (HTTPS)**: Der Datenverkehr wird im Produktionsbetrieb über TLS 1.2 und TLS 1.3 verschlüsselt. Unverschlüsselte Anfragen werden serverseitig von Port 80 auf Port 443 umgeleitet.
* **Netzwerk-Isolation**: Der PostgreSQL-Datenbankserver und die Redis-Instanz laufen in einem isolierten Docker-Netzwerk. Die Ports `5432` und `6379` sind nach außen hin gesperrt und nicht über das Internet erreichbar.

---

## 6. Technische DSGVO-Checkliste für Administratoren

Die folgende Tabelle listet die für Administratoren relevanten technischen Integrationsschritte auf:

| Maßnahme | Technischer Status | Erforderliche Aktion |
| :--- | :--- | :--- |
| **Passwort-Verschlüsselung** | ✅ Umgesetzt (bcrypt) | Keine. |
| **Verbindungsverschlüsselung** | ✅ Umgesetzt (TLS 1.3) | SSL-Zertifikat über den Reverse-Proxy (Nginx / Coolify) konfigurieren. |
| **Auftragsverarbeitungs-Vertrag (AVV)** | ⚠️ Ausstehend | Vor Live-Betrieb den AVV mit dem E-Mail-Provider **Resend** prüfen/abschließen. Ein AVV mit dem Softwarehersteller von OpenPanel ist nicht nötig, da die Instanz vollständig selbstgehostet betrieben wird. |
| **Sitzungsbereinigung** | ⚠️ Ausstehend | Datenbank-Cron-Job (siehe [automation.md](./automation.md)) einrichten, um veraltete Sitzungen nach 30 Tagen zu bereinigen. |
| **Datenschutzbelehrung** | ✅ Umgesetzt | Text der Datenschutzseite im Frontend (`/privacy`) durch die Rechtsabteilung prüfen lassen. |
