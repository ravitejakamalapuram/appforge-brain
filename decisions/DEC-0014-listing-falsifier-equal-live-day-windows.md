---
id: DEC-0014
title: "DEC-0006's listing falsifier is rebuilt on equal-length live-day windows with a pre-registered readability floor, because the 28-day before/after construction could not register a failure"
context: >
  QA filed APP-59 against DEC-0006's governing kill criterion — "weekly CWS impressions, four weeks
  after versus four weeks before the listing change, must at least double" — after Analyst's date
  correction on APP-54 refuted the 2026-09-20 first-publish date that DEC-0006 asserts. With
  first-publish at 2026-09-23 or later and the rewrite unpublished as of 2026-09-28, the "four weeks
  before" window contains roughly five days on which a listing existed at all and twenty-three days
  on which there was no item to impress. Those twenty-three days are not low impressions; they are
  structurally zero. A 28-day sum over five live days compared against a 28-day sum over twenty-eight
  live days clears "at least double" by a factor of about 5.6 with the rewrite doing nothing at all.
  DEC-0006 had pre-registered this threshold specifically so it could not be moved later. It turns
  out the threshold was never the problem: the window construction underneath it was incapable of
  producing a failure, which means the criterion was not a falsifier at all.
question: "How should the listing-rewrite falsifier be constructed so that it can actually register a failure, and what does that construction cost?"
options:
  - "Leave DEC-0006's criterion as written, on the grounds that the threshold was pre-registered and pre-registered thresholds must not move."
  - "Per-live-day mean over whatever live pre-days exist, changing nothing else — QA's option 1, the cheapest fix."
  - "Equal-length live-day windows anchored at the publish date, with a pre-registered readability floor and a third `unreadable` verdict fixed before post data exists — chosen."
  - "Retire the before/after framing entirely and pre-register an absolute floor on post-change weekly impressions."
  - "Delay the publish until twenty-eight live pre-days exist, changing nothing else."
decision: >
  DEC-0006's "The measurement, settled" section is REPLACED by the construction below. The 2x
  threshold is NOT moved — it is the window that is rebuilt, and rebuilt in the direction that makes
  the criterion harder to satisfy, not easier.
  The unit of measurement is mean daily CWS impressions over LIVE days, never a window sum. A day is
  live only if the listing was published on it. The pre-window is the N live days immediately
  preceding the rewrite publish date P; the post-window is the N live days beginning three days after
  P. N is identical on both sides by construction. The first seven live days after first-publish F are
  excluded from the pre-window as launch novelty, and the three days after P are excluded from the
  post-window as CWS re-index propagation. This bounds N at min(28, P - F - 7), and N must be at
  least 14 for the read to be treated as decision-grade.
  A readability floor is pre-registered: the pre-window must total at least 20 impressions for a 2x
  ratio to be read off it. This floor is evaluated and RECORDED AT P, before any post-window data
  exists, which is what keeps the third verdict from becoming an escape hatch.
  Three verdicts, not two. PASS: post mean daily impressions >= 2x pre mean daily impressions.
  FAIL: post mean < 2x pre mean, with the pre-window over the floor — the "discovery is a copy
  problem" hypothesis is dead, the constraint is off-store distribution, recorded as a DEC and not
  iterated on, exactly as DEC-0006 specified. UNREADABLE: pre-window total below 20, declared at P —
  the hypothesis is neither confirmed nor killed on this evidence, and a post-only absolute floor
  pre-registered at P governs instead.
  DEC-0006's refuted first-publish date is corrected in the same change: first-publish is UNKNOWN,
  bounded to 2026-09-23..2026-09-25, and F defaults to the conservative 2026-09-25 if APP-54 cannot
  settle it. Installs remain a secondary read, unchanged.
  What this decision does NOT settle, because it is not the CEO's to settle: the publish date P. The
  construction makes P a real trade rather than a free choice, and that trade goes to the board.
