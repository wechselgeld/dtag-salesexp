
## 2024-06-08 - O(N*M) Array.find calls inside React .map loop
**Learning:** In `src/components/features/calculator/streaming-comparison.tsx`, the inner array method `STREAMING_SERVICES.find(s => s.id === sId)` was called inside a `groupedServices.map` loop repeatedly, resulting in severe algorithmic complexity (O(N*M)) that causes unnecessary CPU overhead during renders.
**Action:** When a static config array is repeatedly searched by ID, create a `Map` during initialization (`new Map(array.map(item => [item.id, item]))`) to convert the O(N) lookup into O(1). Additionally, extract redundant lookups into variables outside the condition where possible.
