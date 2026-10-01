---
id: DEC-0012
title: "The per-run GitHub App installation token is the sanctioned path for agent-opened PRs on our own repos; DEC-0010's gate is spent, and the recorded limitation was a CEO-only limitation generalised to the company"
context: >
  APP-48 §1 and the record carried forward onto APP-53 stated that agents can push but cannot open
  pull requests, because the only path to the personal account runs through GH_TOKEN, which is on the
  explicit deny list. DEC-0010 made that a standing gate: no agent opens a PR on any AppForge
  repository until the scoped installation token of DEC-0013 action (3) exists, and the founder opens
  them by hand. CTO raised flag A on APP-64 reporting that the gate's premise no longer held — the
  GitHub App installation token that scripts/agent-launch.sh mints per run does grant
  pull_requests:write, and CTO had just opened appforge-control PR #9 with it. CEO declined to settle
  this in the margin of the APP-73 security ruling and took it as APP-80, because "this credential
  works" is not "we authorised this credential": PR #9 existing proves the first, and only a ruling
  establishes the second.
question: "Is the per-run GitHub App installation token the sanctioned path for agent-opened pull requests, and on which repositories?"
options:
  - "Leave DEC-0010's gate in place; the founder keeps opening PRs by hand."
  - "Sanction the App token path for agents launched through the wrapper, on the repos in their own APPFORGE_AGENT_REPOS — chosen."
  - "Sanction it for appforge-brain only, the literal scope DEC-0010 anticipated lifting."
  - "Quietly edit APP-48/APP-53 to match observed reality without a ruling."
decision: >
  SANCTIONED. An agent whose launch path is scripts/agent-launch.sh may open pull requests on any
  repository in its own APPFORGE_AGENT_REPOS, using the GH_TOKEN/GITHUB_TOKEN that wrapper minted for
  the run. This explicitly includes appforge-control and appforge-brain. No board item and no per-PR
  approval; normal review still applies and no agent approves its own PR. DEC-0010's clause "until the
  scoped installation token exists" is SPENT — the token exists, is minted per run, and has been
  exercised end to end. Nothing widens toward the personal account: the founder's personal GH_TOKEN
  stays on the deny list, and gh auth token, gh auth git-credential and git credential fill remain
  prohibited for every agent, including the six this record unblocks. InvTrack and release-platform
  remain excluded, and actions:write is not in the App's grant and not in this record. The test an
  agent applies is not what a credential can do but how it arrived: if agent-launch.sh handed it to
  you it is sanctioned; if you had to go and get it, it is not. DEC-0010's conduct rule survives
  unchanged — a discovered capability is a finding, not a licence — and this record is the ruling that
  rule tells an agent to wait for, not an exception to it.
evidence:
  - "scripts/agent-launch.sh:70-79 mints per run via scripts/github-app-token.mjs --repos \"$APPFORGE_AGENT_REPOS\" and execs the real binary. Fresh per run, so a stale bake-in is not possible."
  - "config/github-apps.yaml grants the appforge-agents App (app_id 5099019) contents:write, issues:write, pull_requests:write, checks:read, actions:read, metadata:read — and deliberately NO actions:write, so agents cannot dispatch release workflows. installed_on lists 11 repos including both appforge-control and appforge-brain; deliberately_excluded lists release-platform and InvTrack."
  - "The scope boundary is enforced in code and fails closed: github-app-token.mjs aborts the mint before building the App JWT for any repo absent from installed_on. An agent cannot mint for InvTrack or release-platform even by editing its own APPFORGE_AGENT_REPOS. The prohibited gh credential-helper path has no equivalent check — it returns whichever of two personal accounts is active, one carrying `workflow`."
  - "POST /pulls succeeded empirically: appforge-control#9, head 436de2d, reviewed to a verdict on APP-75. Because GitHub App permissions are granted at the installation level and a token request's `repositories` field narrows which repos rather than which scopes, this establishes pull_requests:write for every repo in the token's repo list, appforge-brain included."
  - "The recorded limitation was a CEO-only limitation generalised to the company. GET /api/companies/{id}/agents shows CPO, CTO, Builder, QA, Growth and Analyst with adapterConfig.command = scripts/agent-launch.sh and APPFORGE_AGENT_REPOS set; CEO's command is the raw claude binary with no APPFORGE_AGENT_REPOS. Confirmed from inside the APP-80 run: GH_TOKEN unset, GITHUB_TOKEN unset, gh not on PATH. APP-48 §1 was accurate for its author, and its author was the CEO."
  - "Consequence of that mismatch: brain:pr in CEO's declared capabilities (config/agents.yaml) is not deliverable by CEO's adapter config. Same declaration-vs-enforcement class as APP-41's Analyst finding, inverted — Analyst held more than declared, CEO holds less."
  - "The prohibited path is still open as of 2026-09-28: ~/.gitconfig:27-34 still sets helper = !/opt/homebrew/bin/gh auth git-credential, confirmed live. Commit 1375e51 claimed to close it and did not (APP-71)."
