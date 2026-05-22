# Audit Log & Revert Engine Architektur

Dieses Dokument beschreibt das Design und die Implementierung des enterprise-grade **Audit Log (Aktivitätslog) & Revert (Rückgängigmachungs) Systems**. Es ermöglicht eine lückenlose Verfolgung aller relevanten Datenänderungen (Erstellungen, Updates, Löschungen) sowie administrativer Systemaktionen (wie Logins und Logouts) und bietet Administratoren die Möglichkeit, Änderungen atomar und kollisionssicher rückgängig zu machen.

---

## 1. Übersicht der Audit- & Revert-Architektur

Das System fängt Datenbank-Mutationen vollautomatisch auf Prisma-Ebene ab, verbindet diese mit dem asynchronen Request-Context (wer hat die Aktion ausgeführt?), bereitet die Daten datenschutzkonform auf und speichert sie in einem strukturierten Diff-Format.

```text
+---------------------------------------------------------------------------------+
| 1. Request-Schicht: tRPC Middleware befüllt AsyncLocalStorage (AuditContext)    |
+---------------------------------------------------------------------------------+
                                         │
                                         ▼
+---------------------------------------------------------------------------------+
| 2. Datenbank-Schicht: Prisma-Erweiterung ($extends.query) fängt Mutation ab     |
+---------------------------------------------------------------------------------+
                                         │
                ┌────────────────────────┴────────────────────────┐
                ▼                                                 ▼
   [Bei DELETE / UPDATE]:                            [Bei CREATE / UPDATE]:
   Lade Vorher-Zustand (inkl.                         Führe Query aus & erhalte
   Relationaler Bäume via prefetch)                   Nachher-Zustand
                │                                                 │
                └────────────────────────┬────────────────────────┘
                                         ▼
+---------------------------------------------------------------------------------+
| 3. Logger-Service: Sanitize Payload (GDPR), Generiere Label & Log-Nachricht     |
+---------------------------------------------------------------------------------+
                                         │
                                         ▼
+---------------------------------------------------------------------------------+
| 4. AuditLog-Tabelle: Speichere Aktion, ID, Email, IP, Nachricht & JSON-Diff     |
+---------------------------------------------------------------------------------+
                                         │
                                         ▼
+---------------------------------------------------------------------------------+
| 5. Revert Engine: Rollback via $transaction (Unterstützt komplexe Kaskaden)     |
+---------------------------------------------------------------------------------+
```

---

## 2. Das Datenmodell (`schema.prisma`)

Die Tabelle `AuditLog` ist auf maximale Abfragegeschwindigkeit und flexible Datenhaltung ausgelegt. Sie verwendet das JSON-Format, um den Zustand von Objekten zum Zeitpunkt der Änderung zu speichern.

```prisma
model AuditLog {
  id             String   @id @default(cuid())
  action         String   // z.B. "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "REVERT"
  entityType     String?  // Name des Modells, z.B. "Product", "Location", "User"
  entityId       String?  // Primärschlüssel des betroffenen Datensatzes
  message        String   // Benutzerfreundliche, lokalisierte Beschreibung (Deutsch)
  details        Json?    // { oldValue: ..., newValue: ... } für Diffs und Wiederherstellungen
  userId         String?  // ID des ausführenden Benutzers
  userEmail      String?  // E-Mail des ausführenden Benutzers
  userRole       String?  // Rolle des ausführenden Benutzers zum Zeitpunkt der Aktion
  clientIp       String?  // IP-Adresse des Clients (DSGVO-konform verschleiert/erfasst)
  revertedFromId String?  // Verweis auf die ursprüngliche AuditLog-ID, falls dies ein Revert ist
  createdAt      DateTime @default(now())

  @@index([action, createdAt])
  @@index([entityType, entityId])
  @@index([userId, createdAt])
}
```

---

## 3. Asynchroner Request-Scoped Context

Da Prisma-Abfragen tief im Service-Layer oder in Drittanbieter-Bibliotheken ausgeführt werden, ist es oft unpraktisch, Session-Informationen manuell durch alle Funktionsaufrufe durchzureichen. Das System nutzt daher **`AsyncLocalStorage`** aus dem Node.js-Standardmodul `node:async_hooks`.

### Funktionsweise (`src/lib/audit-context.ts`)
`AsyncLocalStorage` erlaubt es, Variablen an die asynchrone Ausführungskette eines bestimmten Requests zu binden:

