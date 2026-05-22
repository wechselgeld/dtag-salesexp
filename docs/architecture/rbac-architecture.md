# Rollen- und Berechtigungs-Architektur (RBAC & RLS)

Dieses Dokument beschreibt die Implementierung von Role-Based Access Control (RBAC) und Row-Level Security (RLS) zur Autorisierung auf API- und Datenbankebene.

---

## 1. Systemstruktur & Kontrollschichten

Die Absicherung erfolgt über vier hierarchische Ebenen:

1. **Frontend-Schicht**: Clientseitige Steuerung der UI-Sichtbarkeit über den Custom Hook `usePermissions` und die Guard-Komponente `<RequirePermission>`.
2. **tRPC-Middleware**: Routen-Schutz durch Validierung der Berechtigungs-Matrix über `requirePermission` im Server.
3. **Scope-Engine-Middleware**: Validierung der organisatorischen Zugehörigkeit des angeforderten Zielobjekts über `withHierarchicalScope`.
4. **Datenbank-Schicht**: Automatische Injection von SQL-Bedingungen über die Prisma-Erweiterung `getScopedPrisma` zur Verhinderung von Datenzugriffen außerhalb des zulässigen Scopes.

---

## 2. Implementierungsdetails der Komponenten

### Berechtigungs-Matrix

Die Berechtigungs-Matrix trennt Benutzerrollen von konkreten Berechtigungen und ist in `src/lib/permissions.ts` definiert.

* **Feingranulare Berechtigungs-Tokens (`PERMISSIONS`)**: Vordefinierte Aktionen wie `users:read`, `users:write`, `users:delete`, `teams:manage`, `teams:delete`, `locations:manage`, `locations:delete`, `od:manage`, `news:create`, `news:delete`, `catalog:manage`, `settings:manage`, `sudo:required`, `credits:manage`, `addons:manage`, `prices:manage`.
* **Rollen-Spezifikation (`ROLE_PERMISSIONS`)**:
  * `ADMIN`: Besitzt alle Berechtigungen.
  * `OD_MANAGER`: Verwaltet Benutzer, Teams und Standorte des eigenen OD-Bereichs sowie News-Einträge.
  * `LOCATION_MANAGER`: Verwaltet Teams und Benutzer des eigenen Standorts sowie News-Einträge.
  * `TEAM_LEADER`: Darf News-Einträge für das eigene Team verfassen.
  * `USER` (Vertriebsberater): Besitzt standardmäßig keine administrativen Berechtigungen.
* **isEditor-Kompatibilität**: Wenn das Flag `isEditor` für einen Benutzer gesetzt ist, erhält dieser in `hasPermission` automatisch die Berechtigungen zur Tarif- und Konditionsverwaltung (`catalog:manage`, `prices:manage`, `addons:manage`, `credits:manage`).

### tRPC-Authentifizierung & Autorisierung (`src/server/trpc.ts`)

Jede API-Anfrage durchläuft eine definierte Middleware-Kette:

1. **Authentifizierung (`isAuthed`)**:
   * Liest das signierte JWT aus dem HTTP-Only-Cookie aus.
   * Überprüft die Session-Version in der PostgreSQL-Datenbank gegen das Token.
   * Cacht das Abfrageergebnis für 60 Sekunden in Redis (`session:user:${userId}:current`). Bei Änderungen an Benutzerdaten wird der Cache sofort invalidiert (`invalidateCache`).
2. **Berechtigungs-Check (`requirePermission('...')`)**:
   * Gleicht die Rolle des Benutzers sowie das `isEditor`-Flag der Session gegen die Berechtigungsmatrix ab.
   * Bricht bei fehlenden Berechtigungen mit einem `FORBIDDEN`-Fehler ab.

### Hierarchische Scope-Engine (`src/server/middlewares/scope-engine.ts`)

Die Middleware `withHierarchicalScope(entityType)` erzwingt, dass Manager und Teamleiter nur Entitäten bearbeiten dürfen, die in ihrer organisatorischen Hierarchie liegen.

* **Funktionsweise**: Ermittelt die ID des Zielobjekts aus dem tRPC-Input, fragt dessen organisationsstrukturelle Ahnenreihe (Lineage) in der Datenbank ab und vergleicht diese mit den Attributen der Session:
  * `OD_MANAGER`: Erlaubt Aktionen nur, wenn die `odRegionId` des Zielobjekts mit der des Managers übereinstimmt.
  * `LOCATION_MANAGER`: Erlaubt Aktionen nur, wenn die `locationId` des Zielobjekts mit der des Managers übereinstimmt.
  * `TEAM_LEADER`: Erlaubt Aktionen nur, wenn die `teamId` des Zielobjekts mit der des Teamleiters übereinstimmt.

