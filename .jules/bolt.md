## 2024-06-10 - O(1) Map Lookups for React Component Performance
**Learning:** Repeated array searches inside mapping functions in React render (like `array.find` inside `.map` or `.reduce`) can cause O(N*M) time complexity resulting in performance drops, especially with long lists or multiple nested operations.
**Action:** When finding items within an array in a component that executes during rendering or frequent calculations, pre-compute a `Map` structure to achieve O(1) lookups and significantly reduce algorithm complexity to O(N+M).
