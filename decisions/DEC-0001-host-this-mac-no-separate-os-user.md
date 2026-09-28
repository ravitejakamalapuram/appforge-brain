---
id: DEC-0001
title: "Run agent runtimes on the founder's own Mac user, no separate OS user"
context: "AppForge's original design called for a dedicated `appforge` macOS user, isolating agent-run processes from the founder's own environment. This is a work laptop: the founder cannot create a new macOS user on it, and containers (Docker) were evaluated and declined as more setup than this stage needs."
question: "How do we isolate AI agent runtimes (Paperclip, Claude Code, Codex processes) from the founder's own environment on a single, shared-user work laptop?"
options:
  - "A dedicated `appforge` macOS user (original design)"
  - "Docker/containers for all agent execution"
  - "Same OS user as everything else, isolation via credential scoping instead of OS permissions (chosen)"
decision: "No separate OS user. Everything lives under ~/git-personal/appforge-control/ as the founder's own user, same pattern as every other repo in this portfolio."
evidence:
  - "The founder cannot create a new macOS user on this work laptop."
  - "Containers were evaluated and declined as more setup than this stage needs."
  - "Every other repo in ~/git-personal already runs under the founder's own user with a direnv-scoped GH_TOKEN — this keeps the pattern consistent instead of introducing a one-off exception."
  - "Repo/release access is already designed to go through scoped GitHub App installation tokens (§17.2), which bound an agent's blast radius independently of OS user boundaries."
reason: "The real security boundary was never going to be the filesystem — a same-user process can technically read anything the founder can, with or without a separate OS user, since both run as the same physical human's session. The boundary that actually matters is that agent processes never receive the founder's own credentials: they launch with a clean, minimal environment that does not source ~/git-personal/.envrc (no GH_TOKEN), does not inherit CLOUDSDK_CONFIG, and get their own CLAUDE_CONFIG_DIR (~/git-personal/appforge-control/.claude-appforge — personal account, never the work profile, and never the founder's own personal session state either)."
expected_result: "Agents can run today, on this machine, with zero new OS-level setup, while still being structurally unable to read the founder's GH_TOKEN or personal Claude session — because they're never handed those credentials in the first place, not because the OS stops them."
risk: "A prompt-injected agent that decides to `cat ~/.ssh/id_rsa` or read other founder files is not stopped by the OS, since it runs as the same user as the founder. This is a real, accepted reduction from the original OS-user design. Accepted because this is a single-founder personal project, not a shared-tenant system. Revisit if a second person ever gets agent access, or move to Docker (kept as the documented upgrade path) if this ever needs hardening without a new machine."
owner: founder
date: "2026-09-26"
review_date: "2027-03-26"
status: reviewed
review_outcome: "Reviewed 2026-09-28 under DEC-0016 (APP-73, board approval e028e2f9). The DECISION stands unchanged: no separate `appforge` OS user. One characterisation in this record is WRONG and is corrected by DEC-0016. The comparison table's `Blast radius of a compromised agent` row reads `Bounded by what the agent's GitHub App installation token can do`; that is false. The blast radius is the OS uid. A GitHub App token bounds only what an agent reaches over the GitHub API; it bounds nothing about this host, where the same uid can read `master.key`, `decision-signing.key` and the embedded Postgres data dir, and can write any issue in this company through the control plane with no credential at all (`deploymentMode: local_trusted`). Read `Security boundary` and `summary` the same way: credential scoping is a real hygiene control and it is NOT the security boundary. This record's own `reason` and `risk` fields already said the OS does not stop a same-uid process, so the prose was right and the table over-promised. `decisions/` is append-only, so the table is left in place and corrected here rather than edited. See DEC-0016 for the standing position and its revisit trigger, and DEC-0013 for the credential-path instance of the same defect."
tags: [infrastructure, security, deployment, host]
summary: "No separate appforge OS user — agents run as the founder's own user; isolation comes from credential scoping (no GH_TOKEN, no personal Claude profile) rather than OS permissions."
---

## Full context

See `appforge-ai-master-plan.md` §4.3 "Deployment (Mac now; portable to a VPS later)", the
"Isolation — REVISED 2026-09-26" bullet. This revises the master plan's own original assumption
(a dedicated `appforge` macOS user) after discovering, during implementation, that the founder
cannot create a new macOS user on this work laptop and that containers would be disproportionate
setup for a single-founder V1.

## What actually changed vs. the original design

| | Original design | Revised (this decision) |
|---|---|---|
| OS isolation | Dedicated `appforge` macOS user | None — founder's own user |
| Security boundary | Filesystem permissions | Credential scoping (no `.envrc`, no `CLOUDSDK_CONFIG`, separate `CLAUDE_CONFIG_DIR`) + scoped GitHub App tokens |
| Blast radius of a compromised agent | Bounded by OS user's file access | Bounded by what the agent's GitHub App installation token can do |

## Move-to-harden triggers

Per §4.3: revisit this decision (move to Docker, or a real separate user on a future dedicated
machine) if a second person ever gets agent access, or if an incident postmortem shows the current
boundary was actually exploited.
