---
id: DESIGN-TELEMETRY-G8-0001
title: "Completing G8 for JSON Workbench without transmitting anything: store-side measurement, and why in-extension telemetry is the wrong build this month"
owner: cto
date: "2026-09-28"
status: proposed
decision_needed_from: board
paperclip_issue: APP-46
parent_issue: APP-33
cites: [DEC-0003, DEC-0006, DEC-0004, DEC-0008, OPP-0001]
tags: [json-workbench, telemetry, g8, g9, privacy, analytics, appforge-edge]
summary: >
  G8's telemetry criterion names a mechanism (in-extension `app_installed`) as a proxy for a fact
  (the launch is real and installs are happening). For JSON Workbench the mechanism is unavailable
  without falsifying the product's central public claim, but the fact is directly observable
  store-side. Recommendation: complete G8 via a store-side install feed into the edge Worker
  (Track A, ~0.5 builder-weeks, zero bytes leave the browser, no permission change, no data-collection
  change, no package re-review), strike OPP-0001's activation and day-7-retention falsifiers as
  unmeasurable rather than leaving them pending, and defer in-extension telemetry (Track B) behind a
  pre-registered install-count trigger. Track B is NOT board-approvable as scoped today — at the
  current base of 3 installs it would spend the product's only differentiator to buy a proportion
  whose 95% confidence interval is roughly [1%, 91%].
---

# Telemetry as G8 completion — CTO design

**Scope.** This is a design, not an implementation, and it commits no Builder time. It answers the
four questions APP-46 asks and ends with an explicit approvability verdict.

**Authority note.** Everything in Track A is inside CTO authority to build *except* the §10.3/§22
wording amendment it depends on, which is a board item. All of Track B is a board item: it changes
`data_collection`, the privacy policy, the CWS data-use disclosure, and the store listing copy. Per
`AGENTS.md` § Forbidden the CTO cannot approve a data-collection or permission change and has not
assumed one here.

---

## 0. The finding that reorders the question

G8's acceptance criterion is *"store status PUBLISHED verified by status job; telemetry receiving
`app_installed`"*. Two clauses, one mechanised and one not:

| Clause | State | Mechanism |
|---|---|---|
| store status PUBLISHED verified by status job | **met** | `release-platform/scripts/status.mjs` already queries the CWS API per item and reports `published`/`submitted`; `status.yml` runs it |
| telemetry receiving `app_installed` | **not met** | no telemetry exists; `docs/TELEMETRY.md` says so deliberately |

Read the second clause as written and it names an *implementation*. Read what it is for and it names
a *fact*: the launch is real, and installs are actually happening — as opposed to a release pipeline
that reported success into a void. That distinction is the whole design, because for this product the
implementation is unavailable and the fact is not.

**The fact is directly observable store-side.** The Chrome Web Store Developer Dashboard reports
impressions, installs, weekly users, uninstalls and ratings. §18b of the master plan already
specifies the path — *"Store-side metrics: CWS installs/users/uninstalls/ratings via weekly
founder-free path = dashboard CSV export"* — and the receiving end already exists and is deployed:
`appforge-edge` is live at `https://appforge-edge.echokit-rk.workers.dev` with an admin-gated
`POST /v1/ingest/:source` that upserts into `metrics_daily` (`apps/edge/src/handlers/ingest.ts`,
keyed `(product, date, name, source)`, so replays are idempotent).

So the install signal G8 wants can be made real, continuous and falsifiable **without the extension
sending a single byte.**

What this does *not* recover is activation. That is dealt with honestly in §2 rather than papered over.

---

## 1. The minimum event set that makes G8 and G9 evaluable

APP-46's guess — "likely just `app_installed` + one activation event" — is right about G8 and wrong
about G9, and the reason is arithmetic, not privacy.

### 1.1 G8: one signal, and it is not an in-extension event

| Signal | Source | Name in `metrics_daily` | Cost to obtain |
|---|---|---|---|
| store status | CWS API via existing status job | — (already asserted by the job) | $0, already built |
| installs per day | CWS dashboard CSV → `POST /v1/ingest/cws` | `installs` | the ingest script (Track A) |
| weekly users | same | `weekly_users` | same |
| uninstalls | same | `uninstalls` | same |
| impressions | same | `impressions` | same |

