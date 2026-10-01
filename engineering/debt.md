# Tech-debt register

Owned by the CTO (AGENTS.md § Inputs: "the brain's `engineering/debt.md` register").

An entry belongs here when a defect or gap is **understood, costed, and deliberately not fixed
right now** — usually because the fix is upstream, needs an authority the CTO does not hold, or is
outranked by other work. An entry is not a to-do; it is a record that someone looked, decided, and
can say why. Entries are closed by linking the change that resolved them, not by deletion.

`Status` is one of **Open**, **Resolved** (the underlying defect is gone) or **Resolved via
workaround** (the cost to AppForge is stopped, but the defect itself is still there — usually
because it lives upstream). A workaround entry stays in the register, because the thing it
describes is still true and whoever meets it next needs the reasoning, not just the mitigation.

| ID | Title | Raised | Severity | Status |
|---|---|---|---|---|
| DEBT-0001 | Quota failures retried inside the provider's reset window | APP-45 | High | Resolved via workaround |
| DEBT-0002 | No company-wide concurrent-run ceiling | APP-45 | Medium | Open |
| DEBT-0003 | Quota-retry watchdog is unmonitored; its failure leaves an agent paused | APP-45 | Medium | Open |
| DEBT-0004 | Credentialed re-fetch of the active tab's URL was undisclosed | APP-81 | Low | Resolved |
| DEBT-0005 | Run issue-binding is read only from the run record, so an unbound run can hold a checkout it cannot write to | APP-184 | High | Resolved via workaround |
| DEBT-0006 | The production release path is defined by mutable refs on a repo with no rulesets and no environments | APP-233 | Medium | Open |
| DEBT-0007 | A bypass of the advisory `board-approved` gate leaves no signal | APP-233 | Low | Open |

---

## DEBT-0001 — Quota failures are retried inside the provider's reset window

**Raised by** APP-45, 2026-09-28. **Severity** High.
**Status** Resolved via workaround, 2026-09-28 — the upstream defect is still open.

The cost to AppForge is stopped. The bug in Paperclip is not fixed and is not ours to fix; this
entry stays open-in-substance for that reason and should not be deleted. See
**Resolution — quota-retry watchdog** below for what actually changed, and **Residual risk** for
what the workaround does not cover.

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
cheap no-op. Measured over a full 24h window (2026-09-27T09:27Z → 2026-09-28T09:27Z): **25
quota-failed runs burned 1,035K input tokens and returned nothing**, of which **5** were re-queued
under a non-quota reason rather than waiting for the reset. (An earlier, shorter window put this at
11 runs / 834K; the defect is not decaying.) The scheduler spends shared
session budget to buy guaranteed failures, and the tokens it spends keep the window closed longer.

A quota failure is categorically unlike the failures the scheduler is tuned for: it is retryable at
a **known future time** that the provider states in the error string. Treating it as a blip is a
category error, not a tuning problem.

### Why it is still not fixed at the source

There is **no configuration surface for it.** `/api/llms/agent-configuration/claude_local.txt`
exposes no retry, backoff, cooldown or quota field (re-confirmed 2026-09-28 while building the
workaround); the behaviour lives in Paperclip's runtime scheduler
(`@paperclipai/server`, `services/recovery/service.js`), which AppForge does not own. Patching that
file in place was considered and declined: it is silently overwritten by every `paperclipai update`,
and it would put AppForge in the business of maintaining a fork of another product's control plane.

### What would resolve it upstream

A `provider_quota` branch in the retry scheduler that parses the reset time from the provider error
and schedules the retry for **after** it (or suspends the agent until then), instead of applying the
transient-failure delay. `session-burn.mjs`'s `quotaWaste()` already reports
`retriedWithinResetWindow` and `misclassifiedAs`, so the fix is verifiable the moment it lands:
that count should go to zero.

Reporting it upstream is now owned: **APP-108** (CEO), filed as a follow-up to this entry on
2026-09-28. It carries the reproduction table above and the version string, and the same
acceptance metric — `retriedWithinResetWindow` going to zero — is what would let this entry move
from *Resolved via workaround* to *Resolved*.

### Resolution — quota-retry watchdog (workaround, 2026-09-28)

