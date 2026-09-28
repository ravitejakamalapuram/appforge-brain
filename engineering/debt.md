# Tech-debt register

Owned by the CTO (AGENTS.md § Inputs: "the brain's `engineering/debt.md` register").

An entry belongs here when a defect or gap is **understood, costed, and deliberately not fixed
right now** — usually because the fix is upstream, needs an authority the CTO does not hold, or is
outranked by other work. An entry is not a to-do; it is a record that someone looked, decided, and
can say why. Entries are closed by linking the change that resolved them, not by deletion.

| ID | Title | Raised | Severity | Status |
|---|---|---|---|---|
| DEBT-0001 | Quota failures retried inside the provider's reset window | APP-45 | High | Open |
| DEBT-0002 | No company-wide concurrent-run ceiling | APP-45 | Medium | Open |

---

## DEBT-0001 — Quota failures are retried inside the provider's reset window

**Raised by** APP-45, 2026-09-28. **Severity** High. **Status** Open — upstream fix required.

### What

Paperclip's adapter correctly classifies a Claude session-limit failure as
`errorCode: "provider_quota"`. The **retry scheduler** then ignores that classification and
re-queues the run under a generic reason on a short transient-failure delay:

| Failed at | `scheduledRetryReason` | Retry scheduled | Gap |
|---|---|---|---|
| 2026-09-28T03:45:17Z | `transient_failure` | 03:45:47Z | 30s |
| 2026-09-28T03:48:14Z | `max_turns_continuation` | 03:48:15Z | 1.6s |

The provider's stated reset was 09:50 Asia/Calcutta, ~6 hours later. Every retry inside that
window fails on arrival.

### Why it costs something

A quota-failed run re-reads its full context before the provider rejects it, so the retry is not a
cheap no-op. Measured over the 2026-09-27/28 history: **11 quota-failed runs burned 834K input
tokens and returned nothing**, at 37K–139K input tokens per attempt. The scheduler spends shared
session budget to buy guaranteed failures, and the tokens it spends keep the window closed longer.

A quota failure is categorically unlike the failures the scheduler is tuned for: it is retryable at
a **known future time** that the provider states in the error string. Treating it as a blip is a
category error, not a tuning problem.

### Why it is not being fixed here

There is **no configuration surface for it.** `/api/llms/agent-configuration/claude_local.txt`
exposes no retry, backoff, cooldown or quota field; the behaviour lives in Paperclip's runtime
scheduler, which AppForge does not own. Nothing in `appforge-control` can express "wait until the
reset". The honest options are an upstream change to Paperclip or a wrapper that intercepts
scheduling — the latter would duplicate control-plane logic AppForge would then have to maintain
against an API it does not control, which is worse debt than this entry.

### What would resolve it

A `provider_quota` branch in the retry scheduler that parses the reset time from the provider error
and schedules the retry for **after** it (or suspends the agent until then), instead of applying the
transient-failure delay. `session-burn.mjs`'s `quotaWaste()` already reports
`retriedWithinResetWindow` and `misclassifiedAs`, so the fix is verifiable the moment it lands:
that count should go to zero.

### Interim mitigation

None applied. The failure is self-limiting in the sense that it stops when the window reopens, and
it degrades throughput rather than correctness — no wrong output is produced, runs simply die. That
is why this is debt and not an incident.

---

## DEBT-0002 — No company-wide concurrent-run ceiling

**Raised by** APP-45, 2026-09-28. **Severity** Medium. **Status** Open — upstream gap.

### What

Paperclip exposes only a **per-agent** concurrency ceiling
(`runtimeConfig.heartbeat.maxConcurrentRuns`). All seven agents share **one** provider session
budget. There is no control that bounds the company's total simultaneous runs.

### Why it matters

Measured 2026-09-28: **company-wide peak of 12 concurrent runs**, against per-agent peaks of CEO 4,
CTO 4, CPO 2, Analyst 2, Builder/QA/Growth 1. No agent approached Paperclip's default of 20, so the
default was never the active cause of the session-limit failures.

The consequence is structural: seven agents at APP-39's `max_concurrent: 2` baseline permit **14**
simultaneous runs — *more* than the 12 that actually exhausted the budget. **APP-39's setting could
not have prevented the incident**, and no per-agent value can, because the constrained resource is
company-wide while the only available control is per-agent. Driving every agent to 1 would cap the
company at 7 only by serialising each agent individually — the wrong trade, made at the wrong layer.

This is recorded because the per-agent knob is *plausible enough to be mistaken for the fix*. It
was proposed as the primary mitigation in APP-45 and would have been applied without the
measurement. The register exists so the next person reaching for it finds the arithmetic first.

### What would resolve it

A company-scoped concurrency ceiling in Paperclip — a queue admission limit across all agents in a
company, with over-ceiling wakes queuing rather than dropping (the same safety property that makes
the per-agent ceiling safe today).

### Interim mitigation

Per-agent ceilings from APP-39 (`config/agents.yaml`: baseline 2, Builder/QA 1) remain the declared
intent and are still worth reconciling — they bound the worst case from 140 (7 × Paperclip's
default of 20) to 14. That is a real reduction and not nothing; it is simply not sufficient on its
own. Reconciliation is itself blocked: `sync-agent-heartbeat.mjs` reports six of seven agents as
`SKIPPED — runtimeConfig.heartbeat not readable by this actor`, because the CTO key lacks
`agents:configure` and granting permissions is forbidden to the CTO (AGENTS.md § Forbidden).
Unblocking needs a board grant.
