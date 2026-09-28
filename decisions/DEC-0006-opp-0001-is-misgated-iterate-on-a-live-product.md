---
id: DEC-0006
title: "OPP-0001 is mis-gated: JSON Workbench is a live product being run through the new-product funnel, so the G2 score is not the deciding instrument"
context: >
  CPO researched OPP-0001 and asked CEO to rule on a G2 pass/fail. Between 2026-09-27 and
  2026-09-28 five different §10.4 scores were derived from the same evidence base — 56.6 (the
  pushed PR), 63.2 and 65.2 (two further CPO commits on unpushed local branches), and 58.2 then
  60.2 on the CEO's own re-derivation. The threshold of 60 sits inside that 8.6-point spread, so
  three of the five say fail and two say pass. A board approval (APP-36) was meanwhile opened
  asking to recalibrate §10.4 on the grounds that it "structurally blocks every free product".
  The CEO's job here was to pick a verdict; on inspection the more useful finding is that the
  question was mis-posed.
question: "Does OPP-0001 clear G2 — and is G2 even the right gate for it?"
options:
  - "Accept 56.6 and archive OPP-0001 per §10.3's G2 failure path."
  - "Accept 63.2 or 65.2 and propose a G3 MVP approval to the board."
  - "Rule that the G0-G3 funnel does not apply to a product already past G7, route OPP-0001 to the live-product path, and stop treating the score as a verdict — chosen."
  - "Recalibrate §10.4's weights until JSON Workbench passes."
decision: >
  OPP-0001 is RECLASSIFIED. G0-G3 is the new-product funnel; JSON Workbench has been live on the
  Chrome Web Store since 2026-09-23 at the earliest (0.2.0 PUBLISHED), which puts it past G7 — the
  exact first-publish date is UNKNOWN and bounded to 2026-09-23..2026-09-25, corrected 2026-09-28
  per APP-59; see Corrections below. There is no MVP to
  approve, so G3 is not proposed, not now and not at any score. OPP-0001 is routed onto the
  live-product path, where its real next gate is G9 (PMF signal, owned by Analyst, day 30 =
  2026-10-20) followed by G10 (scale/iterate/pause/kill, CEO to board).
  For the record and not as the operative reason: re-derived honestly the score is 60.2, which is
  0.2 above the threshold and flips to a fail on a one-point drop in ANY of nine criteria. It
  carries no decision-grade signal and is recorded as "marginal", not as a pass.
  The portfolio call for JSON Workbench is ITERATE on distribution. The listing keyword rewrite is
  approved to be drafted and PR'd now under DEC-0003; PUBLISHING it needs a board G7 approval,
  because §10.3's G7 names "listing" explicitly in the approval diff and the CEO may not trigger
  releases. Telemetry is escalated separately as a G8 completion blocker, not as a new opportunity.
evidence:
  - "§10.3's gate ladder is G0 Discovered, G1 Evidence, G2 Validated, G3 MVP approved, G4 Development, G5 QA, G6 Release candidate, G7 Human release approval, G8 Launched, G9 PMF signal, G10 Scale/iterate/pause/kill. G3's acceptance criteria are 'scope, budget (AI $ + builder weeks), kill criteria pre-registered, slot plan' — the criteria for authorising a build that has not happened."
  - "JSON Workbench is live on CWS as item higmlhleblpmdogjccpmjlnilpmhohal, 0.2.0 PUBLISHED. CORRECTED 2026-09-28 (APP-59): the first-publish date is UNKNOWN, bounded to 2026-09-23..2026-09-25 — logs/chrome-store/2026-09-20-release.log carries no publish event, both git tags v0.1.0 and v0.2.0 are dated 2026-09-23, and CHANGELOG.md dates the CWS pipeline to 0.1.1 / 2026-09-23. The build G3 would authorise is days old and already in users' hands, which is the only part of this evidence the decision rests on."
  - "The mis-gating explains the symptom that triggered APP-36. §10.4 weights monetization at 15 with a missing-evidence floor of 1 because it is ranking candidate products competing for a build slot. Applied to a shipped free product it measures something nobody is deciding. The oddness CPO correctly noticed is a routing error surfacing as a scoring error."
  - "Score sensitivity, computed by CEO: on the adjudicated set (4/4/3/2/1/5/3/3/4/2 => 301 => 60.2) a one-point DOWNWARD move in any one of nine of the ten criteria flips the verdict to fail. A threshold that nine independent single-point judgements can cross is not resolving anything at this altitude."
  - "The five derivations of the same evidence: 56.6 (51bc074, pushed as PR #1), 58.2 (CEO first pass), 60.2 (CEO final), 63.2 (d9d4956), 65.2 (d51812b). Spread 8.6 points; threshold 60 sits inside it."
  - "CEO adjudication of the individual revisions: demand_evidence 3->4 ACCEPTED, because the later commits add two genuinely new independent evidence classes (a commercial content market spanning five unaffiliated vendors on the 'open a large JSON file' query, and an August 2026 third-party author who published JSON Workbench's exact four-criteria positioning before it was public). maintenance_inverse 4->3 and platform_risk_inverse 3->2 ACCEPTED as self-penalising corrections against real facts. competition_inverse CONCEDED to 3, against the CEO's own first draft of 2, because the record's own competition_strength field is 3 and the inverse of a 3 is a 3 — the CEO had cited that field as the argument and consistency runs both ways. monetization HELD at 1: §10.4's rule is mechanical, 'missing evidence => score 1', and one comparable (Dadroit) is evidence that somebody else monetizes the job, not evidence about ours."
  - "§10.3's G8 criteria are 'store status PUBLISHED verified by status job; telemetry receiving app_installed'. Telemetry is intentionally not enabled (json-workbench docs/TELEMETRY.md; .appforge/product.yaml has analytics_project: null, data_collection.collected: []). JSON Workbench is therefore only PARTIALLY through G8 and cannot reach G9 at all, because G9's acceptance criteria are pre-registered thresholds measured at day 30/60/90."
  - "DEC-0003 already authorises this growth loop on this product, and strategy/2026-q4-goals.md O2 commits to JSON Workbench completing the full factory loop. Archiving OPP-0001 per §10.3's G2 failure path would have put the factory in direct conflict with a standing Q4 objective on the strength of a 0.2-point margin."
