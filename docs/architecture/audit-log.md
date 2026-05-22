# Audit Log & Revert Engine Architektur

Dieses Dokument beschreibt den Entwurf und die Implementierung des Aktivitätslogs (Audit Log) und des Wiederherstellungs-Systems (Revert Engine). Das System erfasst Datenänderungen (Erstellungen, Updates, Löschungen) sowie administrative Aktionen (z. B. Logins) und ermöglicht kaskadierende, transaktionssichere Rollbacks.

---

## 1. Systemstruktur & Funktionsweise

Das System verarbeitet Datenbank-Mutationen vollautomatisch auf Prisma-Ebene:

1. **Request-Schicht**: Eine tRPC-Middleware befüllt den `AsyncLocalStorage` (`AuditContext`) mit den Session-Informationen des aktuellen Requests.
2. **Datenbank-Schicht**: Eine Prisma-Erweiterung (`$extends.query`) fängt alle schreibenden Operationen ab.
3. **Zustandserfassung**: Bei `DELETE` und `UPDATE` wird der Vorher-Zustand (ggf. inklusive relationaler Abhängigkeiten) über Prefetch-Funktionen geladen. Bei `CREATE` wird die Query ausgeführt und der Nachher-Zustand aufgezeichnet.
4. **Log-Generierung**: Der Logger-Service filtert sensible Felder, ermittelt ein sprechendes Label für die Entität und schreibt einen Eintrag in die Tabelle `AuditLog`.
5. **Wiederherstellung**: Die Revert Engine führt bei Bedarf die inverse Datenbank-Operation aus, verpackt in eine atomare Prisma-Transaktion.

---

## 2. Das Datenmodell (`schema.prisma`)

Die Tabelle `AuditLog` speichert den Zustand der Objekte zum Zeitpunkt der Änderung im JSON-Format:

```prisma
model AuditLog {
  id             String   @id @default(cuid())
  action         String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, REVERT
  entityType     String?  // Name des Prisma-Modells (z. B. Product, User)
  entityId       String?  // Primärschlüssel des betroffenen Datensatzes
  message        String   // Deutsche Beschreibung der Aktion
  details        Json?    // { oldValue: ..., newValue: ... } für Diffs und Rollbacks
  userId         String?  // ID des ausführenden Benutzers
  userEmail      String?  // E-Mail des ausführenden Benutzers
  userRole       String?  // Rolle des ausführenden Benutzers
  clientIp       String?  // IP-Adresse des Clients
  revertedFromId String?  // Referenz auf die ursprüngliche AuditLog-ID bei Reverts
  createdAt      DateTime @default(now())

  @@index([action, createdAt])
  @@index([entityType, entityId])
  @@index([userId, createdAt])
}
```

---

## 3. Request-Scoped Context über AsyncLocalStorage (`src/lib/audit-context.ts`)

Da Prisma-Abfragen tief im Service-Layer ausgeführt werden und kein manuelles Durchreichen des Session-Kontextes stattfinden soll, nutzt das System `AsyncLocalStorage` aus dem Node.js-Modul `node:async_hooks`.

### Kontext-Initialisierung in tRPC (`src/server/trpc.ts`)

Eine globale tRPC-Middleware extrahiert die Session- und IP-Daten des Requests und startet den asynchronen Kontext:

```typescript
const auditContextMiddleware = t.middleware(async ({ ctx, next }) => {
  const session = ctx.session;
  const context = {
    userId: session?.sub || (session as any)?.id || null,
    userEmail: session?.email || null,
    userRole: session?.role || null,
    clientIp: ctx.ip || null,
  };
  return auditContextStorage.run(context, () => next());
});
```

---

## 4. Globaler Prisma Interceptor (`src/lib/prisma.ts`)

Der Prisma-Client registriert den Query-Interceptor statisch beim Erstellen des Prisma-Singletons:

```typescript
client.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const isWrite = ['create', 'update', 'delete'].includes(operation);
        if (model && isWrite && isAuditedModel(model)) {
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
        return query(args);
      }
    }
  }
});
```

> [!WARNING]
> Dynamische Instanziierungen über `$extends` innerhalb von Request-Handlern führen zu Speicherlecks und Connection-Pool-Fehlern. Registriere Erweiterungen ausschließlich statisch auf dem Singleton-Client.

---

## 5. Die Wiederherstellungs-Engine (Revert Engine)

Die Engine in `src/lib/audit-revert.ts` macht Änderungen rückgängig:

