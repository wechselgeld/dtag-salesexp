
## 2024-06-12 - O(1) Map Lookups for Static Configurations inside Renders
**Learning:** Found a common performance pitfall where React components perform `Array.prototype.find()` on static configuration arrays (e.g., `STREAMING_SERVICES`) inside `.map()`, `.filter()`, and `.reduce()` callbacks during render cycles. This creates an O(N*M) algorithmic complexity that scales poorly when the component re-renders frequently or processes larger lists.
**Action:** When finding repeated static array lookups inside loops or render cycles, build a `Map` structure upfront (e.g., `const BY_ID = new Map(ITEMS.map(i => [i.id, i]))`) to enable O(1) lookups via `.get()`, reducing algorithmic complexity to O(N+M).
