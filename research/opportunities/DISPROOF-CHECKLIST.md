# The 14-question disproof checklist

**Status: CANONICAL.** Ratified by CEO on 2026-09-28 under `DEC-0007` (Paperclip APP-33).
Written as a reconstruction by CPO under APP-26; ratified because the brief it reconstructs exists
in no repo, and one readable list beats an unopenable one. **Reconciled against §10.4 on 2026-09-28
under APP-67**; the question→criterion map below is part of the canonical artifact, not commentary
on it.

The 14 YAML keys below are mandatory and verbatim in the `disproof:` block of every Opportunity
record. **Records reference this file; they do not restate the questions.** A record carrying its
own private copy of the list is a defect — that is how three incompatible 14-question sets came to
exist (`DEC-0007`), and the reference rule is what stops a fourth.

If the original brief surfaces and differs materially, `DEC-0007` is superseded and affected records
are re-mapped then.

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
   founder's to make in the founder's own document; `DEC-0007` records what it should say, and
   APP-67 routes it for ratification. **Still owed.**
2. Records no longer need to caveat their answers as "complete against the reconstruction".
   [OPP-0001](./OPP-0001-json-workbench-activation.yaml) predated ratification and used a
   *different* 14-key set — including no question covering `dependency_risk`, which it nonetheless
   scored. **Done:** it was re-mapped onto these keys under APP-49, with `q13` written for the
   first time and `q12` separated out of the combined platform-and-policy answer it had been
   sharing with `q11`.

## The questions

Each question maps to the §29d field(s) it populates and the §10.4 criteria it feeds. The YAML keys
are the stable identifiers; use them verbatim in the `disproof:` block of an Opportunity record so
records stay diffable.

| # | YAML key | Question | Populates (§29d) | Feeds (§10.4) |
|---|---|---|---|---|
| 1 | `q01_is_the_problem_real_or_only_asserted` | Is the problem real, or only asserted? What observation would distinguish the two? | `problem` | user pain, demand evidence |
| 2 | `q02_who_has_it_and_how_often` | Who specifically has it, and how often? Is `frequency` measured or estimated? | `target_user`, `frequency` | user pain, demand evidence |
| 3 | `q03_what_do_they_do_today_and_is_it_good_enough` | What do they do today, and is that already good enough? | `existing_workarounds` | user pain |
| 4 | `q04_is_this_a_feature_rather_than_a_product` | Is this a feature rather than a product? (G2 requires this to be "no".) | gate criterion | **none — §10.3 gate test** |
| 5 | `q05_who_already_solves_it_and_how_strong_are_they` | Who already solves it, and how strong are they? (≥3 competitors, or "none found" plus a search log.) | `competitors`, `competition_strength` | competition (inv), demand evidence |
| 6 | `q06_is_the_differentiation_copyable` | Is the differentiation copyable? What is the actual moat, if any? | `differentiation` | defensibility |
| 7 | `q07_how_would_anyone_ever_find_this` | How would anyone ever find this? | `distribution` | distribution |
| 8 | `q08_will_anyone_pay_and_how` | Will anyone pay, how, and against what comparable? | `monetization`, `estimated_revenue` | monetization |
| 9 | `q09_what_does_it_cost_to_build_and_maintain` | What does it cost to build and to maintain? | `estimated_cost`, `development_complexity`, `maintenance_complexity` | dev cost (inv), maintenance (inv) |
| 10 | `q10_is_it_technically_feasible` | Is it technically feasible with what exists today? | `technical_feasibility` | dev cost (inv) |
| 11 | `q11_what_policy_or_store_rules_could_kill_it` | What policy or store rules could kill it? | `policy_risk` | platform risk (inv) |
| 12 | `q12_what_is_the_security_privacy_exposure` | What is the security/privacy exposure? | `security_risk` | security risk (inv) |
| 13 | `q13_what_dependencies_could_disappear` | What dependencies could disappear, and what happens when they do? | `dependency_risk` | maintenance (inv), platform risk (inv) |
| 14 | `q14_what_would_prove_us_wrong_and_did_we_look` | What would prove us wrong — and did we actually go looking for it? | the whole record | the missing-evidence rule, across all ten |

## The §10.4 map, read the other way

§10.4 names exactly ten scored criteria, whose weights sum to 100 with no residue. Every one of
them has at least one question behind it:

| §10.4 criterion | Weight | Produced by |
|---|---|---|
| user pain | 15 | Q1, Q2, Q3 |
| demand evidence | 20 | Q1, Q2, Q5, Q14 |
| competition (inverse) | 10 | Q5 |
| distribution | 15 | Q7 |
| monetization | 15 | Q8 |
| dev cost (inverse) | 5 | Q9, Q10 |
| maintenance (inverse) | 10 | Q9, Q13 (runtime axis) |
| defensibility | 5 | Q6 |
| security risk (inverse) | 3 | Q12 |
| platform risk (inverse) | 2 | Q11, Q13 (channel axis) |

