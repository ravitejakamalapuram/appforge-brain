---
id: DEC-0004
title: "Company-wide AI + infra budget cap: $100/month"
context: "AppForge is about to start running autonomous and semi-autonomous AI agents (7 initial roles: CEO, CPO, CTO, Builder, QA, Growth, Analyst) with real LLM spend. Before any agent runs unsupervised, the company needs a hard, enforced ceiling so a runaway loop, a bad model choice, or an unexpectedly chatty agent can't produce a surprise bill."
question: "What is the monthly AI + infra spend ceiling for the whole company, and how is it enforced?"
options:
  - "No explicit cap — trust per-agent judgement and the model router's cost-awareness alone"
  - "$50/month — conservative, but likely too tight once 7 agents plus the control plane are running"
  - "$100/month — chosen"
  - "$250+/month — more headroom, but removes the forcing function to design cheap-by-default model routing before it's proven necessary"
decision: "$100/month company-wide budget for AI + infra, enforced as a hard stop at 100% (agent paused + ntfy alert), with an 80% early-warning threshold (CEO daily report), per-agent sub-budgets (§6), and per-issue soft budgets via a `budget:<cents>` label checked by a nightly script."
evidence:
  - "O1 acceptance target explicitly states this number: 'Control plane live and cheap: Paperclip up >= 99% over 30 days; AI+infra <= $100/mo'."
  - "Actual current infra cost is already near $0: embedded Postgres (bundled by Paperclip, no external Homebrew Postgres), no Docker, no paid secret manager (GCP billing account is closed), and Cloudflare Worker usage is expected to bill $0 at this stage — leaving essentially all of the $100 headroom for LLM calls, not fixed infra."
  - "§24.3 makes raising any budget founder-only, which only works as a real governance control if the starting number is deliberately conservative rather than generous."
reason: "A hard, low cap forces the model-routing design (§7: cheap models by default, escalate to a stronger model only when a task's tier requires it) to actually matter, rather than assuming spend will self-regulate once agents are live. It also keeps the entire multi-week experiment cheap enough to run indefinitely while the factory loop is still unproven (before O2/DEC-0003's JSON Workbench loop closes)."
expected_result: "Week-12 acceptance check (§34): spend <= $100/mo confirmed from Paperclip's own cost tracking plus the Cloudflare billing page (expected to show $0, since the edge Worker + D1 usage is within Cloudflare's free tier at this scale)."
risk: "A cap this tight could pause agents mid-task during a legitimate spike (e.g. a security-scan storm across many PRs in one day), stalling real work until the next month's budget resets. Mitigated by per-agent budgets (so one agent's overrun doesn't starve the others) and an 80% early-warning alert that reaches the founder before the hard stop, not only at 100%."
owner: founder
date: "2026-09-26"
review_date: "2026-12-26"
status: active
tags: [budget, economics, governance]
summary: "$100/month company-wide cap on AI + infra spend, hard-stopped at 100% with an 80% early warning; current fixed infra cost is near $0 so nearly the whole budget is headroom for LLM calls."
---

## Full context

See `appforge-ai-master-plan.md` executive summary ("budget cap = $100/month AI + infra"), §1 O1,
§24.3 "Budget system", and §21 "ECONOMICS" (per-product P&L and per-invocation AI economics, which
this company-wide cap bounds from above).

## Enforcement mechanics (as designed)

| Threshold | Effect |
|---|---|
| 80% of $100/mo | Paperclip native alert -> CEO agent's daily report flags it |
| 100% of $100/mo | Hard stop: the overspending agent is paused; ntfy notification to the founder |
| Per-issue | Optional `budget:<cents>` label, checked by agents (HEARTBEAT rule) and a nightly script that flags overruns |
| Raising any budget | Founder-only (§24.3) — no agent, including CEO, can raise its own or another agent's budget |

## Why $100 specifically, not $50 or $250

$50 was judged too tight given 7 agent roles plus the control plane itself will make LLM calls
(heartbeats, routine checks, growth briefs, QA runs). $250+ was rejected because it removes the
forcing function on cheap-by-default model routing (§7) before that design is actually exercised
under a real constraint — the whole point of a low cap during V1 is to make the model router's
tiering decisions matter in practice, not just on paper.

## Related

- `decisions/DEC-0005-reuse-release-platform-oidc-pipeline.md` — another cost-avoidance decision (reusing an existing pipeline instead of building a new one) that keeps this budget realistic.
