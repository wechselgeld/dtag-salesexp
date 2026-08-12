## 2024-06-07 - Precompute Map for O(1) Lookups in React List Renders
**Learning:** In React components like `streaming-comparison.tsx`, repeatedly calling `array.find()` on constant configuration arrays (like `STREAMING_SERVICES`) inside of list mapping or reduce operations creates an O(N*M) algorithmic bottleneck that executes on every render.
**Action:** Always pre-compute a `Map` (e.g., `new Map(array.map(s => [s.id, s]))`) outside of the component or loop for static data. This reduces complexity to O(N+M) and is a very safe, readable performance win.
