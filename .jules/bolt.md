
## 2024-05-18 - Replacing Redundant array.find with O(1) Map Lookups in Render Loops
**Learning:** In React components dealing with static configuration arrays (like `STREAMING_SERVICES`), iterating through `.map()` inside JSX and repeatedly calling `array.find()` to match related elements can cause significant algorithmic bloat, particularly when computing multiple props that require the same lookup condition.
**Action:** Extract repeated O(n) array searches into a constant `Map` initialized outside the component to achieve O(1) lookups. Additionally, pull logic that is identical for multiple inline JSX props up into the map closure to compute it exactly once.
