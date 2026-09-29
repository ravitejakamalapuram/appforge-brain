---
id: "DEC-0019"
title: "An uncredentialed local write must not publish as the board: ask upstream to stop assigning board authority by default, and make our own mis-stamped writes recoverable via the run-log marker"
context: >
  On 2026-09-28 a sweep of every comment in the company (107 issues, 202 comments) found 23 rows
  stored as `authorType: "user"`, `authorUserId: "local-board"`. Seventeen were genuine founder
  writes, one was self-declared, one is unresolved, and **five were agent writes wearing the
  board's name** — on APP-76, APP-94, APP-45, APP-8 and APP-78. The cause is that a client sending
  its credential as `X-Paperclip-Api-Key` instead of `Authorization: Bearer` is recorded as the
  founder and receives `201` with nothing indicating the credential was ignored.
  The misattribution is not cosmetic: a board/user comment on a closed issue reopens it while an
  agent comment is inert, so APP-45 went from `done` back to `todo` with nobody deciding that.
  Nine further board-attributed state changes are in the activity log, including APP-94's close
  clearing a live `checkoutRunId`, APP-78 being reopened and a scheduled retry run cancelled, a
  re-parenting, an archived founder inbox item, and three issues (APP-97, APP-105, APP-106) that
  now read as founder-filed when agents filed them — inverting the exact trust signal the
  investigation was opened about. Three separate agent seats made this typo in a single day, and
  one repeated it six minutes after writing the disclosure that identified it.
question: >
  Is this a documentation problem, a client problem, or an upstream control-plane defect — and what
  exactly should be asked of upstream, given that the Paperclip control plane is not our code?
options:
  - "Documentation only: write the correct header pair into every agent's TOOLS.md and rely on agents reading it."
  - "Client-side only: a shared request helper that sets both headers and asserts the echoed authorType, with nothing asked of upstream."
  - "Ask upstream to attribute the write using `derivedAuthorAgentId` when that field is populated, ranking it the higher-value half because the server already resolves the author at write time — RAISED AND APPROVED, THEN RETRACTED as resting on a false premise."
  - "Ask upstream to stop assigning board authority as the DEFAULT actor in local_trusted and to inspect the X-Paperclip-* namespace, with write-time run-id attribution as the secondary ask — chosen, as the amendment."
  - "Treat it as accepted risk under the uid-containment ruling and change nothing, since an actor at this uid can forge attribution anyway."
decision: >
  Adopted as this company's position and authorised for filing upstream, in this priority order.
  **(A) Primary.** In `local_trusted`, the control plane should stop assigning board authority as
  the *default* actor. `actorMiddleware` sets the `local-board` actor with `isInstanceAdmin: true`
  before any credential is inspected, and `hasBearerCredentials` keys on `Authorization: Bearer`
  only. A mistyped `X-Paperclip-Api-Key` is therefore never examined — the middleware does not
  enumerate the `X-Paperclip-*` namespace at all. There is no failed-authentication branch, which
  is precisely why the failure is silent. The ask is to inspect that namespace and reject a
  credential-shaped header there with `401` rather than falling through to the implicit board
  actor. This is an addition to the middleware, not a corrected branch.
  **(B) Secondary.** When a request presents no bearer but carries an `X-Paperclip-Run-Id` that
  resolves to a live agent run, attribute the write to that agent *at write time*. The server
  already attaches the run id to `req.actor.runId`, so the input is in hand; this makes the
  existing tier-1 derivation synchronous instead of lazy. It would NOT have caught the APP-78
  write, which sent neither header — which is why it is secondary.
  **Explicitly retracted.** The original recommendation, "attribute the write using
  `derivedAuthorAgentId` when that field is populated", ranked first on the ground that the server
  "already resolves the true author" at write time. That ground is false and the recommendation is
  not implementable at the write point, where the field is null by construction.
  **What is ours, needing nothing from upstream.** A shared request helper sets both headers once
  and, after any write, fails the run unless the response echoes `authorType: "agent"`; and every
  write logs the literal string `comment id: {commentId}`, which makes a future mis-stamped write
  of ours recoverable through tier 2 of the platform's own derivation. Tracked on APP-116 at LOW
  risk and $0, approved at CEO level, and not contingent on either board approval.
  This does not revisit DEC-0016. Record integrity is not access control, and nothing here changes
  who may write — only whose name a write carries.
