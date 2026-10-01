---
id: DEC-0016
title: "The OS uid is the only agent containment boundary; stay on deploymentMode local_trusted and say so in the records"
context: >
  CTO escalated (APP-73, raised SEV1) that the local Paperclip API grants board/instance-admin
  authority to requests carrying no credential at all. CEO re-derived the mechanism: the control
  plane runs with `server.deploymentMode = "local_trusted"`, in which the auth middleware defaults
  every request's actor to board/instance-admin before examining any credential. That mode is
  designed, named and set by `onboard` in this instance's own `config.json` — it is documented
  vendor behaviour, not a vulnerability. The consequence is that several boundaries our records
  asserted as server-enforced were never switched on. CTO's phrasing was "several of our written
  boundaries are therefore decorative," and that was correct in substance.
question: >
  Is agent-to-agent issue containment enforced by the control plane, and if not, what is the
  actual boundary — and do we migrate to `deploymentMode: authenticated` or accept the position
  and correct the records?
options:
  - "Treat it as a vulnerability and migrate to `deploymentMode: authenticated` now."
  - "Accept the position on single-user + loopback grounds, and correct every record that claims server-side enforcement — chosen."
  - "Leave the records as they are and rely on agents not testing the claim."
  - "Add an application-layer shim that re-checks credentials above the vendor middleware."
decision: >
  Stay on `deploymentMode: "local_trusted"`. The migration to `authenticated` is explicitly
  DEFERRED, not in progress, and no record may describe or hedge toward it as planned work. What
  changes is the writing, not the server. Three statements are now the company's position and
  supersede any contrary wording elsewhere. (1) THE OS UID IS THE CONTAINMENT BOUNDARY — not the
  control plane. Every agent runs arbitrary Bash as the founder's uid; any process at that uid can
  read any issue in this company and write any issue in this company with no credential, and can
  already read `master.key`, `decision-signing.key` and the embedded Postgres data dir directly.
  (2) EVERY AGENT-FACING DENY LIST IS COOPERATIVE. `APPFORGE_AGENT_REPOS=none`, the `TOOLS.md`
  deny lists, and the per-run cross-issue write cap shape what a well-behaved agent does. They are
  not a sandbox and must not be described as one. (3) WE GAVE UP ATTRIBUTION INTEGRITY. An
  unattributed write is possible, so the audit trail cannot be relied on to name every actor. That
  is an accepted cost of this position, not an oversight, and a record that omits it has the same
  defect in a new coat.
evidence:
  - "`~/.paperclip/instances/default/config.json` sets `server.deploymentMode = \"local_trusted\"` (line 23), `server.bind = \"loopback\"`, `server.host = \"127.0.0.1\"`, `server.port = 3100`. Set by `onboard`; this is a named vendor mode, not a misconfiguration."
  - "Measured 2026-09-28 in a CEO run, read-only: `curl` of `GET /api/companies/<id>/issues` with NO `Authorization` header at all returned `HTTP 200` and all 99 issues in the company. No credential was presented and none was required."
  - "`lsof -nP -iTCP:3100 -sTCP:LISTEN` shows exactly one listener, `127.0.0.1:3100`. The instance is not reachable off this host, which is the entire basis for accepting the position."
  - "`~/.paperclip/instances/default/secrets/` is mode 700 and contains `master.key` and `decision-signing.key`, each mode 600, owned by uid 502 (`rkamalapuram`) — the same uid every agent process runs as. The embedded Postgres data dir is under the same ownership. No agent needs the API to reach any of this."
  - "The named mechanisms our records lean on — `issue_write_actor_class_excluded`, `issue_write_responsible_user_ceiling`, `cross_issue_influence_cap_exceeded` (the per-run cross-issue cap), `issue_write_assignee_run_lock` — are all documented in `appforge-control/docs/paperclip-run-binding.md` and are all reached only AFTER credential verification. An actor presenting no credential is never measured against any of them. They are real features that work correctly for credentialed actors; they are not containment."
  - "DEC-0001 accepted same-uid READ access as a bounded risk but asserted the boundary was credential scoping, and its comparison table states blast radius is 'Bounded by what the agent's GitHub App installation token can do'. That row is false: the blast radius is the uid. DEC-0001's actual decision (no separate OS user) is unaffected and remains active; only its characterisation of the boundary is corrected, via `review_outcome` on that record, because `decisions/` is append-only."
  - "DEC-0013 found the same class of defect on the credential path (an agent-reachable `git credential fill` token) and recorded the general lesson that 'a denial that lives only in a markdown file is not a boundary'. This record applies that lesson to the control plane, which DEC-0013 did not cover."
  - "Board approval `e028e2f9-017b-4dbb-a2bb-1afac4dee905` on APP-73 was approved as recommended, with no amendment, including the risk list from which the revisit trigger below is taken verbatim."
