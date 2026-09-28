---
id: DEC-0008
title: "§10.4 is not recalibrated: a free product's score ceiling is 88, not below the threshold"
context: >
  In handing over OPP-0001, CPO flagged that §10.4 "may be structurally unable to pass a free
  product": monetization carries weight 15, §10.4's missing-evidence rule forces a score of 1 with
  no model, so a free product "starts 12 of 100 weighted points down" and, combined with a
  saturated category scoring low on competition-inverse, "may never reach 60 regardless of the
  growth case". CPO noted §10.4 calls for quarterly weight calibration against G9 outcomes and
  offered this as the first calibration input, explicitly flagging rather than adjusting the score
  to clear the bar. CEO was asked to rule on whether the monetization weight should be recalibrated
  or whether free products are intended to be gated out.
question: "Should §10.4's monetization weight be recalibrated because it penalises free products?"
options:
  - "Recalibrate: cut the monetization weight, or exempt free products from the missing-evidence rule."
  - "Leave §10.4 unchanged; the penalty is intended and the stated premise is arithmetically false — chosen."
  - "Raise the threshold for paid products instead, so the bar is comparable."
  - "Defer to the quarterly G9 calibration with no ruling now."
decision: >
  §10.4 is NOT recalibrated. The weights, the threshold of 60 and the missing-evidence rule all
  stand unchanged. The concern is logged as the first entry in the quarterly calibration file so it
  is revisited against real G9 outcomes rather than dismissed, but no weight moves on the strength
  of a single sub-threshold record. If the board wants free products treated as portfolio entries
  on strategic grounds, that is a change to the North Star, not a tweak to a prioritization rubric,
  and it is the founder's call to make in `strategy/`.
evidence:
  - "The stated premise is arithmetically false. A free product with monetization forced to 1 and every other criterion at 5 scores (75+100+50+75+15+25+50+25+15+10)/5 = 440/5 = 88.0 against a threshold of 60. The rubric is not structurally unable to pass a free product; it leaves 28 points of headroom above the bar."
  - "The monetization penalty costs a free product exactly 12 points of ceiling (60 weighted / 5), which is real but far from disqualifying."
  - "OPP-0001 does not fail because it is free. On the CEO's adjudicated set (DEC-0006) it scores 58.2, and the two criteria holding it down are distribution 2 and competition-inverse 2 — an unlaunched market position in a category owned by a 2M-user incumbent. Those are descriptions of the world, not artefacts of the rubric. With monetization scored a perfect 5 and nothing else changed, the record reaches 70.2; with monetization at 1 and distribution improved, it also clears. There is more than one route over the bar and the rubric is not the binding constraint."
  - "The monetization weight is doing the job the North Star requires. AppForge's North Star is portfolio contribution profit (§6.2, company/mission.md). A product with no monetization path contributes zero profit by construction, so a prioritization rubric that ranks it below an otherwise-equal product with a revenue path is functioning correctly, not malfunctioning."
  - "§10.4's own framing is 'prioritization only — never authorizes'. It ranks a queue; it does not veto work. DEC-0006 approves the listing rewrite on a sub-threshold score precisely because the rubric governs MVP-slot claims rather than ordinary operation of a live product. The pressure CPO felt from the threshold was pressure that the rubric was never meant to apply."
  - "§10.4 specifies calibration 'quarterly against G9 outcomes'. AppForge has zero G9 outcomes to date. Moving a weight now would be calibrating against one record's score instead of against realised results, which inverts the rule."
reason: >
  A rubric should be changed when it misranks reality, not when it returns an unwelcome number.
  Here it returned the right number for the right reasons: the product is free, has no distribution,
  and faces a dominant incumbent. Cutting the monetization weight would have made 58.2 into a pass
  without any fact about the world having changed, which is the definition of fitting the instrument
  to the answer — and per SOUL.md, recommending on the strength of a metric bent to suit is a CEO
  failure, not a CEO judgement call. CPO flagging this rather than quietly adjusting the score was
  correct behaviour and is the reason the rubric can be defended now.
expected_result: >
  §10.4 continues to rank opportunities on unchanged weights. The calibration question is answered
  once there are G9 outcomes to calibrate against, on realised data. Agents stop treating a
  sub-threshold score as a prohibition on operating a live product, which was the actual friction.
risk: >
  If AppForge's strategy does in fact intend a portfolio of free CWS extensions as a deliberate
  entry wedge, then the monetization weight will systematically under-rank the whole strategy and
  this decision will have preserved a genuine mismatch for up to a quarter. That would be a
  strategy/rubric misalignment worth fixing — but at the strategy layer, by the founder, not by an
  agent quietly lowering a weight. Flagged to the board for exactly this reason.
owner: ceo
date: "2026-09-28"
review_date: "2026-12-31"
status: active
tags: [governance, scoring, product-factory, opportunity-gate, portfolio]
summary: "§10.4's monetization weight stands: a free product can score up to 88 against a threshold of 60, so the claim that the rubric cannot pass one is false, and OPP-0001's 58.2 is held down by distribution and incumbency rather than by being free."
---

## The arithmetic the ruling turns on

| Scenario | Weighted | Score | vs threshold 60 |
|---|---|---|---|
| Free product, all other criteria perfect, monetization forced to 1 | 440 | **88.0** | +28 |
| OPP-0001 as adjudicated (`DEC-0006`) | 291 | 58.2 | −1.8 |
| OPP-0001 with monetization at a perfect 5, nothing else changed | 351 | 70.2 | +10.2 |

The first row settles the question. A free product's ceiling is 88, so "may never reach 60
regardless of the growth case" does not hold. The second and third rows show what is actually
binding: OPP-0001 is 1.8 points short, and monetization is one of several routes across the
gap — improving distribution from 2 is another, and it is the one this cycle's work attacks.

## Where the question is parked instead of dropped

§10.4 mandates quarterly calibration against G9 outcomes. There are none yet. The concern is
recorded as calibration input #1 and is revisited when JSON Workbench — or whichever product
reaches G9 first — produces an outcome to calibrate against. Revisiting on data is the rule;
revisiting on one uncomfortable score is not.

## Related

- `DEC-0006` — the OPP-0001 G2 adjudication this question arose from
- `DEC-0004` — the $100/month cap that makes contribution profit the operative constraint
- `company/mission.md`, `strategy/2026-q4-goals.md` — where a change of this kind would belong
- Paperclip `APP-33`
