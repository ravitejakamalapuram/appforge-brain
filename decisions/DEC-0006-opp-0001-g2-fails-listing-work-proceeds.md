---
id: DEC-0006
title: "OPP-0001 fails G2 at 58.2; the listing rewrite proceeds anyway, on DEC-0003's authority rather than G3's"
context: >
  CPO researched OPP-0001 (JSON Workbench) and handed the CEO a G2 recommendation on Paperclip
  APP-33. The handoff reported score 56.6 and G2 FAIL against the §10.4 threshold of 60. On
  review the CEO found that CPO had continued working after the handoff and produced two further
  commits on an unpushed local branch (d51812b, 9feec2d) in which the same opportunity scores
  65.2 and G2 PASS. The decision therefore had to be made against two conflicting artifacts, one
  of which was not in the pull request the CEO was asked to review, and the 43-weighted-point
  swing between them crosses the threshold in the favourable direction.
question: "Does OPP-0001 clear G2, and if not, does the recommended listing-copy change happen anyway?"
options:
  - "Accept 56.6/FAIL as handed over, archive OPP-0001 per §10.3's G2 failure path, and stop."
  - "Accept the newer 65.2/PASS, propose G3 to the board, and let the higher score stand unreviewed."
  - "Re-derive the score from the evidence, rule on each revision separately, and decide the listing work on its own authority — chosen."
  - "Send it back to CPO for a third scoring pass before deciding anything."
