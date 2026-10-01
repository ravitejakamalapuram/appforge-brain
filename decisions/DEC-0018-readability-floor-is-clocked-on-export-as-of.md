---
id: DEC-0018
title: "DEC-0014's readability floor is clocked on an export's `as_of`, not on wall-clock `P`; a pre-publish archive at `P − 1` becomes mandatory and carries the pre-registered fallback window"
context: >
  Analyst filed APP-185 against DEC-0014's own clock. DEC-0014 requires the 20-impression
  readability floor to be "evaluated and RECORDED AT P, before any post-window data exists," and in
  the same breath — correctly, via APP-42 — requires the CWS Developer Dashboard's reporting lag to
  be derived and recorded rather than assumed. Let that lag be L: at wall-clock date T the dashboard
  reports complete daily data only through T - L. DEC-0014's pre-window ends at P - 1. At T = P the
  reported series ends at P - L, so for every L >= 1 the last L days of the pre-window are simply not
  reported yet and the floor cannot be evaluated against the window it is defined on. The only value
  of L for which DEC-0014 is executable as written is L = 0, and a zero-lag dashboard is precisely
  what DEC-0014 refuses to assume. At the APP-175 recommended P = 2026-10-26 with F = 2026-09-25 and
  N = 24, an L of 3 means an evaluation at P silently reads the floor off 21 of 24 days.
  This is not the APP-59 defect returning. DEC-0014's construction — equal live-day windows, the
  burn-in and propagation exclusions, the 2x threshold, the three verdicts — is sound and untouched.
  One step carries the wrong clock.
  A second defect, not raised on APP-185, surfaced while ruling: Growth's retention question on
  APP-54 — does the dashboard's daily series still return dates preceding the most recent listing
  update? — is unanswered, and if the answer is no, the listing edit at P destroys not merely the
  floor determination but the entire pre-window impressions series, which is also the denominator of
  the 2x ratio. DEC-0014 never addressed this because it assumed the capture happened at P.
question: "When is DEC-0014's readability floor determined and recorded, given a dashboard reporting lag L that is neither zero nor yet known, and what protects the pre-window series itself from the listing edit?"
options:
  - "Leave DEC-0014 as written and evaluate at wall-clock P, accepting that the determination silently covers only N - L of the N pre-window days."
  - "Clock the determination on the first export whose `as_of` is at least P - 1 and at most P + 2 — Analyst's repair 1, which leaves N, P, F, the floor value, the exclusions and the 2x threshold untouched. CHOSEN as the primary clock."
  - "Capture at P - 1 and shorten the pre-window to end at P - 1 - L, giving N = min(28, P - F - 7 - L) — Analyst's repair 2. CHOSEN as a pre-registered conditional fallback, not as an alternative selected later."
  - "Pro-rate the floor to 20 * (N - L) / N and evaluate at P — Analyst's repair 3. REJECTED."
  - "Assume L = 0 for the floor determination only, and note the assumption alongside the result."
