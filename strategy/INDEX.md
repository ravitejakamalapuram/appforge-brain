# strategy/ index

Hand-maintained — only `decisions/`, `postmortems/`, `research/opportunities/` and `experiments/`
get an auto-generated INDEX.md (see `scripts/generate-index.mjs` and §9.2 of the master plan).
Add a one-line summary per file here as content is added.

- `containment-model.md` — the OS uid is the **only** agent containment boundary; the control
  plane does not contain agents (`deploymentMode: local_trusted` serves board authority to
  uncredentialed requests by design), so every deny list is cooperative, the write caps bind
  credentialed writes only, and the audit trail is advisory. Ruling of record: `DEC-0016`. Carries
  the revisit trigger that voids that ruling if the instance is ever bound beyond loopback or the
  machine becomes multi-user.
