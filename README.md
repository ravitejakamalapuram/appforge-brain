# appforge-brain

AppForge AI's persistent knowledge base: decisions, postmortems, research, product facts. Private
repo. Plain markdown/YAML, no build step — this is knowledge, not a code package (see
`appforge-kit` for the actual engineering monorepo).

Scaffolded 2026-09-27 as backlog item P0-07. Source of truth for the design:
`~/git-personal/.claude/appforge-ai-master-plan.md` §9 (Company Brain) and §26 (Memory).

## Layout

```
company/        strategy/       policies/       playbooks/     (PERMANENT — founder approval required to change)
engineering/{chrome,android,security,analytics,pricing}/       (PERMANENT standards)
products/<id>/                                                 (LEARNED + facts)
research/{opportunities,competitors}/  experiments/             (LEARNED)
decisions/      postmortems/                                    (LEARNED, append-only)
_active/                                                        (TEMPORARY, pruned weekly by CI)
schemas/        scripts/                                        (validation + INDEX generation tooling)
```

Every folder has an `INDEX.md`. For `decisions/`, `postmortems/`, `research/opportunities/` and
`experiments/`, it's generated (`node scripts/generate-index.mjs`) — don't hand-edit those. The
rest (`company/`, `strategy/`, `policies/`, `playbooks/`, `engineering/*`, `research/competitors/`)
are hand-maintained.

## Tooling

- `npm run validate:schema` — validates every `decisions/DEC-*.md` and `postmortems/PM-*.md`
  frontmatter against `schemas/decision.schema.json` / `schemas/postmortem.schema.json`, plus
  filename/id matching and (for postmortems) required body sections + the mandatory
  `playbook_to_update` linkage.
- `npm run validate:append-only -- <baseRef> <headRef>` — fails if a PR edits an existing
  `decisions/`/`postmortems/` file beyond the allowed review fields (see Rulings below), or
  deletes/renames one.
- `npm run generate-index` — regenerates the auto-generated `INDEX.md` files. `-- --check` (as
  used in CI) exits 1 instead of writing, if anything would change.
- `npm run prune:active` — lists which `_active/` files are 30+ days old (pure logic; the actual
  deletion + issue-opening happens in `.github/workflows/prune-active.yml`).
- All of the above speak the same `cli-output@1` JSON contract as `appforge-kit`'s CLI
  (`scripts/lib/cli-output.mjs` mirrors `appforge-kit/packages/cli/src/output.ts`) — pass `--json`
  for machine-readable output.