* **CREATE**: Löscht den erstellten Datensatz anhand der ID.
* **UPDATE**: Schreibt alle im Log gespeicherten Skalarwerte aus `oldValue` in den Datensatz zurück.
* **DELETE**: Erstellt den gelöschten Datensatz neu und rekonstruiert kaskadierend gelöschte Relationen im selben Transaktions-Scope (`prisma.$transaction`).

### Deep Relationship Prefetching

Beim Löschen komplexer Modelle sichert `fetchCurrentStateWithRelations` abhängige Relationen, bevor diese gelöscht werden:
* **Product**: Sichert Verkaufsargumente (`salesArguments`) und die Preishistorie (`priceHistory`).
* **SpecialPrice**: Sichert Rabattstaffeln (`tiers`) und Produktverknüpfungen.
* **Addon**: Sichert Preisstufen (`tiers`) und kompatible Produkte.

---

## 6. Interaktionen und Beziehungen

```
[tRPC Router] ──> [Prisma Client (Statisch erweitert)]
                         │
                         ▼ (Aufruf)
                  [audit-logger.ts] <── [audit-context.ts] (Session-Daten)
                         │
                         ▼ (Schreibt in)
                  [AuditLog Tabelle]
                         ▲
                         │ (Liest & schreibt)
                  [audit-revert.ts]
```

* Der Prisma-Interceptor in `src/lib/prisma.ts` ist direkt an `src/lib/audit-logger.ts` gekoppelt.
* `src/lib/audit-logger.ts` liest die Metadaten des ausführenden Benutzers asynchron aus `src/lib/audit-context.ts` aus.
* Die Revert-Engine in `src/lib/audit-revert.ts` liest Protokolleinträge aus der `AuditLog`-Tabelle und modifiziert die betroffenen Tabellen über denselben Prisma-Client.

---

## 7. Entwickler-Anleitung: System erweitern

### Neues Modell unter Audit-Kontrolle stellen

Wenn ein neues Modell (z. B. `TeamHighlight`) automatisch auditiert werden soll, führe folgende Schritte aus:

1. **Modell registrieren**: Füge den exakten Namen des Prisma-Modells zum Array `AUDITED_MODELS` in `src/lib/audit-logger.ts` hinzu:
   ```typescript
   export const AUDITED_MODELS = [
     // ...
     'TeamHighlight',
   ];
   ```
2. **Deutschen Namen definieren**: Trage die Übersetzung im Mapping `GERMAN_MODEL_NAMES` in `src/lib/audit-logger.ts` ein:
   ```typescript
   const GERMAN_MODEL_NAMES: Record<string, string> = {
     // ...
     TeamHighlight: 'Highlight des Teams',
   };
   ```
3. **Relationen sichern (Prefetching)**: Wenn das Modell abhängige Tabellen besitzt, die kaskadierend gelöscht werden, füge diese in `fetchCurrentStateWithRelations` in `src/lib/audit-logger.ts` hinzu:
   ```typescript
   else if (model === 'TeamHighlight') {
     options.include = {
       highlights: true, // Relationen, die mitgesichert werden sollen
     };
   }
   ```
4. **Revert-Logik erweitern**: Implementiere das Wiederherstellen dieser Relationen im `DELETE`-Block von `revertAuditLog` in `src/lib/audit-revert.ts`.

### Sensible Felder filtern (Sanitizing)

Um DSGVO-relevante oder sicherheitskritische Felder nicht im Klartext im Audit-Log zu speichern, filtert `sanitizePayload` diese aus.

* **Feld registrieren**: Füge den Feldnamen (z. B. `secretToken`) zum Array `sensitiveKeys` in `src/lib/audit-logger.ts` hinzu:
   ```typescript
   const sensitiveKeys = [
     'password',
     'pin',
     // ...
     'secretToken',
   ];
   ```
   Das System überschreibt diese Felder in der Payload rekursiv mit dem Platzhalter `"[GEFILTERT]"`.

### Manuelles Logging ausführen

Nutze für Aktionen, die nicht direkt an eine Prisma-Mutation gekoppelt sind (z. B. Authentifizierungs-Events), die Funktion `writeAuditLog`:

```typescript
import { writeAuditLog } from '@/lib/audit-logger';

await writeAuditLog({
  action: 'LOGIN_FAILED',
  entityType: 'User',
  entityId: user.id,
  message: `Fehlgeschlagener Anmeldeversuch für E-Mail ${user.email}.`,
  details: { ip: clientIp },
});
```