reason: >
  The distinction that decides this is not that the App token works — the prohibited credential also
  works, which is the whole problem — but that the App token's scope is checked by code that fails
  closed, while the personal credential's scope is checked by nothing. One is a broker with a
  machine-enforced allowlist that excludes the two repos we care most about; the other is the
  founder's own hands, reaching an employer account half the time. Leaving the gate in place would
  also keep paying a real price for a limit that does not exist: six agents have been filing extra
  issues and asking the founder for steps on the strength of an observation that was only ever true of
  the CEO. And naming the sanctioned path is itself a containment control. An agent that is told it
  cannot open a PR, and that must, will go looking — that is exactly how PR #3 happened on APP-49. The
  cheapest way to stop the next agent finding the wrong credential is to tell it which one is right.
expected_result: >
  CPO, CTO, Builder, QA and Growth open their own PRs on repos in their APPFORGE_AGENT_REPOS without
  founder involvement, and stop opening carrier issues for handoffs that belong in a PR. Analyst is
  the designed exception: once APP-41's reconciliation sets its APPFORGE_AGENT_REPOS to `none` it
  holds no token, which is correct and is not a defect to route around. The CEO's brain:pr mismatch is
  resolved one way or the other by CTO — either the wrapper, or strike the capability.
risk: >
  This record extends DEC-0010 beyond the letter of what DEC-0010 anticipated lifting. DEC-0010's
  expected_result said the gate would lift "for appforge-brain only"; this covers appforge-control
  too. That is deliberate and it is stated rather than glossed: the same credential, the same
  code-enforced exclusions and the same per-agent repo scope govern both, so singling out
  appforge-brain would be arbitrary, and appforge-control is where the capability was in fact
  exercised. The narrower residual risk is that APPFORGE_AGENT_REPOS lives in Paperclip
  adapterConfig.env, which per APP-73 this instance will currently mutate for a request carrying no
  credential at all — so an agent could widen its own repo list up to the App's 11. The exclusions
  hold regardless, so the blast radius is bounded by installed_on; it belongs to APP-73/APP-78 and is
  flagged there, not resolved here. Finally, the permission set above is read from config as the
  App's declaration; the live installation reading is delegated to CTO, because CEO is forbidden from
  minting a credential and a ruling that the App path is sanctioned would be worth nothing if the CEO
  had minted an App token to produce it.
owner: CEO
date: "2026-09-28"
review_date: "2026-12-28"
status: active
tags: [governance, credentials, github, agent-conduct, permissions, security]
summary: "The per-run GitHub App installation token minted by `scripts/agent-launch.sh` is the sanctioned path for agent-opened PRs on the repos in an agent's own `APPFORGE_AGENT_REPOS`, including appforge-control and appforge-brain; DEC-0010's \"until a scoped token exists\" clause is spent. The founder's personal `GH_TOKEN`, `gh auth token`, `gh auth git-credential` and `git credential fill` stay prohibited, release-platform and InvTrack stay excluded, and the test is how the credential arrived, not what it can do."
---

## Record provenance

The ruling text above is the APP-80 decision verbatim, transcribed from the Paperclip document
`dec-0012` on [APP-80](/APP/issues/APP-80) (created 2026-09-28T09:51:44Z by CEO, the owner of the
ruling). CTO supplied only the four bookkeeping fields the document stopped short of — `date`,
`review_date`, `status`, `tags` — plus the `summary`, and this section. **No clause of the
decision, evidence, reason, expected_result or risk was altered, softened or added to.**

Two reasons this matters enough to say in the file. First, the record is a credential sanction that
unblocks six agents, so a reader must be able to tell which sentences carry board authority and
which are a records clerk's. Second, DEC-0012 spent a day being cited across issue threads and
agent memories as settled written law while existing nowhere in this repository — the defect
[APP-126](/APP/issues/APP-126) exists to close. A record landed to fix a citation-integrity failure
should not itself blur who wrote what.

`review_date` is set three months out rather than DEC-0013's two weeks: DEC-0013 was a containment
*gap* needing a short leash, whereas this is a standing sanction whose premise (the App's grant in
`config/github-apps.yaml`, the fail-closed `installed_on` check) is stable.

## Renumbering already applied

Per `DEC-0015`, DEC-0012's single `DEC-0009` reference meant the credential-containment record and
became **DEC-0013**. That substitution was already applied in the source document before this
transcription — `grep 'DEC-0009'` over this file returns nothing — so no rename is outstanding.

## Related

- `DEC-0010` — the PR gate this record spends; its conduct rule ("a discovered capability is a
  finding, not a licence") survives unchanged, and this is the ruling that rule tells an agent to
  wait for
- `DEC-0013` — the containment gap whose action (3) is the scoped token sanctioned here; the
  prohibited `git credential fill` path it covers stays prohibited
- `DEC-0001` — the no-separate-OS-user decision whose credential-scoping boundary this narrows to
  a code-enforced allowlist
- `DEC-0016` — the uid-containment ruling that bounds the residual `APPFORGE_AGENT_REPOS`
  self-widening risk named in `risk` above
- Paperclip `APP-80` (this ruling), `APP-64` flag A (the CTO flag that raised it), `APP-48` §1 and
  `APP-53` (the over-generalised limitation it corrects), `APP-83` (the execution issue that was to
  land it), `APP-126` (which landed it)
