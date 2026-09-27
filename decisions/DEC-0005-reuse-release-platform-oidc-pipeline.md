---
id: DEC-0005
title: "Reuse release-platform's existing keyless OIDC pipeline instead of building a new one"
context: "AppForge agents need a way to ship Chrome/Android releases without ever holding store credentials themselves. The founder already operates release-platform: a working keyless pipeline (GitHub OIDC -> GCP Workload Identity Federation -> a release-bot service account) serving 9 apps (7 Chrome extensions, TelePort Android+Chrome, and InvTrack pending its own migration) in production."
question: "Should AppForge build its own release/publish pipeline (a new ChromeStoreAdapter/AndroidAdapter calling CWS/Play APIs directly from appforge-kit), or dispatch releases through the existing release-platform?"
options:
  - "Build a new ChromeStoreAdapter/AndroidAdapter directly against the CWS and Play APIs inside appforge-kit"
  - "Reuse release-platform's existing GitHub OIDC -> GCP WIF -> release-bot SA pipeline, adding only an approval_id input and a staged-publish option (chosen)"
  - "Give each agent its own direct, per-agent store credentials"
decision: "Reuse release-platform. ChromeStoreAdapter and AndroidAdapter are thin clients that dispatch release-platform's existing reusable workflows (scripts/cws.mjs on CWS API v2, scripts/play.mjs on Android Publisher v3) rather than calling the stores directly. The only new work on release-platform itself is (a) accepting an approval_id input and recording it in the GitHub Release body + D1, and (b) a publish_type: staged input for CWS, plus posting results back to Paperclip."
evidence:
  - "release-platform already runs in production for 9 apps with zero store credentials in any app repo: GitHub OIDC -> WIF pool `github`/provider `github-oidc` (restricted to repository_owner == ravitejakamalapuram and job_workflow_ref under release-platform's own workflows) -> impersonates release-bot@rk-release-platform.iam.gserviceaccount.com for a one-hour scoped token."
  - "Its documented security invariant already holds and has been verified in production: no job that executes app-controlled code (test/build/npm ci/Gradle/Flutter/postinstall scripts) has id-token: write."
  - "CWS API v1 shuts down 2026-10-15 (risk R11); release-platform's scripts/cws.mjs is already migrated to v2, so reuse inherits that migration for free."
  - "TASKS.md history (R1-R7) shows this pipeline was already hardened in practice: old CWS OAuth client and PAT/JSON-key secrets were deleted across 7+ migrated repos, the temporary serviceAccountTokenCreator role was removed, and a real dry-run preflight (read-only store status check) exists."
reason: "Don't rebuild a release plane that already exists, is secure by design, is already the single place every product in the portfolio depends on for store access, and has already absorbed the CWS v1->v2 migration. The incremental work needed for AppForge (an approval_id input, a staged-publish flag, a Paperclip callback) is two small additive features on a proven system, not a new subsystem with its own security model to design and audit from scratch."
expected_result: "Release dispatch for any product goes through a second GitHub App (appforge-release, actions: write on product repos only, private key held only by the Release/CTO agent's environment); appforge release production refuses to run without a valid, board-approved approval_id checked against the Paperclip API. release-platform's own security invariant table stays unchanged and is not re-audited by AppForge — it remains the one thing only Release/CTO with an approval id can dispatch."
risk: "Coupling AppForge's entire release authority to release-platform's existing security model means a bug there is a single point of failure for every product's releases, including future AppForge-driven ones. Mitigated by explicitly keeping release-platform's existing invariant table (no id-token in jobs running app code) as the one thing AppForge does not change, and by the new appforge-release App having no actions: write beyond dispatching release-platform's own reusable workflows on product repos."
owner: cto
date: "2026-09-26"
review_date: "2027-03-26"
status: active
tags: [release-pipeline, security, oidc, chrome, android]
summary: "AppForge dispatches releases through release-platform's existing keyless OIDC->WIF->release-bot pipeline rather than building a new store-publishing subsystem; only an approval_id input and a staged-publish flag are added to release-platform itself."
---

## Full context

See `appforge-ai-master-plan.md` §13.5 (ChromeStoreAdapter = release-platform scripts/cws.mjs,
already on v2), §14/§13.6, §17.2/§17.3 (credential broker and diagram), and the "Changes to
release-platform (P1)" note at the end of §15 CI/CD: "(a) accept an approval_id input and record
it in the GitHub Release body + D1; (b) add a publish_type: staged input for CWS; (c) post result
to Paperclip via notify workflow. Security invariant table in its README stays true (no id-token
in jobs running app code)."

## Why this matters for the budget too

This decision is also a direct cost-avoidance choice supporting `decisions/DEC-0004-budget-cap-100-per-month.md`:
building a parallel release pipeline would mean a second GCP project, a second WIF provider, and
duplicated engineering time, none of which is needed when release-platform already does this job
correctly today.

## Related

- `playbooks/chrome-release-playbook.md` — the operational playbook this decision underwrites.
- `products/json-workbench/product-facts.yaml` — an existing product already released through this exact pipeline.