evidence:
  - "The refuted date, verified independently by CEO for this decision: json-workbench/logs/chrome-store/2026-09-20-release.log contains no publish event; `git tag --format='%(creatordate:short)'` returns 2026-09-23 for BOTH v0.1.0 and v0.2.0; CHANGELOG.md dates the CWS release pipeline to 0.1.1 / 2026-09-23. Analyst reached this on APP-54 and APP-41 recorded `first_published: null` independently. DEC-0006 is internally inconsistent about it already — its summary and line 21 say 'live since 2026-09-20' while its own evidence line 34 says '0.2.0 PUBLISHED and live since 2026-09-25'."
  - "The bias is deterministic, not noise. With F = 2026-09-23 and P = 2026-09-28, the 28-day pre-window 2026-08-31..2026-09-28 holds 5 live days against the post-window's 28. Holding impressions per live day exactly flat — the rewrite having zero effect — the sum ratio is 28/5 = 5.6x. Every candidate F in 2026-09-20..2026-09-25 leaves the pre-window at or above 80% non-existence. The criterion returns PASS for every possible outcome, including the outcome where the rewrite makes things worse."
  - "This is bias, not the variance DEC-0006 already flagged. DEC-0006's risk section warns that 'a four-week impressions read on a base of 3-5 users may be too noisy to call' and prescribes holding the threshold fixed. That mitigation is inert against a one-directional inflation from unequal live-day counts — holding a threshold fixed locks in a threshold the construction clears regardless. QA is correct that these are different defects and that the existing risk note does not cover this one."
  - "QA's option 1 (per-live-day mean, changing nothing else) removes this bias but substitutes another pointing the opposite way. With P near today the pre-window would be the item's first ~5 days on the store, which is the single most anomalous period in a CWS listing's life: new items receive novelty placement that is not the steady state the rewrite is being tested against. That inflates the pre-rate and biases the test AGAINST passing, on ~5 days of data from a 3-5 user base. A test biased against passing can return a false FAIL, which under DEC-0006 kills the copy hypothesis and redirects the whole next cycle to off-store distribution. Cheapest is not good enough when a wrong answer reallocates the cycle."
  - "Why 20 impressions is the readability floor rather than a round guess: a 2x ratio read off Poisson-ish counts needs a pre-window count large enough that doubling is distinguishable from sampling. At a pre-total of 20 against a post-total of 40 the difference is real; at 2 against 4 it is one person searching twice. Twenty over a 14-day window is about 1.4 impressions per day — deliberately set far below any plausible success level so the floor can never be the binding constraint on a genuine effect, and can only catch the case where the ratio is unreadable."
  - "Why the three-day post-publish exclusion cuts both ways and is therefore fair: CWS search indexing does not propagate a listing edit instantly, so measuring from day one risks a false FAIL before the change is even live in search; equally, a listing edit can draw a short re-index bump that is not durable reach, which risks a false PASS. Excluding three days guards both."
  - "Why the readability verdict is not an escape hatch: the floor is evaluated on PRE-window data, which is fully determined at P, before any post-window observation exists. The verdict class is therefore fixed before the outcome is observable. An 'inconclusive' option chosen after seeing the result would be precisely the wriggle that pre-registration exists to prevent; one determined before it is an honest statement about instrument resolution, and is the same move DEC-0009 makes in returning `insufficient_data` rather than a cheap verdict."
  - "Why amending a pre-registered criterion is legitimate here, on this company's own stated test: DEC-0008 settled that 'a rubric is changed when it misranks reality, not when it returns an unwelcome number.' No number has been returned — the baseline capture has not happened (APP-54: 0 of 3 CSVs) and the rewrite is unpublished. The amendment is made with zero data in hand, and it makes the criterion strictly harder to satisfy. Every property that makes threshold-moving illegitimate is absent."
  - "The arithmetic consequence, which is the part that is not the CEO's call. N <= P - F - 7. Taking the conservative F = 2026-09-25: N = 14 requires P >= 2026-10-16; N = 28, DEC-0006's originally intended window length, requires P >= 2026-10-30. At P = 2026-09-28 the expression is negative, meaning NO valid pre-window exists and the before/after read cannot be constructed at all. Publishing immediately does not weaken the read; it removes it."
  - "The publish is not in fact on a schedule the delay would break. APP-34 (the listing draft) is blocked and its publish needs a board G7 approval that has not been granted, because §10.3's G7 names 'listing' in the approval diff. The APP-54 baseline capture is blocked on a driveable browser session with a founder card still pending. Telemetry, the unmet half of G8, is unscoped work on APP-46. The ~2.5 weeks that option (i) costs is very likely time the publish was going to spend blocked regardless — but that is the board's finding to make, not the CEO's to assume."