evidence:
  - "Verified against the shipped source on local disk, not inferred from API responses: `@paperclipai/server` v2026.916.1 at `~/.paperclip/cli/installs/npm/2026.916.1/`. `middleware/auth.js:145` assigns `{ type: 'board', userId: 'local-board', isInstanceAdmin: true, source: 'local_implicit' }` as the initial value of `req.actor` when `deploymentMode === 'local_trusted'`, before reading any header; `hasBearerCredentials` is then computed as `/^bearer(?:\\s|$)/i.test(authHeader ?? '')`. No other header is consulted for authentication."
  - "`derivedAuthorAgentId` is a READ-path enrichment, not write-time resolution. `services/issues.js` defines `enrichCommentsWithDerivedAgentAttribution`, invoked when the comments endpoint is queried, which then calls `persistDerivedIssueCommentAttribution` as a best-effort cache — its own comment reads 'Persist a resolved attribution so subsequent reads stop re-scanning run logs' and 'a write failure must never break the read path'. At write time the field is null by construction."
  - "`deriveIssueCommentRunLogAttribution` (issues.js:852) has exactly two lossless tiers: tier 1 resolves the row's own `createdByRunId` to an agent run; tier 2 requires an overlapping run log to contain the literal `comment id: {id}`. The run-id header is not a tier — it populates `req.actor.runId`, which populates the column, which a later read resolves. APP-76's comment `5f37c78c` carries `createdByRunId: 4a0aa6c7` and reads back `derivedAuthorSource: run_id`, which is tier 1 firing on a subsequent read, not the server discarding a resolved author at `201`."
  - "The code deliberately refuses to guess from run-window overlap, in its own words because it 'cannot tell an agent comment from a human board comment' that happened during the run. Consequently APP-78's comment `5d78f4b6` is unrecoverable by design: `createdByRunId` is null so tier 1 cannot fire, and its run log carries no tier-2 marker. That is why it was claimed by hand in a new comment rather than corrected in place — the mis-stamped row is the audit evidence."
  - "Behavioural, not cosmetic, from the activity log: APP-45 `issue.updated` at 14:36:12Z records `reopenedFrom: 'done'`; APP-94 at 11:34:55Z cleared `checkoutRunId` from a live QA run and archived the item from the founder's inbox; APP-78 at 14:53:10Z set status `todo` and cancelled scheduled retry run `15b1b1ca`. The APP-78 write's own body says 'Moving this to blocked' — so the status it produced was not the status its author intended. A transition and a cancelled run that no actor chose."
  - "Documentation alone is refuted by the incident itself: the APP-78 write is 14:53:10Z, six minutes after the APP-98 disclosure that identified the mistyped header, by the same seat that wrote the disclosure. Knowing about the typo demonstrably did not prevent repeating it."
  - "Sweep coverage is asymmetric and stated as such. The comment sweep is complete at 202 comments. The activity-log sweep is not: that endpoint caps at the 500 most recent rows and ignores `offset`, `before` and `cursor`, so the window is 09:25:43Z–14:58:54Z on 2026-09-28. The nine board-attributed state changes are a floor, not a total."
  - "Detection by query is not available for four of the five. Only APP-76's write sent `X-Paperclip-Run-Id`, so only it has a non-null `createdByRunId`; the other four dropped credential and run id together and are metadata-identical to a founder write. Attribution for those rested on content, commit timestamps and run windows."
reason: >
  The conclusion survived the correction but the mechanism did not, and the difference matters for
  what gets filed. Framing the defect as "the request presents a credential in the wrong field and
  is read as presenting none" describes a wrong branch; there is no branch. Board authority is the
  default assignment, and the absence of any authentication-failure path is the reason nothing is
  logged, nothing is returned, and no client can detect the problem from a `201`. That is a more
  serious finding than the one originally taken to the board, not a lesser one, and it changes the
  ask from "use a field you already populate" to "inspect a namespace you currently ignore."
  Ranking (B) below (A) follows from the evidence rather than from cost: write-time run-id
  attribution would have rescued one of the five affected comments and none of the four that sent
  no run id, including the one that produced an unintended status transition.
  The client-side half is not a lesser mitigation to be traded against the upstream one. The
  control plane is not our code, so approval buys a filed position with no delivery date we
  control, while the helper has a date. The tier-2 marker is the most useful thing to come out of
  re-reading the source: it makes the platform's own recovery path work for our future mistakes at
  the cost of one log line, and it was invisible from the outside.
  On method, the failure worth recording is that a board recommendation was built on another
  agent's report plus observed API behaviour and was approved before anyone read the source, which
  was on local disk and readable throughout. The originating report flagged its own limit honestly
  — "observed behaviour, not implementation... the source is not in any repo we hold" — a caveat
  correct about repositories and wrong about availability. Inheriting a caveat instead of testing
  it is the error.
