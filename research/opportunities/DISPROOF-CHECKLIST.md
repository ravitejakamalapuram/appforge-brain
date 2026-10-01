# The 14-question disproof checklist

**Status: CANONICAL.** Ratified by CEO on 2026-09-28 under `DEC-0007` (Paperclip APP-33).
Written as a reconstruction by CPO under APP-26; ratified because the brief it reconstructs exists
in no repo, and one readable list beats an unopenable one. The 14 YAML keys below are mandatory and
verbatim in the `disproof:` block of every Opportunity record. If the original brief surfaces and
differs materially, `DEC-0007` is superseded and affected records are re-mapped then.

## Why this file exists

`AGENTS.md` (CPO) and the master plan (line 241) both require that "all 14 questions" of the
disproof checklist be answered in every Opportunity record, and both cite "§9 of the brief" as the
source. **That brief is not committed to any repo.** It is absent from `appforge-control`,
`appforge-brain`, `appforge-kit` and `~/git-personal/.claude`. The master plan references the
checklist but never reproduces it.

That is a live governance problem, not a cosmetic one: a mandatory gate criterion that exists only
in a document nobody can open cannot be applied consistently, and every Opportunity record written
before it is fixed is checked against whatever the writing agent reconstructed that day.

The 14 questions below were reconstructed by working backwards from two things the master plan
*does* contain:

- **§29d**, the `Opportunity` type — which enumerates every field the record must carry.
- **§10.3**, the G1/G2 acceptance criteria — which enumerate what the gate actually checks.

Between them these cover every field the gate reads, so a record that answers all 14 below will
satisfy the gate whether or not the wording matches §9 exactly.

## What CEO decided

Option 2, per `DEC-0007`: **this reconstruction is ratified as canonical.** The reasoning is in the
decision record; the short version is that the brief may simply no longer exist, and blocking the
product factory on recovering a lost document is an indefinite stall with no owner.

Two consequences:

1. The master plan's line 241 should cite this file rather than "§9 of the brief". That edit is the
   founder's to make in the founder's own document; `DEC-0007` records what it should say.
2. Records no longer need to caveat their answers as "complete against the reconstruction".
   [OPP-0001](./OPP-0001-json-workbench-activation.yaml) predates ratification and uses a
   *different* 14-key set than the one below — including no question covering `dependency_risk`,
   which it nonetheless scores. It must be re-mapped onto these keys before its next score.

## The questions

Each question maps to the §29d field(s) it populates. The YAML keys are the stable identifiers;
use them verbatim in the `disproof:` block of an Opportunity record so records stay diffable.

| # | YAML key | Question | Populates (§29d) |
|---|---|---|---|
| 1 | `q01_is_the_problem_real_or_only_asserted` | Is the problem real, or only asserted? What observation would distinguish the two? | `problem` |
| 2 | `q02_who_has_it_and_how_often` | Who specifically has it, and how often? Is `frequency` measured or estimated? | `target_user`, `frequency` |
| 3 | `q03_what_do_they_do_today_and_is_it_good_enough` | What do they do today, and is that already good enough? | `existing_workarounds` |
| 4 | `q04_is_this_a_feature_rather_than_a_product` | Is this a feature rather than a product? (G2 requires this to be "no".) | gate criterion |
| 5 | `q05_who_already_solves_it_and_how_strong_are_they` | Who already solves it, and how strong are they? (≥3 competitors, or "none found" plus a search log.) | `competitors`, `competition_strength` |
| 6 | `q06_is_the_differentiation_copyable` | Is the differentiation copyable? What is the actual moat, if any? | `differentiation` |
| 7 | `q07_how_would_anyone_ever_find_this` | How would anyone ever find this? | `distribution` |
| 8 | `q08_will_anyone_pay_and_how` | Will anyone pay, how, and against what comparable? | `monetization`, `estimated_revenue` |
| 9 | `q09_what_does_it_cost_to_build_and_maintain` | What does it cost to build and to maintain? | `estimated_cost`, `development_complexity`, `maintenance_complexity` |
| 10 | `q10_is_it_technically_feasible` | Is it technically feasible with what exists today? | `technical_feasibility` |
| 11 | `q11_what_policy_or_store_rules_could_kill_it` | What policy or store rules could kill it? | `policy_risk` |
| 12 | `q12_what_is_the_security_privacy_exposure` | What is the security/privacy exposure? | `security_risk` |
| 13 | `q13_what_dependencies_could_disappear` | What dependencies could disappear, and what happens when they do? | `dependency_risk` |
| 14 | `q14_what_would_prove_us_wrong_and_did_we_look` | What would prove us wrong — and did we actually go looking for it? | the whole record |

## How to answer them

Per CPO `SOUL.md`, the checklist is worked from the start, not backfilled to justify a conclusion
already reached. Three rules follow from that:

- **Q14 is not a formality.** Pre-register the disconfirmers *before* searching, then record what
  the search actually returned — including the ones that came back false. A Q14 answer that finds
  no disconfirming evidence is usually evidence that nobody looked.
- **An estimate must be labelled an estimate.** "Weekly" with no interviews, survey or search-volume
  data behind it is a judgement. Say so. §10.4's missing-evidence rule scores absent evidence 1;
  dressing a guess up as a finding defeats the gate.
- **Answer in both directions.** Q4 in particular: the product can be a product while the
  *opportunity* as written on the intake ticket is a task list with an unverified premise attached.
  Both halves belong in the answer.
