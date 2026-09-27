# JSON Workbench — history

Seeded 2026-09-27 from `~/git-personal/.claude/TASKS.md`, `.claude/json-workbench-growth-brief.md`
and `.claude/json-workbench-growth-sprint-plan.md`.

## Timeline

- **2026-09-23**: Migrated onto `release-platform@v2` (PR #3, rebased cd.yml to
  `workflow_dispatch` + `@v1`, then moved to `@v2`; baseline tag `v0.1.0`). Part of the R1–R7
  release-platform rollout across the whole portfolio (release-platform v2.0.0–v2.0.2, keyless
  OIDC to a single `release-bot` service account, no store credentials in any repo).
- **2026-09-23**: Pilot release verified end to end (alongside TelePort) as part of R5: v0.2.0
  run recorded as `PENDING_REVIEW`.
- **2026-09-24**: Founder designated JSON Workbench the next-session priority (TASKS.md `P4`,
  deprioritizing a full EchoKit review): "focus on JSON Workbench, since it is live. Improve it for
  user reach: a product demo video, a tutorial, publishing, and marketing." Growth brief written
  (`.claude/json-workbench-growth-brief.md`) documenting the 0-reviews, listing-gap state above,
  and a plan skeleton (listing overhaul → demo video/tutorial → distribution → in-product growth
  hooks → measurement) to be confirmed with the founder before building.
- **2026-09-24**: Detailed growth sprint plan drafted (`.claude/json-workbench-growth-sprint-plan.md`).
- **2026-09-26/27**: Selected as the first product to run the full AppForge factory loop end to
  end (see `decisions/DEC-0003-first-factory-product-json-workbench.md`) — the least-blocked live
  product, with launch-kit drafts already prepared in `.claude/launch/`.

## Facts snapshot

See `product-facts.yaml` in this folder for the structured, current state (store item id, listing
gaps, cross-promo partners).

## Related

- `research/opportunities/OPP-0001-json-workbench-activation.yaml`
- `playbooks/launch-playbook.md`, `playbooks/chrome-release-playbook.md`
- `decisions/DEC-0003-first-factory-product-json-workbench.md`