reason: >
  Four agents produced five scores and a board approval request, all arguing about which side of 60
  a number falls on, when the number was never going to decide anything: it moves 8.6 points on
  re-reading and flips on any single one-point judgement. Continuing to argue the score would have
  been the expensive mistake. The cheap and correct observation is that a prioritization rubric for
  allocating build slots was being applied to a product whose build already shipped, and that a
  gate ladder has a live-product branch which nobody routed this onto.
  Reclassifying costs nothing, unblocks the actual work, and removes the pressure that produced
  five scores in two days. It also relocates telemetry correctly: not a speculative privacy-risky
  side quest, but the unmet half of G8 and therefore the binding blocker on the Q4 O2 objective
  that DEC-0003 exists to serve.
  On the score itself the CEO conceded the one point it was wrong on (competition_inverse) and held
  the one the rule decides (monetization). The result, 60.2, is recorded as marginal rather than as
  a pass, because calling a 0.2 margin a pass would be exactly the vanity-metric reasoning SOUL.md
  names as the CEO's characteristic failure.
expected_result: >
  OPP-0001 leaves the G0-G3 funnel and no G3 approval is requested, which closes APP-40. The
  listing rewrite is drafted and PR'd within roughly 0.1 builder-weeks at effectively zero marginal
  cost, and publishes only after a board G7 approval carrying the listing diff. Telemetry is scoped
  by CTO as G8 completion work with the privacy claim as a hard constraint. Once telemetry is live,
  G9 becomes measurable at day 30/60/90 and the portfolio decision for JSON Workbench is taken on
  realised data at G10, as the ladder intends.
risk: >
  The chief risk is that "reclassify when the gate is awkward" becomes a way around scoring. Bounded
  explicitly: this reclassification is available only where the product is already past G7, which is
  a matter of public record rather than judgement, and it does not lower any bar — it moves the
  product to G9's pre-registered thresholds, which are harder and data-backed, not easier. A
  never-launched opportunity scoring 60.2 would still face G3 and the board.
  Second risk: the listing rewrite is the kind of change that looks free and is therefore under-
  reviewed. It still carries a G7 board approval and CTO must confirm the store review path rather
  than assuming the record's "no package re-review" claim. Third: a four-week impressions read on a
  base of 3-5 users may be too noisy to call, which is a reason to pre-register the threshold now
  and refuse to move it later.
owner: ceo
date: "2026-09-28"
review_date: "2026-10-27"
status: active
tags: [json-workbench, opportunity-gate, g2, g8, g9, scoring, product-factory, opp-0001]
summary: "JSON Workbench has been live since 2026-09-23 at the earliest, so running OPP-0001 through the G0-G3 new-product funnel was a routing error; OPP-0001 moves to the live-product path (G9 at day 30), no G3 is proposed at any score, the listing rewrite proceeds under DEC-0003 with publish gated on a board G7, and telemetry is reclassified as the unmet half of G8."
---

## The score was never going to decide this

Five derivations of the same evidence, in two days, by two agents:

| Derivation | Score | Verdict |
|---|---|---|
| `51bc074` — CPO, pushed as PR #1 | 56.6 | FAIL |
| CEO first pass | 58.2 | FAIL |
| **CEO final (adjudicated)** | **60.2** | **marginal** |
| `d9d4956` — CPO | 63.2 | PASS |
| `d51812b` — CPO | 65.2 | PASS |

Spread 8.6 points. The threshold sits inside it. And on the adjudicated set, a one-point drop in
**any of nine of the ten criteria** flips it to a fail. That is an instrument being read past its
resolution.

### The adjudicated set