reason: >
  A falsifier that cannot register a failure is not a weak measurement, it is not a measurement. The
  cost of leaving it standing is specific and large: DEC-0006 routes a PASS to "discovery is a copy
  problem, keep iterating on listing copy" and a FAIL to "the constraint is off-store distribution,
  stop." A criterion that returns PASS unconditionally would have sent the next cycle into further
  listing-copy iteration on the strength of the item having existed longer, and would have done it
  while carrying the authority of a pre-registered kill criterion. That is worse than having no
  criterion, because it manufactures confidence.
  QA's option 1 was the cheapest repair and it is not the one taken, because it trades a bias that
  produces false PASSes for a bias that produces false FAILs while leaving the sample at five noisy
  launch days. Both failure directions are expensive here and the asymmetry is fixable at its root by
  making the two windows equal in live days, which is the actual defect. Equal windows anchored at P
  also compare the rewrite against the steady state it perturbs rather than against a different era
  of the listing.
  The readability floor is the piece DEC-0006 was missing rather than the piece QA asked for. DEC-0006
  named noise as a risk and prescribed a mitigation that does not mitigate it. Declaring at publish
  time whether the instrument can carry a 2x signal at all converts "too noisy to call" from a thing
  discovered afterwards, when it is indistinguishable from motivated reasoning, into a thing stated
  in advance. SOUL.md names scaling on vanity metrics as this role's characteristic failure, and a
  doubling from one impression per day to two is exactly that metric.
  On authority: the construction is process, costs nothing, is reversible in one commit, and makes the
  gate stricter, which is the same basis on which DEC-0007 was recorded as a decision rather than
  escalated. The publish date is not, because a two-to-five week slip on a Q4 O2 milestone is schedule
  and strategy, and because the publish itself is board-gated at G7. Splitting it that way is what
  keeps this from being the CEO setting both the instrument and the conditions under which it reports.
expected_result: >
  The listing experiment becomes capable of returning FAIL, so the "discovery is a copy problem"
  hypothesis becomes genuinely testable rather than assumed. The board receives one decision — the
  publish date — with the measurement consequence of each option priced in front of it: publish on or
  after 2026-10-16 for a 14-day equal-window read, on or after 2026-10-30 for the 28-day read DEC-0006
  intended, or publish now and accept that the before/after falsifier is abandoned for a post-only
  floor set without a baseline.
  Analyst computes the verdict mechanically from the construction above with no judgement left at the
  point of reading, records N, F, the live-day counts and the pre-window total alongside the result as
  QA's option 2 recommends, and records the readability determination at P rather than afterwards.
  G10's portfolio call for JSON Workbench either waits for the read or is taken explicitly without it
  and says so — under every option the read lands after DEC-0006's 2026-10-27 review date and after
  G9's day-30 of 2026-10-20, and those two reads are about different things in any case.
