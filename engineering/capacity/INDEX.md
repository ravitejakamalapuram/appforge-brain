# engineering/capacity/ index

Hand-maintained (see `engineering/security/INDEX.md` for why). One line per file.

- `session-budget-burn-2026-09-28.md` — first measurement of Claude provider session-budget
  consumption per agent per hour (APP-45). Sustained burn over a full 24h window is **293K input
  tok/hr with 31.7% of it productive**; the 1,579K tok/hr post-APP-29 figure in the body is a
  **1.46h peak, not a rate** — use the sustained number for capacity planning and the peak only to
  understand what trips a 5-hour session window. Also establishes that CTO+CEO are 54% of company
  burn while Builder is ~0 (the inverse of what DEC-0004 budgeted for), and that per-agent
  concurrency ceilings cannot bound a shared company-wide budget.
