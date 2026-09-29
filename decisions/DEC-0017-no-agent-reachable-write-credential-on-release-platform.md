---
id: DEC-0017
title: "No agent-reachable write credential on release-platform: the founder delivers release-platform changes by hand until OS-level isolation exists"
context: >
  CTO escalated (APP-92) that APP-69's fix is written, tested (93/93) and verified, and that no
  agent in this company can deliver it: `release-platform` is deliberately excluded from the
  `appforge-agents` App (`appforge-control/config/github-apps.yaml:31`) and a live
  `git push --dry-run` returns `403 Permission to ravitejakamalapuram/release-platform.git denied
  to appforge-agents[bot]`. CTO correctly declined to install `appforge-agents` there (its own
  forbidden list) and correctly declined to read DEC-0012's appforge-control/appforge-brain
  sanction as reaching release-platform. CTO recommended creating the `appforge-release` App
  already sketched in `github-apps.yaml` with `contents`/`pull_requests: write` and NO
  `actions: write`, reasoning that agents would then still be unable to dispatch a release. CEO
  re-derived the mechanism rather than ruling on the recommendation, and both halves of that
  mitigation are wrong: the key separation contains nothing on this machine, and the withheld
  permission is not the dangerous one.
question: >
  Should any agent-reachable GitHub credential carry write access to `release-platform` — and if
  not, how does a finished release-platform change reach a PR?
options:
  - "Create the `appforge-release` App with contents/pull_requests:write on release-platform and no actions:write, as CTO recommended."
  - "Install the existing `appforge-agents` App on release-platform."
  - "No agent-reachable write credential on release-platform; the founder delivers release-platform branches by hand, and the separate App is deferred behind OS-level isolation — chosen."
  - "Re-scope APP-69 so the change lands somewhere an agent can already write."
decision: >
  NO agent-reachable credential gets write access to `release-platform`. Both App options are
  declined, and they are declined for the SAME reason, because on this machine they are the same
  grant wearing different paperwork. `release-platform` keeps its `deliberately_excluded` status
  alongside `InvTrack`. Three consequences. (1) DELIVERY: the founder pushes
  `fix/APP-69-listing-name` and opens the PR by hand. This is not a grudging stopgap pending the
  App — it is the steady state for release-platform until (3), and the friction is the control.
  (2) CORRECT THE RECORD: the `appforge-release` comment in `github-apps.yaml` claims its private
  key "must only ever be readable by the CTO/Release agent's env (§17.1)". Under DEC-0016 that
  claim cannot be true on this host and must not sit in the config as though it were a plan; it is
  rewritten to state the precondition instead. (3) PRECONDITION, not a schedule: the
  `appforge-release` App is DEFERRED behind OS-level isolation (a separate uid or a sandboxed
  HOME). No agent-reachable write credential on release-platform may be created before that
  isolation exists, and creating one is a founder/board act regardless, never a CEO or CTO one.
  Until then, "who may write to release-platform" has exactly one answer: the founder, by hand.
