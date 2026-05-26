---
trigger: always_on
description: Standardized folder layout, Zustand stores, tRPC routers, and component structure rules.
---

## folder-structure

This project enforces strict directory layouts and file naming conventions to preserve architectural cleanliness and prevent compilation breaks.

### Rules and Conventions
- **Zustand State Stores**:
  - Location: All global/shared Zustand stores must live inside `src/lib/store/`.
  - Naming: Use strict `kebab-case` and a `-store.ts` file suffix (e.g., `basket-store.ts`, `settings-store.ts`, `modal-store.ts`).
  - Do NOT create standalone store files directly under `src/lib/` or custom hooks directories.
- **tRPC Routers**:
  - Location: All tRPC routers must reside inside `src/server/routers/`.
  - Naming: Use strict lowercase `kebab-case` (e.g., `admin-audit.ts`, `admin-errors.ts`, `admin-users.ts`, `od-region.ts`).
- **UI Components Grouping**:
  - Partition components strictly under `src/components/` into `shared/`, `layout/`, and `features/`.
  - Consolidate domain-specific components under feature folders (e.g., `src/components/features/admin/passkey-prompt.tsx`) rather than creating separate single-file directories directly under `src/components/`.
- **Path Imports**:
  - Always utilize compiler path aliases (`@/...`) rather than deep relative parent directories (e.g., use `@/lib/store/basket-store` instead of `../../hooks/use-basket-store`).

For the comprehensive specification, architectural details, and standard directory blueprint, always refer to the **folder-structure skill**:
👉 [folder-structure Skill](file:///.agents/skills/folder-structure/SKILL.md)
