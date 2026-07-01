## 2024-07-01 - O(1) Lookup Map for Streaming Services
**Learning:** Found O(N*M) lookups inside React render loops where `STREAMING_SERVICES.find((s) => s.id === id)` is repeatedly called.
**Action:** Replace arrays with Map for static configurations to enable O(1) lookups.
