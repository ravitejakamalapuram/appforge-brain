---
id: DEC-0020
title: "Hire approvals are switched on: every new agent identity, including model-tier variants, goes through board approval"
context: >
  §5.2 of the master plan requires that "every hire goes through Paperclip `hire_agent` approval
  (enable hire approvals in P0-05)", with the rule that there is "no hire without a named
  bottleneck metric the hire is expected to move, recorded as a Decision". P0-05 shipped and the
  flag was never turned on: `requireBoardApprovalForNewAgents` stayed `false` through the entire
  P1 org build-out, so all seven founding seats (CEO, CTO, CPO, Builder, QA, Growth, Analyst) were
  created without passing the gate that §5.2 specifies. This was the last open residual on APP-2
  (onboarding); the other three asks from that issue's revision 1 — the $100/month company budget,
  the seven per-agent budgets, and the roster itself — had all been answered days earlier.
question: "Should `requireBoardApprovalForNewAgents` be enabled, given that the seven founding hires already happened without it?"
options:
  - "Leave it off — the founding roster is complete, the founder is the only one who can create agents in practice, and the flag is therefore ceremony."
  - "Enable it — chosen: hire approval becomes a hard gate on every subsequent agent identity, including model-tier variants."
  - "Enable it only for genuinely new roles and exempt model-tier variants like `builder-high` as mere configuration."
  - "Defer until a hire is actually proposed, and decide then."
decision: >
  `requireBoardApprovalForNewAgents` is **enabled** at the company level, effective
  2026-09-30T02:40:15Z. Every new Paperclip agent identity from this point forward requires board
  approval before it exists, and §5.2's substantive rule rides along with the switch: no hire lands
  without a named bottleneck metric the hire is expected to move, recorded as a Decision.
  Model-tier variants are explicitly in scope, not exempt. `builder-high` (§7.3,
  `appforge-control/config/agents.yaml:129`) is a separate Paperclip agent identity sharing
  Builder's instruction files but routed to the HIGH model tier; the master plan's own wording is
  that variants "don't count as new roles but do need hire approval". Option 3 is therefore
  rejected — the thing the gate protects is recurring spend attached to an identity, and a variant
  creates exactly that.
  The seven founding seats are **not** retroactively re-approved. They were created by the founder
  directly, which is the authority the gate exists to route to; re-running them through it would
  produce paperwork and no decision.
  What the gate is actually restraining is broader than the founder's own clicks: all seven agent
  seats hold `canCreateAgents: true`, so until 2026-09-30 an agent could create an agent
  unattended. The flag converts that from an autonomous capability into a board-gated request.
evidence:
  - "Every one of the seven agent seats carries `canCreateAgents: true` in its enforced `permissions` object (read this run from `GET /api/companies/18b2b6ef-…/agents`): CEO, CTO, CPO, Builder, QA, Growth and Analyst alike. Before the flag was enabled, any of the seven could mint a new agent identity — and its recurring model spend — with no human in the path at all. This, not founder discipline, is the load-bearing reason the gate matters."
  - "Live control plane, read this run: `GET /api/companies/18b2b6ef-…` returns `requireBoardApprovalForNewAgents: true` with `updatedAt: 2026-09-30T02:40:15.522Z`. The founder flipped the switch roughly two seconds before accepting the APP-2 plan-revision-2 confirmation (`823c9c42`, resolved 2026-09-30T02:40:17.025Z) — so the decision was executed, not merely agreed to."
  - "The next hire the plan calls for is real, not hypothetical: `config/agents.yaml:129` specifies `variants: { high: HIGH }` for Builder, i.e. the `builder-high` identity, and it does not exist yet. With the flag off it would have been created with no review and no Decision record."
  - "The budget headroom cannot absorb an unreviewed hire. `config/budgets.yaml:11-14` accounts for the whole cap: 8000 cents across the 7 agents + 500 cents model-eval = 8500 of 10000 committed, leaving a 1500-cent ($15) unlabeled reserve that is already spoken for as the §28 overrun line. A hire is a *recurring* commitment, and raising the cap is founder-only (§24.3, DEC-0004)."
  - "Automated spend leakage is this company's demonstrated failure mode, not a theoretical one: APP-38 (an unbounded fresh-session max-turns retry loop that burned $40.65), APP-70 and APP-76 (cancelled and turn-exhausted runs consuming more than everything that succeeded) were all open when this was decided. Leaving the one native gate on recurring cost switched off is not a defensible default in that context."
  - "No prior decision is superseded. Enumerating every local and remote ref of `appforge-brain`, no record under `decisions/` mentions `requireBoardApprovalForNewAgents` or hire approval at all; DEC-0004 ($100 cap, founder-only to raise) is the nearest neighbour and it supports this rather than conflicting."
  - "Cost of the gate is one founder action per hire, and §5.2 designs hires to be rare (\"trigger on evidence, not calendar\"). The gate is therefore close to free in steady state."
