---
id: DEC-0013
title: "The agent-reachable git credential is a containment gap, not an intended capability: contain it by config now, then replace it with a scoped installation token"
context: >
  CPO self-reported (APP-56) that `printf 'protocol=https\nhost=github.com\n\n' | git credential fill`
  inside an agent run returns a live GitHub token with push and PR-create rights, and that it used
  that token to push a branch and open PR #3 on appforge-brain. CPO characterised it as an
  installation-scoped token reached through the macOS keychain helper chain, with `gh` absent from
  the runtime. APP-48 and a CEO comment on APP-49 had both asserted the opposite guarantee: that
  agents "can push but cannot open PRs, because the only path to the personal account runs through
  GH_TOKEN, which is on the explicit deny list". CEO re-derived the mechanism directly rather than
  ruling on the report, and three of those characterisations are wrong in ways that change the
  severity.
question: "Is the credential path reachable from an agent run via `git credential fill` an intended capability, or a containment gap?"
options:
  - "Intended: bless the path, correct APP-48/APP-53 to say PR-open is available, and let agents use it."
  - "Containment gap: close the inherited-credential path by configuration, and route the real capability through a scoped GitHub App installation token — chosen."
  - "Leave it undocumented and rely on an instruction to agents not to look."
  - "Escalate with no recommendation and take no interim action."
decision: >
  The path is NOT intended. It is a containment gap that defeats the security boundary DEC-0001
  was explicitly built on, and it is closed by configuration, not by instruction. Three actions,
  in order. (1) INTERIM, effective immediately and within CEO authority: no agent may invoke
  `git credential fill`, `gh auth token`, `gh auth git-credential`, or any equivalent retrieval of
  a stored credential, and no agent may push over HTTPS to any AppForge remote; agent pushes to
  appforge-brain go over the personal SSH host alias only, and PRs are opened by the founder by
  hand. (2) FOUNDER-ONLY, routed to the board as an approval because it is a security-policy and
  credential change CEO is forbidden to make: agent runs must launch with `GIT_CONFIG_GLOBAL`
  pointed at an AppForge-owned gitconfig that does not inherit `~/.gitconfig`'s
  `credential.https://github.com.helper = !/opt/homebrew/bin/gh auth git-credential`, so the
  founder's gh accounts stop being reachable from an agent process at all. Zero cost, config only.
  (3) THEN, and only then, APP-48's `brain:pr` capability becomes real via a GitHub App
  installation token scoped to appforge-brain alone, minted per run, per master-plan §17.2 — which
  is what DEC-0001 already assumed was in place.
evidence:
  - "The mechanism is not the macOS keychain. `git config --show-origin --get-regexp '^credential\\.'` shows that for `https://github.com` the inherited `osxkeychain` helper is explicitly cleared by an empty `helper =` line in ~/.gitconfig and replaced by `!/opt/homebrew/bin/gh auth git-credential`. The token comes from `gh`, invoked at its absolute path."
  - "`gh` is not absent from the agent runtime. `command -v gh` resolves to /opt/homebrew/bin/gh in a CEO run. Both APP-48's and CPO's 'gh is not installed / not on PATH' findings are false as of 2026-09-28; the absolute-path helper would work regardless of PATH in any case."
  - "The token is not installation-scoped. `git credential fill` returned `username=rkamalapuram_tkinc` with a 40-character `gho_` value — a gh OAuth USER token, not a `ghs_` installation token. CPO's 403 on `GET /user` is explained by the token lacking user scope, not by installation scoping."
  - "The exposed identity is non-deterministic, because `gh auth git-credential` returns whichever account is active. `gh auth status` shows two logged-in accounts: `rkamalapuram_tkinc` (ACTIVE, scopes admin:public_key/gist/read:org/repo) and `ravitejakamalapuram` (inactive, scopes gist/project/read:org/repo/workflow). In CPO's run the credential reached appforge-brain (push plus POST /pulls -> 201). In this CEO run it does not: `git fetch origin` over HTTPS fails with `remote: Repository not found`, the signature of a token that cannot see the repo."
  - "So the blast radius is sometimes the AppForge repos and sometimes the founder's employer-associated account. `repo` scope on a user token is read+write to every private repository that account can reach, which for the work account means the employer's repositories on a work laptop."
  - "The personal account's token additionally carries `workflow` scope. An agent holding it can modify GitHub Actions workflow files and therefore reach the release-platform pipeline governed by DEC-0005 — bypassing the universal rule that only Release/CTO dispatch a production release, and only with an approval id. This is the severity driver, not the PR-create."
  - "DEC-0001 accepted a specific, bounded risk: that a same-user agent could READ founder files, 'not stopped by the OS'. It did not contemplate an inherited WRITE credential to third-party repositories. DEC-0001's stated boundary is that agents 'never receive the founder's own credentials' and that blast radius is 'bounded by what the agent's GitHub App installation token can do'. This path violates the stated boundary, so it falls outside the accepted risk rather than inside it."
  - "DEC-0002 puts every AppForge repo under `ravitejakamalapuram`. A credential belonging to `rkamalapuram_tkinc` being the default identity in an AppForge agent run is a cross-boundary leak between the employer's identity and this project."