decision: >
  G2 FAILS at an adjudicated score of 58.2. OPP-0001 does not proceed to G3 and no board G3
  approval is requested. Separately and on different authority, the store-listing keyword rewrite
  (the record's step S1) is APPROVED to proceed now as a LOW-risk growth-cycle change to an
  already-launched product under DEC-0003, not as an MVP scope item under G3. Telemetry (S2) is
  NOT approved here and is escalated as its own opportunity. The distribution post (S3) is
  deferred until S1 has been measured, so the two interventions do not confound each other.
evidence:
  - "§10.4 weights verified against the master plan: user pain 15, demand evidence 20, competition-inverse 10, distribution 15, monetization 15, dev cost-inverse 5, maintenance-inverse 10, defensibility 5, security risk-inverse 3, platform risk-inverse 2. Sum 100. Score = Sum(w*s)/5, threshold 60."
  - "Both CPO scores are arithmetically correct for the scores they assert: 283/5 = 56.6 and 326/5 = 65.2. The disagreement is in the scores, not the sums. The CEO recomputed all three sets independently."
  - "demand_evidence 3 -> 4 (+20 weighted) is ACCEPTED. The later version adds two genuinely new independent evidence classes absent from the earlier one: E2, a commercial content market on the 'open a large JSON file' query spanning five unaffiliated vendors, and E3, a third-party author who in August 2026 wrote JSON Workbench's exact four-criteria positioning before JSON Workbench was public. §10.3's G1 bar of three independent demand signals is genuinely met."
  - "competition_inverse 2 -> 4 (+20 weighted) is REJECTED. No new evidence was added; the same fact (~2.5M users across five formatters, a 2M-user leader) is simply read the opposite way. It also contradicts two of the record's own fields: competition_strength 3, and distribution 2 whose stated evidence is that 'CWS search ranking favours 2M-user incumbents'. A 2M-user incumbent holding default category ranking is the single largest obstacle to the very thing being proposed, which is being found in store search. Held at 2."
  - "monetization 1 -> 2 (+15 weighted) is REJECTED. §10.4 is mechanical: 'missing evidence => score 1.' The record itself states free, no payment provider wired, no pricing block, no willingness-to-pay signal, and monetization 'explicitly OUT of scope for this cycle'. One named comparable (Dadroit) is evidence that someone else monetizes the job, not evidence that we can. Held at 1."
  - "maintenance_inverse 4 -> 3 (-10) and platform_risk_inverse 3 -> 2 (-2) are ACCEPTED. Both are self-penalising corrections against real facts (12.07 MiB package, DuckDB-WASM/jq-web/Monaco, MV3 churn, single distribution channel). That CPO revised two criteria downward is material evidence that the upward revisions were reasoning rather than score-chasing."
  - "Adjudicated set: 4/4/2/2/1/5/3/3/4/2 => weighted 291 => 58.2. Below 60 by 1.8 points."
  - "G3's acceptance criteria (§10.3) are 'scope, budget, kill criteria pre-registered, slot plan' for an MVP. JSON Workbench is already past G8: released 2026-09-20, 0.2.0 PUBLISHED, CWS item higmlhleblpmdogjccpmjlnilpmhohal. It is not an MVP awaiting approval, so G3 is not the gate that governs editing its listing text."
  - "DEC-0003 already authorises exactly this loop on exactly this product, and 2026-q4-goals O2 commits to JSON Workbench completing it. Archiving OPP-0001 outright per §10.3's G2 failure path would put the factory in direct conflict with a standing Q4 objective."
reason: >
  Two things are true at once and the honest decision holds both. First, the opportunity is weak
  on the axes §10.4 exists to measure: it is free, it has no distribution, and it sits in a
  category owned by a 2M-user incumbent. 58.2 is a fair reading and G2 fails. Second, §10.4's own
  first line is 'prioritization only - never authorizes', so a sub-threshold score is a statement
  about queue position and MVP-slot claims, not a prohibition on editing the store listing of a
  product that shipped eight days ago. Conflating the two would let a prioritization rubric veto
  ordinary operation of a live product, which is not what the rubric is for.
  On the process point: a score that moves 43 weighted points across the pass threshold, on an
  unpushed branch, in the favourable direction, after the handoff was already sent, is exactly the
  pattern the CEO must not rubber-stamp - and the CEO's own failure mode per SOUL.md is
  recommending on vanity metrics. Re-deriving it rather than picking one of the two supplied
  numbers is the whole job. The result lands in the same place CPO originally recommended, which
  is worth stating plainly: this confirms CPO's first verdict on corrected arithmetic, it does not
  overturn CPO's judgement.
expected_result: >
  The listing rewrite ships within roughly 0.1 builder-weeks at effectively zero marginal cost and
  is measured on CWS Developer Dashboard impressions (primary) and installs (secondary), weekly,
  four weeks after versus four weeks before, with no telemetry and no privacy change. If weekly
  impressions do not at least double in four weeks, the 'discovery is a copy problem' hypothesis
  is dead, the constraint is off-store distribution, and that is recorded as a DEC rather than
  iterated on. OPP-0001 stays open at G2 with a re-score due once impressions data exists, because
  distribution is one of the two criteria holding the score down and it is the one this work moves.
risk: >
  Chief risk is that 'approved on DEC-0003's authority rather than G3's' becomes a general-purpose
  bypass for the scoring gate. Bounded deliberately: this applies only to listing/metadata text on
  an already-PUBLISHED product, only at LOW risk, only with no code, no permission and no data-
  collection change, and it does not extend to S2 or S3. Anything touching permissions, collected
  data or the privacy claim goes to the board, without exception. Secondary risk: a CWS metadata
  change may still trigger a listing review; CTO/Release must confirm the review path before
  publish rather than assuming the 'no re-review' claim in the record. Third: a four-week
  impressions read on a base this small may be too noisy to call cleanly, which is a reason to
  pre-register the threshold now and not move it later.
owner: ceo
date: "2026-09-28"
review_date: "2026-11-09"
status: active
tags: [json-workbench, opportunity-gate, g2, scoring, product-factory, opp-0001]
summary: "OPP-0001 scores 58.2 on CEO re-derivation and fails G2; the store-listing keyword rewrite proceeds anyway as LOW-risk growth-cycle work under DEC-0003, while telemetry escalates separately and the distribution post waits for the listing result."
---

## How the three score sets compare

Weights are §10.4's and sum to 100. Score = Σ(w·s)/5, threshold 60.

| Criterion | w | 51bc074 handoff | d51812b unpushed | **CEO adjudicated** | Ruling |
|---|---|---|---|---|---|
| user pain | 15 | 4 | 4 | **4** | unchanged |
| demand evidence | 20 | 3 | 4 | **4** | accept (+20) — new E2/E3 |
| competition (inv) | 10 | 2 | 4 | **2** | reject — re-read, not re-measured |
| distribution | 15 | 2 | 2 | **2** | unchanged; the real weak spot |
| monetization | 15 | 1 | 2 | **1** | reject — §10.4 missing-evidence rule |
| dev cost (inv) | 5 | 5 | 5 | **5** | unchanged |
| maintenance (inv) | 10 | 4 | 3 | **3** | accept (−10), self-penalising |
| defensibility | 5 | 3 | 3 | **3** | unchanged |
| security risk (inv) | 3 | 4 | 4 | **4** | unchanged |
| platform risk (inv) | 2 | 3 | 2 | **2** | accept (−2), self-penalising |
| **weighted** | 100 | 283 | 326 | **291** | |
| **score** | | 56.6 FAIL | 65.2 PASS | **58.2 FAIL** | |

Two of the five revisions are accepted, two are accepted as downward corrections, one pair
(competition-inverse and monetization, +35 weighted between them) is rejected. Rejecting those two
is what keeps the result below the line.

## What is and is not approved

| Step | Disposition | Authority |
|---|---|---|
| S1 — listing title + short-description keyword rewrite | **Approved now** | DEC-0003 + Q4 O2; LOW risk, CEO work-plan authority |
| S2 — `app_installed` / `feature_used` telemetry | **Not approved** — escalated as its own opportunity | Board; touches the privacy claim, store disclosure, re-review |
| S3 — distribution post to DEV / r/dataengineering | **Deferred** until S1 is measured | Growth, after the impressions read |

S3 is deferred on experiment-design grounds, not on risk grounds. The record's falsifier (a) fires
both S1 and S3 and then measures installs, which cannot attribute the result to either. Running S1
alone against impressions is readable; running both against installs is not.

## Measurement, corrected

The earlier version of this record had the better experiment and the later one regressed it. The
pre-registered measure is **impressions**, not installs: the hypothesis is specifically "we are
invisible to the query the audience types", and impressions measure reach directly while installs
conflate reach with appeal. And "triple installs in 28 days" off a base of three users is nine
users — indistinguishable from noise. **Doubling weekly impressions in four weeks** is the
criterion; installs are reported as a secondary read.

## Related

- `research/opportunities/OPP-0001-json-workbench-activation.yaml` — the record being adjudicated
- `DEC-0003` — JSON Workbench runs the first factory loop; the authority S1 proceeds under
- `DEC-0004` — the $100/month cap; S1 is ≈$0 marginal
- `DEC-0007` — the disproof checklist this record's answers must be re-mapped onto
- `DEC-0008` — why §10.4 is not being recalibrated to rescue this score
- Paperclip `APP-33` — the handoff and this decision
