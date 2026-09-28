# An approval records a decision, never an execution

**Status:** active policy. Raised by the CEO on APP-118 after a self-filed
avoidable failure; adopted via pull request so the founder is the one who merges it.

## The rule

> A board approval in `status: approved` is **authorization to attempt an action**.
> It is **never evidence that the action occurred.**

Nothing in this company reconciles the two. An approval does not change state when
its approved action goes unperformed, and no agent is notified. `approved` and
"done" look identical from the outside, and the platform offers no signal that
distinguishes them.

Three obligations follow.

### 1. Acceptance is stated as an observed effect, never as an approval status

Any issue whose unblock depends on an approval must state its acceptance criteria as
**the effect you expect to observe**, paired with **the exact read-only check that
proves it**. The approval's status is not an acceptance criterion and may not be
listed as one.

The worked example is APP-90, whose acceptance is the three observed effects of the
three requested console operations — never the status of approval `5ea35987`. Use
that table shape:

| # | Observed effect | Read-only check that proves it | Proven by |
|---|-----------------|--------------------------------|-----------|
| 1 | CTO membership holds `tasks:manage_active_checkouts` | `GET /api/agents/me` (as CTO) → `access.grants[].permissionKey` contains it | _run id + timestamp_ |

A check qualifies only if it is **read-only** and **cheap**. Re-attempting the
approved action to see whether it works is not a check — it is a second attempt at a
privileged operation, and it is forbidden here.

### 2. Pre-flight before dispatch — a step, not a habit

Before dispatching any agent on the strength of a decided approval:

1. Run the read-only check that proves the approved effect exists.
2. **Paste its output into the dispatching comment**, with the run id and timestamp.
3. Dispatch only if the effect is there. If it is not, say so on the approval's issue
   and route it back to the board instead of dispatching.

Writing the check down is the point. A pre-flight that happened but was not recorded
leaves the next reader in exactly the position this policy exists to prevent.

**No agent may be dispatched against an approval's status alone.** A dispatching
comment that cites only `status: approved` is an incomplete dispatch, and the
receiving agent is entitled to send it back rather than burn a run on it.

### 3. The same rule applies to a closed issue

An issue in `done` is a record that someone judged the work complete. Where the work
was a request for a board-side action, `done` carries exactly the same gap as
`approved` — see the audit on APP-118, where a `done` issue (APP-77) and an
`approved` approval (`3ac22df9`) both had to be checked against live state before
either could be believed, and gave opposite answers.

## Why this is written down

On 2026-09-28 the CEO read approval `3ac22df9` as `approved` and inferred the grant
it authorized had been made. It had not. On that inference the CEO opened APP-98 and
dispatched the CTO to call a route the missing grant could never have opened. The CTO
spent a run collecting two `403`s; the CEO spent a run ruling on them; the CPO stayed
blocked behind APP-26 throughout. Every actor reasoned correctly from the evidence in
front of them. The whole chain was avoidable by one free read-only call before the
first dispatch.

The failure scales with the size of the ask. Approval `5ea35987` requests three
console operations at once. If it is decided `approved` and any one of the three is
not performed, the company reads `approved`, believes the stall is clearing, and
dispatches against an effect that does not exist — the same failure with triple the
surface.

## Out of scope, deliberately

- **Do not build anything that executes approvals automatically.** That is a separate
  proposal with a separate blast radius and it has not been made.
- Whether a decided approval should carry an explicit `executed` / `verified_by`
  field is an **upstream platform change**. It is a recommendation to the board at
  most; no agent may attempt it.

## Related

- `policies/autonomy-levels.md` — which decisions need an approval in the first place.
- APP-118 — the audit of every approval decided `approved` in this company's history.
- APP-90 — the acceptance table this policy points at as its worked example.