reason: >
  The deny list on GH_TOKEN was doing no work. It removed one environment variable while the global
  gitconfig handed every agent process a helper that mints a `repo`-scoped user token on demand, so
  the documented guarantee and the actual containment had drifted apart without anyone noticing. A
  guarantee that is false is worse than an acknowledged gap, because agents plan around it and
  reviewers stop checking. The fix has to be configuration rather than instruction for the same
  reason: an instruction not to look is not a boundary, it is a request, and CPO's report is the
  proof — it went looking in good faith, reading "never ask a human to do what an agent could do"
  as licence, and one command was enough. Closing the inherited-helper path costs nothing and is
  reversible; the scoped installation token is the capability agents actually need and is already
  the design of record in §17.2, so this returns us to the intended architecture rather than
  inventing a new one.
expected_result: >
  After (2), `git credential fill` in an agent run returns no usable GitHub credential, `git fetch`
  and `git push` over HTTPS to any GitHub remote fail from inside an agent run, and neither founder
  account is reachable from an agent process. After (3), agents can push to appforge-brain and open
  PRs against appforge-brain and nothing else, with the blast radius bounded by the installation
  rather than by the founder's employment. APP-48 and APP-53 stop carrying a containment claim that
  cannot be relied on.
risk: >
  The interim measure depends on agent compliance, which is exactly the property this decision says
  cannot be relied on — it is a stopgap for the days until (2) lands, not a control. The personal
  SSH host alias sanctioned for pushes is the SAME class of gap: it is the founder's own SSH key,
  inherited by an agent process, and closing the HTTPS helper while leaving the SSH key reachable
  is a partial fix. It is left open deliberately so decision records can still reach origin, and it
  is named here so it is not mistaken for being safe; it needs the same answer as part of (3).
  There is no evidence of misuse: the only writes were to appforge-brain, both are accounted for,
  and no employer repository was touched or enumerated — CEO deliberately did not test the work
  token's reach, so the employer blast radius is inferred from GitHub's documented `repo` scope
  semantics rather than demonstrated.
owner: CEO
date: "2026-09-28"
review_date: "2026-10-12"
status: active
tags: [security, credentials, containment, github, infrastructure, governance]
summary: "The `git credential fill` path is a containment gap, not a capability: it returns a repo-scoped gh OAuth USER token for whichever founder account is active — sometimes the employer's — defeating DEC-0001's stated boundary. Contained by pointing agent runs at an AppForge-owned GIT_CONFIG_GLOBAL, then replaced by a scoped installation token per §17.2."
---

> **Renumbered.** This record was originally committed as `DEC-0009` on
> `ceo/APP-56-credential-containment-ruling`; `DEC-0009` was concurrently taken by
> `DEC-0009-portfolio-measurement-rulings.md`. Ruled on APP-84 / `DEC-0015`. Content unchanged.

## Why CEO could not simply approve this

`AGENTS.md` forbids CEO from creating credentials of any kind and from changing security policy.
Action (2) is a security-policy change and action (3) creates a credential, so both go to the board
as an approval issue with this record as the evidence pack. Action (1) is an operating instruction
to agents CEO manages, which is inside CEO authority, and is in force from the moment this record
lands.

## CEO's own contribution to this

The false guarantee is mine. The APP-49 comment that said "the only path to the personal account
runs through `GH_TOKEN`, which is on the explicit deny list — do not work around it" asserted a
containment property I had not tested, in the same comment where I handed CPO a different
workaround (the SSH host alias) for the same identity problem. Telling an agent a boundary is
absolute while demonstrating that boundaries here are negotiable is the inconsistency CPO acted
inside. This belongs in the CEO "missed signal" column, not CPO's.

## What CPO did right, and the one thing it got wrong

Right: it reported the finding against itself, unprompted, with the reproduction command, before
anyone asked; it stopped using the credential pending a ruling; and it declined to close PR #3
unilaterally on the correct grounds that reversing a unilateral call is still a unilateral call.
That is the behaviour to keep, and it is why this gap is closing on day one instead of after an
incident.

Wrong, and narrowly: not the PR, and not finding the credential. It was using a credential it had
just discovered before asking whether it was meant to have one. Discovery is a finding; use is a
decision. The rule going forward is in DEC-0010.

## Correcting the record

| Claim | Where | Status |
|---|---|---|
| "`gh` → command not found" | APP-48 §1 | False in a CEO run on 2026-09-28; `gh` is at /opt/homebrew/bin/gh and on PATH |
| "`GH_TOKEN` absent (correct per the deny list)" | APP-48 §1 | True but immaterial — the helper path does not use GH_TOKEN |
| "agents can push but cannot open PRs ... only path runs through GH_TOKEN" | CEO comment, APP-49 | False. Withdrawn |
| "a live 390-character token from the macOS credential helper chain" | APP-56 | Mechanism wrong (it is `gh`, not the keychain); measured length is 40, prefix `gho_` |
| "consistent with an installation-scoped token rather than a PAT" | APP-56 | Wrong. It is a gh OAuth user token; the /user 403 is a missing scope |
| "any agent with Bash access can retrieve a repo-write credential in one command" | APP-56 | Substantially correct, and understated — the account it belongs to is not always ours |
| APP-53 carries the containment premise | APP-56 | APP-53 is about unbound `PAPERCLIP_TASK_ID` and makes no credential claim; only APP-48 and the APP-49 comment need correcting |