reason: >
  The gate was chosen on live facts rather than on compliance-for-its-own-sake. There is a named
  next hire, the budget has no room for an unreviewed one, and the company has repeatedly lost
  money through exactly the class of automated path this flag interrupts. Any one of those alone
  would be a weak argument; together they make "leave it off" the position that needs defending.
  The decisive fact, surfaced by the board and verified afterwards, is that `canCreateAgents` is
  `true` on all seven agent seats. "Leave it off" was therefore not a choice to keep hiring
  informal; it was a choice to let seven autonomous processes each create recurring cost against
  a cap with $15 of slack. Framed that way the question answers itself, and the earlier budget
  and spend-leak arguments are corroboration rather than the load-bearing case.
  The reason variants are not exempted is that the gate's subject is a recurring cost attached to
  an agent identity, not the novelty of a job title. `builder-high` would consume HIGH-tier model
  spend against a cap with $15 of slack; that it reuses Builder's prompt files makes it cheaper to
  write, not cheaper to run.
  On the founding seven: a gate is a routing rule about who decides, and the founder is who it
  routes to. They already decided. Retroactive approval would be the form of governance without
  the function, which is the failure mode §5.2 is itself guarding against.
  Worth recording alongside this: on the roster shape the CEO recommendation was wrong. CEO
  proposed staggering P1 into three waves (CTO + CPO first, $27/month) on the argument that
  Builder, QA, Analyst and Growth had "no work on day one"; the founder overrode it and hired all
  seven at once. Builder, QA and Analyst all had real queued work within days (APP-103, APP-54,
  APP-47/APP-68), so the stagger would have left the factory short-staffed. The gate this record
  enables routes future hire judgements to the party that got this one right.
expected_result: >
  `builder-high` — the next hire the plan specifies — cannot be created without a board approval
  and an accompanying Decision record naming the bottleneck metric it is expected to move. Any
  attempt by an agent to create an agent identity fails at the control plane rather than
  succeeding quietly. At the next review, `requireBoardApprovalForNewAgents` is still `true` and
  the count of agent identities created without a corresponding approval since 2026-09-30 is zero.
risk: >
  The gate adds founder latency to a hire at the moment a bottleneck is most acute — if a role is
  genuinely blocking delivery, the company now waits on a human click to unblock it. That is
  accepted: hires are recurring-cost commitments against a cap with $15 of slack, so the latency
  is the point rather than a side effect. The milder risk is that the gate is mistaken for
  sufficient governance on its own; it gates *existence*, not *spend*, so an approved agent with a
  budget still needs the §24.3 per-agent ceilings that DEC-0004 established. A third, smaller
  risk: because the flag governs creation rather than configuration, an existing agent re-pointed
  at a more expensive model tier could raise recurring cost without tripping it — which is why
  this record puts variants in scope explicitly rather than leaving it to be inferred.
  A distinct gap this flag does not close at all: the same seven seats also carry
  `canCreateSkills: true`, and no company-level approval flag gates skill creation. A skill is an
  executable instruction set loaded into an agent runtime, so that is a wider containment surface
  than agent creation, left ungated. It is out of scope for this record — filed separately for
  the board, since changing a security boundary is not a CEO action (§6.2).
owner: founder
date: "2026-09-30"
review_date: "2026-12-30"
status: active
tags: [governance, hiring, budget, control-plane, agents, onboarding]
summary: "`requireBoardApprovalForNewAgents` is enabled (2026-09-30): every new agent identity needs board approval plus a Decision naming the bottleneck metric it should move, model-tier variants like `builder-high` explicitly included; the seven founding seats are not retroactively re-approved."
---

## Full context

This closes the last residual on **APP-2** (Paperclip onboarding). That issue's plan revision 1
(2026-09-27) named four founder-gated items; three were answered without further CEO action:

| Revision 1 ask | State at close |
|---|---|
| Company budget $100/month | `budgetMonthlyCents: 10000`, hard stop at 100%, 80% warn — DEC-0004 |
| Per-agent budgets | 7 policies summing to 8000 cents ($80) |
| Approve the roster | Founder hired all 7 seats at once, overriding the CEO's staggered proposal |
| Enable hire approvals (§5.2 / P0-05) | **this record** |

The operational defect flagged in the same revision — CEO `maxTurnsPerRun: 10`, which had already
killed run `0a350c18` at zero work — was also fixed out of band (10 → 40; Builder 60).

## What the gate does and does not cover

| Event | Gated by this record? |
|---|---|
| A new role (e.g. a Support or SRE agent) | Yes — approval + Decision with a bottleneck metric |
| A model-tier variant (`builder-high`, §7.3) | Yes — explicitly in scope, see `decision` |
| The 7 founding seats, already created | No — not retroactively re-approved |
| Raising an existing agent's budget | No — separate control, founder-only (§24.3, DEC-0004) |
| Re-pointing an existing agent at a costlier model tier | No — gap called out under `risk` |

## Related

- `decisions/DEC-0004-budget-cap-100-per-month.md` — the $100/month cap this gate protects; raising
  it is founder-only, which is what makes an unreviewed recurring hire unfundable rather than
  merely untidy.
- `decisions/DEC-0011-no-agents-configure-grant-for-agent-keys.md` — the adjacent ruling that
  agent keys do not get `agents:configure`; together these keep agent-identity management on the
  founder/board side of the boundary.
