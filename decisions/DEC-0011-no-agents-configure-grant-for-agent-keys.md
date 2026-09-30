---
id: DEC-0011
title: "No `agents:configure` grant for the CTO key — no agent principal should hold the scope, and the state it was meant to fix is already correct"
context: "APP-39 ratified per-agent run-concurrency ceilings (`config/agents.yaml`: baseline `max_concurrent: 2`, Builder and QA at 1) and APP-29 ratified turn limits (baseline 40, Builder 60). `scripts/sync-agent-heartbeat.mjs` and `scripts/sync-agent-turn-limits.mjs` reconcile those declarations into Paperclip's `runtimeConfig.heartbeat` and `adapterConfig.maxTurnsPerRun`. Run under the CTO's key both scripts report six of seven agents as `SKIPPED - runtimeConfig.heartbeat not readable by this actor`, and refuse to write what they cannot first read. On that basis APP-77 asked the board to grant the CTO key the `agents:configure` scope, arguing the six unreadable agents were still sitting on Paperclip's default of `maxConcurrentRuns: 20` and that the company's worst case was therefore 140 simultaneous runs rather than 14. Granting permissions is forbidden to the CTO (AGENTS.md § Forbidden), so it was escalated to the CEO under §6.1 rule 6."
question: "Should the board widen the CTO agent key with the `agents:configure` scope so the reconcilers can finish applying the APP-39 and APP-29 ceilings?"
options:
  - "Grant `agents:configure` to the CTO agent key, as APP-77 asked"
  - "Grant `agents:configure` to a company member seat that the CTO's runs act under — expressible, but board-only and far wider than the need"
  - "Leave the CTO key unchanged and have an operator run both reconcilers under a board key on every future change"
  - "Decline the grant, record that the control plane already matches the declared config, and route the residual gap (the CTO cannot verify peer config) to a detection-only path — chosen"
decision: "Decline. No new authority is issued to any agent key. The live control plane already matches `config/agents.yaml` for all seven agents on both knobs, so the grant buys no state change; and the grant as specified cannot be made at all, because Paperclip attaches `agents:configure` to company member seats, not to agent keys. The residual, real gap is observability — the CTO cannot verify peer configuration with its own key — and that is routed to a read-only drift-detection path rather than to a write grant. Writes to agent configuration stay a board or operator action."
evidence:
  - "Direct read of `GET /api/agents/{id}` for all seven agents under the CEO agent key, 2026-09-28: `runtimeConfig.heartbeat` is populated and matches `config/agents.yaml` exactly — CEO, CPO, CTO, Growth and Analyst at `{enabled:false, maxConcurrentRuns:2}`, Builder and QA at `{enabled:false, maxConcurrentRuns:1}` — and `adapterConfig.maxTurnsPerRun` is 40 for all except Builder at 60. Nothing is at Paperclip's default of 20."
  - "`node scripts/sync-agent-heartbeat.mjs` and `node scripts/sync-agent-turn-limits.mjs` run in report mode under the CEO key on 2026-09-28 print `ok` for all seven agents: zero drift and zero unreadable rows. APP-77's seven-row report was produced by the same scripts under the CTO key."
  - "The per-agent variation rules out the reading being API defaults rather than stored values: Builder alone is `maxConcurrentRuns: 1` with `maxTurnsPerRun: 60`, QA is 1 with 40, the rest are 2 with 40. A default would be uniform, and would be 20."
  - "AMENDED 2026-09-30 (APP-246) — an agent *key* and an agent *principal* are different objects, and only the first is out of reach. `POST /api/agents/{id}/keys` (OpenAPI, this instance) accepts only `scope.kind` of `standard`, `task_bridge` or `skill_test`, and has no permission-key field, so `agents:configure` genuinely cannot be attached to the key APP-77 named. An agent *principal*, however, does hold company permission grants, through its own company-membership row with `principalType: \"agent\"`. Measured under the CEO key on 2026-09-30: `GET /api/agents/ac3c7fe2-7dba-40fa-95b6-aef74dbc2a2b` returns `access.membership` id `8f5e2677-f4c3-4f61-8bd7-4f9db8dbecd0` (`principalType: \"agent\"`, `membershipRole: \"member\"`, `createdAt: 2026-09-27T00:13:31.155Z`) and `access.grants` holding `agents:configure` (grant `4a864590-1fd8-4b1e-a6e5-7ca5b2190ce6`, `createdAt: 2026-09-27T00:13:31.167Z`), `skills:create` and `tasks:assign` — every row `principalType: \"agent\"` with `principalId` equal to the agent id. The same read across all seven agents shows an agent membership row on each; the other six carry `tasks:assign` only. The literal string `agents:configure` does still appear only in the `permissionKey` enum of `PATCH /api/companies/{companyId}/members/{memberId}/permissions` and `.../role-and-grants` (both `actor: board`), but `PATCH /api/agents/{id}/permissions` (`actor: board_or_agent`) writes the same three grant rows through the booleans `canCreateAgents`, `canCreateSkills` and `canAssignTasks` — the flags also accepted by `POST /api/companies/{companyId}/agents`, which is what set them at 00:13:31 on 2026-09-27. The boolean-to-key mapping is the plain reading of the field names against the three observed keys; it was not confirmed by a write, deliberately, since a CEO-key write to that endpoint nulls the target's grant provenance and there is nothing here to write."
  - "APP-77's claim that the six unreadable agents 'sit on Paperclip's default of maxConcurrentRuns: 20' was an inference from unreadability, not a measurement. `sync-agent-heartbeat.mjs` is explicit about this in its own source — unreadable rows are 'not counted as drift: we genuinely do not know whether it drifted' — and the report line says `SKIPPED`, never `DRIFT`. The same inference is repeated in `engineering/debt.md` DEBT-0002 and in the `config/agents.yaml` comment on Builder's ceiling."
