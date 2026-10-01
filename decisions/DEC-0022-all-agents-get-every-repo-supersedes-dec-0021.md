---
id: "DEC-0022"
title: "CTO and Builder tokens cover every company repo, appforge-control included; supersedes DEC-0021"
context: >
  DEC-0021 (2026-10-01, APP-251) kept `appforge-control` out of Builder's per-run token scope and
  routed all control-repo work to CTO. Later the same day the founder widened agent access
  instead: through the board's assistant (APP-251 comment `317f4e78`), the founder set
  `APPFORGE_AGENT_REPOS` for CTO and Builder in Paperclip (Harness / Runtime > Environment
  variables) to every company repo. Before this, `config/github-apps.yaml` had already moved
  `InvTrack` into `installed_on` as an ordinary product repo (2026-09-30) and added
  `release-platform` to the installation (2026-10-01) for branch pushes and draft PRs only. With
  Builder's scope now covering `appforge-control`, DEC-0021's routing rule has nothing left to
  protect, and keeping it would send work to CTO for a reason that no longer exists.
question: "Now that Builder's token covers appforge-control, does control-repo work stay CTO-only?"
options:
  - "Keep DEC-0021's routing: CTO does all control-repo work even though Builder can now push there."
  - "Supersede DEC-0021 — chosen: CTO and Builder both get every repo; control-repo work is routed like other platform work, and Builder may implement it."
decision: >
  CTO and Builder each carry an `APPFORGE_AGENT_REPOS` that lists every company repo:
  `appforge-kit, appforge-control, appforge-brain, echokit, json-workbench, TelePort, StellarTab,
  GitaVerses, TeluguPanchangam, cors-enabler, session-transfer, InvTrack, release-platform`.
  DEC-0021 is superseded. `appforge-control` is no longer CTO/CEO-only: CTO may break control-repo
  work down to Builder, CEO may route it to either, and Builder implements it instead of handing
  it back. Nothing else changes: every agent still opens draft PRs only and has no merge
  authority (operating rule 11); `.github/workflows/**` still goes through the board's assistant
  because the App withholds the `workflows` permission; release dispatch and merge on
  `release-platform` remain the board's assistant's and the founder's. Decided by the founder.
evidence:
  - "Founder instruction relayed by the board's assistant on APP-251, comment `317f4e78` (2026-10-01): CTO and Builder `APPFORGE_AGENT_REPOS` set to all 13 repos; explicitly supersedes DEC-0021."
  - "CTO run of 2026-10-01 (after the change) carries `APPFORGE_GIT_CREDENTIAL=app` and the 13-repo `APPFORGE_AGENT_REPOS` above; `scripts/repo-scope-check.sh` exits 0 for `appforge-control`. Builder's adapter config was not read directly in the run that wrote this record; its scope is taken from the founder's instruction."
  - "`config/github-apps.yaml` on `appforge-control` main lists `InvTrack` (onboarded 2026-09-30) and `release-platform` (added 2026-10-01, branches and draft PRs only, main protected, `workflows` withheld) under `installed_on`."
reason: >
  The founder chose throughput over the hygiene argument in DEC-0021. That argument never claimed
  containment: per DEC-0016 the OS uid is the only containment boundary, and the token list
  shaped only the cooperative path. With the scope widened, a routing rule that sends Builder-able
  work to CTO only adds a round-trip through the busiest engineering seat.
expected_result: >
  Control-repo and platform tasks are implemented by whichever of CTO or Builder they are routed
  to, with no push failures from token scope. At the review date, no CTO or Builder run since
  2026-10-01 has failed at push because a company repo was outside its scope, and every
  agent-authored change to `appforge-control` and `release-platform` landed through a PR merged by
  the board's assistant, not by a direct push to main.
risk: >
  DEC-0021 measured `appforge-control` with no server-side merge gate (`protected: false`,
  rulesets 403 plan-gated on private repos), so `contents: write` there is push-to-main. Builder
  now has that on the repo holding `scripts/agent-launch.sh` and the config that scopes every
  token, guarded only by the cooperative draft-PR rule. Detection: any commit on
  `appforge-control` main that did not arrive through a merged PR. `release-platform` is a public
  repo, so a bad branch push there is public; its main is protected per `config/github-apps.yaml`.
  Reversal is one adapter-config field per agent.
owner: "founder"
date: "2026-10-01"
review_date: "2026-12-30"
status: "active"
tags: [governance, permissions, github, agents, routing, appforge-control]
summary: "CTO and Builder tokens cover all 13 company repos (founder, APP-251); appforge-control is no longer CTO/CEO-only and Builder may implement control-repo work. Supersedes DEC-0021. Draft PRs only, no merge, workflows still withheld."
---

## Why this was decided here

Widening a token scope is a permission change, outside every agent's authority. The founder made
it directly in Paperclip and asked the CTO to record it. The CTO wrote this record and the
matching routing changes; it did not decide the scope.

## What changed from DEC-0021

| | DEC-0021 | DEC-0022 |
|---|---|---|
| Builder's scope includes `appforge-control` | No | Yes |
| CEO routes control-repo work to | CTO only | CTO or Builder |
| CTO may break control-repo work down to Builder | No | Yes |
| Builder assigned control-repo work | Hands back at turn one | Implements it |

DEC-0021's `status` is set to `superseded` with `superseded_by: DEC-0022` in the same change.

## Related

- `decisions/DEC-0021-appforge-control-is-cto-ceo-only-builder-not-widened.md` — superseded by
  this record.
- `decisions/DEC-0016-os-uid-is-the-only-containment-boundary.md` — why the token list is
  hygiene, not containment.
- `appforge-control/docs/agent-repo-scope.md` — the turn-one scope check, still useful for any
  agent whose scope is narrower than this.
