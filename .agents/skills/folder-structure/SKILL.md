---
name: folder-structure
description: Standards and naming conventions for folder organization, Zustand state stores, tRPC routers, and React component modularity.
---

This document outlines the professional folder layout, file naming conventions, and modular component design rules tailored for the Next.js and tRPC stack in this repository. Following these rules ensures clean, uniform, self-documenting code with highly structured, predictable paths.

---

## 1. Directory Blueprint

The workspace adheres to a strict Next.js App Router layout with the following directory roles under `src/`:

| Directory | Role / Responsibilities | Naming Style |
| :--- | :--- | :--- |
| `src/app/` | Pages, layouts, templates, and routing endpoints. | `kebab-case` directories |
| `src/components/` | Reusable React UI elements, organized by feature scope. | `kebab-case` directories, `kebab-case` files |
| `src/hooks/` | Standard custom React hooks (excluding state stores). | `kebab-case` prefix `use-` (e.g., `use-media-query.ts`) |
| `src/lib/` | Core utilities, SDK clients, and global Zustand store state. | `kebab-case` files and directories |
| `src/server/` | Backend router setups, tRPC configurations, and db wrappers. | `kebab-case` files |
| `src/types/` | Shared global TypeScript definitions and typings. | `kebab-case` files |

---

## 2. Zustand Store Standardization

Zustand stores represent global or semi-global client-side state. They must never be scattered throughout hooks directories or stand alone as single files in the `lib` root.

### Core Rules
* **Centralized Store Directory**: All Zustand state stores must be placed inside `src/lib/store/`.
* **File Suffix Convention**: Every state store file must end with the `-store.ts` suffix.
* **Store Hook Naming**: The exported hook inside the file must follow the standard `use[StoreName]Store` pattern.

### Examples
* ✅ **Correct Location & Naming**:
  * `src/lib/store/basket-store.ts` (exports `useBasketStore`)
  * `src/lib/store/settings-store.ts` (exports `useSettingsStore`)
  * `src/lib/store/modal-store.ts` (exports `useModalStore`)
* ❌ **Incorrect Location & Naming**:
  * `src/hooks/use-basket-store.ts` (Legacy location)
  * `src/lib/store.ts` (Monolithic/unorganized store)
  * `src/lib/store/basketStore.ts` (CamelCase filename)

---

## 3. tRPC Router Kebab-Case Standard

tRPC routers are backend endpoints. Standardizing filenames inside `src/server/routers/` facilitates instant discovery and consistency.

### Core Rules
* **Strict Kebab-Case**: Every router file inside `src/server/routers/` must be named in lowercase `kebab-case`.
* **Index / App Router**: The main entry point router is `src/server/routers/_app.ts`.
* **No Individual Router Imports on Client**: Individual router files must never be directly imported by client components or pages. Client pages can only consume endpoints via the main React Query wrapper (`@/lib/trpc` or `trpc.[endpoint]`).

### Examples
* ✅ **Correct**:
  * `src/server/routers/admin-audit.ts`
  * `src/server/routers/admin-errors.ts`
  * `src/server/routers/admin-users.ts`
  * `src/server/routers/od-region.ts`
* ❌ **Incorrect**:
  * `src/server/routers/adminAudit.ts` (CamelCase)
  * `src/server/routers/adminErrors.ts` (CamelCase)
  * `src/server/routers/odRegion.ts` (CamelCase)

---

## 4. UI Component Modularity

Avoid creating redundant, single-file subfolders in `src/components/` that hold only one or two specialized UI items.

### Core Rules
* **Modularity Directory Setup**: Partition `src/components/` into three distinct architectural layers:
  1. `src/components/shared/` — Abstract, domain-agnostic atoms (e.g., buttons, badges, modals, animated-number).
  2. `src/components/layout/` — Global page structuring elements (e.g., app-shell, sidebar-nav, resolution-guard).
  3. `src/components/features/` — High-level components containing specific business logic grouped by domain (e.g., basket, calculator, onboarding, admin).
* **Eliminate Flat Single-File Component Folders**: Under no circumstances should folders like `src/components/admin/` be created directly inside the root `components` folder if they are single-purpose. Consolidate them under the appropriate feature directory:
  * ➔ `src/components/features/admin/passkey-prompt.tsx`

---

## 5. Path Imports and Code Hygiene

* **Alias Path Imports**: Always prefer configuration alias paths (`@/...`) over complex relative parent directories (`../../..`).
  ```typescript
  // ✅ PASS
  import { useBasketStore } from '@/lib/store/basket-store';

  // ❌ FAIL
  import { useBasketStore } from '../../hooks/use-basket-store';
  ```
* **No Dead Stores**: Unused or deprecated monolithic state stores (like `src/lib/store.ts`) must be completely deleted rather than left commented out.