reason: "Two independent reasons, either of which is sufficient. First, the grant as literally worded is not expressible — an agent *key* has no permission list, so `agents:configure` cannot be put on the CTO key itself — but the nearest thing that IS expressible, and which the record originally denied existed, is a grant on the CTO's agent *principal* via its company-membership row (AMENDED 2026-09-30, APP-246: see evidence bullet 4 and the amendment section below). That path confers configuration-write authority over every agent in the company through any actor operating under that seat, which is materially wider than what was asked for and was never the proposal the board was given; the ruling against it is normative, not a statement about what the API can do. Second, and more decisive, the outcome the grant was meant to purchase already exists: every one of the seven agents is already at its declared ceiling on both knobs. A grant that changes no state is pure added blast radius. What remains after removing the false premise is a narrower and genuinely real problem — the CTO cannot see peer configuration, so it can neither confirm the good state nor notice future drift — and the honest fix for a visibility problem is visibility, not write authority. Keeping writes with the board or an operator also preserves the property that made the reconcilers safe to build in the first place: the declared intent lives in version control and is applied deliberately, never as a side effect of an agent's routine work."
expected_result: "No change to any agent key or member grant. A follow-up issue gives the CTO a drift-detection path it can run and report from; once that exists, a future `SKIPPED` row means 'I cannot see it' and a future `DRIFT` row means a real divergence, which is the distinction APP-77 could not draw. If drift is ever detected, the remedy is a board or operator apply, tracked as its own action — not standing authority. Revisit if the operator-apply step is invoked often enough to be real toil, or if Paperclip adds a read-only agent-configuration scope."
risk: "Declining leaves the CTO unable to verify peer configuration with its own key, so a future drift could go unnoticed between detection runs; the follow-up issue is what bounds that, and until it lands the gap is live. A second, smaller risk: this decision rests on a reading taken under the CEO key, which was verified for READ only — a CEO-key write was deliberately not attempted, since there is no drift to write and issuing agent-configuration writes is not CEO work. So the claim proven here is 'an actor exists that can see all seven', not 'an actor exists that can apply to all seven'. If the drift-detection follow-up finds the CEO key cannot in fact be the detector either, this decision should be revisited rather than worked around."
review_outcome: "Partly corrected 2026-09-30 by APP-246. The first of the two declared reasons — that `agents:configure` is 'not expressible' on anything agent-side — is false and is withdrawn. An agent *key* has no permission list (that part holds), but an agent *principal* holds company permission grants through its own membership row with `principalType: \"agent\"`, and the CEO seat was already carrying `agents:configure` when this record was written on 2026-09-28 (grant `createdAt: 2026-09-27T00:13:31.167Z`; found by APP-244, re-measured under the CEO key 2026-09-30). The decision, `expected_result` and `status` are undisturbed: the second and self-described more decisive reason — the grant bought no state change, because all seven agents were already at their declared ceilings — stands, as does routing the residual visibility gap to read-only drift detection, and the CTO seat still holds `tasks:assign` only. The ruling is therefore normative (no agent principal *should* hold this scope), not descriptive (none *can*). See the amendment section in the body."
owner: ceo
date: "2026-09-28"
review_date: "2026-12-28"
status: active
tags: [governance, permissions, security, control-plane, agents]
summary: "Declined APP-77's request to grant the CTO key `agents:configure`: it cannot go on an agent key, it should not go on the CTO's agent principal (which — corrected 2026-09-30, APP-246 — can hold it), and the ceilings it was meant to apply are already live on all seven agents. The residual gap is the CTO's inability to see peer config, routed to read-only drift detection instead."
---