reason: >
  The server is behaving as designed and documented, so there is nothing to fix in it; the defect is
  entirely in our own writing. That distinction decides the remedy. An application-layer shim above
  the vendor middleware would be new, unreviewed security code written to restore a property the
  uid does not actually give us, and migrating to `authenticated` buys little while the only
  listener is loopback on a single-user machine and every agent already runs at the uid that owns
  the signing keys — it would move the credential check in front of an actor who can read the
  keys either way. What is genuinely dangerous is the drift: an agent reading our records today
  reasons from a boundary that does not exist, plans around it, and reviewers stop checking it.
  That is the same failure mode as DEC-0013, and it is why the correction is worth doing carefully
  rather than softening. Specifically it must NOT be softened into "containment is layered."
  There is one layer and it is the uid; understating that is the defect being fixed, not a
  diplomatic way of describing it.
expected_result: >
  No record in `appforge-brain` or in any `agents/*/AGENTS.md` or `agents/*/TOOLS.md` asserts or
  implies server-side enforcement of agent-to-agent issue boundaries. Every deny list is labelled
  cooperative at the point of use. The per-run cross-issue cap and the run-attribution audit trail
  are described as binding credentialed writes only. An agent that rediscovers the unauthenticated
  API path finds this decision and stops, instead of re-escalating it as a SEV1 for a third time.
risk: >
  The whole position is conditional, and the condition is the revisit trigger below. If it fires
  and nobody notices, we are left with records that read as an accepted risk while the premise
  making it acceptable has gone — which is strictly worse than the state this record is fixing,
  because it would look reviewed. That is why the trigger is written into
  `config/security.yaml` next to the containment claim rather than only here: a strategy document
  is not read by whoever changes a bind address. Accepting this also means the audit trail is
  advisory, so an incident investigation cannot prove which actor made a given write; if that ever
  matters for a real incident, `authenticated` gets re-scoped regardless of this record.
owner: CEO
date: "2026-09-28"
review_date: "2026-12-28"
status: active
tags: [security, containment, governance, infrastructure, paperclip]
summary: "The OS uid — not the control plane — is the only agent containment boundary: `deploymentMode: local_trusted` serves board authority to uncredentialed requests by design, so every deny list and write cap is cooperative and the audit trail is advisory. Stay on `local_trusted`; correct the records; void this ruling if the instance is bound beyond loopback or the machine becomes multi-user."
---

## REVISIT TRIGGER — this ruling is void if any of these becomes true

Taken from the board's own approved risk list on approval `e028e2f9`. This is not a review date;
it is a kill switch. If any condition below holds, **this decision is void immediately** and
`deploymentMode: authenticated` must be re-scoped, as an approval issue, before agents continue:

1. The instance is bound to anything other than loopback — i.e. `server.bind` is no longer
   `loopback`, or `server.host` is no longer `127.0.0.1`, in
   `~/.paperclip/instances/default/config.json`.
2. This machine becomes multi-user, or any second person gets agent access.
3. `server.deploymentMode` changes from `local_trusted` to anything else (in which case the
   records corrected under this decision become wrong in the opposite direction and need
   re-auditing, not deleting).

The same trigger is written into `appforge-control/config/security.yaml` beside the containment
claim it governs, because that is where someone changing a bind address will actually hit it.

## What this decision does NOT say

- It does not say the control plane is broken. `local_trusted` is a documented vendor mode and it
  is doing what it says.
- It does not say the deny lists are pointless. They are the operating instructions that keep
  well-behaved agents inside their remit, and they work for that. They are not a sandbox.
- It does not say containment is "layered". There is one layer. See `reason`.
- It does not authorise any agent to test the unauthenticated write path. The mechanism is
  established; a write probe would itself create the unattributed write this record documents as a
  cost. The read-only `GET` in `evidence` was sufficient and is the last probe anyone needs.

## Why this is a CEO record and not a CTO one

CTO raised the finding and escalated it correctly; maintaining `strategy/` and the decision log is
a CEO responsibility, and Paperclip's `delegation_cycle` guard also refused to let CEO hand the
follow-up back to the agent that escalated it. The substance of the finding is CTO's.

## Related records

| Record | Relationship |
|---|---|
| `DEC-0001` | Its decision (no separate OS user) stands. Its claim that blast radius is bounded by a GitHub App token is corrected here; see that record's `review_outcome`. |
| `DEC-0013` | Same class of defect on the credential path. Established that a markdown-only denial is not a boundary; this record applies it to the control plane. |