- `npm test` runs `scripts/tests/*.test.mjs` (Node's built-in test runner).

## CI

- `.github/workflows/pr-checks.yml` (on every PR to `main`): the `board-approved`-label gate on
  `company/`/`strategy/`/`policies/`, the append-only check on `decisions/`/`postmortems/`, the
  DEC/PM schema validator, and the INDEX-freshness check.

  **All four of those are advisory checks. They go red; they do not refuse the merge.** Measured
  read-only on 2026-09-29 (APP-134): `GET /repos/ravitejakamalapuram/appforge-brain/branches/main`
  returns `protected: false`, `protection.enabled: false`, and
  `protection.required_status_checks.enforcement_level: "off"` with empty `contexts`/`checks`. None
  of these jobs is a required status check, so a merge with all of them red returns HTTP 200.
  Rulesets are not a hidden second mechanism either: `/rulesets` and `/rules/branches/main` return
  403 *"Upgrade to GitHub Pro or make this repository public"* on this repo, while the same
  endpoints with the same token return `200 []` on the account's public repo `appforge-kit` — so
  branch protection is a public-repo feature on this account's plan, unavailable here rather than
  merely unconfigured.

  The `board-approved` gate nonetheless works, and has never been bypassed, because every agent
  stops at the red X. That is **agent discipline plus a loud signal, not server-side enforcement**
  — the same cooperative category as the `TOOLS.md` deny lists under `DEC-0016`. Do not describe
  any of these checks as enforced, and do not build anything that assumes a red X here stops a
  merge. Full statement: `appforge-control/docs/containment-model.md`. Turning branch protection on
  is a founder call about money or repo visibility, not an engineering task — see APP-123.

  > The header comment inside `pr-checks.yml` still calls the label gate a "CODEOWNERS-like check",
  > which implies enforcement it does not have. The corrected header is written and reviewed but
  > cannot be pushed by an agent: the `appforge-agents` App has no `workflows: write` permission, so
  > GitHub refuses any agent push that touches `.github/workflows/`. Applying it is a founder act —
  > tracked on APP-134.
- `.github/workflows/prune-active.yml` (weekly schedule + manual dispatch): prunes `_active/`.

## Rulings made while scaffolding (P0-07)

These are judgment calls made to turn the master plan's prose into concrete schemas/scripts. None
of them change the plan's intent; they're recorded here so a future reader knows they were
deliberate.

1. **DEC-0001 vs DEC-0002 numbering.** §26 gives a worked *format* example using the "stay on
   personal GitHub account" decision but labels it `DEC-0001` generically. §11.1 separately and
   specifically says of that same decision: "Record as DEC-0002." Since §11.1 is a directed
   instruction (not just a format illustration) and the seed list also asks for a `DEC-0001` about
   host/OS-user isolation, this repo assigns `DEC-0001` to the host decision (§4.3's "REVISED
   2026-09-26" note) and `DEC-0002` to the GitHub-account decision, matching §11.1 literally.
2. **The `review_outcome` exception also covers `status`/`superseded_by`.** §9.1 says append-only
   CI "rejects edits to existing DEC/PM files except `review_outcome` fields". §26's own status
   enum (`active|superseded(by DEC-x)|reviewed`) only makes sense if a review can actually flip
   `status` — a review that could never update `status` from `active` to `reviewed` would be inert.
   `scripts/validate-decisions.mjs` therefore treats `status`, `superseded_by` and `review_outcome`
   together as the allowed-to-change field set; everything else, and the entire markdown body, must
   be byte-identical between an existing file's old and new versions.
3. **`tags` and `summary` added to both schemas.** §26's exact frontmatter list for decisions has
   no `tags`/`summary` field, but §9.2 (immediately after §9.1's schema description) requires the
   generated `INDEX.md` to show "title, tags, one-line summary per file" — which needs a place to
   put tags/summary. Both fields are optional additions to `schemas/decision.schema.json` and
   `schemas/postmortem.schema.json`; `summary` falls back to the `decision` (or `reason`) field if
   omitted, so existing/future files without it still index fine.
4. **Postmortem frontmatter vs. body split.** §26 lists postmortem content as a flat sentence
   ("what happened; expected; actual; why; missed signals; root cause (5 whys); what changes;
   reusable lesson; playbook to update (mandatory...); was relevant knowledge available but not
   retrieved (y/n)") with no yaml example, unlike decisions. This repo puts the two
   easily-machine-checked, mandatory items — `playbook_to_update` (string) and
   `knowledge_available_not_retrieved` (boolean) — into `schemas/postmortem.schema.json`'s
   frontmatter (both required), and treats the eight narrative items as required markdown body
   *sections*, checked by `scripts/validate-decisions.mjs`'s heading scan rather than the JSON
   Schema (since free text isn't a JSON Schema's job). Identity/lifecycle fields (`id`, `title`,
   `date`, `owner`, `status`) mirror the decision schema for consistency.
5. **The mandatory `playbook_to_update` linkage.** §26 says a postmortem's playbook-to-update field
   is "mandatory, CI fails if empty and no linked playbook PR". Implemented as: the field must be
   non-empty **and** contain either a `playbooks/` path or a PR reference (`PR #123` or a
   `.../pull/123` URL) — see `checkPlaybookField` in `scripts/validate-decisions.mjs`.
6. **`_active/` needs a `created` frontmatter field.** §9.1 says CI "deletes `_active/` files older
   than 30 days" but doesn't say how age is measured. Git history alone is fragile (rebases,
   squash-merges rewrite commit dates). Every `_active/` file is required to carry a
   `created: YYYY-MM-DD` frontmatter field; `scripts/prune-active.mjs` falls back to the file's
   first-commit date via `git log` only if that field is missing, and never deletes a file whose
   age it can't determine (it's kept and flagged instead).
7. **Seed sources verified, not invented.** The master plan's seed-content line (§9.1) names
   `.claude/launch/*`, `.claude/json-workbench-growth-*.md`, `release-platform/README.md`, and
   "TASKS.md history". All four were confirmed to exist with real content before being digested
   into `playbooks/launch-playbook.md`, `playbooks/chrome-release-playbook.md`, and
   `products/json-workbench/{product-facts.yaml,history.md}` — nothing here is invented filler.
   `.claude/TASKS.md` and the launch docs were exactly where the plan said they'd be.
8. **Ajv usage matches `appforge-kit`'s pattern.** `Ajv2020` is imported from `ajv/dist/2020.js` as
   a named import (not the CJS default export), matching
   `appforge-kit/packages/schemas/src/validate-permissions.ts` — the same reason applies here even
   though this repo has no TypeScript build step (Node's ESM resolution of the CJS `ajv` package
   needs the same named-import form).