`impressions` is not optional trim: it is the metric DEC-0006 bound the live kill criterion to
("weekly CWS impressions must at least double"), so the feed that carries it is load-bearing for a
decision already taken.

**G8 completes when:** the status job reports PUBLISHED *and* `metrics_daily` holds a non-zero
`installs` series for `json-workbench` covering at least 7 consecutive days from a store-side source.
That is strictly more evidence than "an `app_installed` event arrived once", and it is mechanised
rather than asserted.

### 1.2 G9: three of the four pre-registered thresholds are not purchasable at this scale

§22.1's evaluable set is WAU, D30 retention, activation, revenue path. §22.2's scale set is D30 ≥ 25%,
activation ≥ 40%, WAU growth ≥ 10%/mo. OPP-0001 q14 pre-registered (a) reach, (b) activation < 30%,
(c) day-7 return < 10%. Map each onto what is obtainable:

| Threshold | Store-side? | In-extension telemetry? | Verdict |
|---|---|---|---|
| (a) reach — weekly installs / impressions | **yes**, directly | not needed | **measurable now** |
| install rate = installs ÷ impressions | **yes**, both numbers are reported | not needed | **measurable now**, and a real funnel step nobody had claimed |
| 30-day survival proxy = weekly users ÷ cumulative installs | **yes**, coarse | better with telemetry | **measurable as a proxy**, must be labelled one |
| WAU per §18b (distinct `install_id` with ≥1 event in 7 days) | **no** — CWS "weekly users" counts the install base that checked in, not engaged use | yes | **not measurable**; see §1.4 |
| D1/D7/D30 cohort retention | **no** — CWS reports no cohorts | yes | **not measurable** |
| (b) activation < 30% | **no** — no store-side signal of any kind exists | yes, in principle | **not measurable**; see §1.3 |
| (c) day-7 return < 10% | **no** | yes, in principle | **not measurable** |

### 1.3 Why "in principle" is not "in practice" — the n=3 problem

OPP-0001 E5 records **3 users on 2026-09-28** (5 on 2026-09-27). Falsifier (b) asks whether activation
is under 30%. Take the most favourable case imaginable: telemetry ships, every install consents, and
one of three installs activates. The exact (Clopper–Pearson) 95% confidence interval on 1/3 is
approximately **[0.8%, 90.6%]**. The interval contains 30%, contains 5%, and contains 85%. The
measurement cannot distinguish "nobody activates" from "almost everybody does".

How much would be enough? For a two-sided test at α = 0.05, 80% power:

| Question | Instrumented, consenting installs needed |
|---|---|
| is activation 30% or 60%? (crude) | ≈ **20** |
| is activation 30% or 45%? (a real read) | ≈ **77** |

Now apply consent. `docs/TELEMETRY.md` commits to *"default is off and no event is sent before
explicit consent"*. For a privacy-selected developer audience 5–20% opt-in is the realistic band. At
15%, reaching the crudest useful n ≈ 20 requires on the order of **130–150 cumulative installs** —
roughly a 45× growth in the install base.

This is the answer to APP-46's instruction *"if the only honest telemetry is too weak to answer the
activation question, say so and change the question."* It is too weak, and notably it is too weak for
a reason that has nothing to do with privacy: **at n=3 no instrument answers the activation question,
privacy-preserving or not.** The privacy cost of Track B would be paid in full and the informational
return would be zero. That ordering matters — it means the recommendation does not depend on how much
weight one puts on the privacy claim.

It also means the weakness is **temporary**. If the listing rewrite works, the constraint dissolves.
So the correct disposition is not "never" — it is "not yet, and here is the number at which the answer
changes" (§5.2).

### 1.4 The Q4 sub-goal has the same problem, and it needs a board ruling

`strategy/2026-q4-goals.md` carries *"JSON Workbench: WAU +30% by 2026-12-31"*. Under §18b's
definition WAU requires telemetry, so as literally written this sub-goal is unevaluable on the same
grounds as falsifier (b). The store-side substitute is **CWS weekly users +30%**, which is measurable
from the Track A feed but is an *install-base* metric, not an engagement metric — an extension that
nobody opens still counts. Restating the sub-goal that way is defensible but it is a genuine weakening
and it is not the CTO's call. Flagged for the board alongside the §10.3 amendment; left unchanged here.

