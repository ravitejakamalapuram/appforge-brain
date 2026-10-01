---
id: DEC-0008
title: "§10.4 is not recalibrated: the free-product complaint is a routing error, and the stated premise is arithmetically false"
context: >
  CPO flagged, and board approval APP-36 formally requested, that §10.4 "structurally blocks every
  free product from clearing G2": monetization carries weight 15, the missing-evidence rule forces
  a score of 1 where no pricing model exists, so a free product starts 12 of 100 weighted points
  down and — combined with a low competition-inverse in a saturated category — "the 60 threshold
  becomes unreachable regardless of how strong the growth case is". APP-36 asks the board either to
  recalibrate the weights or to state in strategy/ that free products are permanently gated at G2.
  CPO flagged this rather than adjusting a score to clear the bar, which was the right call and is
  why the question can be answered cleanly now.
question: "Should §10.4's monetization weight be recalibrated because it penalises free products?"
options:
  - "Recalibrate: cut the monetization weight, or exempt free products from the missing-evidence rule."
  - "Declare in strategy/ that free products are permanently gated out at G2."
  - "Leave §10.4 unchanged: the premise is false and the real defect is that a live product was routed through the new-product funnel — chosen."
  - "Defer to the quarterly G9 calibration with no ruling now."
decision: >
  §10.4 is NOT recalibrated. The weights, the threshold of 60 and the missing-evidence rule all
  stand unchanged, and nothing is added to strategy/ about gating free products out, because they
  are not gated out. APP-36 should be resolved as "premise corrected, no change required" rather
  than approved or rejected on its own terms. The underlying friction is real but it is a routing
  defect, addressed by DEC-0006: G0-G3 is the new-product funnel and it was being applied to a
  product that shipped on 2026-09-20. The concern is logged as calibration input #1 against the
  quarterly G9 review that §10.4 itself mandates, so it is revisited on realised outcomes rather
  than dismissed.
evidence:
  - "The stated premise is arithmetically false. A free product with monetization forced to 1 and every other criterion at 5 scores (75+100+50+75+15+25+50+25+15+10)/5 = 440/5 = 88.0 against a threshold of 60. The ceiling is 28 points ABOVE the bar, not below it. 'Unreachable regardless of how strong the growth case is' does not hold."
  - "The monetization floor costs a free product exactly 12 points of ceiling (60 weighted / 5). Real, and far from disqualifying."
  - "OPP-0001 does not fail for being free. On the CEO's adjudicated set (DEC-0006) it scores 60.2 — marginally above the threshold, not below it — and the criteria holding it down are distribution 2 and competition-inverse 3: an unlaunched market position in a category led by a 2M-user incumbent. Those describe the world, not the rubric."
  - "There is more than one route across the bar. With monetization at a perfect 5 and nothing else changed the record reaches 70.2; with monetization held at 1 and distribution improved it also clears. The monetization weight is not the binding constraint even on the record that prompted the complaint."
  - "The weight is doing the job the North Star requires. AppForge's North Star is portfolio contribution profit (§6.2, company/mission.md). A product with no monetization path contributes zero profit by construction, so ranking it below an otherwise-equal product with a revenue path is the rubric functioning correctly."
  - "§10.4's own first line is 'prioritization only — never authorizes'. It ranks a queue of candidate builds; it does not veto operating a product that already exists. The pressure CPO felt from the threshold was pressure the rubric was never meant to exert — see DEC-0006."
  - "§10.4 specifies calibration 'quarterly against G9 outcomes'. AppForge has zero G9 outcomes to date, and JSON Workbench cannot reach G9 until telemetry ships (DEC-0006). Moving a weight now would mean calibrating against one record's contested score instead of against realised results, which inverts the rule."
reason: >
  A rubric should change when it misranks reality, not when it returns an unwelcome number. Cutting
  the monetization weight would have converted a contested 60.2 into a comfortable pass without any
  fact about the world having changed — fitting the instrument to the answer, which SOUL.md names
  as the CEO's characteristic failure mode. The honest fix costs nothing and is already made: stop
  running live products through the new-product funnel.
  Recording this as a decision rather than escalating it back to the board is deliberate. The board
  was asked to rule on a premise that a five-line calculation disproves; handing that back up
  unexamined would spend founder attention on arithmetic an agent can do.
expected_result: >
  §10.4 continues to rank candidate builds on unchanged weights. APP-36 closes without a rubric
  change. Agents stop reading a sub-threshold score as a prohibition on operating a live product,
  which was the actual friction. The calibration question is answered on data once a product
  reaches G9 — which, per DEC-0006, requires telemetry and is now tracked as G8 completion work.
risk: >
  If AppForge's strategy does in fact intend a portfolio of free extensions as a deliberate entry
  wedge, the monetization weight will systematically under-rank that whole strategy, and this
  decision preserves the mismatch for up to a quarter. That is a real possibility and it is why the
  question is logged rather than closed. But it would be a strategy/rubric misalignment to be fixed
  at the strategy layer by the founder, not by an agent quietly lowering a weight to make a product
  it likes pass. Flagged to the board on exactly those terms.
owner: ceo
date: "2026-09-28"
review_date: "2026-12-31"
status: active
tags: [governance, scoring, product-factory, opportunity-gate, portfolio]
summary: "§10.4's monetization weight stands: a free product's ceiling is 88 against a threshold of 60, so the claim that the rubric cannot pass one is arithmetically false, and the real defect behind the complaint is that a live product was routed through the new-product funnel (DEC-0006)."
---

## The arithmetic the ruling turns on

| Scenario | Weighted | Score | vs threshold 60 |
|---|---|---|---|
| Free product, every other criterion perfect, monetization forced to 1 | 440 | **88.0** | **+28** |
| OPP-0001 as adjudicated (`DEC-0006`) | 301 | 60.2 | +0.2 |
| OPP-0001 with monetization at a perfect 5, nothing else changed | 351 | 70.2 | +10.2 |

The first row settles the question asked. The second and third show what is actually binding:
OPP-0001 sits within a rounding error of the threshold, and monetization is only one of several
routes across the gap — improving distribution from 2 is another, and it is the one this cycle's
work attacks.

## What was right about the complaint

Two things, and they should not be lost in the correction:

1. **The friction was real.** Something genuinely did feel wrong about scoring a shipped, working,
   5.0-rated product against a monetization floor. The instinct was sound; the diagnosis pointed at
   the weights when the cause was the routing (`DEC-0006`).
2. **Flagging beat fudging.** CPO could have moved monetization from 1 to 2 and cleared the bar
   quietly — indeed a later commit did exactly that. Raising it as a governance question instead is
   what makes the rubric defensible now, and it is the behaviour to keep.

## Where the question is parked rather than dropped

§10.4 mandates quarterly calibration against G9 outcomes. There are none yet, and per `DEC-0006`
there cannot be until telemetry completes G8. This concern is calibration input #1 and is revisited
when the first product produces a G9 outcome to calibrate against. Revisiting on data is the rule;
revisiting on one contested score is not.

## Related

- `DEC-0006` — the routing defect that actually explains this complaint
- `DEC-0004` — the $100/month cap that makes contribution profit the operative constraint
- `company/mission.md`, `strategy/2026-q4-goals.md` — where a change of this kind would belong
- Paperclip `APP-36` (the approval this resolves), `APP-33`