```typescript
import { AsyncLocalStorage } from 'node:async_hooks';

export interface AuditContext {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  clientIp?: string | null;
}

export const auditContextStorage = new AsyncLocalStorage<AuditContext>();

export function getAuditContext(): AuditContext | undefined {
  return auditContextStorage.getStore();
}
```

### Registrierung in tRPC (`src/server/trpc.ts`)
Eine globale tRPC-Middleware fängt die Session- und IP-Daten des ankommenden Requests ab und startet den asynchronen Kontext:

```typescript
const auditContextMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = ctx.session;
  const context = {
    userId: session?.sub || (session as any)?.id || null,
    userEmail: session?.email || null,
    userRole: session?.role || null,
    clientIp: ctx.ip || null,
  };
  // Alle nachfolgenden asynchronen Aufrufe innerhalb dieser Kette haben Zugriff auf 'context'
  return auditContextStorage.run(context, () => next());
});
```

---

## 4. Globaler Prisma Interceptor

Um sicherzustellen, dass keine Datenmutation unprotokolliert bleibt, ist ein globaler Abfrage-Interceptor direkt in den Prisma-Client integriert.

> [!IMPORTANT]
> **Performance & Memory-Leaks**: Die Prisma-Erweiterung `$extends` wird **einmalig statisch** beim Erstellen des Prisma-Singletons (`src/lib/prisma.ts`) registriert. Dynamische Erweiterungen bei jedem Request würden neue Prisma-Instanzen erzeugen, was unter Last zu Speicherlecks und Connection-Pool-Exhaustion führt.

### Interceptor-Ablauf (`src/lib/prisma.ts`)
```typescript
client.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const isWrite = ['create', 'update', 'delete'].includes(operation);
        if (model && isWrite && isAuditedModel(model)) {
          // Dynamic import verhindert zirkuläre Abhängigkeiten während des App-Bootstraps
          const { logAutomaticAction, fetchCurrentState, fetchCurrentStateWithRelations } = 
            await import('./audit-logger');

          if (operation === 'create') {
            const result = await query(args);
            await logAutomaticAction('CREATE', model, result);
            return result;
          }
          if (operation === 'update') {
            const oldValue = await fetchCurrentState(model, args.where);
            const result = await query(args);
            await logAutomaticAction('UPDATE', model, result, oldValue);
            return result;
          }
          if (operation === 'delete') {
            const oldValue = await fetchCurrentStateWithRelations(model, args.where);
            const result = await query(args);
            await logAutomaticAction('DELETE', model, result, oldValue);
            return result;
          }
        }
        return query(args); // Standard-Fallthrough für Leseoperationen
      }
    }
  }
});
```

### Label- & Variablen-Auflösung (`getEntityLabel`)
Um aussagekräftige Log-Nachrichten wie `Standort "Hannover" wurde erstellt.` statt anonymer IDs anzuzeigen, ermittelt `getEntityLabel` dynamisch das lesbarste Feld des Objekts:

