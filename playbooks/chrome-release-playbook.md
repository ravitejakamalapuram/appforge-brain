# Chrome (and Android) release playbook

Digest of `~/git-personal/release-platform/README.md` (seeded 2026-09-27, see `decisions/DEC-0005-reuse-release-platform-oidc-pipeline.md`).

## What it is

`release-platform` is the **only** repo allowed to hold store credentials. Any repo owned by
`ravitejakamalapuram` ships to Chrome Web Store and/or Google Play via a small `release.yaml` in
the app repo plus a ten-line caller workflow that does `uses:
ravitejakamalapuram/release-platform/.github/workflows/release.yml@v2`.

## Auth, without secrets

1. The caller job requests a GitHub OIDC token (`permissions: id-token: write`), signed by GitHub,
   naming the repo/owner/workflow.
2. `google-github-actions/auth` exchanges it at a GCP Workload Identity Federation provider that
   only accepts tokens where `repository_owner == "ravitejakamalapuram"` **and**
   `job_workflow_ref` starts with `ravitejakamalapuram/release-platform/.github/workflows/`.
3. The federated identity impersonates `release-bot@rk-release-platform.iam.gserviceaccount.com`
   and gets a one-hour token scoped to `chromewebstore` or `androidpublisher`.

Because of rule 2, store calls can only happen inside release-platform's own reusable workflows —
an app repo's own job can never mint a store token even though it's the same GitHub account.
There is nothing to leak, rotate, or expire.

## The one security invariant

> **No job that executes app-controlled code has `id-token: write`.**

App-controlled code = anything from the caller repo: `test`, `build`, `npm ci`, Gradle, Flutter,
postinstall scripts, Gradle plugins. Every workflow/job in release-platform is designed against
this table (from its README): `resolve` and `publish-*` jobs hold `id-token: write` but never run
app code; `plan`/`build-*` jobs run app code but never hold `id-token: write`.

## Release flow (Chrome)

`ChromeStoreAdapter` = `release-platform/scripts/cws.mjs`, already on **CWS API v2** (v1 shuts
down 2026-10-15 — see `decisions/DEC-0005...`). Steps: `resolve` → `plan` (validate, test, next
semver) → `build-chrome` (zip) → `publish-chrome` (upload, submit, optional staged rollout) →
`release` (tag `vX.Y.Z` + GitHub Release). One-time human onboarding per new store item (API can't
do this): create the item in the CWS dashboard, fill the privacy-practices tab, upload listing
assets, confirm 2-step verification, confirm slot availability (the publisher account has a
5-published-item cap — see `products/json-workbench/product-facts.yaml` for a live example of a
product holding a slot).

## Onboarding a new app (checklist)

1. Add `.appforge/release.yaml` (or the pre-AppForge `release.yaml` equivalent) with `targets:` for
   chrome and/or android.
2. Add a ten-line caller `.github/workflows/release.yml` (`uses:
   release-platform/.../release.yml@v2`, `permissions: id-token: write`).
3. For Chrome: create the CWS item by hand first (API can't create items), note its item id.
4. For Android: upload the keystore as a per-repo GitHub secret (no Secret Manager — billing
   account closed, see `decisions/DEC-0004-budget-cap-100-per-month.md`'s cost-avoidance context).
5. Dry-run first (`release-platform` supports a preflight/dry-run mode that checks store status
   read-only) before a real publish.

## AppForge-specific additions planned (not yet shipped)

Per master plan §13.5/§17.1: release-platform gains an `approval_id` input (recorded in the
GitHub Release body + D1) and a `publish_type: staged` input for CWS, and posts its result back to
Paperclip. Release dispatch will go through a second GitHub App (`appforge-release`, `actions: write`
on product repos only) whose use is wrapped by `appforge release production`, which refuses to run
without a valid board-approved `approval_id`.
