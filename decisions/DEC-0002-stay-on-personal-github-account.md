---
id: DEC-0002
title: "Stay on personal GitHub account (ravitejakamalapuram), not an org"
context: "AppForge needs a GitHub account/org structure for its platform repos (appforge-control, appforge-brain, appforge-kit) and product repos. The founder's rule: move to an org only if it is both free and easier. The brief's default assumption was that a company needs a GitHub org."
question: "Should AppForge's repos live under a new GitHub organization, or stay on the founder's existing personal account?"
options:
  - "Stay on the personal account ravitejakamalapuram (chosen)"
  - "Create a free GitHub org"
  - "Create a paid GitHub Team/Enterprise org"
decision: "Stay on the personal account ravitejakamalapuram."
evidence:
  - "GitHub docs: required-reviewer environments and full rulesets are only available for public repos on Free/Pro/Team plans — a free org would not actually unlock required reviewers for AppForge's private repos (appforge-control, appforge-brain), so the org migration buys nothing at the Free tier."
  - "Migrating to an org means re-pinning the GitHub OIDC -> GCP Workload Identity Federation provider's repository_owner condition (currently ravitejakamalapuram) in release-platform's WIF setup — real migration cost for a security-sensitive config."
  - "release-platform, the existing 9-app keyless release pipeline, already works correctly scoped to the personal account."
reason: "A Free org gives no functional benefit here (no required-reviewer environments for private repos) while costing a non-trivial, security-sensitive WIF re-pin. The founder's own rule (org only if free AND easier) is not met — it would be free but not easier."
expected_result: "All AppForge platform and product repos continue to live under ravitejakamalapuram with zero WIF/OIDC re-configuration, and release-platform's existing security invariant (repository_owner pinned check) stays valid unchanged."
risk: "A personal account has weaker default governance (no org-level required 2FA enforcement beyond the individual's own settings, no org owners/teams for future collaborators) if a second person ever needs write access. Mitigated by the plan to revisit this exact decision (see below) rather than treating it as permanent."
owner: founder
date: "2026-09-26"
review_date: "2027-03-26"
status: active
tags: [github, account-structure, infrastructure]
summary: "Stay on the personal GitHub account instead of creating an org — a Free org would not unlock required reviewers for private repos, and migrating would mean re-pinning release-platform's WIF repository_owner condition for no benefit."
---

## Full context

See `appforge-ai-master-plan.md` §11.1 "Account decision", which explicitly instructs: "Record as
DEC-0002." (§26's own worked example of the decision-record format happens to use this exact
decision's content but labels it `DEC-0001` generically, purely to illustrate the frontmatter
shape — §11.1's specific numbering instruction is treated as authoritative here; see this repo's
README "Rulings" section for why DEC-0001 was assigned to the host-isolation decision instead.)

## Repos affected

`release-platform` (exists), `appforge-control` (new, private), `appforge-brain` (this repo, new,
private), `appforge-kit` (new, public/MIT), and every existing/future product repo — all stay
under `ravitejakamalapuram`.

## Revisit triggers

Per §11.1: revisit when (a) a second human joins the project, (b) the business is sold or spun
out, or (c) a paid GitHub Team plan is justified by revenue.
