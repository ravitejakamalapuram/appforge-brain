# Claude provider session-budget burn — measurement, 2026-09-28

Raised by **APP-45** ("Agent runs now die on the Claude provider session limit, not the turn
cap"), which required the per-hour consumption to be measured and written down before anything
was changed or bought. This is that measurement.

Measured with `appforge-control/scripts/session-burn.mjs` (built for this issue) against
Paperclip's own `/api/companies/{id}/heartbeat-runs` history. Re-runnable — every number below
can be regenerated, and should be before anyone cites it in a later decision.

## What the numbers are, and are not

Runs are `billingType: "subscription_included"`. The `imputed $` column is what those tokens
**would have** cost at API list price. It is **not cash** and it does **not** draw down DEC-0004's
$100/mo cap. Nothing here is a budget breach. It is used as a single scalar proxy for pressure on
the shared subscription session window, because the provider exposes no direct "fraction of session
budget consumed" reading. **Token counts are the honest measure.** Do not quote the dollar column
as spend; that mistake would look like a $126 overrun on a $100 cap that has not been touched.

## Headline

| Window | Input tok/hr | Imputed $/hr | Productive share |
|---|---|---|---|
| Trailing 30h (2026-09-26T23:01Z → 2026-09-28T05:01Z) | 160K | $4.21 | 20.2% |
| **After the APP-29 cap fix** (2026-09-28T03:34:38Z → 05:02Z, 1.46h) | **1,579K** | **$48.66** | **16.5%** |

Burn rose roughly **10x** after the turn cap was raised. That is the arithmetic change APP-45
predicted, now quantified. At the post-fix rate a 5-hour Claude session window absorbs ~7.9M input
tokens, which is why the limit trips within the hour rather than at the end of the day.

The more alarming number is the one that holds across **both** windows: only about **one sixth to
one fifth** of everything the company sends to the provider belongs to a run that succeeded.

## Per agent (post-cap-fix window, 1.46h)

| Agent | Runs | Input tok | Output tok | Imputed $ | $/hr |
|---|---|---|---|---|---|
| CTO | 14 | 809K | 234K | 26.35 | 18.09 |
| CEO | 10 | 684K | 219K | 22.87 | 15.70 |
| Growth | 4 | 344K | 77K | 10.05 | 6.90 |
| Analyst | 6 | 261K | 70K | 5.93 | 4.07 |
| CPO | 3 | 201K | 52K | 5.68 | 3.90 |
| QA | 1 | 0K | 0K | 0.00 | 0.00 |
| Builder | 0 | — | — | — | — |

**CTO and CEO together are 70% of company burn.** Builder — budgeted as "the largest single
consumer" (DEC-0004, §6.2) — consumed nothing in this window. The agents actually exhausting the
shared session budget are the two coordination roles, not the one doing the building. Whatever
capacity planning happens next should start from that inversion rather than from the budget table.

## Where the tokens went (post-cap-fix window)

| Outcome | Runs | Input tok | Imputed $ |
|---|---|---|---|
| `cancelled` | 7 | 752K | 27.96 |
| `provider_quota` | 10 | 696K | 17.26 |
| `succeeded` | 6 | 425K | 11.70 |
| `max_turns_exhausted` | 3 | 322K | 10.37 |
| `claude_auth_required` | 1 | 105K | 3.59 |

The APP-29 fix is confirmed working: `max_turns_exhausted` went **27 → 1** across the cap change
(pre-fix vs. post-fix classification of the same history), and `provider_quota` went **1 → 10**.
One ceiling was removed and the next one took over, exactly as APP-45 described.

## Finding 1 — quota failures are detected correctly but scheduled wrongly

The adapter **does** classify them: `errorCode: "provider_quota"` is set on all 11. That part is
not broken, and APP-45's investigation item 3 can be closed on the detection side.

The **retry scheduler** then ignores that code. Observed on 2026-09-28:

| Failed at | Filed under | Retry scheduled for | Gap |
|---|---|---|---|
| 03:45:17 | `transient_failure` | 03:45:47 | **30 seconds** |
| 03:48:14 | `max_turns_continuation` | 03:48:15 | **1.6 seconds** |

The provider's stated reset was **09:50 Asia/Calcutta — about six hours away.** Every retry inside
that window is rejected on arrival.

These retries are not free. A quota-failed run re-reads its whole context before the provider
rejects it: the 11 quota failures burned **834K input tokens** and returned nothing. Individual
attempts cost 37K–139K input tokens each. So the scheduler is spending real session budget to
buy guaranteed failures, while the tokens it spends keep the window closed.

There is **no adapter-config knob for this**. `/api/llms/agent-configuration/claude_local.txt`
exposes no retry, backoff, cooldown or quota field — the behaviour lives inside Paperclip's runtime
scheduler, which this company does not own. See the debt register entry `DEBT-0001`.

## Finding 2 — per-agent concurrency caps cannot bound a shared budget

This one changes the recommended mitigation, so it matters more than the specific numbers above.

APP-45 proposed lowering `maxConcurrentRuns` from Paperclip's default of 20. Measured reality:

- **Company-wide peak: 12 concurrent runs** (2026-09-28T04:51:37Z).
- **Per-agent peaks: CEO 4, CTO 4, CPO 2, Analyst 2, Builder 1, QA 1, Growth 1.**

No agent came close to 20. The default was never the active cause — it is a latent risk, not this
failure.

More importantly: Paperclip offers **only** a per-agent ceiling. Seven agents at APP-39's baseline
of `max_concurrent: 2` permit **14** simultaneous runs against **one** shared session budget — which
is *more* than the 12 that actually blew it. **APP-39's setting would not have prevented this
incident**, and no per-agent value can, because the constrained resource is company-wide and the
control is not. Setting each agent to 1 would cap the company at 7 while serialising every agent
individually — the wrong trade made at the wrong layer.

The missing primitive is a **company-wide concurrent-run ceiling**. That is an upstream platform
gap, recorded as `DEBT-0002`.

## Finding 2b — routine cadence is already staggered and was not involved

APP-45 paired cadence with concurrency as the free mitigation ("staggering routines ... is free and
may be sufficient on its own"). Checked against the live routine set rather than assumed:

| Routine | Trigger | Schedule (Asia/Kolkata) | Concurrency policy |
|---|---|---|---|
| Daily Portfolio Report | schedule | `0 7 * * *` | `coalesce_if_active` |
| Weekly Board Narrative | schedule | `30 7 * * 1` | `coalesce_if_active` |
| Weekly Portfolio Review | schedule | `0 9 * * 1` | `coalesce_if_active` |
| Opportunity Scouting Batch | schedule | `0 10 * * 3` | `coalesce_if_active` |
| Experiment Status Review | schedule | `0 10 * * 5` | `coalesce_if_active` |
| GitHub CI/PR notifications | webhook | event-driven | `always_enqueue` |

**There is nothing to stagger.** The five scheduled routines are already spread across different
hours and different days, no two fire in the same minute, and every one is `coalesce_if_active` — so
a routine cannot pile a second run onto an agent that is still working. The heaviest moment is
Monday 07:30 and 09:00, an hour apart.

Decisively: **the session-limit failures happened between 03:38 and 04:51, when no scheduled routine
fires at all.** The load came from webhook, assignment and retry wakes. Restaggering the cron
entries would not have moved a single one of the failed runs, so cadence is **ruled out** — not
deferred, not blocked, simply not the cause.

This leaves the `always_enqueue` webhook routine as the only cadence-shaped risk, and it is the
correct policy for CI notifications: dropping a CI failure is worse than queuing one.

## Finding 3 — the dominant waste is not the ceiling at all

`cancelled` is the single largest consumer in the post-fix window: **7 runs, 752K input tokens,
more than the quota failures and more than everything that succeeded.** These are runs that
consumed a full context and were then cancelled — by reassignment, by terminal issue status, or by
superseding wakes. Nobody has looked at this; it was invisible while attention was on the two
ceilings. It is plausibly the cheapest large win available and deserves its own issue rather than
a guess here.

## What was applied, and what is blocked

- **Measurement tooling** — `scripts/session-burn.mjs` + `scripts/lib/session-burn.mjs` (14 unit
  tests). Applied. Readable with a plain agent key, deliberately: measuring the problem must not
  require the grant that fixing it does.
- **Concurrency mitigation** — **not applied, and partly ruled out.** Ruled out as a *sufficient*
  fix by Finding 2. Additionally blocked mechanically: `sync-agent-heartbeat.mjs` reports six of
  seven agents as `SKIPPED — runtimeConfig.heartbeat not readable by this actor`. The CTO key lacks
  `agents:configure`, and granting permissions is forbidden to the CTO (AGENTS.md § Forbidden). So
  even the partial mitigation needs a board action.
- **Quota backoff** — **not applied.** No configuration surface exists (Finding 1). `DEBT-0001`.
- **Plan capacity** — **not touched.** Any subscription change is a budget decision reserved to the
  founder under DEC-0004 ("raising any budget is founder-only — no agent, including CEO, can raise
  its own or another agent's budget"). Routed to the board via CEO, not decided here.

## Recommended order of attack

Ranked by measured impact per unit of effort, and deliberately putting the paid option last:

1. **Reset-aware quota backoff** (`DEBT-0001`) — recovers 834K input tokens of pure waste and stops
   the retry storm. Upstream fix; needs a platform change, not a config edit.
2. **Investigate `cancelled` burn** (Finding 3) — the largest single bucket, entirely unexamined.
3. **Company-wide concurrency ceiling** (`DEBT-0002`) — the correct control at the correct layer.
4. **`agents:configure` grant** so `sync-agent-heartbeat.mjs` can finish APP-39's reconciliation.
   Free, but only a partial mitigation; do not mistake it for a fix.
5. **Plan capacity** — last resort, board decision, and not justified until 1–3 are done. Buying
   capacity to feed a pipeline that wastes ~83% of what it consumes would scale the waste.

## Reproducing

```sh
cd appforge-control
node scripts/session-burn.mjs --hours 30
node scripts/session-burn.mjs --since 2026-09-28T03:34:38Z   # post-APP-29-cap-fix
node scripts/session-burn.mjs --json                          # machine-readable
```

## Addendum — refreshed over a full 24h window (2026-09-28T09:27Z)

Re-run with `--hours 24` once a full day of history existed, because the windows above are short
(1.46h and 30h) and the headline rate was drawn from a spike. The refreshed figures confirm the
findings and sharpen two of them.

| Window | Runs | Input tok/hr | Imputed $/hr | Productive share |
|---|---|---|---|---|
| 2026-09-27T09:27Z → 2026-09-28T09:27Z (24.00h) | 111 | **293K** | **$8.31** | **31.7%** |

Read the 1,579K tok/hr post-cap-fix figure as the **peak** rate, not the sustained one. Sustained
burn over a full day is 293K input tok/hr. Both matter: the peak is what trips a 5-hour session
window inside an hour, the sustained rate is what capacity planning should use.

### Per agent, 24h

| Agent | Runs | Input tok | Output tok | Imputed $ | $/hr |
|---|---|---|---|---|---|
| CTO | 41 | 2,023K | 528K | 56.54 | 2.36 |
| CEO | 23 | 1,646K | 511K | 50.39 | 2.10 |
| CPO | 24 | 1,448K | 337K | 40.09 | 1.67 |
| Analyst | 12 | 837K | 238K | 20.70 | 0.86 |
| Growth | 7 | 588K | 131K | 16.03 | 0.67 |
| QA | 4 | 498K | 168K | 15.68 | 0.65 |
| Builder | 0 | — | — | — | — |

The inversion holds and is not an artifact of the short window: **CTO + CEO = 54% of company burn
over a full day** (77% including CPO), while **Builder consumed nothing at all in 24 hours.** The
three coordination roles are the company's entire provider load. That is the single most important
input to any capacity request, and it argues against buying capacity before asking why the builder
is idle while the managers saturate the budget.

### Waste, 24h

| Outcome | Runs | Input tok | Imputed $ |
|---|---|---|---|
| `succeeded` | 25 | 2,196K | 63.19 |
| `cancelled` | 22 | 1,804K | 58.00 |
| `max_turns_exhausted` | 27 | 1,704K | 44.32 |
| `provider_quota` | 25 | 1,035K | 25.51 |
| `claude_auth_required` | 4 | 299K | 8.41 |

**68.3% of everything the company sent to the provider bought nothing.** Revisions to the findings:

- **`DEBT-0001` is larger than recorded.** Quota waste is **25 runs / 1,035K input tokens** over
  24h, not 11 runs / 834K. **5** of those were re-queued under a non-quota reason
  (`max_turns_continuation`, `transient_failure`) instead of waiting for the reset. The run that
  produced this addendum was itself woken by `transient_failure_retry` after a `provider_quota`
  failure — the defect is still live and still reproducing.
- **Finding 3 is confirmed at scale**, and `max_turns_exhausted` joins it. `cancelled` (1,804K) and
  `max_turns_exhausted` (1,704K) are each comparable to everything that succeeded (2,196K). Note
  what this means for APP-29: raising the cap to 40 stopped runs dying at 10, but 27 runs still
  exhausted 40 turns. The cap is no longer obviously wrong, but it is not obviously right either —
  and turns spent hitting a cap are turns bought and thrown away.
- **Concurrency is unchanged as a conclusion.** Company peak 12, per-agent peaks CEO 4 / CTO 4.
  Still no agent near 20; still no per-agent value that bounds a company-wide budget.

Regenerate with `node scripts/session-burn.mjs --hours 24`.
