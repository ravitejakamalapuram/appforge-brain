---
id: DEC-0021
title: "appforge-control is CTO/CEO-only: Builder's token scope is not widened, and control-repo work is routed to CTO"
context: >
  APP-249 was a 21-line `appforge-control` change that Builder implemented and verified correctly
  at the first attempt, then could not push: `remote: Repository not found.` It cost three runs,
  two of them at the turn limit. APP-251 was filed to fix this as a class, on the premise that the
  `appforge-agents` App installation did not cover `appforge-control` and that CTO reached the repo
  through host credentials. Both parts of the premise were false. Read with the App JWT on
  2026-09-30, the installation (id `165532898`, `repository_selection: selected`) already covers
  `appforge-control`. What Builder hit was its own per-run token scope: `agent-launch.sh` mints the
  token with `--repos "$APPFORGE_AGENT_REPOS"`, which is set per agent in the Paperclip adapter
  config, and Builder's list does not include `appforge-control`. CTO runs carry an App token too
  (`APPFORGE_GIT_CREDENTIAL=app`); CTO reaches the repo because its list includes it. So the real
  question was never a GitHub settings change. It was whether to add one repo to one agent's list.
question: "Should Builder's per-run token scope include appforge-control, or should appforge-control be CTO/CEO-only with control-repo work routed away from Builder?"
options:
  - "Widen Builder: add `appforge-control` to Builder's `APPFORGE_AGENT_REPOS` (one Paperclip adapter-config field, no GitHub or manifest change), so Builder can push control-repo work itself."
  - "CTO/CEO-only — chosen: keep `appforge-control` out of Builder's scope, state the policy, and route control-repo work to CTO."
  - "Status quo: keep Builder's scope as is without stating a policy (option 2 with nobody knowing it is the policy — how APP-249 burned three runs)."
decision: >
  `appforge-control` stays out of Builder's `APPFORGE_AGENT_REPOS`. Changes to `appforge-control`
  (installers, scripts, CI, infra, agent instructions, config) are CTO work: CEO routes them to
  CTO, CTO does not break them down to Builder, and a Builder that is assigned one anyway says so
  at turn one (`scripts/repo-scope-check.sh` exits 1) and hands back to CTO instead of
  implementing. Decided by the founder through the board's assistant on APP-251 interaction
  `dbb30a05`, taking the CTO's recommendation: "appforge-control stays CTO/CEO-only; Builder is
  not widened."
evidence:
  - "Installation selection, read with the App JWT on 2026-09-30 (a token minted with no `repositories` field carries the full selection): 12 repos, `appforge-control` among them. Adding the repo to the installation, as APP-251 option 1 was written, would have been a no-op."
  - "Builder's reported scope in APP-249 / APP-251 was 9 repos (`echokit, json-workbench, TelePort, StellarTab, GitaVerses, TeluguPanchangam, cors-enabler, session-transfer, appforge-kit`), echoed by `GET /installation/repositories`. That endpoint authenticates with an installation token and returns the token's repos, not the installation's, so it cannot tell the two lists apart. Builder's adapter config was not read directly in the run that wrote this record; the 9-repo list is Builder's own report."
  - "CTO's run of 2026-10-01 carries `APPFORGE_GIT_CREDENTIAL=app` and an `APPFORGE_AGENT_REPOS` that includes `appforge-control`: the asymmetry between the two agents is the repo list, not the auth mode."
  - "`appforge-control` has no server-side merge gate: `protected: false`, and rulesets return 403 (plan-gated) on private repos. `contents: write` there means push-to-main, not PR-only."
  - "`appforge-control` holds `scripts/agent-launch.sh` and the config that scope every agent's token. Builder's declared capability is the narrowest write grant, `repo:write:assigned`."
  - "appforge-control#50 (merged, `677fc04`) added `scripts/repo-scope-check.sh` and `docs/agent-repo-scope.md`: an agent can now detect an out-of-scope repo at turn one from two environment variables, with no network call. The APP-249 cost came from discovering the scope at `git push`, after the work."