---

## 2. Staying literally true to the privacy claim

### 2.1 What the claim actually is, quoted

The constraint has to be checked against the exact published words, not a paraphrase:

| Location | Text | Falsified by *any* outbound event? |
|---|---|---|
| CWS short description | *"Nothing leaves your browser."* | **Yes.** Unqualified and absolute |
| CWS detailed description | *"Your source data stays in the browser."* | No — scoped to source data |
| `PRIVACY.md` §1 | *"does not collect, transmit, or sell any personal data, browsing history, or user-provided content"* | No — scoped to three categories, none of which an install counter is |
| `PRIVACY.md` §3 | *"does not use any third-party analytics, tracking pixels, telemetry services, or advertising networks"* | **Yes.** Cloudflare is a third-party processor and the thing being described is a telemetry service |

Two of the four are absolute. There is no phrasing of in-extension telemetry — anonymous, consented,
content-free, aggregate, sampled, any of it — that leaves the short description true. **Track B requires
rewriting the listing copy and `PRIVACY.md`, and therefore a G7 board approval carrying that diff.**
That is a straight consequence of the words we chose to ship, not a judgement call.

Track A, by contrast, is trivially compatible: the extension is not modified at all, so all four
statements stay true without qualification. `.appforge/product.yaml` keeps
`data_collection.collected: []` and `transmitted.endpoints: []` honestly, not by omission.

### 2.2 The tempting middle options, and why each fails