| Criterion | w | s | Ruling |
|---|---|---|---|
| user pain | 15 | 4 | unchanged |
| demand evidence | 20 | 4 | **accepted** — two new independent evidence classes |
| competition (inverse) | 10 | 3 | **conceded** from CEO's own draft of 2; the record's `competition_strength` is 3 |
| distribution | 15 | 2 | unchanged — the real weakness, and what this cycle attacks |
| monetization | 15 | 1 | **held** — §10.4: "missing evidence ⇒ score 1" |
| dev cost (inverse) | 5 | 5 | unchanged |
| maintenance (inverse) | 10 | 3 | accepted (self-penalising) |
| defensibility | 5 | 3 | unchanged |
| security risk (inverse) | 3 | 4 | unchanged |
| platform risk (inverse) | 2 | 2 | accepted (self-penalising) |
| | **100** | | **301 → 60.2** |

## Where OPP-0001 actually sits

```
G0 → G1 → G2 → G3 → G4 → G5 → G6 → G7 → G8 → G9 → G10
                 ↑                        ↑    ↑
    everyone was arguing here    JSON Workbench   the real next gate
      (new-product funnel)        is here,        (day 30 = 2026-10-20)
                                  partially
```

G8's criteria are "store status PUBLISHED **and** telemetry receiving `app_installed`". The first
is met; the second is not, and is intentionally not enabled. So JSON Workbench never completed G8,
and G9 — whose criteria are pre-registered thresholds at day 30/60/90 — cannot be evaluated at all.

That is the finding that matters most: **telemetry is not an optional privacy-risky side project,
it is the unmet half of G8 and therefore the binding blocker on Q4 objective O2**, which DEC-0003
exists to serve. It was being discussed as a growth nice-to-have.

## Dispositions

| Item | Disposition | Authority |
|---|---|---|
| G3 MVP approval | **Not proposed, at any score** | No MVP exists; product shipped 2026-09-23 or earlier |
| Listing copy draft + PR | **Approved now** | DEC-0003 + Q4 O2; LOW risk, CEO work-plan authority |
| Publishing the listing | **Board, via G7** | §10.3 G7 names "listing" in the approval diff; CEO may not trigger releases |
| Telemetry | **Escalated** as G8 completion, CTO to scope | Privacy claim is a hard constraint |
| Distribution post | **Deferred** until the listing result is read | Otherwise it confounds the measurement |

## The measurement — AMENDED by DEC-0010 before this record merged

Competing kill criteria existed across the record, APP-34 and the earlier commits. This is the one
that binds:

> **Weekly CWS impressions, four weeks after versus four weeks before the listing change, must at
> least double.** Installs are a secondary read. If impressions do not double, the "discovery is a
> copy problem" hypothesis is dead, the constraint is off-store distribution, and that is recorded
> as a DEC rather than iterated on.

Impressions, not installs: the hypothesis is specifically "we are invisible to the query this
audience types", and impressions measure reach directly while installs conflate reach with appeal.
"Triple installs" off a base of three users is nine users — indistinguishable from noise.

**The window construction above is withdrawn.** It could not register a failure: with first-publish
at 2026-09-23 or later, "four weeks before" is roughly 80% days on which no listing existed, so a
28-day sum over ~5 live days against a 28-day sum over 28 live days returns "at least double" from
the asymmetry alone — about 5.6× with the rewrite doing nothing, and still 2.8× with the rewrite
actively halving reach. QA caught this on `APP-59`.

What survives unchanged: **impressions not installs**, the **2× threshold** (which is NOT moved),
installs as a secondary read, and the FAIL consequence — hypothesis dead, constraint is off-store
distribution, recorded as a DEC rather than iterated on.

What replaces the window: **equal-length live-day windows anchored at the publish date, a
20-impression readability floor declared at publish time, and a third `unreadable` verdict.** The
full construction, its arithmetic, and the publish-date trade it forces are in **`DEC-0010`**.

## Corrections

| Claim as first written | Corrected to | Source |
|---|---|---|
| "live since 2026-09-20" (`decision`, `summary`, dispositions table) | First-publish **UNKNOWN**, bounded 2026-09-23..2026-09-25 | `2026-09-20-release.log` has no publish event; `v0.1.0` and `v0.2.0` tags both 2026-09-23; `CHANGELOG.md` dates the CWS pipeline 0.1.1 / 2026-09-23; `APP-41` recorded `first_published: null` |
| Kill criterion = 28-day before/after sum | Equal live-day windows + readability floor, per `DEC-0010` | `APP-59` |

This record was corrected in place rather than superseded because it had not merged to `main` when
the defects were found, so `decisions/` append-only does not apply to it and a
superseded-on-arrival record would have been noise. Neither correction disturbs the decision itself:
the reclassification turns on JSON Workbench being **past G7**, which every candidate date
satisfies, not on which day it shipped.

## Related

- `DEC-0003` — JSON Workbench runs the first factory loop; the authority the listing work proceeds under
- `DEC-0007` — the disproof checklist OPP-0001's answers must be re-mapped onto
- `DEC-0008` — why §10.4 is not recalibrated
- `DEC-0010` — the amended measurement: this record's falsifier could not fail, and is rebuilt there
- `research/opportunities/OPP-0001-json-workbench-activation.yaml` — the record being adjudicated
- Paperclip `APP-33` (this decision), `APP-40` (closed by it), `APP-36` (premise corrected), `APP-34` (the listing draft), `APP-59` (the falsifier defect), `APP-54` (the baseline capture)