### Row-Level Security (RLS) via Prisma Extension (`src/lib/prisma-extended.ts`)

Für Leseabfragen (`findMany`, `findFirst`) injiziert die Prisma-Erweiterung `getScopedPrisma(session)` dynamisch SQL-Filterbedingungen.

* **Filter-Injection**: Modifiziert das `where`-Argument der Prisma-Abfrage durch Einbetten der Filter in ein logisches `AND`:
  ```typescript
  args.where = {
    AND: [
      args.where || {},
      rlsWhere, // Liefert die Filterbedingungen aus src/lib/rbac.ts
    ],
  };
  ```
* **Sicherheits-Eigenschaften**: Durch die Verwendung des logischen `AND` wird verhindert, dass clientseitig übergebene Suchparameter oder `OR`-Abfragen die RLS-Filter überschreiben oder aushebeln.

---

## 3. Interaktionen und Beziehungen

```
[Frontend Guard / Hook] ──> [tRPC Router / requirePermission]
                                            │
                                            ▼
[Prisma Client (Scoped)] <── [tRPC Middleware / Scope Engine]
```

* Die Hooks `usePermissions` im Frontend basieren auf den identischen Validierungsregeln (`hasPermission`) aus `src/lib/permissions.ts`, die auch auf dem Server in der tRPC-Middleware ausgeführt werden.
* Die tRPC-Middleware `isAuthed` injiziert das `session`-Objekt in den tRPC-Context (`ctx.session`). Dieses Objekt wird anschließend von `getScopedPrisma(ctx.session)` verwendet, um die RLS-Query-Einschränkungen auf Datenbankebene anzuwenden.

---

## 4. Entwickler-Anleitung: System erweitern

### Neue Berechtigung hinzufügen

1. **Token registrieren**: Füge das Berechtigungs-Token zum String-Array `PERMISSIONS` in `src/lib/permissions.ts` hinzu:
   ```typescript
   export const PERMISSIONS = [
     // ... bestehende Tokens
     'logs:view',
   ] as const;
   ```
2. **Rollen zuweisen**: Weise die Berechtigung den gewünschten Rollen im Objekt `ROLE_PERMISSIONS` in `src/lib/permissions.ts` zu:
   ```typescript
   export const ROLE_PERMISSIONS: Record<string, ReadonlySet<Permission>> = {
     ADMIN: new Set(PERMISSIONS),
     OD_MANAGER: new Set([
       // ... andere Berechtigungen
       'logs:view',
     ]),
     // ... weitere Rollen
   };
   ```

### Neue Rolle registrieren

1. **Rang definieren**: Trage die neue Rolle und ihren numerischen Rang (Hierarchie-Ebene) im Objekt `ROLE_RANKS` in `src/lib/rbac.ts` ein:
   ```typescript
   const ROLE_RANKS = {
       ADMIN: 4,
       REGIONAL_DIRECTOR: 3.5, // Neue Rolle zwischen ADMIN und OD_MANAGER
       OD_MANAGER: 3,
       // ...
   } as const;
   ```
2. **Berechtigungen zuordnen**: Definiere das Berechtigungs-Set für die neue Rolle im Objekt `ROLE_PERMISSIONS` in `src/lib/permissions.ts`:
   ```typescript
   export const ROLE_PERMISSIONS: Record<string, ReadonlySet<Permission>> = {
     // ...
     REGIONAL_DIRECTOR: new Set([
       'users:read',
       'od:manage',
     ]),
   };
   ```
3. **Sicherheitsfilter anpassen**: Erweitere die Filterfunktionen in `src/lib/rbac.ts` (z. B. `getOdRegionFilter`, `getUserFilter`), um das Verhalten der neuen Rolle bei RLS-Abfragen festzulegen.

### Scoped tRPC-Route implementieren

Führe für schreibende oder modifizierende Operationen die Middlewares `requirePermission` und `withHierarchicalScope` in der gewünschten Prozeduren-Kette aus:

```typescript
import { router, protectedProcedure } from '../trpc';
import { requirePermission } from '../trpc';
import { withHierarchicalScope } from '../middlewares/scope-engine';
import { z } from 'zod';

export const documentRouter = router({
  delete: protectedProcedure
    .input(z.object({ id: z.string() })) // Erfordert ID zur Scope-Überprüfung
    .use(requirePermission('documents:delete')) // Berechtigungs-Check
    .use(withHierarchicalScope('document')) // Scope-Engine Hierarchie-Check
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.document.delete({
        where: { id: input.id },
      });
    }),
});
```
