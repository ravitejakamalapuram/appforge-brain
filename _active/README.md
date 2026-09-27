# _active/ — TEMPORARY

Current incidents and release notes in flight. Nothing here is durable knowledge — when something
here turns out to matter long-term, promote it into `decisions/`, `postmortems/`, `playbooks/` or
`products/<id>/history.md` in the same PR that removes it from here (or a follow-up PR referenced
from the pruning issue).

## Rules

- Every file here must carry a `created: YYYY-MM-DD` frontmatter field (git history is not
  trusted as the source of truth for age, since it can be rewritten by a rebase/squash).
- `.github/workflows/prune-active.yml` runs on a schedule, deletes any file whose `created` date
  is 30+ days old, and opens a GitHub issue per deleted file asking whether it should have been
  promoted first. See `scripts/prune-active.mjs` for the (unit-tested) expiry logic.
- This folder does **not** get a generated INDEX.md (only `decisions/`, `postmortems/`,
  `research/opportunities/` and `experiments/` do — see `scripts/generate-index.mjs`), since its
  contents are expected to churn constantly.
