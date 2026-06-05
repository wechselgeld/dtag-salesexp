1. **Analyze `src/components/features/calculator/streaming-comparison.tsx`**:
   - The component iterates over `groupedServices` and runs `selectedServices.find(sId => STREAMING_SERVICES.find(s => s.id === sId)?.group === group.groupId)` three times per iteration during render.
   - It also calls `STREAMING_SERVICES.find` in `getPrice`, `toggleService`, `coveredValue`, and inside `dynamicPlans.map`'s `includes.map`.
2. **Optimize Lookups**:
   - Create a module-level `STREAMING_SERVICES_MAP` using a `Map` for O(1) lookups instead of O(N) array finds.
   - Replace all `STREAMING_SERVICES.find((s) => s.id === id)` calls with `STREAMING_SERVICES_MAP.get(id)`.
3. **Optimize Render Loop**:
   - In `groupedServices.map`, calculate `selectedServiceId` once per group instead of three times.
4. **Complete Pre-commit Steps**:
   - Ensure proper testing, verifications, reviews, and reflections are done (running `pnpm run lint` and `node --test` or equivalent).
5. **Submit Change**:
   - Create PR with title `⚡ Bolt: Optimize streaming service lookups and prevent redundant rendering calculations` and appropriate description.