reason: >
  The case for widening was the escalation round-trip: every mis-routed control-repo task paid a
  full Builder run before it failed. That cost came from late discovery, not from the routing, and
  the turn-one scope check removes most of it — a mis-routed task now costs Builder about one turn.
  Against that, widening concentrates write access in the highest-leverage repo the company has,
  which holds the launcher that defines every other agent's scope and has no merge gate. Giving
  the agent with the narrowest declared capability write access to the file that defines what
  "assigned" means inverts the ordering. This is a hygiene decision, not a containment one: per
  DEC-0016 the OS uid is the only containment boundary, and Builder runs at the same uid where the
  App private key is readable, so the token list shapes only the cooperative path. It was decided
  on those terms, and it is cheap to reverse — one adapter-config field.
expected_result: >
  No Builder run spends more than its first turns on an `appforge-control` task: CEO and CTO route
  control-repo work to CTO, and a Builder assigned one anyway hands it back at turn one. At the
  review date, the count of Builder runs that implemented `appforge-control` changes and then
  failed at push since 2026-10-01 is zero, and Builder's `APPFORGE_AGENT_REPOS` still excludes
  `appforge-control`.
risk: >
  Every control-repo change now goes through CTO, which is already the busiest engineering seat
  (60 turns per run, carrying Architect/Reviewer/Release duties until those hires split off). If
  control-repo work turns out to be frequent, CTO becomes the bottleneck. The reversal trigger is
  explicit: if CTO's control-repo queue is regularly the thing holding up delivery, revisit and
  widen Builder (option 1), which is one field and needs no GitHub or manifest change. A second
  risk is that the routing rule is cooperative text in AGENTS.md files: an issue can still be
  assigned to Builder directly by a human or an agent that skips it. The turn-one scope check is
  the backstop that keeps such a mistake to one turn rather than three runs.
owner: founder
date: "2026-10-01"
review_date: "2026-12-30"
status: active
tags: [governance, permissions, github, agents, routing, appforge-control]
summary: "appforge-control stays out of Builder's per-run token scope (founder, APP-251); control-repo work is routed to CTO, and a mis-assigned Builder hands back at turn one via scripts/repo-scope-check.sh. Hygiene, not containment (DEC-0016); reversible in one adapter-config field."
---

## Full context

APP-251 asked to fix Builder's push failures in `appforge-control` as a class. The investigation
found that the premise was wrong in two places, and the correction changed who could act:

| Claim in APP-251 | What is true |
|---|---|
| The App installation does not cover `appforge-control` | It does (12 repos, read with the App JWT) |
| CTO pushes with host credentials | CTO pushes with an App token; its repo list is wider |
| The fix is a founder action in GitHub App settings | The only lever is Builder's `APPFORGE_AGENT_REPOS` in Paperclip |

## How routing honours this record

| Who | Rule | Where |
|---|---|---|
| CEO | Route `appforge-control` changes to CTO, never to Builder | `appforge-control/agents/ceo/AGENTS.md` |
| CTO | Do `appforge-control` changes itself; do not break them down to Builder | `appforge-control/agents/cto/AGENTS.md` |
| Builder | If assigned `appforge-control` work, hand back to CTO at turn one | `appforge-control/agents/builder/AGENTS.md` |
| Any agent | Run `scripts/repo-scope-check.sh` at turn one | `appforge-control/docs/agent-repo-scope.md` |

## Related

- `decisions/DEC-0016-os-uid-is-the-only-containment-boundary.md` — why the token list is hygiene,
  not containment.
- `decisions/DEC-0013-agent-reachable-git-credential-is-a-containment-gap.md` — why an
  out-of-scope push must not be worked around with another credential.
- APP-253 — the separate finding that `InvTrack` was in the installation selection while
  `config/github-apps.yaml` listed it as excluded.