decision: >
  DEC-0014's clause "This floor is evaluated and RECORDED AT P" is AMENDED. Nothing else in DEC-0014
  moves: not P, not F, not N as a formula, not the 20-impression floor value, not the seven-day
  burn-in or three-day propagation exclusions, not the 2x threshold, not the three verdicts and not
  their consequences. DEC-0014's status stays `active` and its body is not edited, because
  decisions/ is append-only; a forward pointer to this record is written into its `review_outcome`,
  which is the one field the append-only rule exempts.
  FOUR RULINGS.
  (1) MANDATORY PRE-PUBLISH ARCHIVE, unconditional. Before the rewrite is submitted at P, and no
  earlier than wall-clock P - 1, the full daily impressions series must be exported and archived.
  Its `as_of` will be P - 1 - L. This is not the floor determination. It is insurance against the
  daily series not surviving the listing edit, and it is required whatever the answer to the
  retention question turns out to be, because the event it guards against destroys the 2x
  denominator and not merely the floor. If this archive does not exist, the rewrite does not publish.
  (2) PRIMARY CLOCK, adopting Analyst's repair 1 with three amendments. The readability floor is
  determined from the FIRST export whose `as_of >= P - 1` — first meaning smallest qualifying
  `as_of`, so there is no choosing among candidates — provided that same export satisfies all three
  of: `as_of <= P + 2`; it carries a complete daily series covering every day of [P - N, P - 1]; and
  the determination is computed using ONLY rows dated `<= P - 1`, so the propagation days P, P + 1
  and P + 2 cannot enter the arithmetic even when the export contains them. The determination must
  be RECORDED — committed to appforge-brain or posted on the governing issue, timestamped — before
  any export with `as_of >= P + 3` is taken. N is unchanged at min(28, P - F - 7).
  (3) FALLBACK, adopting Analyst's repair 2, pre-registered and conditional rather than chosen. The
  fallback governs if and only if no export satisfying (2) exists — because the daily series did not
  survive the edit, or its coverage of [P - N, P - 1] is incomplete, or no capture landed with
  `as_of <= P + 2`. Then the archive from (1) governs: the pre-window ends at P - 1 - L, N becomes
  min(28, P - F - 7 - L), and both the floor total and the pre mean daily impressions are read off
  that archive. Which branch governs, and the observable fact that triggered it, must be recorded
  before any post-window datum is read. Where both a valid (2) export and the (1) archive exist,
  (2) governs — always, with no exception available to the reader.
  (4) CONTAMINATION IS REPORTED, NEVER ABSORBED. A floor determined from an export with
  `as_of >= P + 3`, or recorded after such an export was taken, is contaminated. It is reported as
  contaminated and the run returns UNREADABLE-BY-PROCEDURE, which is not DEC-0014's UNREADABLE
  verdict and does not trigger the post-only absolute floor: it is a statement that the pre-registered
  procedure was not followed, and it goes to the board rather than being resolved by the Analyst.
  Repair 3 is REJECTED. L must be derived from data captured strictly before P and recorded before P,
  so it cannot be tuned after the outcome is visible, and the same L governs the fallback window and
  every lag statement in the result.
  What this does NOT settle, because it is not the CEO's: the publish date P. It remains the board's
  on APP-175. But the fallback changes the price of some values of P, and APP-175 is told so below.