**Default-on anonymous aggregate telemetry.** §18b permits it (*"default on for anonymous usage only
if disclosed"*, and this product's `data_collection.sensitive` is `[]`), and it is the only variant
that solves the consent-dilution problem in §1.3. It is also the variant that makes "Nothing leaves
your browser" false for 100% of users instead of 15%. It maximises information and maximally destroys
the claim. Ruled out: APP-46 names the claim a hard constraint, and OPP-0001 E3 records an August 2026
trust shock in this exact category whose consequence was mass uninstalls.

**A one-shot install ping with no identifier.** Still an outbound request, so it still falsifies two
published sentences — and with no `install_id` it cannot be deduplicated, cannot support cohorts, and
cannot answer activation. It buys an install count we can already get from the store, at the cost of
the claim. Strictly dominated by Track A.

**Local-only activation with user-initiated disclosure.** The extension computes activation locally
and offers a link that opens a prefilled GitHub issue in the user's own client. Nothing is transmitted
by us, so it is literally true. But the yield is a handful of self-selected anecdotes — no rate, no
denominator — and it adds new product surface, which OPP-0001 puts explicitly out of scope
(*"New product surface of any kind — maintenance complexity 3 and policy risk 3 both argue against
adding any"*). Ruled out on cost-for-value, not on honesty. Worth reconsidering only if the board wants
qualitative activation colour and accepts it is not a measurement.

### 2.3 The privacy invariant Track A is built to preserve

Written as a testable invariant so a future reviewer can check it rather than trust it:

> For the whole of Track A, the diff to `json-workbench` contains no change to `manifest.json`, no
> new network call from any extension context, and no change to `.appforge/product.yaml`'s
> `data_collection` block. Every byte of measurement originates from the Chrome Web Store's own
> reporting of our listing, fetched by the founder and pushed to `appforge-edge` from outside the
> browser the user is running.

---

## 3. Downstream impact

### 3.1 Track A (store-side feed)

| Surface | Impact |
|---|---|
| Privacy policy | **none.** No change to what is collected from users |
| CWS data-use disclosure | **none.** No new data category to declare |
| Package re-review | **none.** No new extension version is submitted at all |
| `manifest.json` / permissions | **none** |
| `.appforge/product.yaml` | comment-level only — record the G8 disposition; `collected`/`transmitted` stay empty |
| `docs/TELEMETRY.md` | amend to record that G8 was completed store-side and that this document's design is deferred, not abandoned |
| §10.3 / §22 | **amendment required** — the only board item in Track A (§5.1) |
| New credential | the edge `INGEST_ADMIN_TOKEN` must be reachable by the ingest job. It is already a `wrangler secret`; the job runs on the founder's Mac, and per `AGENTS.md` rule 4 agents must not hold production write tokens — so the token stays in `appforge-control/secrets/` (sops) and the job reads it, rather than any agent receiving it |

### 3.2 Track B (in-extension telemetry) — the full bill

| Surface | Impact | Severity |
|---|---|---|
| Store listing copy | *"Nothing leaves your browser"* must go. This is the sentence the product ranks and converts on | **high** |
| `PRIVACY.md` §1 and §3 | §3 must be rewritten outright; the published GitHub Pages copy must be updated *before* submission or the disclosure/policy mismatch is an auto-rejection | **high** |
| CWS data-use disclosure form | changes from no-collection to declaring product-interaction data. The checklist's named failure mode is *"Data disclosure form matches reality"* and *"Privacy policy matches disclosure"* | **high** |
| Package re-review | **yes.** Any new version is reviewed, and this one combines a new data declaration with the two permissions OPP-0001 q13 identifies as the most scrutinised (`debugger`, `<all_urls>`). Expect a longer-than-normal cycle and budget for one rejection round. DEC-0006's risk section explicitly asked the CTO to confirm rather than assume this — **confirmed: re-review applies** | **high** |
| `manifest.json` permissions | **avoidable, and worth the effort to avoid.** Extension `fetch` follows ordinary CORS, so a `host_permissions` entry is only needed if the endpoint does not send `Access-Control-Allow-Origin`. `appforge-edge` currently sends no CORS headers and has no `OPTIONS` handler (`apps/edge/src/`), so as things stand a POST from the service worker would be blocked. Fixing that in the Worker keeps the manifest permission set **byte-identical** — which matters a great deal, because adding a permission is forbidden to the CTO outright and is the single thing store reviewers react hardest to | medium → **none if done via the Worker** |
| `.appforge/product.yaml` | real edit: `analytics_project`, `collected`, `stored.remote`, `transmitted.endpoints`, `third_party: [cloudflare]`, `retention`. §16.3: any change here ⇒ `risk:high` + board approval | **high** |
| **CI safety net** | **missing.** §13.2 promises a network-analysis and data-flow gate — *"grep + build-output scan for hostnames ⇒ must be in `transmitted.endpoints`"*. `appforge-kit/.github/workflows/checks.yml` states it explicitly: *"Still explicitly OUT OF SCOPE: network/data-flow/runtime checks."* `packages/e2e` is in flight but not wired. **The automated guard against exactly this class of mistake does not exist yet** | **blocking prerequisite** |
| `@appforge/telemetry` | queue only (`enqueue`/`peek`/`ack`/`drain`, 122 lines). No transport, no flush, no `install_id` generation, no consent gate, no alarms wiring. The transport half is unwritten | — |

That last row is the one I would put in front of the board first. Track B is a change whose failure
mode is silently transmitting something undeclared, and the automated check designed to catch that is
the one piece of the platform not yet built. Shipping Track B before the e2e request-logging harness
means the only thing standing between us and an undeclared endpoint is human review of a diff.

---

## 4. Cost

Builder-weeks assume the existing Builder; AI $ are estimates against DEC-0004's $100/month cap, based
on comparable tasks in this repo set (DEC-0006 priced the 0.1-bw listing rewrite at *"effectively zero
marginal cost"*). They are estimates, not quotes.

### Track A — ~0.5 builder-weeks, ~$4–8 AI

| Item | Owner | bw | Note |
|---|---|---|---|
| CWS stats CSV → metric-rows parser + `POST /v1/ingest/cws` client, with tests | Builder | 0.30 | pure Node, no extension code; the receiving endpoint already exists and is deployed |
| Weekly job wiring + runbook for the founder's CSV download (§18b A8) | Builder | 0.10 | manual download step until a CWS stats API exists |
| `metrics.md` definitions for `installs`, `impressions`, `weekly_users`, `install_rate`, `survival_proxy_d30` — each labelled proxy-or-not | CTO/Analyst | 0.05 | prevents `survival_proxy_d30` being read as D30 later |
| `docs/TELEMETRY.md` + `product.yaml` comment amendments | CTO | 0.05 | no functional change |
| DEC + §10.3/§22 amendment text for the board | CTO | — | this document plus a DEC; already substantially written |

### Track B — ~2.0–2.5 builder-weeks, ~$20–35 AI, plus founder time and a store review cycle

| Item | bw |
|---|---|
| e2e request-logging harness so §13.2's network/data-flow gate actually exists (**prerequisite**) | 0.4 |
| `@appforge/telemetry` transport: flush client, batch, `install_id`, consent gate, `alarms` | 0.5 |
| `appforge-edge` CORS/`OPTIONS` handling so no `host_permissions` entry is needed | 0.1 |
| `json-workbench` wiring: `onInstalled` → `app_installed`, `feature_used` at pipeline/SQL/diff success, options toggle, first-run consent | 0.5 |
| `PRIVACY.md` rewrite + published page + `CHROMEWEBSTORE.md` privacy section + `product.yaml` data block | 0.2 |
| Listing copy rewrite (short description no longer states an absolute) | 0.1 |
| Security review per §13.2 — CRITICAL classification ⇒ `codex_local` second opinion (`AGENTS.md` § Escalation) | 0.3 |
| QA (G5), RC (G6), board G7 approval packet, staged release | 0.3 |
| Founder: CWS data-use form, privacy page publish, review correspondence | — (hours, not bw) |
| Contingency: one rejection round | 0.2 |

Both tracks sit inside DEC-0004's cap. Cost is not the reason to prefer Track A; §1.3 is.

---

## 5. Recommendation

### 5.1 Track A — board-approvable as scoped. Recommend approval.

Approve the §10.3 G8 amendment below and the §22/G9 re-specification in §5.3. No data-collection
change, no permission change, no re-review, no privacy-policy change. The build itself is then LOW-risk
platform/docs work inside CTO authority.

Proposed §10.3 G8 amendment — a substitution, deliberately narrow:

> **G8 Launched.** Store status PUBLISHED verified by the status job; **and** an install signal
> landing in `metrics_daily` for ≥ 7 consecutive days. The install signal is normally telemetry
> receiving `app_installed`. **For a product whose `.appforge/product.yaml` declares
> `data_collection.transmitted.endpoints: []` and whose published store listing asserts that no data
> leaves the device, a store-reported installs series ingested from the store's own dashboard
> satisfies this clause instead.** The substitution must be recorded in a Decision naming the product;
> it is not available by default and never applies to a product that already transmits.

**Why this is not DEC-0008 in reverse.** DEC-0008 refused to move a §10.4 *weight* so a product would
pass, and it was right to. This is a different operation and the difference should be checkable rather
than asserted:

- it substitutes a *mechanism* for observing a fact, leaving the fact identical — "installs are
  happening" either way;
- the substituted evidence is **stronger**, not weaker: a 7-day store-reported series versus a single
  arriving event;
- eligibility turns on a **matter of record** (`transmitted.endpoints: []` plus a published
  no-transmission claim), not on judgement — the same bound DEC-0006 put on its own reclassification;
- it cannot be used to dodge anything, because a product that transmits is ineligible by construction;
- and it is paired with §5.3, which makes G9 **narrower** for this product, not easier.

If the board is not persuaded by that distinction, the honest alternative is to record JSON Workbench
as permanently incomplete at G8 and accept that Q4 O2 cannot be met. I do not recommend that, but it is
the coherent alternative and should be on the table rather than implied.

### 5.2 Track B — NOT board-approvable as scoped. Recommend deferral behind a numeric trigger.

Not on privacy grounds alone. At n=3 installs the measurement Track B buys has a 95% CI of roughly
[1%, 91%] on the one question it exists to answer, so the trade is the product's sharpest differentiator
for no information. Approving it today would be a decision that cannot be right at any privacy
weighting.

Pre-register the trigger now, so this is a deferral and not a quiet burial:

> When `metrics_daily` shows **cumulative installs ≥ 150** for `json-workbench`, the CTO reopens the
> Track B board request automatically, without waiting to be asked. 150 is the install base at which a
> 15% opt-in rate yields ≈ 22 consenting installs — the minimum n for the crude 30%-vs-60% read in
> §1.3. It is a floor for a coarse answer, not a comfortable sample.

Two conditions attach to that future request, and both should be minuted now:

1. the §13.2 network/data-flow e2e gate must exist and be green before any telemetry code merges;
2. the board request must carry the listing-copy diff, because "Nothing leaves your browser" cannot
   survive Track B and the board should approve losing that sentence with its eyes open.

### 5.3 Change the question — the part that is a real cost, stated as one

APP-46 instructed: change the question, not the claim. Concretely, for JSON Workbench's G9:

**Strike as unmeasurable** (do not leave pending — a pending falsifier makes G9 unevaluable forever,
which is the exact trap DEC-0006 found this product in):

- OPP-0001 q14 falsifier **(b)** activation < 30%;
- OPP-0001 q14 falsifier **(c)** day-7 return < 10%;
- §22.1/§22.2's activation and D30-cohort thresholds, for this product, this cycle.

**Keep, unchanged:** DEC-0006's bound criterion — weekly CWS impressions, four weeks post versus four
weeks pre, must at least double. It was chosen before this analysis and is not touched by it.

**Add, newly measurable from the Track A feed:**

- `install_rate` = installs ÷ impressions, pre/post. A real funnel step, store-side, no telemetry. It
  separates "invisible to the query" from "visible and unappealing" — which is the distinction
  DEC-0006's impressions-only criterion cannot make on its own, and is the most useful thing this
  design adds.
- `survival_proxy_d30` = weekly users at day 30 ÷ cumulative installs at day 30. Labelled a proxy in
  `metrics.md`. **Not** D30 retention and must never be reported as it: it measures install-base
  survival, not use.

Be plain about what this costs: **the founder's original activation hypothesis stays untested for
another cycle.** OPP-0001 already conceded that premise has no evidence behind it either way. The
choice is between an untested hypothesis and a hypothesis tested at n=3 — which is an untested
hypothesis wearing a number, and worse, because a number invites action.

---

## 6. Debt this surfaced

For `engineering/debt.md` (register does not yet exist — creating it is itself the first entry):

| # | Item | Why it matters | Sized |
|---|---|---|---|
| 1 | §13.2 network/data-flow CI gate absent; `checks.yml` declares it out of scope | the only automated guard against an undeclared endpoint. Blocks Track B | 0.4 bw |
| 2 | `@appforge/telemetry` ships a queue with no transport | the package looks done and is half-built; a future reader will assume otherwise | 0.5 bw |
| 3 | `appforge-edge` has no CORS/`OPTIONS` handling | no browser client can reach `/v1/events` today without a host permission nobody should add | 0.1 bw |
| 4 | `policies/chrome.md` does not exist | §16.4 assigns the CTO a quarterly-refreshed CWS policy digest; store-review claims are currently re-derived ad hoc, as they were for §3.2 of this document | 0.2 bw |
| 5 | `app-metadata.json` still says `draft`; `product.yaml` `first_published` is `null` | the §22.1 day-30/60/90 clock origin is unrecorded, and G9's day-30 date rests on it | 0.05 bw |
| 6 | `engineering/debt.md` register missing | `AGENTS.md` names it a CTO input and output | 0.05 bw |

Item 5 is worth the board's attention: G9's day-30 reading is dated 2026-10-20 in DEC-0006, but
`first_published` is `null` and documented as unrecoverable from the repo. The Track A feed does not fix
this — it needs a reading off the CWS listing. Worth closing before the clock is relied on.

## Related

- `DEC-0006` — reclassifies OPP-0001 and escalates telemetry as G8 completion; this document is its requested output
- `DEC-0003` — the authority JSON Workbench's growth loop proceeds under
- `DEC-0008` — why §10.4 was not recalibrated; §5.1 distinguishes this amendment from that refusal
- `DEC-0004` — $100/month cap both tracks sit inside
- `research/opportunities/OPP-0001-json-workbench-activation.yaml` — q13 (the hard constraint), q14 (the falsifiers §5.3 strikes), E5 (the install base)
- master plan §10.3 (gates), §13.2 (security pipeline), §16.3 (data classification), §18b (taxonomy, store-side metrics), §22.1/§22.2 (kill/scale thresholds)
- Paperclip `APP-46` (this design), `APP-33` (the deciding issue)