**No orphans in either direction.** Every criterion is produced by a question; every question but
one feeds a criterion. The exception is deliberate:

- **Q4** feeds §10.3's literal G2 criterion, `"feature not product?" = no`. It is a pass/fail gate
  test and does not belong in a weighted ranking — a weight would let a strong score elsewhere buy
  past it. It lands on the gate, not on the score.

Two §29d fields carry no criterion of their own, which is not the same as being unasked:

- **`technical_feasibility`** (Q10) is mandatory, bounds the dev-cost score, and has no weight.
- **`dependency_risk`** (Q13) is mandatory, and its *evidence* is scored twice over — the runtime
  axis under maintenance (inverse), the channel axis under platform risk (inverse) — while the
  field itself carries no weight and instead feeds the pre-registered kill criteria a G3 record
  must supply.

A field can be mandatory without being weighted. §10.4 ranks a queue; §10.2 and §10.3 decide
whether a record may advance at all. **Do not "fix" a structural field by giving it a weight** —
that is a recalibration, and `DEC-0008` declined those.

## Ruling on `dependency_risk` (APP-67)

**KEEP `dependency_risk` as a mandatory §29d field. Add nothing to §10.4. Change no weight.**

APP-67 reported that `dependency_risk` is "scored by §10.4 but asked by nobody". Checked against
the sources, neither half survives:

1. **§10.4 does not score it.** §10.4 enumerates ten criteria — user pain 15, demand evidence 20,
   competition (inv) 10, distribution 15, monetization 15, dev cost (inv) 5, maintenance (inv) 10,
   defensibility 5, security risk (inv) 3, platform risk (inv) 2 — summing to 100. Dependency is
   not among them. **There is nothing in §10.4 to drop**, so "drop it from §10.4" was never an
   available option.
2. **The question already exists here.** Q13 has populated `dependency_risk` since this file was
   first committed under APP-26. The gap was never in the checklist; it was in `OPP-0001`, which
   used its own 14 keys, none of which asked about dependencies, and set `dependency_risk: 3`
   anyway. That is a record defect, and APP-49 fixed it by re-mapping the record onto these keys.
3. **Its evidence is already scored.** Q13's two axes land on maintenance (inverse) and platform
   risk (inverse), as the map above records and as `OPP-0001`'s own scoring block already cites.
   The number was never unsupported in the live record; what was missing was this map saying so.
4. **Adding a dependency criterion would be a recalibration.** It would mean inventing a weight and
   renormalising the other ten — exactly the change `DEC-0008` declined one day earlier, and
   explicitly out of bounds for a consistency fix.

So: nothing is dropped, nothing is added, no weight moves, and the reason `dependency_risk` looked
unsupported is recorded here so the next reader does not re-open it.


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
- **One answer may not silently serve two criteria.** Q11 and Q12 are separate questions because
  `policy_risk` and `security_risk` are separately weighted. `OPP-0001` scored both from a single
  combined platform-and-policy paragraph, which is how a criterion acquires a number nobody argued
  for specifically. If an answer is doing double duty, split it — and where a single answer
  legitimately feeds two criteria, as Q13 does, say which axis feeds which.

## Amendments owed by the founder's master plan

Neither edit is an agent's to make. Both are recorded here so the diff is stated plainly and the
documents can be brought into agreement when the board rules.

1. **Line 241** — replace the citation `"§9 of brief"` with
   `appforge-brain/research/opportunities/DISPROOF-CHECKLIST.md`. Owed since `DEC-0007`, not yet
   executed.
2. **§10.4** — append: *"These ten criteria are the complete scored set; their weights sum to 100.
   `technical_feasibility` and `dependency_risk` are mandatory §29d fields that carry no criterion
   of their own, and §10.3's 'feature not product?' test is a gate test, not a weighted criterion.
   The question→criterion map in `appforge-brain/research/opportunities/DISPROOF-CHECKLIST.md` is
   authoritative for which disproof question feeds which criterion."* **No weight, threshold or
   floor changes.**

Routed for board ratification under APP-67. Until ratified, this file is the operative map and the
master plan's silence on it is the discrepancy being carried openly.

## Known gap, not in scope here

§10.4 names `config/scoring.yaml` as the home of the weights. **That file does not exist in
`appforge-control`** — the weights live only in the master plan's prose, which is the same failure
mode as the checklist itself and is why the ten criteria had to be recovered from a sentence. Not
fixed here because `config/` is control-plane and not CPO's to write; raised separately.


## Related

- `DEC-0007` — ratification of this list
- `DEC-0008` — why no weight moves here
- `DEC-0006` — the G2 adjudication that surfaced the key drift
- Paperclip `APP-33`, `APP-49`, `APP-61`, `APP-67`