evidence:
  - "The defect is closed-form and was verified independently for this ruling rather than taken from the filing. DEC-0014 sets the pre-window as the N live days immediately preceding P, so it ends at P - 1; the dashboard reports through T - L; at T = P the overlap is short by exactly L days. For L >= 1 the determination covers N - L of N days. At P = 2026-10-26, F = 2026-09-25: P - F = 31, N = min(28, 31 - 7) = 24, pre-window 2026-10-02..2026-10-25 inclusive = 24 days. With L = 3 an evaluation at P sees 21 of them, or 87.5%."
  - "The slack interval that makes repair 1 work is never empty and never contains a post-window observation, for every L. The pre-window is fully reported from T = P - 1 + L; the first post-window day is P + 3, observable from T = P + 3 + L; and P - 1 + L < P + 3 + L identically in L. Stating the rule as a condition on the export's `as_of` rather than on wall-clock T is what makes it hold without knowing L in advance and survive L drifting between exports."
  - "The escape-hatch guarantee DEC-0014 bought with the at-P clock is preserved exactly. DEC-0014's stated property is that 'the verdict class is fixed before the outcome is observable', and observability by the evaluator, not the calendar, is what carries that. An `as_of <= P + 2` ceiling means no post-window day (P + 3 onward) can be in the evaluator's hands. The additional requirement that only rows dated <= P - 1 enter the arithmetic closes the weaker residual leak — that a large re-index bump visible on P..P+2 might be informative about where the post-window is heading."
  - "The fallback's arithmetic, computed for this ruling. N = min(28, P - F - 7 - L) preserves the burn-in guarantee: the pre-window starts at P - L - N >= F + 7. At P = 2026-10-26, F = 2026-09-25, L = 3 the fallback gives N = 21 over 2026-10-02..2026-10-22, exactly meeting F + 7 = 2026-10-02 at the boundary. The decision-grade minimum N >= 14 moves from P >= F + 21 = 2026-10-16 under the primary clock to P >= F + 21 + L under the fallback."
  - "At the APP-175 recommended P = 2026-10-26 the fallback stays decision-grade for every L <= 10, computed across L = 0..11: N = 24, 23, 22, 21, 19, 17, 14 at L = 0, 1, 2, 3, 5, 7, 10 and 13 at L = 11. The recommendation is therefore robust to any plausible dashboard lag under either branch, which is why this ruling does not and must not stall APP-175."
  - "The fallback does, however, reprice the cheap end of DEC-0014's own option table. DEC-0014 offers the board option (i) at 'P >= 2026-10-16, N = 14'. That row is true only under the primary clock; under the fallback the same P yields N = 14 - L and drops below decision-grade for any L >= 1. Any P the board picks within L days of 2026-10-16 is at risk, and L is not yet known. This is stated on APP-175 rather than silently absorbed, because narrowing the board's option set without saying so is the failure this split exists to prevent."
  - "The retention hazard is live and larger than the floor. Growth asked on APP-54 whether the daily series still returns dates preceding the most recent listing update; QA accepted it into the export spec on 2026-09-28 and it is still unanswered, APP-54 being in_review at 0 of 3 CSVs behind a pending founder browser card. If the answer is no, an export taken after the edit has no pre-window at all — which kills the 2x ratio, not just the floor. APP-186's own filing says it plainly: if the capture channel is still blocked when P arrives, 'this issue failing is the event that loses the pre-window.' That is why the archive at (1) is unconditional rather than a fallback trigger."
  - "Repair 3 was rejected on DEC-0014's own logic rather than on taste. Pro-rating the floor to 20 * (N - L) / N introduces a second estimator whose value depends on L, and therefore makes the floor — the one number DEC-0014 pre-registered specifically so it could not move — a function of an empirical quantity derived later. It also buys nothing: the pre-window days are not lost under repair 3, merely not yet reported, so trading a four-day wait for a rounding argument is a strictly worse deal."
  - "Amending is still permitted on this company's own test, and the window for it is closing. DEC-0014 freezes itself 'once the first post-window data point exists'; APP-54 stands at 0 of 3 CSVs, so no data of any kind exists. DEC-0008's test — 'a rubric is changed when it misranks reality, not when it returns an unwelcome number' — is passed with zero numbers in hand, which is the same footing on which DEC-0014 was permitted to amend DEC-0006."
  - "DEC-0014 cannot be edited in place, which the APP-185 acceptance criteria did not anticipate. scripts/validate-decisions.mjs enforces an append-only rule on decisions/ and postmortems/: body text may not change and the only frontmatter fields exempt are `status`, `superseded_by` and `review_outcome`. DEC-0006 carries its amendment banner inline only because DEC-0014 landed in the same unmerged change; DEC-0014 is now on origin/main and is frozen. The amendment therefore had to be a new record."
  - "DEC-0018 is the next free id, enumerated across every ref as DEC-0015 requires rather than read off main. All refs together claim DEC-0001..DEC-0011 and DEC-0013..DEC-0017; DEC-0012 remains reserved-in-flight per DEC-0015 and was not taken. Reading main alone would have produced DEC-0016, which is already claimed by DEC-0016-os-uid-is-the-only-containment-boundary.md on two branches — the exact collision DEC-0015 exists to stop."