risk: >
  The chief risk is that "the falsifier was badly built" becomes a way to rebuild a criterion whenever
  it is about to return an unwelcome answer. Bounded by the DEC-0008 test and by timing: this
  amendment is made with no data in hand at all, it moves the criterion strictly harder, and it does
  not touch the 2x threshold. The bound to enforce going forward is the one that matters — once the
  first post-window data point exists, this construction is frozen, including N, F, the floor and the
  three-day exclusion. Any later change to it is a board matter, not a CEO one.
  Second risk: the `unreadable` verdict is still a third exit, and third exits get used. Mitigated by
  determining it at P from pre-window data, so it cannot be selected in response to a result — but if
  it fires, the honest reading is that CWS impressions at this traffic level cannot test this
  hypothesis, and the correct next move is to stop trying to test it with this instrument rather than
  to re-run the same experiment hoping for a louder signal.
  Third: the construction still depends on F, which is unknown and may stay unknown. QA notes the
  dashboard may return zeros rather than absent rows for pre-launch days, in which case a live day with
  no impression is indistinguishable from a day with no listing and F cannot be read from impressions
  at all. The 2026-09-25 default handles this, and being the latest candidate it never claims a live
  day that might not have been live — but a wrong F propagates directly into N, so the fallback and
  the day counts must be reported with the result, never silently assumed.
  Fourth: none of this addresses the base rate. Fourteen days at a 3-5 user scale may simply not
  produce 20 impressions, in which case the honest outcome is `unreadable` and the company learns that
  it instrumented the wrong thing — which is still worth more than a PASS that was structural.
owner: ceo
date: "2026-09-28"
review_date: "2026-11-15"
status: active
review_outcome: >
  AMENDED IN PART by DEC-0018 (CEO, 2026-09-29, APP-185) — one clause only. "This floor is
  evaluated and RECORDED AT P" is superseded: the readability floor is determined from the first
  export whose as_of is in [P - 1, P + 2], using only rows dated on or before P - 1, because for
  any dashboard reporting lag L >= 1 the last L days of the pre-window are not yet reported at
  wall-clock P. DEC-0018 also pre-registers a shortened-window fallback, N = min(28, P - F - 7 - L),
  and makes a pre-publish archive at P - 1 an unconditional gate on the publish. Everything else in
  this record stands: P, F, N = min(28, P - F - 7), the 20-impression floor value, both exclusions,
  the 2x threshold, the three verdicts and the freeze at first post-window data. This record remains
  active; read it together with DEC-0018.

  P IS SETTLED — by the board, exactly as this record routed it, and not by a later DEC. Board
  approval 45846cd6 ("json-workbench listing publish date P: pick a floor"), decided by
  `local-board` at 2026-09-29T09:06:46Z on APP-175, approved option (i-b): a publish date FLOOR of
  P >= 2026-10-26. The board's stated reason was that avoiding a confound between the listing change
  and G9's day-30 PMF checkpoint is worth the extra ten days over the bare-minimum decision-grade
  option (P >= 2026-10-16, N = 14). At that floor, with this record's conservative F = 2026-09-25,
  N = min(28, P - F - 7) = 24 — before DEC-0018's reporting-lag adjustment
  N = min(28, P - F - 7 - L), which shortens it by L. This closes the one question this record
  declared it would not settle; nothing in the construction changes because of it. Pointer recorded
  by CTO on APP-192.
tags: [json-workbench, measurement, falsifiability, pre-registration, kill-criteria, g9, opp-0001, cws]
summary: "DEC-0006's four-weeks-before/after impressions criterion could not fail — the pre-window was ~80% pre-existence, returning PASS at 5.6x with zero effect — so it is rebuilt on equal-length live-day windows anchored at the publish date, with a 20-impression readability floor declared at publish time and a third `unreadable` verdict; the 2x threshold does not move, and the publish date the construction now constrains goes to the board."
---

> **Renumbered.** This record was originally committed as `DEC-0010` on
> `ceo/APP-59-dec-0006-falsifier-fix`; `DEC-0010` was concurrently taken by
> `DEC-0010-pr-3-stands-agent-opened-prs-are-gated.md`. Ruled on APP-84 / `DEC-0015`. Content unchanged.

## What was wrong, in one table

Take first-publish `F = 2026-09-23` and a publish date `P = 2026-09-28`, and let the rewrite have
**exactly zero effect** — impressions per live day perfectly flat at some rate `r`:

| | Window | Live days | Impressions | Verdict under DEC-0006 |
|---|---|---|---|---|
| Pre | 2026-08-31 → 2026-09-28 | **5** | 5r | |
| Post | 2026-09-28 → 2026-10-26 | **28** | 28r | |
| Ratio | | | **5.6×** | **PASS** |

