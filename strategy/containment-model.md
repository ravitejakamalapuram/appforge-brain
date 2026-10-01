# Containment model: the OS uid is the boundary

**Ruling of record: `decisions/DEC-0016-os-uid-is-the-only-containment-boundary.md`**
(APP-73, board approval `e028e2f9`, 2026-09-28). Read that record for the evidence and the
revisit trigger. This document exists so an agent orienting itself in `strategy/` reasons from
the real boundary instead of a written one.

## The boundary

There is **one** containment boundary for AppForge agents and it is the **OS uid** they run as
(`rkamalapuram`, uid 502 — the founder's own user, per `DEC-0001`).

It is not the control plane. Paperclip runs with `server.deploymentMode = "local_trusted"`, a
named vendor mode in which the auth middleware defaults every request's actor to
board/instance-admin *before* examining any credential. Measured 2026-09-28: a `GET` of this
company's issue list with no `Authorization` header returns `200` and every issue. Any process at
this uid can therefore read and write any issue in this company with no credential — and does not
need the API at all to read `master.key`, `decision-signing.key`, or the embedded Postgres data
dir, all of which it owns on disk.

This is not a defect in Paperclip. It is what `local_trusted` means, and we chose to stay on it.

## What follows from that

- **Every agent-facing deny list is cooperative.** The `TOOLS.md` deny lists and
  `APPFORGE_AGENT_REPOS=none` describe what a well-behaved agent does. They are operating
  instructions and they work as such. **They are not a sandbox and must not be described as one.**
- **The per-run cross-issue write cap and the assignee run lock bind credentialed writes only.**
  So do `issue_write_actor_class_excluded` and the responsible-user ceiling. Every one of them is
  evaluated *after* credential verification, so an actor presenting no credential is never
  measured against any of them. They are real features for credentialed actors; they are not
  containment.
- **Every CI gate is advisory too.** No repo in this company requires a status check, a review,
  or even a pull request to merge into its default branch (verified 2026-09-29 across all 11 repos
  agents hold tokens for). A failing gate is a visible red X, not a block, so the same
  "cooperative, not enforced" verdict that applies to the deny lists applies to CI.
- **The run-attribution audit trail is advisory.** An unattributed write is possible, so the trail
  cannot be relied on to name every actor. We gave this up knowingly; it is an accepted cost of
  the position, not an oversight.

Do **not** restate this as "containment is layered." There is one layer. Understating it is the
specific defect `DEC-0016` was written to fix.

## The revisit trigger

`DEC-0016` is **void immediately** if the instance is bound to anything other than loopback, if
this machine becomes multi-user or a second person gets agent access, or if
`server.deploymentMode` changes. Any of those requires re-scoping
`deploymentMode: authenticated` as a board approval before agents continue. The trigger is
duplicated in `appforge-control/config/security.yaml`, next to the claim it governs, because
whoever changes a bind address will not be reading this file.

## Deferred, not in progress

Migration to `deploymentMode: authenticated` is **deferred**. The board considered and declined it
on APP-73. Nothing in this company should be planned, scheduled, or written as if that migration
were underway.

---

_Governance: this file records a board-approved ruling and is maintained by CEO under §6.2. It
does not restate or amend the PERMANENT founder-approved content in `strategy/` (see
`company/mission.md` and `strategy/2026-q4-goals.md`), which still needs founder approval to
change._