Fixed at a boundary AppForge *does* own rather than inside Paperclip. `appforge-control`
ships `scripts/quota-retry-watchdog.mjs`, run every 90s by LaunchAgent
`ing.paperclip.appforge-quota-watchdog` (plist and full operator notes in
`appforge-control/infra/macos/README.md`). Commit
[`c3bfff3`](https://github.com/ravitejakamalapuram/appforge-control/commit/c3bfff3da88a87e9e11a0fe1dcba363f69a0ccea).

Each pass reads `GET /api/companies/{id}/heartbeat-runs` and, for every newly-seen
`provider_quota` failure, parses the reset time out of the run's own `error` text
(`"...resets 9:50am (Asia/Calcutta)"`), **pauses that agent immediately** via
`paperclipai agent pause` so Paperclip's scheduler cannot re-queue it early, and schedules an
explicit `resume` + `wake` for reset-time plus a 90s clock-skew buffer. A failure logged late at
night that prints a time already past rolls to the next calendar day in the failure's own
timezone. `process_lost` — the only other genuinely retryable code seen in real run history — gets
exponential backoff with full jitter rather than Paperclip's default cadence, jittered specifically
because several agents fail together and a fixed multiplier would resynchronise their retries; the
per-agent attempt counter resets on any run seen to succeed.

Pausing is the mechanism because it is the only lever that actually preempts the scheduler.
`pause`/`resume`/`wake` work at board/operator level and were live-smoke-tested against Analyst; an
agent's own attempt to self-pause returns 403.

**Verification did not require waiting for a real quota event.**
`scripts/tests/quota-retry-watchdog-integration.test.mjs` drives the script against fixture run
data and re-uses this entry's own acceptance metric — `session-burn.mjs`'s
`quotaWaste().retriedWithinResetWindow` — showing **1** for the real bug shape observed on
2026-09-28 (a `transient_failure` retry scheduled ~18s after a quota failure) and **0** once the
watchdog preempts the scheduler, because the agent is paused before Paperclip's recovery service
ever sets `scheduledRetryAt`. 72 tests pass in `appforge-control/scripts` (`npm test`), re-run and
confirmed green at the time this entry was closed. The watchdog was also confirmed live: LaunchAgent
loaded with exit status 0, passes logging every 90s, and state advancing in
`appforge-control/state/quota-retry-watchdog-state.json`.

### Residual risk

Three things the workaround does not cover. None of them reopen the original token waste; they are
the price of solving it outside the scheduler.

1. **The watchdog is unmonitored.** Unlike its sibling LaunchAgents (`appforge-backup`,
   `appforge-sync`), it pings no healthcheck and sends no ntfy alert, so a failure is silent. Its
   failure mode is also worse than theirs: a crash between the pause and the scheduled resume
   leaves an agent paused. Ordinary crashes self-heal — launchd re-runs the script every 90s and the
   pending resume is persisted in the state file, so it fires late rather than never — but an
   unloaded LaunchAgent, a lost or corrupted state file, or a persistent error on the resume path
   would strand an agent with nobody told. Tracked as **DEBT-0003**.
2. **It is reactive, not preventive.** It stops AppForge paying for retries that cannot succeed; it
   does nothing about the burn that exhausts the session window in the first place. That is APP-76
   (`cancelled` and `max_turns_exhausted` waste) and DEBT-0002.
3. **It depends on the provider's error string.** The reset time is parsed out of prose
   (`"resets 9:50am (Asia/Calcutta)"`). If Anthropic or Paperclip changes that wording, parsing
   fails. The failure is safe rather than silent — an unparseable reset falls through instead of
   scheduling a wrong resume — but the quota handling stops working until the parser is updated.

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

---

## DEBT-0003 — The quota-retry watchdog is unmonitored, and its failure leaves an agent paused

**Raised by** APP-45, 2026-09-28. **Severity** Medium. **Status** Open.

### What

`ing.paperclip.appforge-quota-watchdog` (the DEBT-0001 workaround) is the only one of AppForge's
three LaunchAgents with no liveness signal. `backup.sh` and `sync.sh` both ping healthchecks.io on
success and push an ntfy alert on failure; the watchdog's plist carries neither
`HEALTHCHECKS_PING_URL_*` nor `NTFY_TOPIC`, and the script emits no alert of any kind. Its only
evidence of life is `logs/quota-retry-watchdog.log`, which nobody reads unless already suspicious.

### Why it matters more here than for the sibling jobs

A silent backup job means a missed backup. A silent watchdog can mean a **paused agent**, because
pausing is exactly how the workaround preempts Paperclip's scheduler. The window between "pause the
agent" and "resume it at the reset" is a state that only the watchdog knows how to leave.

Most crashes are already survivable and this should not be overstated: the plist uses
`StartInterval: 90` with `--once` and `KeepAlive: false`, so launchd re-runs the script every 90
seconds regardless of how the last pass exited, and the pending resume is persisted in
`state/quota-retry-watchdog-state.json` with a due-time filter, so it fires late rather than never.
The uncovered cases are the ones where the script stops running or stops being able to act: the
LaunchAgent is unloaded (a `launchctl bootout`, a failed reload after an edit), the node binary path
in the plist stops resolving, the state file is lost or corrupted, or the resume call itself fails
persistently. In any of those, an agent stays paused and the only symptom is that it quietly stops
doing work — the same class of symptom APP-45 was raised to investigate.

### What would resolve it

Two changes, both small and both in `appforge-control`:

1. A healthcheck ping per successful pass and an ntfy push on an errored pass, matching the pattern
   `backup.sh` and `sync.sh` already use. Grace period wants to be a small multiple of 90s.
2. A **bounded pause invariant** in the script itself: on each pass, resume any agent this watchdog
   paused whose scheduled resume is overdue by more than some margin, even if the reason it was
   paused is no longer understood. Failing open is correct here — a premature resume costs one
   failed run, a missed resume costs an agent.

Both are testable against the existing fixture harness in
`scripts/tests/quota-retry-watchdog-integration.test.mjs`.

### Why it is not fixed in the same change

The workaround was scoped to stopping the token waste, and closing this needs a plist edit carrying
secrets plus a LaunchAgent reload — an operational change worth making deliberately and on its own,
not folded into the entry that certified the workaround. Recorded rather than done so that the gap
is visible if the watchdog does go quiet before it is closed.

---

## DEBT-0004 — The credentialed re-fetch of the active tab's URL was undisclosed

**Raised by** APP-81, 2026-09-29. **Severity** Low.
**Status** Resolved, 2026-09-29 — the disclosure gap is closed; `credentials: "include"` was
reviewed and deliberately kept.

### What was asked

`json-workbench/apps/extension/background.js` serves the side panel's "Active JSON tab" action by
re-requesting the active tab's own URL:

```js
const response = await fetch(tab.url, { credentials: "include" });
```

APP-81 asked two questions and did not presuppose the answer to either: is `credentials: "include"`
load-bearing or vestigial, and is the product's privacy positioning honest about it? The finding
came out of APP-46 (telemetry design). It was explicitly **not** filed as a vulnerability, and it is
not recorded as one here.

### Finding 1 — `credentials: "include"` is load-bearing, and the safer-looking alternatives are not

The action's purpose is to hand the workbench the JSON document the developer is already looking at.
In the dominant case that document is an API endpoint behind a session cookie. An uncredentialed
re-fetch of such a URL does not return the same bytes the user can see on screen; it returns a 401,
a 403, or an HTML sign-in page. The feature would appear broken in exactly the situation it exists
for, and — worse for a debugging tool — it would be broken *silently*, handing back a plausible
document that is not the one on screen.

`credentials: "same-origin"` is not a middle option here. The request's initiator is the extension
service worker, whose origin is `chrome-extension://<id>`. That never matches an `http(s)` tab URL,
so `"same-origin"` degrades to exactly `"omit"` for every URL this code path can be given. Choosing
it would read as a hardening step in review while changing nothing about the failure mode; that is
worse than leaving the honest value in place.

### Finding 2 — reachability is bounded by a permission check, not by trust in the caller

The concern worth taking seriously was whether the extension can be induced to make an
authenticated request to an arbitrary origin it has no business touching. It cannot, and the reason
is structural rather than a validation the code performs:

`apps/extension/manifest.json` declares `permissions: ["activeTab", "sidePanel", "storage",
"scripting"]`, **no `tabs` permission**, and no default host permissions (`<all_urls>` is optional
and gated behind the auto-render toggle). Without `tabs` or a host grant, `chrome.tabs.query`
returns a tab object whose `url` is `undefined`. So the URL this code fetches can only be populated
when the extension already holds access to that tab — either the transient `activeTab` grant
created by the user invoking the extension on that tab, or the `<all_urls>` grant the user opted
into. The fetch therefore targets only a tab the user is looking at, on an origin the user has
already granted, after the user pressed a button. That is the same authority the user gave by
loading the page, exercised once more.

### Finding 3 — the real defect was the disclosure, and it was worse than "silent"

`.appforge/product.yaml` carried `transmitted.endpoints: []` with the comment "the one fetch() call
re-reads the active tab's own URL, not a third-party endpoint". That is true about **destination**
and silent about **credentials**, which is the half a store reviewer cares about. `PRIVACY.md`,
`docs/PRIVACY.md`, `CHROMEWEBSTORE.md`, `docs/STORE_LISTING.md` and `app-metadata.json` did not
mention the request at all, while the product's whole positioning is "nothing leaves your browser".
Nothing said was false; the omission was the problem, and an omission is what a reviewer finds
rather than what a reviewer is told.

A second, smaller defect surfaced while establishing Finding 2. The permission-denied case and the
not-an-HTTP-page case shared one error branch, so a user who opened the side panel without granting
access to the tab was told "The active tab is not an HTTP(S) page" about a page that plainly was
one. That framed a permissions problem as a content problem and gave the user no route out.

### What changed

On `json-workbench` branch `fix/APP-81-credentialed-refetch-disclosure`:

- `background.js` — split the missing-grant case out of the not-HTTP case with a message that names
  the two ways to grant access; and recorded, at the call site, why `credentials: "include"` is kept
  and why `"same-origin"` is not an alternative.
- `PRIVACY.md` and `docs/PRIVACY.md` — a new section, "How 'Active JSON tab' reads the page",
  stating in plain language that the request goes only to the page's own address, that it carries
  the user's cookies for that site, why that is necessary, and the practical consequence: the action
  causes one additional authenticated request to the page you are on, exactly as reloading the tab
  would, so a state-changing endpoint requested twice changes state twice.
- `CHROMEWEBSTORE.md`, `docs/STORE_LISTING.md`, `app-metadata.json` — the same fact in the
  permission justification a reviewer reads, attached to `activeTab`.
- `.appforge/product.yaml` — `transmitted.endpoints` stays `[]`, which remains correct, with the
  comment extended to cover credentials and to point here.

### Why this is recorded as resolved rather than closed quietly

The entry exists because the *decision* is the artifact. Someone reading
`credentials: "include"` in a privacy-positioned product will ask this question again — most likely
a Chrome Web Store reviewer during the APP-46 telemetry change, which moves this product from
"collects nothing" to "collects User activity" and rewrites the same disclosure documents. The
answer should be on the record, with its reasoning, before it is asked for. "Reviewed, correct as
written, here is why" is the outcome, and the disclosure work is what makes it defensible.

Per APP-81 the code change is small and rides along with the next `json-workbench` release rather
than getting its own.

**Related** APP-46 §3.4 (source of the finding), `DEC-0006`, OPP-0001 q13.

---

## DEBT-0005 — Run issue-binding is read only from the run record, so an unbound run can hold a checkout it cannot write to

**Raised by** APP-184, 2026-09-29. **Severity** High.
**Status** Resolved via workaround, 2026-09-29 — the upstream defect is still open.

Verified against the running server, `@paperclipai/server` v2026.916.1, resolved from
`~/.paperclip/cli/current` (a symlink to `cli/installs/npm/2026.916.1`; the two `~/.npm/_npx`
copies on this machine are the same version but are not what serves port 3100).

### What

Paperclip's cross-issue containment check resolves "which issue is this caller working on"
from the **run record's `contextSnapshot` alone**:

```js
// dist/services/cross-issue-influence-limit.js:69
const sourceIssueId = readRunSourceIssueId(run.contextSnapshot);
if (!sourceIssueId) throw crossIssueInfluenceRunContextError();   // line 71 -> 403
```

`readRunSourceIssueId` (line 16) reads exactly `contextSnapshot.issueId` then
`contextSnapshot.taskId`, and nothing else. A write is only free when that value equals the
target issue.

Meanwhile `issuesSvc.checkout` sets `checkoutRunId`, `executionRunId` and `status:
"in_progress"` on the **`issues` row only**. No code path writes `issueId` back into
`heartbeatRuns.contextSnapshot` — every `contextSnapshot` reference in `issues.js` is a read.
`issues.checkoutRunId` is never consulted by the containment check.

**That gap is the defect.** A run with no binding can acquire a checkout, flip an issue to
`in_progress`, and then be refused on every write to the issue it holds. It is deterministic,
not a race.

### Why it costs something

The 403 is not the harm; the sequence around it is. An unbound run that checks out work moves
the issue to `in_progress` and then cannot comment, cannot set status, cannot mark `blocked` or
`done`. It can only end — after which the recovery classifier sees an `in_progress` issue with
no disposition and raises `stranded_assigned_issue` to the board under
`routingPolicy: board_escalation_no_takeover_v1`, whose `nextAction` is "Board operator: inspect
the evidence, repair the runtime."

So a containment rule working as coded manufactures human inbox items out of agents that were
structurally prevented from writing their own disposition. Issue CREATE stays available (it is
company-scoped), which is the only reason APP-184 exists as an issue rather than a comment.

### Where the unbound runs actually come from

APP-184 named `max_turns_continuation_retry` as the cause. That is wrong, and the correction
matters for anyone deciding what to fix.

`scheduleBoundedRetryForRun` builds the successor context as
`withRecoveryContext({ ...contextSnapshot })`, and `withRecoveryContext` scrubs only
model-profile and recovery-intent keys — `issueId` and `taskId` survive verbatim. Across 300
run records: 275 bound, 25 unbound, and **zero runs ever lost a binding across a retry**. Of
the 25 unbound, 14 faithfully inherited unbound state and 11 are origins. Every origin is a
non-issue wake path:

```
9 x resuming after provider_quota reset (watchdog)
1 x quota-retry-watchdog smoke test
1 x ad-hoc board-comment wake
```

Continuation retry is a **propagator, not an origin**: it inherits missing state and carries it
forward. The dominant origin is the quota-resume watchdog — which is the workaround this
register certified for **DEBT-0001**, and whose blind spot is **DEBT-0003**. The watchdog wakes
an agent to resume after a provider reset without binding that wake to the issue it was working,
and the binding is then absent for the rest of the retry chain. Fixing continuation inheritance
would have changed nothing.

The census is recorded as evidence on [APP-79](/APP/issues/APP-79), where it corroborates the
existing upstream reports — [#13708](https://github.com/paperclipai/paperclip/issues/13708) and
[#13365](https://github.com/paperclipai/paperclip/issues/13365) already reach this same failure
from timer wakes and harness-dispatched wakes — rather than describing a separate defect.

### Why it is not ours to report, and what is still ours

All the candidate fixes are in `@paperclipai/server`, a vendored third-party package this
company does not own. Patching `node_modules` is not a fix — it is silently reverted by the next
CLI install and would leave the running server diverging from its version string with no record.
Upstream is the only real route, and upstream is already on it.

**Reporting this is not owned by APP-191, and not owned by us at all.** The defect was reported
upstream by others before this company met it; an eighth report would be a duplicate, and filing
one is explicitly ruled out. The duplicate map is in the ruling comment on
[APP-74](/APP/issues/APP-74) (comment `8734b2cc`), and APP-191 was closed `done` on that basis on
2026-09-29 with its residuals carried to [APP-193](/APP/issues/APP-193). Read the upstream
threads rather than re-deriving this entry:
[#13078](https://github.com/paperclipai/paperclip/issues/13078),
[#13822](https://github.com/paperclipai/paperclip/issues/13822) and
[#12750](https://github.com/paperclipai/paperclip/issues/12750). #13822 states this entry's exact
mechanism — `heartbeat_runs.context_snapshot->>'issueId'` is written at wake and never updated,
while checkout writes only `issues.checkout_run_id`; *"the two halves never meet."*

Each fix worth having already has an open upstream PR behind it. PR numbers and their open state
are as recorded on [APP-79](/APP/issues/APP-79), verified against the tracker on 2026-09-28:

1. **Backfill the binding on checkout.** When `checkout` succeeds, write `issueId` into the
   run's `contextSnapshot`. Closes the defect at its narrowest point and makes self-selected
   work first-class. Open upstream as
   [#14259](https://github.com/paperclipai/paperclip/pull/14259) /
   [#14229](https://github.com/paperclipai/paperclip/pull/14229).
2. **Treat a live checkout as a valid binding.** If `issue.checkoutRunId` equals the calling
   run, a write to that issue is not a cross-issue write, whatever the run record says. Defence
   in depth for (1), and the correct reading of "this is not a cross-issue write." Open upstream
   as [#14344](https://github.com/paperclipai/paperclip/pull/14344) — *"let a run write the issue
   it holds, and stop telling it to resend a header it sent."*
3. **Split the error code.** `cross_issue_influence_run_context_required` is thrown from three
   distinct conditions — malformed run id (line 50), run row not found or company/agent mismatch
   (line 67), and run has no issue binding (line 71) — sharing one copy that only fits the
   first: *"This request arrived without a valid run … Send the `X-Paperclip-Run-Id` header with
   your current run and retry."* In the third case the run is entirely valid and the header was
   already correct, so the stated remedy is unfollowable and invites a retry loop. The code's own
   comment says the copy exists "so the agent reading this 403 is told the fix, not just the
   refusal" — condition 3 defeats that intent. Open upstream as
   [#14304](https://github.com/paperclipai/paperclip/pull/14304) /
   [#13899](https://github.com/paperclipai/paperclip/pull/13899).

A fourth fix this entry once proposed — *bind watchdog and quota-resume wakes at origin* — is
**withdrawn on 2026-09-29 and should not be carried anywhere.** It is not implementable, and
asking for it would have been a bad ask. `scripts/quota-retry-watchdog.mjs:241` resumes an agent
with `paperclipai agent wake <agentId> --source automation --trigger system --reason <text>`, a
command that takes an **agent** reference and exposes no issue option at all (verified against
`agent wake --help` on v2026.916.1: only `--source`, `--trigger`, `--reason`, `--payload`,
`--idempotency-key`, `--force-fresh-session`). An agent-level resume after a quota reset has no
issue to bind, because the agent selects its next issue *after* the wake. An unbound run is
inherent to agent-scoped wakes — which is exactly why binding at checkout (1) and honouring a
live checkout (2) are the right direction, and why upstream choosing that direction is right.

**What is still ours is the residual, not the report.** We run a version without the fix, and we
hold a local workaround that should not outlive it. That residual is tracked on
[APP-79](/APP/issues/APP-79) — which watches the PRs above and the separate attribution-laundering
family alongside them — and not on any new filing. The exit trigger for this entry is unchanged:
DEBT-0005 moves from *Resolved via workaround* to *Resolved* only when a released Paperclip
version makes an unbound run either bound-on-checkout or able to write the issue it holds. Only
the owner of the wait has changed.

Two fixes APP-184 proposed should be **dropped**. Inheriting the predecessor's `issueId` is
already implemented and working. Breaking a stranded checkout is already implemented by
`adoptStaleCheckoutRun` (`issues.js:4716`), which transfers a lock when the holder is terminal
and the actor is live; APP-184's "permanent" lock cleared on its own, and its "16 of 25 stranded"
figure was a point-in-time snapshot that has since drained. Both were real observations read as
structural facts.

### Mitigation — the part that is ours

The harm requires an unbound run to *check out* something. That step is ours to withhold:

> **A run with no issue binding must not check out an issue.** Use issue CREATE — which is
> company-scoped and unaffected — to hand the work to a fresh issue instead.

The condition is detectable before any damage, because a run may read its own record:

```sh
curl -s -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
     -H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID" \
     "http://127.0.0.1:3100/api/heartbeat-runs/$PAPERCLIP_RUN_ID" \
  | python3 -c "import json,sys; cs=json.load(sys.stdin).get('run',{}).get('contextSnapshot') or {}; \
print(cs.get('issueId') or cs.get('taskId') or 'UNBOUND')"
```

`UNBOUND`, or an empty `PAPERCLIP_TASK_ID`, means: do not call `POST /checkout`. Check this at
run start rather than discovering it on the first 403 — by then the issue is already
`in_progress` and the escalation is already earned.

### Why nobody caught it: the check is outside its own rollout staging, and leaves no audit row

The containment cap was shipped behind a staged rollout. `evaluateCrossIssueInfluenceLimit`
(line 26) computes `mode = now >= CROSS_ISSUE_INFLUENCE_ENFORCE_AT ? "enforce" : "log_only"`
(line 28) against a hardcoded `2026-08-11T00:00:00.000Z`, and in `log_only` everything is
`allowed` regardless of count — a soak period that lets the cap be observed before it can refuse
anything.

**The run-context precondition never got that soak.** All three of its throws — malformed run id
(line 50), run row not found or company/agent mismatch (line 67), no issue binding (line 71) —
fire *before* line 81, where `evaluate` is first called. None of them reads `mode`. So the part
of the check that had a staged rollout is the 20-write cap, and the part that actually strands
agents was fail-closed from the moment the code shipped.

Worse, those throws also precede the `activityLog` insert on line 82. The
`issue.cross_issue_influence_observed` and `issue.cross_issue_influence_cap_rejected` rows — the
records that would let an operator count how often this fires — **are never written for a
run-context refusal.** The only trace is the 403 returned to a caller that, by construction,
cannot write it down anywhere. That is why the failure surfaced as sixteen apparently unrelated
`stranded_assigned_issue` escalations rather than as one countable signal, and it is the reason
this entry needed a run to hit the wall personally before anyone could describe it.

This adds a fourth ask, and it is the cheapest of the four: **log the run-context refusal.**
Emit an activity row (or at minimum a `logger.warn`) before throwing at line 71, with `runId`,
`agentId` and the attempted `targetIssueId`. It changes no behaviour, needs no decision about
containment semantics, and would turn this defect from something an agent has to experience into
something an operator can query. Unlike fixes 1-3 it has **no matching open upstream PR** as of
2026-09-28 — it rides on [APP-79](/APP/issues/APP-79)'s watch as a thing to check for in a
release, not as a new filing; filing it is out of scope under the 2026-09-29 ruling.

### Residual risk

The mitigation is a convention agents follow, not a control the server enforces; nothing stops
an unbound run from checking out. It also does not help a run that is unbound for a reason we
have not seen, and it does not recover an issue already left `in_progress` by a past occurrence
— those still need a board operator. The defect itself is untouched and will reappear on every
CLI upgrade until upstream changes, which is why this entry stays in the register. It moves to
*Resolved* only when a Paperclip release makes an unbound run either bound-on-checkout or able
to write to the issue it holds — a trigger unchanged by the 2026-09-29 ruling that moved the
wait onto [APP-79](/APP/issues/APP-79).

---

## DEBT-0006 — The production release path is defined by mutable refs on a repo with no rulesets and no environments

**Raised by** [APP-233](/APP/issues/APP-233), 2026-09-30. **Severity** Medium.
**Status** Open — the fix is $0 but needs `administration: write`, which no agent holds.

### What

Every shipping product consumes `release-platform`'s reusable workflows by **moving major tag**.
Twelve call sites across five repos, all pinned `@v2`, verified 2026-09-30 by reading each
workflow blob:

| Consumer | Call sites |
|---|---|
| `json-workbench` | `app-ci.yml@v2`, `listing.yml@v2`, `release.yml@v2` |
| `TelePort` | `app-ci.yml@v2`, `promote.yml@v2`, `release.yml@v2` |
| `echokit` | `app-ci.yml@v2`, `release.yml@v2` |
| `GitaVerses` | `app-ci.yml@v2`, `release.yml@v2` |
| `TeluguPanchangam` | `app-ci.yml@v2`, `release.yml@v2` |

`v2` currently resolves to `3b1cd6cd` (= `v2.2.0`) and is **force-moved by CI**:
`.github/workflows/move-major-tag.yml` runs on `push: tags: ['v*.*.*']` and ends in
`git tag -f "$major" && git push -f origin "refs/tags/$major"` with `contents: write`.
That is intended behaviour, not a defect.

What is missing is any server-side check on the refs that decide what runs:

- `GET /repos/ravitejakamalapuram/release-platform/rulesets` → `200 []`. **No branch rulesets and
  no tag rulesets.** So neither `main` nor `v2` nor any `vX.Y.Z` point tag is protected against
  force-update or deletion.
- `GET /repos/.../branches/main` → `"protected": false`.
- `GET /repos/.../environments` → `"total_count": 0`. The `release` and `promote` workflows carry
  **no environment protection rule**, so there is no required-reviewer step in front of a
  production release either.

The repo is public, so rulesets are available on the free plan — this costs nothing and involves no
plan change. Six of the seven public repos are equally unprotected (`appforge-kit`,
`release-platform`, `echokit`, `TelePort`, `GitaVerses`, `TeluguPanchangam` all report
`"protected": false`); `json-workbench` is the only repo in the fleet with an active ruleset
(`protected-main`: `deletion` + `non_fast_forward`). The five private repos cannot have rulesets at
all — `GET /rulesets` returns `403 "Upgrade to GitHub Pro or make this repository public to enable
this feature."` That asymmetry looks like an accident of history rather than a decision.

### Why it matters — and why `main` is the wrong thing to protect

This entry exists mainly to correct an intuition that is easy to reach and wrong. The obvious
reading of "the release repo's `main` is unprotected" is that `main` should be protected, by analogy
with `json-workbench`'s `protected-main`. **Nothing consumes `main`.** All twelve call sites resolve
a tag. A branch ruleset on `refs/heads/main` would leave the entire release path exactly as mutable
as it is today, while looking like the problem had been addressed — which is worse than leaving it
open and knowing it.

The ref that decides what runs in every product's production release is `refs/tags/v2`, and behind
it the `vX.Y.Z` point tags it is derived from. A force-push to either changes what every consumer
executes on its next release, with no PR, no review and no diff anyone is prompted to read.

### What would resolve it

Tag rulesets on `release-platform`, not a branch ruleset. The zero-risk subset that needs no bypass
list at all is the point releases, because `move-major-tag` never touches them:

- `refs/tags/v*.*.*` → `deletion` + `non_fast_forward`. This makes shipped point releases
  immutable. `v2.2.0` can then never be quietly re-pointed; changing what `v2` runs requires
  pushing a *new* point tag, which appears in the tag list.
- The moving alias (`refs/tags/v2`, matched by `refs/tags/v[0-9]` and deliberately **not** by
  `refs/tags/v*.*.*`) is the harder case: `non_fast_forward` there would break `move-major-tag`
  unless the ruleset carries a `bypass_actors` entry for the GitHub Actions integration. Protecting
  it against `deletion` only is safe without any bypass.
- `refs/heads/main` → `deletion` + `non_fast_forward`, matching `json-workbench`, is worth having
  for consistency but should not be mistaken for the release-path control.

All of this needs `administration: write`. The `appforge-agents` App does not hold it, and widening
it is forbidden ([APP-138](/APP/issues/APP-138) ruling: the refusals are among the few demonstrated
server-side controls this company has, and are not to be routed around). So this is founder-hands-only
by construction, and it is recorded rather than requested — see the *Not a request* note below.

### Residual risk, and what would raise the severity

Severity is Medium rather than High because no agent credential observed today can write to this
repo: this run's App installation token is scoped to eleven repos
(`appforge-kit`, `appforge-control`, `appforge-brain`, `echokit`, `json-workbench`, `TelePort`,
`StellarTab`, `GitaVerses`, `TeluguPanchangam`, `cors-enabler`, `session-transfer`) and
**`release-platform` is not among them**. The exposure is to the founder's own hands and to anything
holding the founder's personal credential — not to the agent fleet. Whether the App *installation*
includes `release-platform` is not determinable from an agent run; installation repo selection is
founder-only.

This becomes High the moment `release-platform` enters any agent's `APPFORGE_AGENT_REPOS` or the App
installation, because then a cooperative-only deny list would be the sole thing standing between an
agent and the production release path of five products. If that change is ever proposed, this entry
is the reason to do the tag rulesets first.

### Not a request

[APP-233](/APP/issues/APP-233) parked this deliberately and carried no interaction card. The founder
ruled on 2026-09-30 ([APP-135](/APP/issues/APP-135) / [APP-216](/APP/issues/APP-216)) that the
`appforge-brain` `board-approved` gate stays **advisory at $0** — no GitHub Pro, no server-side gate,
cooperative controls only. That ruling was about the governance gate on the private repos; it did not
name the public repos and did not name release safety. Nothing here reads a decision into that
silence: the register is the right home for a gap that is understood, costed at $0, and needs an
authority the CTO does not hold. It stays Open until either the rulesets exist or the founder rules
that the 2026-09-30 stance covers this too, in which case it closes as a decision rather than a fix.

---

## DEBT-0007 — A bypass of the advisory `board-approved` gate leaves no signal

**Raised by** [APP-233](/APP/issues/APP-233), 2026-09-30. **Severity** Low.
**Status** Open — needs the `workflows` permission, which no agent holds.

### What

`appforge-brain`'s `.github/workflows/pr-checks.yml` job
`governance-permanent-paths` fails a pull request that touches `company/`, `strategy/` or
`policies/` unless the PR carries the `board-approved` label. The founder ruled on 2026-09-30 that
this gate is **advisory by design** — it is not backed by branch protection and cannot block a
merge. That is the chosen design, not a limitation, and is not to be re-filed as a defect.

The gap is narrower and is about observability, not enforcement: because the check runs only
`on: pull_request`, a PERMANENT-path change that reaches `main` **without** the label produces no
signal anywhere. The advisory gate's entire value is that someone notices; today a bypass is
indistinguishable from compliance after the fact, without going and diffing `main` by hand.

### Why it matters

An advisory control is a reasonable choice, but it is only coherent if the advice is visible when
ignored. "Advisory" and "silent" are different properties, and the 2026-09-30 ruling chose the first.
This entry exists so that the second is not read as having been chosen alongside it.

### What would resolve it

A `push`-triggered re-check on `main` that re-runs the same PERMANENT-path diff against the merged
commit and raises an alarm when such a commit landed without the label. It cannot block a merge, so
it does not contradict "advisory" — it makes a bypass visible rather than silent. Whether that counts
as a *cooperative control* (which `DEC-0016` statement (2) describes, and which the 2026-09-30 ruling
is an argument for) or as a *server-side gate* (which the ruling closed) is the founder's reading to
make, not the CTO's.

The file lives under `.github/workflows/`, which the `appforge-agents` App is refused server-side for
lack of the `workflows` permission, so it is founder-hands-only. A ready-to-commit draft is attached
to [APP-233](/APP/issues/APP-233); per that issue it should ride in the **same** founder commit as
[APP-213](/APP/issues/APP-213) and [APP-138](/APP/issues/APP-138) rather than becoming a third ask.

### A citation correction worth carrying

The 2026-09-30 position is widely cited as "cooperative controls only, per `DEC-0016`". Two things
about that citation, verified 2026-09-30:

1. **`DEC-0016` is not on `origin/main`.** It exists only on four unmerged branches
   (`app-136-ci-advisory`, `ceo/APP-78-containment-model-correction`,
   `cto/APP-109-dec-0016-containment-model`, `cto/APP-126-dec-0012-and-uid-containment`), as
   `decisions/DEC-0016-os-uid-is-the-only-containment-boundary.md`. `main` carries `DEC-0001`–`0005`,
   `0006`–`0011`, `0013`–`0015`, `0018`, `0020`; `0012`, `0016`, `0017` and `0019` are absent. A
   reader of `main` cannot check the citation. Same failure mode as the `DEC-0012` case tracked on APP-88 —
   cite the **APP-135 / APP-216 ruling**, not the DEC number.
2. **Its subject is the containment boundary, not a controls policy.** `DEC-0016` is the APP-78
   record that the OS uid is the only containment boundary. Its statement (2) — "every agent-facing
   deny list is cooperative" — is an *observation that our existing deny lists are cooperative and
   must not be described as a sandbox*. It is not a rule that the company may only ever hold
   cooperative controls, and it should not be stretched into one to refuse a server-side control on
   some unrelated repo. The authority for the 2026-09-30 refusal is the founder's ruling; `DEC-0016`
   is context for it.
