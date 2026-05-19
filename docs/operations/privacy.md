# Datenschutz & Datensicherheit

Dieses Dokument gibt einen technischen Überblick über die Datenschutzpraktiken der Plattform. Es beschreibt, welche Daten erhoben werden, wo sie gespeichert sind und wie die Sicherheitsmechanismen technisch konfiguriert sind.

> [!WARNING]
> Dieses Dokument stellt keine rechtliche Beratung dar. Vor einem offiziellen Live-Betrieb sollte eine offizielle Datenschutzerklärung und ein DSGVO-Konzept mit der zuständigen Datenschutzabteilung abgestimmt werden.

---

## 1. Grundprinzipien

*   **Datensparsamkeit**: Das System speichert ausschließlich Daten, die für den sicheren Betrieb und die Authentifizierung der Vertriebsmitarbeiter zwingend erforderlich sind.
*   **Keine Endkundendaten**: Das Tool dient rein der Tarifberatung und Angebotskalkulation. Es werden **keine Kundennamen, Kundenadressen, Bankdaten oder Vertragsdaten** in der Datenbank gespeichert. Der PDF-Export des Warenkorbs wird direkt im Browser generiert und nicht auf dem Server abgelegt.
*   **Kein externes Tracking**: Es werden keine Google Analytics, Facebook Pixel oder ähnliche Tracking-Mechanismen geladen. Eventuell genutzte Performance-Messungen laufen anonymisiert ohne Personenbezug.
*   **Nur für den internen Gebrauch**: Das Tool ist nicht öffentlich zugänglich. Jeder Benutzer muss einer organisatorischen Einheit (OD-Region, Standort, Team) zugewiesen sein.

---

## 2. Gespeicherte Daten (Mitarbeiterdaten)

Das System speichert ausschließlich Daten der Telekom-Vertriebsmitarbeiter (User):

### A. Benutzertabelle (`User`)
*   `firstName` / `lastName`: Zur Anzeige im UI und im PDF-Briefkopf des Beraters.
*   `email`: Dient als Login-Identifikator (ausschließlich geschäftliche Telekom-E-Mail-Adressen).
*   `password` / `pin`:
    *   Das optionale Admin-Passwort und die Berater-PIN werden ausschließlich als sichere Einweg-Hashes mittels **bcryptjs** (Cost-Faktor 10) in der Datenbank gespeichert. Eine Wiederherstellung im Klartext ist mathematisch unmöglich.
*   `role` / `isEditor`: Steuert die Autorisierungsgrenzen.
*   `odRegionId` / `locationId` / `teamId`: Zur Durchsetzung der RLS-Sicherheitsgrenzen (Scope-Engine).

### B. Sitzungstabelle (`UserSession`)
*   `ip`: Die IP-Adresse wird bei der Anmeldung erfasst, um den Zugriff über autorisierte Telekom-Netzbereiche (IP-Whitelisting) abzugleichen.
*   `userAgent`: Dient zur Analyse von Browser-Kompatibilitätsproblemen und zur Erkennung ungewöhnlicher Anmeldeversuche.
*   `deviceId`: Eine zufällige ID zur Erkennung verifizierter Endgeräte (Bypass der E-Mail-Verifizierung bei Folgelogins).

---

## 3. Cookie-Spezifikationen

Die Authentifizierung erfolgt zustandslos über sichere, signierte JWT-Sitzungsdaten in Cookies:

| Cookie-Name | Typ | Ablaufzeit | Attribute | Verwendungszweck |
| :--- | :--- | :--- | :--- | :--- |
| `auth-token` | JWT | 4 Std. (Admins) / 30 Tage (Berater) | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` | Speichert Sitzungsinformationen und Rollen-Claims des angemeldeten Benutzers. |
| `sales-device-id` | JWT | 365 Tage | `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` | Identifiziert ein bekanntes, verifiziertes Gerät des Beraters. Verhindert doppelte E-Mail-Verifizierungen auf demselben Endgerät. |

---

## 4. Verbindungssicherheit

*   **HTTPS-Zwang**: In Produktion wird jeglicher Traffic über **TLS 1.2 und TLS 1.3** verschlüsselt. Unverschlüsselte HTTP-Anfragen (Port 80) werden automatisch auf HTTPS (Port 443) umgeleitet.
*   **Interne Netzwerke**: Der PostgreSQL-Datenbankserver und die Redis-Instanz laufen in einem isolierten Docker-Netzwerk innerhalb von Coolify. Es gibt **keine Port-Freigaben nach außen** für die Datenbanken (kein offener Port 5432 oder 6379 im Internet). Alle Verbindungen laufen lokal und passwortgeschützt über Container-Links.

---

## 5. DSGVO-Checkliste für den Administrator

| Maßnahme | Technischer Status | Rechtliche Empfehlung |
| :--- | :--- | :--- |
| **Passwörter/PINs hashen** | ✅ Umgesetzt (bcrypt) | — |
| **Verschlüsselte Verbindung** | ✅ Umgesetzt (TLS 1.3) | — |
| **Auftragsverarbeitung (AVV)** | ⚠️ Ausstehend | Vor Livegang muss ein AVV (Auftragsdatenverarbeitungs-Vertrag) mit **Resend** abgeschlossen werden. |
| **Automatische Session-Löschung** | ⚠️ Ausstehend | Richte den Datenbank-Cron-Job (siehe [automation.md](./automation.md)) ein, um alte Sessions nach 30 Tagen zu bereinigen. |
| **Datenschutzbelehrung** | ✅ Vorhanden (`/privacy`) | Lasse den Text der Datenschutzseite im Frontend durch die Rechtsabteilung prüfen. |