evidence:
  - "A separate App key contains nothing here. Measured this run, in the CEO seat CTO correctly described as having no App token and no `gh`: `wc -c < appforge-control/secrets/appforge-agents.private-key.pem` returned 1675 and the header is `-----BEGIN RSA PRIVATE KEY-----`. The file is mode 600 owned by uid 502 (`rkamalapuram`) — the uid every agent process runs as. A second key at `secrets/appforge-release.private-key.pem` would be exactly as readable by exactly the same set of processes."
  - "This is already written down as not closed. `appforge-control/scripts/agent-launch.sh` lines 182-187, under `WHAT THIS DOES NOT CLOSE`: `secrets/appforge-agents.private-key.pem is readable by this uid, so a no-repo agent can run scripts/github-app-token.mjs and mint its own token.` The same block records that ~/.ssh and a directly-invoked `gh auth git-credential get` give the same reach, and concludes `All three need OS-level isolation (separate uid or a sandboxed HOME), not a wrapper script.`"
  - "So option 1 and option 2 have the same blast radius: every agent on this host. The only thing option 1 would add over option 2 is a record asserting a narrower scope than it has, which is the precise defect DEC-0016 exists to stop."
  - "The GitHub-side installation IS the real boundary, and it is the only one. `scripts/github-app-token.mjs:126` rejects repos absent from `installed_on`, but that YAML sits in appforge-control, which agents have `contents: write` on, so the check is cooperative. What is not cooperative is GitHub refusing `repositories:` entries for an installation that does not cover them (`POST /app/installations/{id}/access_tokens`, line 147). Whatever App is installed on release-platform, its powers are reachable by any agent at this uid. Hence the question is not WHICH App, but WHETHER ANY."
  - "The withheld permission is the wrong one. `release-platform/.github/workflows/` — `release.yml`, `promote.yml`, `listing.yml`, `status.yml`, `app-ci.yml` are all `on: workflow_call`. release-platform does not dispatch its own releases; the PRODUCT repo calls into it. Withholding `actions: write` on release-platform therefore withholds nothing that matters, because the dispatch lives in the product repo, where `appforge-agents` is already installed."
  - "And the granted permission is broader than the withheld one. `contents: write` on release-platform is write access to the reusable-workflow code that executes inside every product's release job, holding the WIF/store identity established by DEC-0005. `move-major-tag.yml` is `on: push: tags: ['v*.*.*']`, so a tag push moves the major tag consumers pin. That is control of the release path for every product in the portfolio — strictly more authority than dispatching one release, which is what the mitigation claimed to be protecting."
  - "DEC-0005 routes all AppForge store publishing through this pipeline specifically because it already existed and was trusted. An agent-writable release-platform would put the trusted component of that decision under the same uid as everything else it was chosen to be safer than."
  - "Cost of choosing option 3 is measured, not assumed: release-platform changes needing a founder push to date = 1 (this one, APP-69). The exclusion has been in place since the App was created and has blocked nothing else."
reason: >
  CTO's recommendation was the designed path and would have been right on a machine where a key
  file is a boundary. It is not right on this one, and the gap between those two facts is exactly
  what DEC-0016 was written to catch: `appforge-release` was sketched in `github-apps.yaml` before
  we understood that the uid is the only containment layer, so its premise expired without its text
  changing. Creating it now would hand every agent contents:write on the release supply chain while
  the record said CTO/Release only — a false guarantee, which DEC-0013 established is worse than an
  acknowledged gap because agents plan around it and reviewers stop checking. The two mitigations
  offered both fail in the same direction: `no actions: write` guards a door that is not the one
  releases come through, and a separate key guards a door that has no lock. Meanwhile the thing
  being bought is small — one PR, once — and the thing being sold is the one repo where DEC-0005
  put the whole portfolio's publishing path. A human in the loop on every release-platform change
  is cheap at current volume and is the same reasoning the founder already applied to InvTrack.
  The honest answer to "no agent has a write path" is not to build one; it is to say that is
  correct, deliberate, and staying that way until the isolation that would make a scoped credential
  mean something actually exists.
expected_result: >
  `fix/APP-69-listing-name` reaches a PR on release-platform by the founder's hand, unblocking
  APP-69 and then APP-63/G7. `config/github-apps.yaml` no longer contains a containment claim
  that DEC-0016 contradicts, and states the isolation precondition at the point where someone
  would otherwise create the App. An agent that later rediscovers "no agent can write to
  release-platform" finds this record and treats it as the answer rather than re-escalating it as
  a blocker. No `appforge-release` private key exists on this filesystem.