The rewrite did nothing and the criterion says the hypothesis is confirmed. Set `r` to *half* its
pre value — the rewrite actively harming reach — and the ratio is still 2.8×, still a PASS. There is
no value of the thing being measured that produces a FAIL. That is the whole defect.

## The construction that replaces it

```
        F          F+7                          P    P+3                      P+3+N
        |           |                           |     |                          |
        |  burn-in  |. . . . . . . . . [ PRE: N live days ] [prop] [ POST: N live days ]
        |  7 days   |                           |     |                          |
     first       novelty                     rewrite  CWS re-index
     publish     excluded                    published  propagation excluded
```

1. **Unit — mean daily impressions over live days.** Never a window sum. A day is live only if the
   listing was published on it.
2. **Equal N on both sides.** Pre-window is the `N` live days immediately preceding `P`. Post-window
   is the `N` live days beginning at `P+3`. Equal by construction, so no asymmetry survives.
3. **`N = min(28, P − F − 7)`, and `N ≥ 14` for a decision-grade read.** The cap is what enforces the
   burn-in: it guarantees `P − N ≥ F + 7`.
4. **Readability floor, declared at `P`.** Pre-window total ≥ 20 impressions, or the ratio is not
   read as a ratio.
5. **Three verdicts.**

| Verdict | Condition | Consequence |
|---|---|---|
| **PASS** | post mean ≥ 2 × pre mean | "Discovery is a copy problem" survives; next cycle may iterate on copy |
| **FAIL** | post mean < 2 × pre mean, pre-total ≥ 20 | Hypothesis **dead**. Constraint is off-store distribution. Recorded as a DEC, **not** iterated on |
| **UNREADABLE** | pre-total < 20, **determined at `P`** | Neither confirmed nor killed. A post-only absolute floor pre-registered at `P` governs instead |

`FAIL`'s consequence is carried over from DEC-0006 verbatim. The only additions are the window
construction, the floor, and the third verdict.

## What it costs — the board's decision, not the CEO's

Taking the conservative `F = 2026-09-25`:

| Option | Publish `P` | `N` | Read lands ≈ | What you get |
|---|---|---|---|---|
| **(i) — recommended** | ≥ **2026-10-16** | 14 | 2026-11-05 | A real before/after falsifier at the minimum decision-grade length |
| (ii) | **now** (2026-09-28) | **none** | 2026-10-29 | `P − F − 7 < 0` — **no valid pre-window exists.** Before/after is abandoned; falsifier becomes a post-only floor set with no baseline, i.e. by judgement |
| (iii) | ≥ 2026-10-30 | 28 | 2026-12-03 | DEC-0006's originally intended window length |

The sharp version: **you cannot both publish now and keep a before/after falsifier.** Option (ii) is
not a weaker read, it is a different and much weaker instrument, because the pre-window it needs
does not exist.

Recommendation is **(i)**. It is the cheapest option that keeps a falsifier that can fail, and its
~2.5 weeks is probably not real schedule — the publish is already blocked three ways over (board G7
on APP-34, the APP-54 baseline capture, telemetry on APP-46). But "probably not real schedule" is a
judgement about priorities, so the board makes it.

## Frozen at first data

Once the first post-window data point exists, this construction is **frozen** — `N`, `F`, the
20-impression floor, the three-day exclusion, and the 2× threshold. Changing any of them after that
is a board matter. This decision is the one permitted amendment, and it is permitted only because it
is made with zero data in hand and moves the bar in the harder direction.

## Related

- `DEC-0006` — the record this amends; its "The measurement, settled" section is replaced, and its
  refuted 2026-09-20 first-publish claim is corrected in the same change
- `DEC-0008` — the test this amendment has to pass: "a rubric is changed when it misranks reality,
  not when it returns an unwelcome number"
- `DEC-0009` — the sibling refusal to return a cheap verdict where the data cannot carry one
- `DEC-0003` — the authority the listing work proceeds under
- Paperclip `APP-59` (this decision, filed by QA), `APP-54` (the baseline capture and Analyst's date
  correction), `APP-34` (the listing draft and its G7), `APP-41` (`first_published: null`)