```typescript
function getEntityLabel(model: string, data: any): string {
  if (!data) return 'Unbekannt';
  if (model === 'SystemSetting') return data.key || 'Einstellung';
  if (model === 'User' && (data.firstName || data.lastName)) {
    return `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }
  return data.name || data.title || data.email || data.firstName || data.id || 'Unbekannt';
}
```
*   **Fehlerbehebung**: Zuvor fielen Abfragen fälschlicherweise auf nicht existierende User-Eigenschaften zurück, was leere Anführungszeichen (`""`) zur Folge hatte. Durch die explizite Typprüfung auf `model === 'User'` ist eine präzise Label-Erzeugung für alle Entitäten garantiert.

### DSGVO & Sicherheits-Filter (`sanitizePayload`)
Das System schwärzt sensible Felder (wie Passwörter, PINs, OTP-Hashes und Tokens) vollständig, bevor sie in das JSON-Details-Feld geschrieben werden.

---

## 5. Die Wiederherstellungs-Engine (Revert Engine)

Die Revert Engine (`src/lib/audit-revert.ts`) macht Änderungen rückgängig, indem sie die inversen Operationen ausführt:
1.  **CREATE rückgängig machen** $\rightarrow$ Löscht den erstellten Datensatz.
2.  **UPDATE rückgängig machen** $\rightarrow$ Schreibt die alten Skalarwerte (`oldValue`) zurück in den Datensatz.
3.  **DELETE rückgängig machen** $\rightarrow$ Erstellt den gelöschten Datensatz neu und verknüpft kaskadiert gelöschte Relationen.

### Atomare Transaktionssicherheit
Alle Schritte einer Wiederherstellung werden innerhalb einer **Prisma-Datenbanktransaktion (`prisma.$transaction`)** ausgeführt. Schlägt die Wiederherstellung einer kaskadierten Beziehung fehl (z. B. durch eine verletzte Foreign-Key-Constraint), wird die gesamte Operation rückgängig gemacht, um Dateninkonsistenzen zu verhindern.

### Deep Relationship Prefetching (Lösch-Kaskaden)
Beim Löschen komplexer Modelle reicht es nicht aus, nur den Hauptdatensatz zu sichern. Das System führt vor der eigentlichen Löschung ein Prefetching durch:
*   **Product**: Sichert Sales-Arguments und die Preis-Historie (`priceHistory`).
*   **SpecialPrice**: Sichert Rabatt-Staffelungen (`tiers`) und Produktverknüpfungen.
*   **Addon**: Sichert Preisstufen (`tiers`) und kompatible Produkte.

Bei der Wiederherstellung (`REVERT DELETE`) rekonstruiert die Engine diese Relationen hierarchisch im selben Transaktions-Scope.

---

## 6. Frontend-Kollisionsschutz & Visual Diffing

Das Administrations-Interface für das Aktivitätslog (`src/app/admin/audit/`) ist für maximale Zuverlässigkeit im operativen Betrieb optimiert.

### Side-by-Side Visual Diffing
Die Komponente vergleicht `oldValue` und `newValue` auf Feldebene. Hinzugefügter Text wird grün hervorgehoben, während gelöschter Text rot und durchgestrichen dargestellt wird.

### Write-Collision Detection
Wenn Admin A einen Datensatz ändert, danach Admin B denselben Datensatz aktualisiert und Admin A versucht, seine Änderung rückgängig zu machen, droht ein Datenverlust, da Admin B's neuere Änderung überschrieben würde.

*   **Schutz-Mechanismus**: Vor der Ausführung eines Reverts ruft der Client `getCurrentState` auf. Weicht der aktuelle Datenbank-Zustand vom Zustand nach der zu revertierenden Aktion ab (`newValue`), wird eine prominente Warnung im UI eingeblendet:
    > ⚠️ **Achtung Write-Kollision**: Dieses Element wurde nach dieser Aktion erneut geändert. Das Rückgängigmachen überschreibt neuere Änderungen!
*   Der Administrator muss diese Warnung explizit zur Kenntnis nehmen, um fortzufahren.

---

## 7. Entwickler-Leitfaden: Das System erweitern

### Neues Modell unter Audit-Kontrolle stellen

Wenn ein neues Datenmodell (z. B. `TeamHighlight`) automatisch auditiert werden soll, sind folgende drei Schritte notwendig:

#### Schritt A: Modell registrieren
Füge den exakten Namen des Prisma-Modells zum Array `AUDITED_MODELS` in `src/lib/audit-logger.ts` hinzu:
```typescript
export const AUDITED_MODELS = [
  // ... bestehende Modelle
  'TeamHighlight',
];
```

#### Schritt B: Deutschen Namen für die Log-Nachricht definieren
Trage die Übersetzung im Mapping `GERMAN_MODEL_NAMES` in `src/lib/audit-logger.ts` ein:
```typescript
const GERMAN_MODEL_NAMES: Record<string, string> = {
  // ...
  TeamHighlight: 'Highlight des Teams',
};
```

#### Schritt C: (Optional) Relationen sichern (Prefetching)
Falls das Modell abhängige Kind-Tabellen besitzt, die bei einer Löschung kaskadierend verschwinden, füge diese in `fetchCurrentStateWithRelations` hinzu:
```typescript
else if (model === 'TeamHighlight') {
  options.include = {
    // Relationen definieren, die mitgesichert werden sollen
  };
}
```
Erweitere anschließend den `REVERT DELETE` Block in `src/lib/audit-revert.ts`, um diese Relationen bei der Wiederherstellung neu zu erzeugen.

---

## 8. Manuelles Logging von Systemaktionen

Für Aktionen, die nicht direkt an eine einzelne Datenbank-Mutation gekoppelt sind (z. B. Authentifizierungsschritte), stellt das System die Funktion `writeAuditLog` zur Verfügung:

```typescript
import { writeAuditLog } from '@/lib/audit-logger';

// Protokollieren eines erfolgreichen Logins
await writeAuditLog({
  action: 'LOGIN',
  entityType: 'User',
  entityId: user.id,
  message: `Erfolgreiche Anmeldung für ${user.firstName} ${user.lastName}.`,
  details: { email: user.email, role: user.role },
});
```
