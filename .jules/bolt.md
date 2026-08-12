## 2026-06-18 - [O(1) lookups vs Nested Array Search in Next.js Renders]
**Learning:** React component re-renders that rely on repeated array `.find` lookups (like `STREAMING_SERVICES.find`) inside loops/reducers lead to O(N*M) algorithmic complexity. The memory mentions creating O(1) Maps, which prevents this specific bottleneck.
**Action:** When working with static config arrays used frequently inside React renders or loops, pre-compute a static `Map` lookup structure to reduce algorithmic complexity to O(N+M).