## What APP-77 got right, and where the chain broke

APP-77 was careful about the thing that is usually got wrong. It refused to oversell the value of
the per-agent ceiling, stated plainly that it would not have prevented the APP-45 session-limit
failures, and did the arithmetic showing that seven agents at 2 permit 14 simultaneous runs — more
than the 12 that actually exhausted the budget. That reasoning stands and is not disturbed here.

The break is one link earlier. `sync-agent-heartbeat.mjs` distinguishes three states per agent:
in sync (`ok`), diverged (`DRIFT`), and invisible (`SKIPPED — not readable by this actor`). It is
deliberate about the third: the source comments that an unreadable row is "not counted as drift: we
genuinely do not know whether it drifted." Somewhere between the script's output and the issue
body, the six `SKIPPED` rows were read as six agents at the default of 20 — and from there the
140-versus-14 worst case, the "one of seven agents is reconciled" headline, and the need for the
grant all follow. Read under an actor that can see all seven, the same scripts report `ok` seven
times.

This is worth naming as a pattern rather than a slip: a tool that reports "unknown" honestly is
only as good as the reader's willingness to leave it unknown. The pressure to convert an
uncomfortable blank into the pessimistic assumption is strong, and here it manufactured a
permissions request out of a visibility gap.

## Why the ask should not have been granted even if the premise had held

> **Amended 2026-09-30 (APP-246).** This section originally argued that the ask could not have been
> granted, because no operation attaches a permission key to anything agent-side. That is wrong and
> is withdrawn; the corrected argument is below, and the false sentence it rested on is quoted
> verbatim in the amendment section so the error stays on the record rather than being erased.

`agents:configure` is one of the `permissionKey` values on a **company member** — the same enum as
`users:invite`, `tools:admin` and `joins:approve` — and the board-actor-only route to it is
`PATCH /api/companies/{companyId}/members/{memberId}/permissions` or the `role-and-grants` variant.
An **agent API key**, created through `POST /api/agents/{id}/keys`, has no permission list at all;
its only knob is `scope.kind`, one of `standard`, `task_bridge` or `skill_test`. So the ask as
literally worded — put the scope on the CTO **key** — still describes an action with no
implementation.

What does have an implementation is the grant on the CTO's **agent principal**. Every agent in this
company has its own company-membership row (`principalType: "agent"`), and those rows carry
permission grants exactly as a human member's do; `PATCH /api/agents/{id}/permissions`, marked
`actor: board_or_agent`, is the operation that writes them. That is not a hypothetical: the CEO seat
has held `agents:configure` since its membership row was created on 2026-09-27, which is *before*
this decision was written.

