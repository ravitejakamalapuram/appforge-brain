# engineering/capacity/ index

Hand-maintained (see `engineering/security/INDEX.md` for why). One line per file.

- `session-budget-burn-2026-09-28.md` — first measurement of Claude provider session-budget
  consumption per agent per hour (APP-45). Establishes the post-APP-29 burn rate (1.58M input
  tok/hr, ~10x the trailing average), that only ~17% of consumption belongs to runs that succeed,
  that CTO+CEO are 70% of burn while Builder is ~0, and that per-agent concurrency ceilings cannot
  bound a shared company-wide budget.
