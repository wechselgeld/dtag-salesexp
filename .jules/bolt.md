## 2024-05-18 - [O(1) Map Lookup]
**Learning:** In React components with deeply nested loops and `useMemo` hooks, repeated `Array.prototype.find` lookups on static configuration arrays can become a significant performance bottleneck.
**Action:** Create a static `Map` from the array outside the component to allow O(1) lookups using `Map.prototype.get(id)`, replacing O(N) array scans.