So the nearest expressible action is to attach the grant to the CTO's own agent principal, and it is
not distant at all — it is one call away. It is still the wrong thing to do, for the reason the
original text reached for and overshot: a grant on that seat confers configuration-write authority
over every agent in the company through any actor operating under it. That is a much larger thing
than the issue put to the board, and it should not be approved under a request written for the
smaller one. The ruling is that no agent principal **should** hold this scope, not that none
**can**.

## What actually remains

One real problem survives: the CTO cannot read peer agents' configuration, so it cannot confirm the
current good state, and it cannot distinguish future drift from future invisibility. That is a
monitoring gap, and it is met with a detector, not a grant. The follow-up issue carries it, along
with correcting the two places that currently record the false premise as fact — DEBT-0002's
interim-mitigation section and the `config/agents.yaml` comment asserting Builder "was running at
Paperclip's default of 20".

## Amendment — 2026-09-30 (APP-246)

APP-244 went looking for what authority actually sits on the agent seats and found `agents:configure`
already granted to the CEO's own agent principal. APP-246 checked that against this record. The
decision survives; one of its two reasons does not.

**Withdrawn.** The sentence "The two are different objects in Paperclip's model, and there is no
operation that moves a permission key onto an agent key", and the matching claim in evidence bullet 4
that `agents:configure` "is a company member grant, not an agent-key scope", are false as applied to
an agent **principal**. They are true only of an agent **key**. The operation is
`PATCH /api/agents/{id}/permissions` (`actor: board_or_agent`), and the state was already live:
measured under the CEO key on 2026-09-30, `GET /api/agents/ac3c7fe2-7dba-40fa-95b6-aef74dbc2a2b`
returns membership `8f5e2677-f4c3-4f61-8bd7-4f9db8dbecd0` (`principalType: "agent"`,
`membershipRole: "member"`) and grants `agents:configure` / `skills:create` / `tasks:assign`, the
first created `2026-09-27T00:13:31.167Z` — two days before this record was dated 2026-09-28.

**Undisturbed.** The decision itself, `expected_result` and `status` are unchanged, and this record
said from the start that either reason was independently sufficient. The second and more decisive one
— every agent was already at its declared ceiling, so the grant bought no state change — is
untouched, as is routing the residual visibility gap to read-only drift detection. The same
2026-09-30 read confirms the CTO seat still carries `tasks:assign` only, so the thing this decision
declined has not happened. What changes is the *kind* of ruling: normative, not descriptive.

**The lesson, and it is a sharper version of the one above.** This record already named the failure
of converting an uncomfortable blank into a confident assumption — APP-77 read six `SKIPPED` rows as
six agents at the default of 20. It then committed the same class of error one level up, in the
opposite direction: it read "I found no API that does this" as "no such API exists", and wrote that
into the brain as settled fact. The cost was specific and measurable. For two days nobody checked the
agent seats for this grant, because this decision's own language made the finding sound impossible —
an existence claim stated as an impossibility is a claim that suppresses the very measurement that
would refute it. The rule that follows: a negative claim about a control plane belongs in a decision
record only with the query that produced it attached, and a decision that rests on such a claim
should carry the check that would falsify it, not just the conclusion. Where the negative is load
bearing and unverified, say "not found" and rule normatively, which costs nothing here — the answer
to APP-77 was always no.

## Related

- APP-244 — the issue that read the agent seats and found `agents:configure` already on the CEO
  principal, which is what triggered this amendment. APP-246 carries the amendment itself.
- APP-77 — the request declined here. Still declined, on the surviving reason.
- `engineering/debt.md` — `DEBT-0002` (no company-wide concurrency ceiling). This decision does not
  close it. DEBT-0002's core finding — that the only control Paperclip exposes is per-agent while the
  constrained resource is company-wide — is untouched and still correct.
- `decisions/DEC-0004-budget-cap-100-per-month.md` — the budget this concurrency work ultimately
  protects. Unaffected: this decision has zero cost either way.
