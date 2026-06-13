## 2023-10-27 - Fast Lookups in Render Loops
**Learning:** Using `array.find()` in deeply nested loops during renders (e.g., repeatedly searching `STREAMING_SERVICES` for streaming comparison tiers) causes O(N*M) performance bottlenecks and can trigger unnecessary re-renders.
**Action:** When a static configuration array is searched repeatedly inside a `.map()` callback or complex hook, pre-calculate a `Map` (e.g., `STREAMING_SERVICES_BY_ID`) at module scope to reduce lookup complexity to O(1).