reason: >
  A clock that cannot strike is the same class of defect as a falsifier that cannot fail, and it is
  worth fixing for the same reason: left standing, it does not announce itself. Nobody evaluating the
  floor at P would see an error. They would see a pre-window total, compute it off whatever rows the
  export happened to carry, and record a pre-registered verdict against a window silently short by L
  days. The failure mode is a confident number, which is the failure mode DEC-0014 was written to
  remove.
  Repair 1 is taken over repair 2 as the primary because it is the only repair that costs nothing.
  N stays 24 rather than 21, every other parameter is untouched, and the guarantee DEC-0014 actually
  bought — verdict class fixed before the outcome is observable — is preserved exactly, since it was
  always a statement about the evaluator's information and never about the calendar. Repair 2 pays L
  days of window for the same guarantee, and there is no reason to pay when the four-day slack
  interval is free.
  But repair 2 is not merely a runner-up, and ruling "repair 1" alone would have been the wrong
  shape of answer. Repair 1 is conditional on an empirical fact nobody has yet established, and if
  that fact goes the wrong way repair 1 is not weaker, it is unavailable. Pre-registration means the
  branch must be written down before the data exists, with a trigger that is observable and cannot
  be steered by the result. Leaving it to be picked at P would have reintroduced, at the level of
  which-clock, exactly the discretion DEC-0014 removed at the level of which-verdict. So both
  branches are registered now, with strict precedence and an outcome-independent trigger.
  The mandatory archive is the part the filing did not ask for and the part most likely to matter.
  The retention question has been open since 2026-09-28 and is routinely discussed as though it
  threatened the floor determination. It does not; it threatens the pre-window itself, which is the
  denominator of the 2x ratio and therefore the whole experiment. Making the archive conditional on
  the answer would mean discovering the answer at the moment it is too late to act on, so it is
  unconditional and it gates the publish.
  On authority: this is instrument design, costs nothing, is reversible in one commit, and leaves
  every pre-registered number where DEC-0014 put it. That is the same basis on which DEC-0014 itself
  was recorded as a CEO decision rather than escalated, and the same split is kept here — the CEO
  sets the instrument, the board sets P. The one place the split leaks is the fallback repricing the
  cheap end of the option table, and the answer to a leak like that is to hand the board the corrected
  table, not to claim the leak is not there.
expected_result: >
  The floor determination becomes executable for any dashboard lag, including the lag nobody has
  measured yet, without moving P, N, F, the floor value, the exclusions or the 2x threshold. APP-186
  gets an unambiguous instruction for both branches and unblocks on this ruling. APP-175 continues on
  its own merits with a corrected option table, and the recommended P = 2026-10-26 clears
  decision-grade under both branches for any L <= 10.
  The pre-window survives the listing edit under every answer to the retention question, because the
  archive at P - 1 is taken before the edit rather than hoped for after it. If the capture channel is
  still blocked at P, that now fails loudly as a publish gate instead of quietly as a lost baseline.
  Analyst computes the verdict mechanically as DEC-0014 already requires, and records alongside it
  which clock governed, the governing export's `as_of` and `exported_at`, the derived L, and the
  per-day pre-window coverage.
risk: >
  The chief risk is that the recording requirement in ruling (2) is an instruction rather than a
  mechanism, and this company has already ruled — DEC-0016, and DEC-0013 before it — that an
  instruction not to look is a request rather than a boundary. Nothing stops an evaluator from
  holding a compliant export, taking a later one, and then recording. The exports are manual browser
  captures and there is no place to put a gate, so this cannot be closed the way a credential can be.
  What bounds it is auditability rather than prevention: every export is archived with its `as_of`
  and `exported_at`, the determination is committed with a timestamp, and ruling (4) makes the
  contaminated case a reportable outcome that routes to the board rather than a judgement call the
  evaluator can absorb. A violation is therefore visible after the fact even though it is not
  preventable before it. Stated plainly because the alternative is to pretend the gate exists.
  Second: the two-branch structure is itself a second exit, and this record's own argument against
  repair 3 is that added degrees of freedom are expensive. Bounded by strict precedence — a valid
  primary-clock export always governs, with no exception available — by the trigger being a fact
  about whether an export exists rather than about what it says, and by requiring the branch to be
  recorded before any post-window datum is read. The residual is that the fallback's floor total is
  knowable from the archive before the primary export is taken, so both numbers may be in hand at
  once. That is accepted and made safe only by the precedence rule, and any deviation from it is a
  board matter, not an Analyst one.
  Third: this ruling uses `review_outcome` on DEC-0014 to carry a forward pointer to an amending
  record, which is a use the field was not written for. It is deliberate and it is bounded here:
  `review_outcome` may carry a pointer to an amending record and nothing else, and it may never
  carry substantive content that belongs in the amending record. Without it a reader of DEC-0014 on
  main meets the stale at-P clause with nothing to warn them, which is the citation-integrity hazard
  DEC-0015 exists to close. If the validator's owner rules this an abuse of the exemption, the
  pointer comes out and the discoverability problem comes back for a different fix.
  Fourth: none of this makes the floor more likely to be cleared. Twenty impressions over 21 to 24
  days at a 3-5 user base may simply not happen, and this ruling only guarantees that the resulting
  UNREADABLE is honest rather than an artifact of a short window. That was already DEC-0014's fourth
  risk and it is unchanged.
  Fifth: L is still unmeasured and the derivation is blocked behind APP-54's founder card. Both
  branches are written to survive an unknown L, but the fallback's N and the corrected APP-175 table
  both depend on it, so an L that arrives late or wrong propagates into the window exactly as a wrong
  F does. It must be reported with the result, never assumed.
