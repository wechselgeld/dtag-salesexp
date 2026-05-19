# Rollen- & Berechtigungs-Architektur (RBAC & RLS)

Dieses Dokument beschreibt die Implementierung des **Role-Based Access Control (RBAC)** und des **Row-Level Security (RLS)** Systems zur logischen Absicherung aller API-Routen und Datenbankabfragen.

---

## 1. Übersicht der Sicherheitsarchitektur

Die Absicherung erfolgt über vier aufeinander aufbauende Kontrollschichten:

```text
+-------------------------------------------------------------------------------+
| 1. Frontend-Schicht: usePermissions() & <RequirePermission>                   |
+-------------------------------------------------------------------------------+
                                       |
+-------------------------------------------------------------------------------+
| 2. tRPC-Middleware: isAuthed & requirePermission('...')                       |
+-------------------------------------------------------------------------------+
                                       |
+-------------------------------------------------------------------------------+
| 3. Scope Engine Middleware: withHierarchicalScope('...')                      |
+-------------------------------------------------------------------------------+
                                       |
+-------------------------------------------------------------------------------+
| 4. Datenbank-Schicht: Prisma-Erweiterung (getScopedPrisma)                    |
+-------------------------------------------------------------------------------+
```

---

## 2. Die Schichten im Detail

### A. Deklarative Berechtigungs-Matrix (`src/lib/permissions.ts`)

Entkoppelt Rollen von fest verdrahteten Berechtigungen. Es definiert feingranulare Permission-Tokens:

*   **Berechtigungstokens**: `users:read`, `users:write`, `users:delete`, `teams:manage`, `teams:delete`, `locations:manage`, `locations:delete`, `od:manage`, `news:create`, `news:delete`, `catalog:manage`, `settings:manage`, `sudo:required`, `credits:manage`, `addons:manage`, `prices:manage`.
*   **Rollenverteilung (`ROLE_PERMISSIONS`)**:
    *   `ADMIN`: Besitzt alle Berechtigungen.
    *   `OD_MANAGER`: Kann Benutzer, Teams und Standorte des eigenen Bereichs verwalten sowie News erstellen.
    *   `LOCATION_MANAGER`: Kann Teams und Benutzer des Standorts verwalten sowie News erstellen.
    *   `TEAM_LEADER`: Kann News für das eigene Team verfassen.
    *   `USER` (Vertriebsberater): Keine administrativen Berechtigungen (nur Kalkulator-Zugriff).
*   **Legacy `isEditor` Brücke**: Um Abwärtskompatibilität mit dem bestehenden Schema und UI-Formularen zu wahren, wertet `hasPermission` zusätzlich das optionale Flag `isEditor` aus. Wenn `isEditor` wahr ist, erhält der Benutzer automatisch alle Berechtigungen zur Katalog- und Konditionsverwaltung (`catalog:manage`, `prices:manage`, `addons:manage`, `credits:manage`).

---

### B. tRPC-Authentifizierungs- & Autorisierungs-Pipeline (`src/server/trpc.ts`)

Jede API-Anfrage durchläuft eine strikte Validierungs-Kette:

```text
[Client-Anfrage]
      │
      ▼
1. isAuthed Middleware
      │  ├── JWT verifizieren & Session laden
      │  └── Überprüfung der Session-Version in der DB (gecacht für 60s)
      ▼
2. requirePermission Middleware
      │  └── Permission-Matrix-Check (z.B. "teams:manage")
      ▼
3. withHierarchicalScope Middleware (Scope Engine)
      │  └── Validierung der Organisations-Hierarchie des Zielobjekts
      ▼
[Resolver ausführen]
```

#### Schicht 1: `isAuthed` (Authentifizierung & Widerruf)
Liest das custom JWT aus dem HTTP-Only-Cookie aus. Um zu verhindern, dass entzogene, geänderte oder gelöschte Konten mit aktiven JWTs Zugriff behalten, prüft die Middleware den DB-Nutzer-Status:
*   **Caching-Topologie**: Die DB-Abfrage wird über Redis (`getCached`) für 60 Sekunden zwischengespeichert.
*   **Cache-Invalidierung**: Modifikationen an Benutzerdaten (`adminUsers.update`, `auth.setPassword`) rufen sofort `invalidateCache('session:user:' + id)` auf.

#### Schicht 2: `requirePermission('...')`
Prüft die geladene Benutzerrolle sowie das `isEditor`-Flag aus der Session gegen die Berechtigungsmatrix ab. Schlägt der Check fehl, wird die Anfrage mit einem `FORBIDDEN`-Fehler abgebrochen.

---

### C. Hierarchische Scope Engine (`src/server/middlewares/scope-engine.ts`)

Die Scope-Engine stellt sicher, dass Manager oder Teamleiter nur Operationen auf Objekten ausführen dürfen, die in ihrer Hierarchie-Struktur liegen. 

*   **Verwendung**:
    ```typescript
    export const teamRouter = router({
      update: protectedProcedure
        .use(requirePermission('teams:manage'))
        .use(withHierarchicalScope('team')) // Prüft Berechtigung auf das Team
        .mutation(async ({ ctx, input }) => { ... }),
    });
    ```
*   **Mechanismus**: Die Middleware holt die ID des Zielobjekts aus dem Input, fragt dessen organisatorische Zugehörigkeit ab und vergleicht diese mit den Claims der Benutzersession:
    *   `OD_MANAGER`: Darf nur Aktionen auf Objekten ausführen, deren `odRegionId` mit der eigenen übereinstimmt.
    *   `LOCATION_MANAGER`: Darf nur Objekte des eigenen `locationId`-Bereichs modifizieren.
    *   `TEAM_LEADER`: Darf nur die eigene `teamId` verwalten.

---

### D. Row-Level Security (RLS) via Prisma Extension (`src/lib/prisma-extended.ts`)

Für Lese-Abfragen (`findMany`, `findFirst`) wird der Prisma Client dynamisch erweitert, um automatische RLS-Bedingungen in die SQL-Queries zu injizieren.

*   **getScopedPrisma(session)**: Liefert einen erweiterten Client zurück, der Abfragen auf `user`, `team`, `location` und `odRegion` abfängt und modifiziert:
    ```typescript
    // Injektion eines logischen AND Filters zur Verhinderung von Privilege Escalation
    args.where = {
      AND: [
        args.where || {},
        rlsWhere, // Aus src/lib/rbac.ts
      ],
    };
    ```
*   **Verhinderung von Leaks**: Durch das Einbetten in ein logisches `AND` wird verhindert, dass clientseitig übergebene `OR`-Abfragen (wie z. B. Freitext-Suchen) die RLS-Filter überschreiben.

---

### E. Frontend-Fähigkeiten-Flags (`src/hooks/use-permissions.ts` & `guard.tsx`)

Für die dynamische Steuerung der Benutzeroberfläche stehen zwei Tools zur Verfügung:

#### Custom React Hook `usePermissions`
```tsx
import { usePermissions } from '@/hooks/use-permissions';

export function AddProductButton() {
  const { can } = usePermissions();

  if (!can('catalog:manage')) return null;
  return <button onClick={openModal}>Tarif hinzufügen</button>;
}
```

#### Deklarative Guard-Komponente `<RequirePermission>`
```tsx
import { RequirePermission } from '@/components/shared/guard';

export function AdminPanel() {
  return (
    <RequirePermission action="users:read" fallback={<p>Keine Berechtigung</p>}>
      <UserListView />
    </RequirePermission>
  );
}
```
