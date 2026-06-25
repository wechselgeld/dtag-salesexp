## 2025-02-09 - Map instead of Array.find in repeated renders
**Learning:** In React components like `streaming-comparison.tsx`, iterating over constant arrays and calling `Array.find` repeatedly within components or hooks can cause an O(N*M) performance issue during renders.
**Action:** Always extract constant configuration array lookups into an O(1) `Map` object at the module level (e.g. `STREAMING_SERVICES_BY_ID`) to ensure high-performance lookups.