owner: CEO
date: "2026-09-29"
review_date: "2026-11-15"
status: active
tags: [json-workbench, measurement, falsifiability, pre-registration, kill-criteria, cws, opp-0001, g9]
summary: "DEC-0014 required its readability floor to be recorded at wall-clock P, which is impossible for any dashboard reporting lag L >= 1 because the last L days of the pre-window are still unreported then. The floor is instead determined from the first export whose as_of is in [P-1, P+2], using only rows dated on or before P-1 — which preserves the before-the-outcome-is-observable guarantee for every L at zero cost to N, P, F, the floor value, the exclusions or the 2x threshold. A shortened-window fallback is pre-registered against the still-open question of whether the daily series survives a listing edit, and a pre-publish archive at P-1 becomes an unconditional gate on the publish because that same question threatens the whole pre-window, not just the floor."
---

> **Amends `DEC-0014`.** One clause only — *"This floor is evaluated and RECORDED AT `P`"*.
> `DEC-0014` is otherwise unchanged and remains `active`. Its body is not edited because
> `decisions/` is append-only; the forward pointer lives in its `review_outcome` field.

## The defect in one line

`DEC-0014` requires the floor to be read off days `[P − N, P − 1]` **at `T = P`**, and the dashboard
does not report day `P − 1` until `T = P − 1 + L`.

| At `T = P` | |
|---|---|
| Pre-window ends | `P − 1` |
| Dashboard reports through | `P − L` |
| Days missing from the determination | **`L`** |
| Executable as written | only if `L = 0` — the one case `DEC-0014` refuses to assume |

At `P = 2026-10-26`, `F = 2026-09-25`, `N = 24` (pre-window `2026-10-02 → 2026-10-25`) and `L = 3`,
the determination silently covers 21 of 24 days.

## The slack interval, which is free

```
                 P-1+L                              P+3+L
                   |                                  |
   T ------------->|<--- floor may be recorded here -->|-------------->
                   |            (4 days wide)          |
            pre-window fully              first post-window day (P+3)
              reported                        becomes observable
```

`P − 1 + L < P + 3 + L` identically in `L`. The interval is never empty and never contains a
post-window observation — **for every lag, without knowing the lag**. That is why the clock can move
and the guarantee cannot break.

Expressed on `as_of` rather than on `T`, so it holds even if `L` drifts between exports:

> **`as_of ∈ [P − 1, P + 2]`**

## The four rulings

### 1 — Pre-publish archive. Unconditional. Gates the publish.

Between `P − 1` and the submission of the edit at `P`, export and archive the full daily series.
Its `as_of` will be `P − 1 − L`. **Not** the floor determination.

This exists because Growth's retention question on `APP-54` — *does the daily series still return
dates preceding the most recent listing update?* — is still unanswered, and if the answer is **no**,
the edit at `P` destroys the pre-window itself, which is the **denominator of the 2× ratio** and not
merely the floor. `DEC-0014` never covered this because it assumed the capture happened at `P`.

**If this archive does not exist, the rewrite does not publish.**

### 2 — Primary clock (Analyst's repair 1, amended)

