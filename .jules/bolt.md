## 2024-06-15 - React Component Render Optimization

**Learning:** `STREAMING_SERVICES.find` within `src/components/features/calculator/streaming-comparison.tsx` was executing within loops directly during render. The list size isn't massive (10 items), but doing `find` multiple times for each included service / each streaming plan inside the main render loop causes O(n*m) complexity. Map lookups are vastly more efficient O(1) in JavaScript than Array.find.
**Action:** Replace `Array.find` lookups on static/constant lists with Map-based lookups constructed once outside of components/iterations.