expected_result: >
  The position filed upstream is (A) then (B), with the retracted recommendation named as retracted
  so no reader reconstructs it from the earlier approval. APP-116 lands the helper: both headers set
  in one place, every write asserting `authorType == "agent"` and failing the run otherwise, the
  `comment id: {commentId}` marker logged after every post, and an end-to-end check that a write
  with no `createdByRunId` reads back `derivedAuthorSource: run_log_comment_post`. After that, a
  dropped credential produces a failed run rather than a silent founder-stamped write, and any that
  still slips through is recoverable by the platform without a hand-written claim. No further
  board-stamped agent write should enter the record unnoticed; the measure is that the next sweep
  finds new `local-board` rows only where a human actually wrote them.
risk: >
  Recommendation (A) is an addition to code we do not own and cannot schedule; if upstream declines
  or defers it, the helper on APP-116 is the whole of the mitigation and remains cooperative — an
  agent that does not use the helper is not stopped by it, exactly the property DEC-0013 says
  cannot be relied on. Scoping (A) too broadly across the `X-Paperclip-*` namespace would break
  legitimate callers, since `X-Paperclip-Run-Id` is itself sent unauthenticated by design and must
  keep working; the ask is deliberately limited to credential-shaped headers.
  Recommendation (B) makes a client-self-reported run id load-bearing for authorship. That is
  acceptable at `local_trusted`, where an actor at this uid can already claim any run id, and it
  must be re-reviewed before any `authenticated` deployment — the same tripwire DEC-0016 records.
  The five claimed writes are claimed on content and timing, not on platform metadata, because the
  metadata cannot support it; APP-44's comment `124e750c` is left unclaimed rather than guessed at.
  The activity-log floor of nine means the true number of board-attributed state changes before
  09:25Z on 2026-09-28 is unknown and not currently obtainable through any route found.
owner: CEO
date: "2026-09-29"
review_date: "2026-12-28"
status: active
tags: [security, attribution, audit, governance, control-plane, containment]
summary: "An uncredentialed local write is stamped as the board because `actorMiddleware` assigns board authority as the DEFAULT actor in local_trusted and only ever inspects `Authorization: Bearer` — so a mistyped `X-Paperclip-Api-Key` is never examined and there is no failure branch to report. Ask upstream to inspect that namespace and reject credential-shaped headers, with write-time run-id attribution second; meanwhile assert the echoed `authorType` and log the `comment id:` marker so tier-2 recovery works on our own mistakes."
---

## Why this was decided here

Board approval [`1dedf6eb`](/APP/approvals/1dedf6eb-1c88-4101-8e3f-b346eb8d5751) authorised the
original position on 2026-09-29T06:15:23Z, and amendment
[`90e205af`](/APP/approvals/90e205af-6e50-493a-9123-f6009a869437) replaced its operative text at
09:06:45Z after the retraction above. Two approvals rather than one because the CEO may not change
security policy and may not approve its own amendment — correcting the operative text of an
approved ruling is an amendment, not a clarification, so it went back to the board rather than
being edited in place.

The client-side half is not covered by either approval and did not need to be. It is a correctness
check in our own scripts that changes no authorisation behaviour, so it was approved at CEO level
and tracked on APP-116; it proceeds whatever upstream decides.

## Related

- [APP-115](/APP/issues/APP-115) — this ruling; [APP-102](/APP/issues/APP-102) — the originating sweep.
- [APP-116](/APP/issues/APP-116) — the shared request helper, the `authorType` assertion and the tier-2 marker.
- [APP-113](/APP/issues/APP-113) — QA claiming comment `8e4674e1` on [APP-94](/APP/issues/APP-94).
- `DEC-0016` — the OS uid is the containment boundary. Not revisited here; this is record integrity, not access.
- `DEC-0013` — an instruction not to look is a request, not a boundary. The reason the helper is mechanism rather than documentation.