The floor is determined from the **first** export — smallest qualifying `as_of`, so there is nothing
to choose between — whose `as_of ≥ P − 1`, provided **all three** hold:

| Condition | Why |
|---|---|
| `as_of ≤ P + 2` | no post-window day (`P+3`+) can be in the evaluator's hands |
| complete daily coverage of `[P − N, P − 1]` | the window must actually be there |
| only rows dated `≤ P − 1` enter the arithmetic | the `P..P+2` propagation days cannot leak in even when present |

And the determination must be **recorded** — committed or posted, timestamped — **before any export
with `as_of ≥ P + 3` is taken**.

`N = min(28, P − F − 7)`. **Unchanged.**

### 3 — Fallback (Analyst's repair 2), pre-registered, not chosen

Governs **if and only if no export satisfying (2) exists**: the series did not survive the edit, or
its coverage of `[P − N, P − 1]` is incomplete, or no capture landed with `as_of ≤ P + 2`.

Then the archive from (1) governs: pre-window ends at `P − 1 − L`, and

> `N = min(28, P − F − 7 − L)`

**Precedence is strict: where both exist, (2) governs. No exception is available to the reader.**
The governing branch and the observable fact that triggered it are recorded **before** any
post-window datum is read.

### 4 — Contamination is reported, never absorbed

A floor determined from an export with `as_of ≥ P + 3`, or recorded after such an export was taken,
returns **`UNREADABLE-BY-PROCEDURE`**. This is **not** `DEC-0014`'s `UNREADABLE` verdict and does
**not** trigger the post-only absolute floor. It says the pre-registered procedure was not followed,
and it goes to the board.

### Rejected — repair 3

Pro-rating the floor to `20 × (N − L)/N` makes the one pre-registered number a function of an
empirically-derived `L`, and buys nothing: the days are not lost, only not yet reported.

## What this costs the board — corrected table for `APP-175`

Taking `F = 2026-09-25`:

| `L` | `N`, primary clock | `N`, fallback | Decision-grade min `P`, fallback |
|---|---|---|---|
| 0 | 24 | 24 | 2026-10-16 |
| 1 | 24 | 23 | 2026-10-17 |
| 2 | 24 | 22 | 2026-10-18 |
| **3** | **24** | **21** | **2026-10-19** |
| 5 | 24 | 19 | 2026-10-21 |
| 7 | 24 | 17 | 2026-10-23 |
| 10 | 24 | **14** | 2026-10-26 |
| 11 | 24 | 13 ✗ | 2026-10-27 |

Two readings, and both belong in front of the board:

- **The recommendation is safe.** At `P = 2026-10-26` the fallback stays decision-grade for every
  `L ≤ 10`. `APP-175` is unaffected and should be decided on its own merits.
- **The cheap end of `DEC-0014`'s own table is not.** `DEC-0014` offers option (i) at
  `P ≥ 2026-10-16, N = 14`. That row holds **only under the primary clock**; under the fallback the
  same `P` yields `N = 14 − L` and falls below decision-grade for any `L ≥ 1`. **Any `P` within `L`
  days of 2026-10-16 is at risk, and `L` is not yet known.**

## What is unchanged

`P` · `F` · `N = min(28, P − F − 7)` · the 20-impression floor value · the 7-day burn-in exclusion ·
the 3-day propagation exclusion · the 2× threshold · `PASS` / `FAIL` / `UNREADABLE` and their
consequences · the freeze at first post-window data.

## Related

- `DEC-0014` — the record this amends, one clause only; status stays `active`
- `DEC-0008` — the test this amendment passes with zero numbers in hand
- `DEC-0015` — the id allocation rule; `DEC-0018` was enumerated across every ref, not read off `main`
- `DEC-0016`, `DEC-0013` — "an instruction not to look is a request, not a boundary", the ruling the
  residual risk in (2) is measured against
- Paperclip `APP-185` (this ruling, filed by Analyst), `APP-186` (the `P`-anchored capture this
  unblocks), `APP-175` (the board's `P`), `APP-54` (`F`, `L`, retention), `APP-42` (lag derivation),
  `APP-47` (where Growth raised the export shape)
