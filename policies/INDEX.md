# policies/ index

This folder's INDEX.md is hand-maintained (only decisions/, postmortems/,
research/opportunities/ and experiments/ get an auto-generated INDEX.md — see
scripts/generate-index.mjs and §9.2 of the master plan). Add a one-line summary per file here
as content is added.

- `approval-execution-rule.md` — an approval in `status: approved` authorizes an attempt and
  never evidences an execution; acceptance must be an observed effect with a read-only check,
  and no agent may be dispatched on an approval's status alone.
- `autonomy-levels.md` — stub for the approval matrix and autonomy levels (§24 GOVERNANCE).
