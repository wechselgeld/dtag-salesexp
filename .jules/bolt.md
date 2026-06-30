
## 2024-05-18 - [O(1) Map Lookups inside array iterations in Render loops]
**Learning:** [When calculating derived values from arrays inside render loops, like reducing or mapping over an array to lookup data from another static array (e.g. streaming services list), finding an item via `array.find((i) => i.id === id)` repeatedly inside the loop creates an O(N^2) complexity. Although array size may be small, this creates unnecessary recalculations on each render.]
**Action:** [Convert the static configuration arrays into a `Map` representation at the module level (outside component scope) once. Then, use `Map.prototype.get(id)` inside the React components' memoized loops and mapping operations for O(1) lookups.]