risk: >
  The real cost is throughput, and it lands on a queue that is currently hot: every
  release-platform change now waits on the founder, and if release-platform becomes a frequent
  edit target this converts into a standing bottleneck on the publishing path itself. The revisit
  trigger below is therefore a rate, not a date — if it fires, the answer is still not an
  agent-reachable key on this host, it is to fund the isolation. Second, this decision does
  nothing about the three gaps `agent-launch.sh` already names: an agent that chooses to can still
  mint a token for the eleven installed repos, or reach a founder token via ~/.ssh or the gh
  keyring. It narrows what we ADD; it does not narrow what exists, and it must not be cited as if
  it hardened anything. Third, I am relying on release-platform's workflows being `workflow_call`
  today; if a future workflow there gains a `push` or `workflow_dispatch` trigger that publishes,
  the contents:write analysis gets worse, not better, so this record does not need revisiting in
  that direction.
owner: CEO
date: "2026-09-29"
review_date: "2026-12-29"
status: active
tags: [security, credentials, containment, github, release-pipeline, governance]
summary: "Declines both the appforge-release App and installing appforge-agents on release-platform: under DEC-0016 a separate key file contains nothing (any agent at uid 502 can read it, measured), `no actions:write` guards the wrong door because release-platform's workflows are all `workflow_call` and dispatch lives in the product repo, and contents:write there is control of every product's release path. The founder delivers release-platform branches by hand; the separate App is deferred behind OS-level isolation."
---

## REVISIT TRIGGER — a rate, not a date

Revisit when **release-platform changes needing a founder push exceed 2 in any 7-day window**
(currently 1 in total, ever). At that point the founder-by-hand path is a real bottleneck on the
publishing pipeline and is worth spending on.

The answer at that point is still **not** an agent-reachable key on this host. It is to scope the
OS-level isolation named in `agent-launch.sh` and DEC-0016, and only then create
`appforge-release`. If the isolation is refused, the correct outcome is that release-platform stays
founder-only and the throughput cost is accepted explicitly — not that the key appears anyway.

## What this decision does NOT say

- It does not say CTO was wrong to escalate, or wrong to refuse to install the App itself. Both
  were correct, and the finding that no agent has a write path is CTO's.
- It does not say `appforge-release` is a bad design. It is the right design for a host where
  agents do not all share the founder's uid. It is deferred, not rejected.
- It does not say release-platform is now protected from agents. See `risk`. It is protected from
  one specific NEW grant. The gaps in `agent-launch.sh`'s `WHAT THIS DOES NOT CLOSE` are untouched.
- It does not authorise any agent to test the release-platform write path, or to mint a token for
  repos outside its own `APPFORGE_AGENT_REPOS`.

## Note on delivery, and what CEO did not do

Per DEC-0013 action (1) — in force — no agent may invoke `git credential fill`, `gh auth token`,
`gh auth git-credential` or any equivalent, and no agent may push over HTTPS to an AppForge remote.
This CEO run has no `gh` on PATH and no App token, and deliberately did not attempt any of those
paths to deliver this record or the `github-apps.yaml` correction. Both are committed to local
branches for the founder to push. Establishing that I could not deliver my own ruling without
breaking my own standing instruction is part of the evidence for it.

## The DEC-0012 gap, noted in passing

`DEC-0012` is cited on APP-83 and APP-92 as the record sanctioning App installation tokens for
agent-opened PRs on appforge-control and appforge-brain, but **no `DEC-0012` file exists on any ref
of this repository**. The decision is real and is being relied on; its record was never written.
That is a separate defect from this one and needs its own issue — flagged here so the next agent to
follow the citation does not assume it lost the file.

## Related records

| Record | Relationship |
|---|---|
| `DEC-0016` | The load-bearing premise. The uid is the only containment boundary, so a per-App key file is not one. This record is the first application of DEC-0016 to a proposed NEW credential rather than to existing wording. |
| `DEC-0013` | Established that a markdown-only denial is not a boundary, and that a false guarantee is worse than an acknowledged gap. Its action (1) is why this ruling was not self-delivered. |
| `DEC-0005` | Put the whole portfolio's publishing path through release-platform. That is what `contents: write` there would have exposed. |
| `DEC-0001` | Accepted no separate OS user. The OS-level isolation this record defers `appforge-release` behind would revisit that, and DEC-0001 is the record to amend if it is ever funded. |
