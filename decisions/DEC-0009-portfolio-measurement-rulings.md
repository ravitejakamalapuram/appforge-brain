---
id: DEC-0009
title: "Five rulings on §22.1/§22.2: `insufficient_data` is the honest portfolio output, the degenerate maintenance clause is guarded and given an absolute ceiling, allocation renormalises behind a coverage floor, and no store metric may ever stand in for WAU or retention"
context: >
  On the 2026-09-28 weekly portfolio review the CEO could not apply §22.1 or §22.2 to any of the
  nine products, because every threshold in both policies is stated in metrics AppForge does not
  collect: all nine `.appforge/product.yaml` files carry `analytics_project: null`,
  `config/analytics.yaml` is a design target with `enabled: false`, appforge-edge is unprovisioned,
  and the deterministic script §22.1 requires ("recommendation computed by script from metrics
  before the CEO sees narrative") does not exist — so the anti-sunk-cost control is not in force.
  The CEO ruled out solving this with in-product telemetry as a first move: that is a privacy-policy
  change, a store data-disclosure change and a re-review against products positioned on "nothing
  leaves your browser", and therefore a board decision. The instruction was to recover what the
  Chrome Web Store and Play Console already report first-party, with zero product code change, and
  to have the policy state plainly what stays unmeasurable rather than let agents guess. Analyst
  delivered the measurement baseline on APP-35 and came back with five defects it could not decide
  — four in the master plan's own text, one a founder-approval goal change.
question: >
  How should the §22.1/§22.2 evaluator behave given that store data recovers the WAU and
  acquisition halves of the policy but leaves six of its seven rules undecidable?
options:
  - "Bless weaker store-only interim rules so the policy returns verdicts now."
  - "Accept `insufficient_data` as the honest per-product output, fix the defects the encoding exposed, and name every missing input — chosen."
  - "Ship in-product telemetry to make the policy evaluable."
  - "Defer all five rulings to the board and leave the evaluator unbuilt."
decision: >
  Accept `insufficient_data`. Build the evaluator anyway, with five rulings binding on
  `config/portfolio.yaml`:
  (D1) The `maintenance cost > 3x contribution` clause gets a `contribution > 0` guard, and a second
  clause is added for the contribution <= 0 case — SUNSET candidate if maintenance cost exceeds
  3x the base maintenance ceiling §22 already fixes ($2/product/month, so $6/month) for 2 sustained
  quarters. `maintenance_cost` is defined as attributable AI spend plus attributable infra, with
  `excludes: founder_hours` recorded on its face.
  (D2) Accept `insufficient_data`. No store-only rule may ever produce SUNSET or SCALE. The
  evaluator must print, in its own output, that `insufficient_data` is not a freeze.
  (D3) Renormalise the §22 allocation score over available terms, stamp a coverage fraction on every
  score, withhold the growth-pool allocation entirely below coverage 0.7, cap `strategic` at 0.25 of
  realised weight, and admit attributable spend as a declared proxy for maintenance burden. Never
  proxy D30 retention.
  (D5) Reject substituting `play_active_devices_30d` into a WAU threshold. Android WAU clauses stay
  undecidable with a named reason until APP-42's first real export confirms Play's report schema,
  and Android then gets its own rule set with its own thresholds.
  (O2) The Q4 goal "JSON Workbench: WAU +30%" is restated as an absolute floor on a trailing mean,
  recommended at `cws_weekly_users >= 50` to match §22.1's own day-90 floor. That edit is
  founder-only and is routed to the board, not made here.
  The D1 guard and the unreachable-ITERATE finding are corrections to the master plan's *text* and
  go to the board for ratification; they are operative in config meanwhile because SUNSET is a
  candidate flag that §22.1 itself routes to board approval before any product is sunset, so no
  irreversible action follows from the ruling.
evidence:
  - "§22.1 bullet 1c is degenerate as written. `maintenance cost > 3x contribution` with contribution = -$0.50 reads `cost > -$1.50`, which is true for any spend at all. Seven of nine products are free, so contribution is <= 0 by construction, so all seven satisfy a SUNSET clause on that disjunct alone. A deterministic script surfaces this on day one; a narrative review never does. The defect is an argument for the §22.1 anti-sunk-cost control, produced by the control itself."
  - "Six of the seven decision rules in §22.1/§22.2 require D30 retention or activation. With a perfect store ingest running tomorrow every product still returns `insufficient_data`. The only clause that becomes armed is unresolvable policy/security risk, currently false for all nine. Store data therefore improves the explanation, not the verdict, and must not be sold as restoring the policy."
  - "The binding constraint on retention and activation is sample size, not instrumentation. At n = 3-5 a D30 cohort can only return 0%, 33%, 67% or 100%. Shipping telemetry to json-workbench today would produce numbers that look like measurements and are not. This is a second, independent reason the no-telemetry-first call was right, and it is the answer when telemetry is proposed again in November."
  - "Q4 goal O2 is unscoreable by arithmetic, not by instrumentation. +30% on a base of 3-5 is a target of 4-7 users; the instrument's smallest expressible change is 1 user (20-33%); and two Google surfaces disagreed by 2 users (40%) one day apart. The target effect is smaller than the instrument's demonstrated error. An absolute floor is scoreable at any n; a percentage target on a base of 3 is not."
  - "§22 weights D30 retention 0.2 and maintenance burden 0.1. A script defaulting them to 0 silently reweights every product's attention budget. Below coverage 0.7 the surviving terms are contribution_trend — degenerate, since all seven free products sit at roughly equal negative contribution — and `strategic`, a judgement input. An allocation driven by a judgement term and a degenerate one, stamped with a computed score, is the vanity-metric failure §22.2 forbids and SOUL.md names as a CEO failure. Allocating nothing from the growth pool is better than allocating on arithmetic theatre."
  - "Play Console publishes daily active devices and 30-day actives but no 7-day distinct-active figure, and daily counts cannot be summed into a weekly distinct count. Substituting 30-day actives would change what the threshold means — the same class of error as aliasing CWS `weekly users` (installations that checked in with Chrome, a measure of installed-and-online) to §18b's WAU (distinct install_id with >= 1 event in 7 days, a measure of use). Both aliases are forbidden by name in config."
  - "Deferring the Android thresholds costs nothing today: TelePort is on an internal track only and InvTrack's `first_published` is unknown, so both are `not_applicable` regardless. No verdict is being withheld that could otherwise be produced."
  - "DEC-0008 settled the governing principle one day earlier: a rubric is changed when it misranks reality, not when it returns an unwelcome number. Loosening §22.1's retention gate so ITERATE could reach the distribution diagnosis OPP-0001 already supports on independent evidence would be fitting the instrument to the answer. It is also unnecessary — DEC-0006 approved the listing rewrite on the research record, not on a §22.1 verdict."
  - "The launch-date defect is worse than reported. Analyst sourced json-workbench's `first_published` to 2026-09-20; CTO checked the log and found no publish event in it, and the first tag (v0.1.0) is 2026-09-23, so no publish was possible on that date. `first_published` is null for all nine products, §22.1's day-30/60/90 clock has no origin anywhere in the portfolio, and the correct entry is null rather than a guess."
  - "Four of nine products are published with an unknown launch date and four are not publicly launched at all, three of those behind the §13.6 two-slot constraint. Measurement is not the portfolio's binding constraint; slots are. That is already a live board approval (Paperclip APP-37) and is not re-litigated here."
reason: >
  An explicit "cannot evaluate, here is precisely which number is missing, and whether store ingest
  or telemetry or neither would fix it" is a real governance gain over the current state, where the
  gap gets filled with judgement that reads like a measurement. That gain does not require
  telemetry, does not require a privacy-policy change, and survives the discovery that most of the
  policy stays dark. What it does require is that every gap be named at the point of use: a silent
  default, a quiet alias, or a proxy presented as the real metric would convert an honest blank into
  a confident wrong answer, which is the specific failure the anti-sunk-cost control exists to
  prevent. The four text defects are fixed in the direction of the clause's evident intent rather
  than in the direction that produces a comfortable verdict, and the two that amount to editing
  plan or strategy text are sent to the board instead of being absorbed by an agent.
expected_result: >
  `config/portfolio.yaml` encodes all five rulings, and `appforge metrics portfolio` returns a
  defensible SCALE/ITERATE/PAUSE/SUNSET, `insufficient_data`, or `not_applicable` per product with
  the missing input named in every non-verdict. The first several monthly allocations correctly run
  on base maintenance only, because coverage sits below 0.7 until store exports exist. No product's
  outcome changes today as a result of these rulings — what changes is that the script will be
  correct when the data arrives, and that nobody has to re-derive these four judgements in 2027Q1.
  Agents stop reading `insufficient_data` as a prohibition on ordinary product work.
risk: >
  The largest risk is that "we accepted `insufficient_data`" hardens into a standing excuse and the
  portfolio runs on narrative for a quarter while everyone points at the blank. The mitigation is
  that the blanks are per-metric and named, so the cost of each one is legible and re-reviewable at
  the November call. Second: the $6/month maintenance ceiling is derived from §22's own base
  maintenance figure, not from realised data, and may be wrong once real per-product cost
  attribution exists — it cannot fire before 2027Q1 in any case, and is a calibration input, not a
  settled number. Third: if the founder declines the §22.1 text amendment, config and plan disagree
  until that is resolved, which is why the disagreement is recorded on the clause itself rather than
  smoothed over. Fourth: Analyst's reading of Play's report schema is medium-confidence and
  unverified against a real export, which is exactly why no Android threshold is set on it yet.
owner: ceo
date: "2026-09-28"
review_date: "2026-11-30"
status: active
tags: [portfolio, governance, metrics, kill-policy, scale-policy, measurement, privacy]
summary: "§22.1/§22.2 return `insufficient_data` honestly rather than verdicts cheaply: the degenerate maintenance clause gets a contribution guard plus a $6/month absolute ceiling, allocation renormalises behind a 0.7 coverage floor, store metrics may never be aliased to WAU or retention, and the unscoreable Q4 WAU goal is routed to the founder as an absolute floor."
---

## What the store data actually bought

| | Before | After store ingest |
|---|---|---|
| §22.1/§22.2 rules that can fire | 0 of 7 | 1 of 7 (unresolvable policy/security risk) |
| Products with a computable verdict | 0 of 9 | 0 of 9 |
| Products with a *named* missing input | 0 of 9 | 9 of 9 |

The third row is the whole gain, and it is worth the build. The second row is why this must not be
described as restoring the kill policy.

## The four text defects, and why they were fixed rather than deferred

| Defect | As written | Ruling |
|---|---|---|
| D1 maintenance clause | vacuously true for every free product | `contribution > 0` guard + separate $6/month absolute ceiling for the contribution <= 0 case |
| D2 policy inert | six of seven rules need telemetry | accept `insufficient_data`; no store-only rule may produce SUNSET or SCALE |
| D3 allocation score | 30% of weight unavailable, defaults to 0 | renormalise, stamp coverage, withhold growth pool below 0.7, cap `strategic` at 0.25 |
| D5 Android WAU | no store-side equivalent exists | no aliasing; undecidable with a named reason; separate Android rule set after APP-42 |

D4 (no `first_published` anywhere, so the day-30/60/90 clock has no origin) is not a judgement call
and needed no ruling — it is a backfill, tracked on APP-41, and the honest entry until then is null.

## `insufficient_data` is not a freeze

§22.1 exists to **stop** work (PAUSE, SUNSET) or to **escalate spend** (SCALE). It does not
authorize ordinary work, and its silence does not prohibit it. A product returning
`insufficient_data` continues under CPO and CEO direction at its base maintenance allocation.

This is stated here because the company has already made this mistake once in the opposite
direction: agents read §10.4's sub-threshold prioritization score as a prohibition on operating a
live product, which DEC-0006 and DEC-0008 had to unwind. The evaluator prints the line in its own
output so the error cannot be re-derived from a blank field.

## Where ITERATE ends up, and why the gate is not loosened

§22.1 gates ITERATE behind `retention >= 20%`, so the policy cannot reach the diagnosis OPP-0001
already reached on independent evidence — that json-workbench's binding constraint is distribution.
The gate is not loosened. Its practical cost is zero, because the work ITERATE would authorize needs
no §22.1 verdict and is already approved under DEC-0006. Lowering a retention threshold so the
policy agrees with a conclusion reached another way is the instrument-bending DEC-0008 refused.
Recorded as a spec defect (ITERATE unreachable) rather than routed around in config.

## Related

- `DEC-0008` — the governing principle: change a rubric when it misranks reality, not when it returns an unwelcome number
- `DEC-0006` — OPP-0001 is mis-gated; the listing rewrite proceeds on the research record, not on a policy verdict
- `DEC-0004` — the $100/month cap that makes contribution the operative constraint and the maintenance ceiling meaningful
- `strategy/2026-q4-goals.md` — goal O2, whose restatement is founder-approval content and is not edited here
- Paperclip `APP-35` (this ruling), `APP-41` (config + backfill), `APP-42` (store ingest), `APP-43` (evaluator + digest), `APP-37` (the slot constraint that actually binds), `APP-48` (agents cannot push to appforge-brain)
