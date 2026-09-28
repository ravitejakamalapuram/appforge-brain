---
id: DEC-0007
title: "Ratify the reconstructed 14-question disproof checklist as canonical, rather than waiting for a brief nobody can open"
context: >
  The master plan (line 241) and CPO's AGENTS.md both make "all 14 questions" of the disproof
  checklist mandatory in every Opportunity record, and both cite "§9 of the brief" as the source.
  That brief is not committed anywhere: the CEO confirmed its absence from appforge-control,
  appforge-brain, appforge-kit and ~/git-personal/.claude, and confirmed that the master plan
  declares the field (§29d `disproof: Record<DisproofQuestion,string>`) without ever enumerating
  the questions. A mandatory gate criterion therefore exists only in a document no agent can read.
  CPO reconstructed the 14 questions from §29d and §10.3 and committed the reconstruction as
  research/opportunities/DISPROOF-CHECKLIST.md marked "AWAITING RATIFICATION", asking CEO to
  either produce the real brief or ratify the reconstruction.
question: "What is the canonical 14-question disproof checklist, given that the document it is supposed to come from does not exist in any repo?"
options:
  - "Wait for the founder to produce the original brief before any further Opportunity record is written."
  - "Ratify CPO's reconstruction as canonical now, with a review date and a board-visible flag — chosen."
  - "Have CEO write a different list from scratch, discarding the reconstruction."
  - "Drop the 14-question requirement from the gate entirely."
decision: >
  CPO's reconstruction in research/opportunities/DISPROOF-CHECKLIST.md is RATIFIED as the canonical
  disproof checklist for all Opportunity records from 2026-09-28. Its status line changes from
  "RECONSTRUCTION, AWAITING RATIFICATION" to canonical, and the master plan's line 241 reference
  should point at that file instead of "§9 of the brief". The 14 YAML keys in that file are the
  stable identifiers and records must use them verbatim so records stay diffable. If the original
  brief later surfaces and its questions differ materially, this decision is superseded and
  affected records are re-mapped at that point, not retroactively invalidated.
evidence:
  - "CEO independently confirmed the brief's absence: grep for the enumerated questions across appforge-control, appforge-brain and ~/git-personal/.claude returns only the master plan's reference at line 241 and CPO's own reconstruction. config/scoring.yaml, which §10.4 names as the home of the weights, is likewise absent from appforge-control."
  - "The reconstruction is derived from two artifacts that do exist and are authoritative: §29d's Opportunity type (every field the record must carry) and §10.3's G1/G2 acceptance criteria (everything the gate actually checks). Each of the 14 questions is mapped in the file to the §29d field it populates."
  - "Coverage check: the reconstruction's questions map onto problem, target_user, frequency, existing_workarounds, competitors, competition_strength, differentiation, distribution, monetization, estimated_revenue, estimated_cost, development_complexity, maintenance_complexity, technical_feasibility, policy_risk, security_risk and dependency_risk — every scored and structural field of the §29d record, plus §10.3's literal 'feature not product?' criterion as Q4."
  - "DEFECT FOUND, and it is why ratification cannot be deferred: OPP-0001's `disproof:` block uses a completely different set of 14 keys from the checklist committed one commit later. The checklist's own instruction to use its keys verbatim is already violated by the only record that exists. The record's set also omits any question covering `dependency_risk`, which the record scores 3 without a supporting answer."
  - "Paperclip rule #1 — never ask a human to do what an agent could do. 'The brief' is the input the master plan was written from; it may simply no longer exist. Blocking the product factory on the recovery of a possibly-lost document is an indefinite stall with no owner and no completion criterion."
reason: >
  Between two lists that both satisfy the gate, the one that is committed, readable, and mapped to
  the fields the gate checks beats one that cannot be opened. The gate's purpose is that an
  Opportunity record be systematically argued against on every axis before it consumes budget, and
  a reconstruction derived from §29d and §10.3 serves that purpose whether or not its wording
  matches the lost original. Deferring instead means every record written in the meantime is
  checked against whatever the writing agent reconstructed that day, which is strictly worse than
  one ratified list — and it is exactly what happened here, producing two incompatible 14-question
  sets in two consecutive commits.
  This is recorded as a decision rather than escalated as an approval because it is process, LOW
  risk, costs nothing and is reversible in one commit. It is flagged in the weekly board report so
  the founder can override with the real list at any time.
expected_result: >
  Every Opportunity record from 2026-09-28 uses the ratified keys verbatim, making records diffable
  against each other and making an unanswered question visible as a missing key rather than as a
  differently-worded one. OPP-0001 is re-mapped onto the ratified keys before any re-score, and its
  missing dependency_risk answer is written. Future gate reviews compare like with like.
risk: >
  The reconstruction may differ from the original brief's §9, in which case existing answers must
  be re-mapped later — cheap, because the mapping is mechanical and the substance of the answers
  does not change. Larger risk is ossification: a reconstructed list ratified by the CEO acquires
  an authority it has not earned by use. Mitigated by the 90-day review date and by treating the
  first three Opportunity records against it as a test of the list, not only of the opportunities.
owner: ceo
date: "2026-09-28"
review_date: "2026-12-28"
status: active
tags: [governance, product-factory, disproof, opportunity-gate, g2]
summary: "The 14-question disproof checklist cited as '§9 of the brief' exists in no repo, so CPO's reconstruction from §29d and §10.3 is ratified as canonical with its keys mandatory, rather than stalling the factory on a document nobody can open."
---

## Why this could not be deferred

The concrete cost of leaving it unratified is already visible. Two commits, eight hours apart, by
the same agent, produced two different 14-question sets:

| | OPP-0001 record (`d51812b`) | Ratified checklist (`9feec2d`) |
|---|---|---|
| Q1 | `q01_is_the_problem_real_outside_our_own_heads` | `q01_is_the_problem_real_or_only_asserted` |
| Q4 | `q04_is_the_existing_workaround_already_good_enough` | `q04_is_this_a_feature_rather_than_a_product` |
| Q10 | `q10_can_it_be_monetized` | `q10_is_it_technically_feasible` |
| dependency_risk | **no question covers it** | `q13_what_dependencies_could_disappear` |

Neither set is wrong on the merits; they are just not the same list, and no gate can be applied
consistently against a moving target. The record scores `dependency_risk: 3` with no disproof
answer behind it, which is precisely the kind of unargued number the checklist exists to prevent.

## What this obliges

- The ratified keys are mandatory and verbatim in the `disproof:` block of every Opportunity record.
- `DISPROOF-CHECKLIST.md`'s status line is updated from awaiting-ratification to canonical.
- The master plan's line 241 should cite the file, not "§9 of the brief". That edit is the
  founder's to make in the founder's document; this decision records what it should say.
- OPP-0001 is re-mapped before its next score, per `DEC-0006`.

## Related

- `research/opportunities/DISPROOF-CHECKLIST.md` — the ratified list
- `DEC-0006` — the G2 adjudication that surfaced the key mismatch
- Paperclip `APP-33`
