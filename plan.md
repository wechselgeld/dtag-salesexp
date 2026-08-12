1. **Analyze `STREAMING_SERVICES` usage in `src/components/features/calculator/streaming-comparison.tsx`**
   - The `STREAMING_SERVICES` array is currently searched linearly with `.find()` multiple times inside `.filter`, `.reduce`, and `.some` loops.
   - For example, in `coveredValue` or rendering elements, it calls `STREAMING_SERVICES.find(...)` repeatedly.
   - There are also highly redundant `.find()` calls inside the `.map()` loop rendering `TierSelect` components. For instance, to get the `customPrice` prop, it searches through `STREAMING_SERVICES` for the exact same condition three times.

2. **Implement O(1) map for `STREAMING_SERVICES`**
   - Create a constant map outside the component (or memoized inside): `const STREAMING_SERVICES_MAP = new Map(STREAMING_SERVICES.map(s => [s.id, s]))`
   - Alternatively, since it's a static array of objects, we can build a simple object lookup: `const STREAMING_SERVICES_BY_ID = Object.fromEntries(STREAMING_SERVICES.map(s => [s.id, s]));`
   - Replace `STREAMING_SERVICES.find((s) => s.id === id)` with `STREAMING_SERVICES_BY_ID[id]`.

3. **Refactor redundant array lookups in `groupedServices.map(...)`**
   - In `src/components/features/calculator/streaming-comparison.tsx`, the `TierSelect` mapping loop does redundant work:
     ```javascript
     selectedId={
       selectedServices.find(
         (sId) => STREAMING_SERVICES.find((s) => s.id === sId)?.group === group.groupId,
       ) || null
     }
     ```
   - Change it to:
     ```javascript
     const selectedId = selectedServices.find(sId => STREAMING_SERVICES_BY_ID[sId]?.group === group.groupId) || null;
     ```
     and pass `selectedId` and `customPrice` down cleaner.
   - This prevents re-evaluating the same heavy array search conditions repeatedly in the render function.

4. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done**
   - Run `pre_commit_instructions` tool to execute `pnpm lint` and `pnpm test` (or equivalents) and verify the changes don't break the build.
   - Record learning about pulling `array.find` for static configuration arrays into an O(1) Map.

5. **Submit the PR**
   - Submit the PR with title "⚡ Bolt: [performance improvement] Replace array.find with Map lookup in streaming calculator".
