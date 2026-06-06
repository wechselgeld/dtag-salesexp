## 2024-05-24 - Initialized\n**Learning:** Bolt journal initialized.

## 2024-05-24 - Pre-calculating Monthly Prices
**Learning:** When calculating costs over a fixed 24-month period with complex discounting tiers, resolving the best price inside the loop leads to O(Months * SpecialPrices * Tiers) complexity due to nested `.find()` operations per month.
**Action:** Pre-calculate the best prices and track the applied special prices into `Float64Array` (or regular arrays) before the loop. Iterate over SpecialPrices * Tiers first to populate the per-month best prices, reducing algorithmic complexity to O(SpecialPrices * Tiers + Months).
