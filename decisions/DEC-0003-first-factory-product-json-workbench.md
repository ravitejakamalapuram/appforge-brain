---
id: DEC-0003
title: "First AppForge factory loop runs on JSON Workbench"
context: "AppForge's product factory (§10) needs to prove its full state machine (DISCOVERED -> ... -> RELEASE_CANDIDATE -> HUMAN_APPROVAL -> production) end to end on one real product before it's trusted with more. The portfolio has several live-or-near-live candidates: JSON Workbench, EchoKit, TelePort, StellarTab, GitaVerses, TeluguPanchangam."
question: "Which product should run the first full AppForge factory growth cycle, to validate the loop before scaling to a second product?"
options:
  - "JSON Workbench (live on CWS today, 0.1.0 published / 0.2.0 pending review) — chosen"
  - "EchoKit (blocked on a Gumroad payout method and a paywall-enabling release before it can go live commercially)"
  - "TelePort (Android, blocked on a new demo video for its accessibility declaration before promotion)"
  - "StellarTab / GitaVerses / TeluguPanchangam (migrated onto release-platform but not a current growth focus)"
decision: "JSON Workbench's growth cycle (listing overhaul, demo video, tutorial, distribution) is the first product to run through the AppForge factory loop."
evidence:
  - "JSON Workbench is live on CWS today: item higmlhleblpmdogjccpmjlnilpmhohal, 0.1.0 PUBLISHED, 0.2.0 PENDING_REVIEW as of 2026-09-24."
  - "Founder's explicit 2026-09-24 instruction (TASKS.md P4, .claude/json-workbench-growth-brief.md): 'focus on JSON Workbench, since it is live', deprioritizing a full EchoKit review (P3) in favor of this."
  - "Launch-kit drafts already exist specifically for this work (.claude/launch/: positioning, launch-posts, channels-and-plan, in-product-growth, store-listing-review) — less new work needed to start the loop."
  - "EchoKit is blocked on a founder action (adding a Gumroad payout method) and a pending extension release before its paywall can go live; TelePort is blocked on producing a new demo video for Play's accessibility-service declaration. Both are less ready than JSON Workbench right now."
reason: "Picking the least-blocked, already-live product lets the full loop (CPO growth brief -> PRD delta -> CTO design -> Builder -> QA -> security -> RC -> board approval -> staged publish) be proven end to end without first doing unrelated unblocking work on a different product."
expected_result: "Acceptance criteria O2 and §34: JSON Workbench completes the full product-factory state machine and produces a release record with a recorded approval_id, without requiring new Android or payments infrastructure to be built first."
risk: "Over-fitting the factory's design to JSON Workbench's specifics (a Chrome-only, no-payments extension) before it is exercised on Android (TelePort) or a paid product (EchoKit). Mitigated by keeping engineering/ standards platform-general in this brain and deliberately revisiting the design after the JSON Workbench loop closes, before the second product (§30 milestone M3: 'second product through factory with <= 1 h founder time')."
owner: cpo
date: "2026-09-26"
review_date: "2026-12-31"
status: active
tags: [product-factory, json-workbench, prioritization]
summary: "JSON Workbench (already live, least blocked, launch-kit drafts ready) runs the first end-to-end AppForge factory growth cycle, ahead of EchoKit (payments-blocked) and TelePort (demo-video-blocked)."
---

## Full context

See `appforge-ai-master-plan.md` executive summary ("first factory run = JSON Workbench growth
cycle"), §5.1 (sub-goal example "JSON Workbench: WAU +30% by 2026-12-31"), §30 90-day plan row 11
("JSON Workbench loop part 1"), and §35 "FIRST IMPLEMENTATION TASK" primary acceptance walkthrough
which is explicitly "adapted to first run = JSON Workbench growth cycle".

## What "the loop" concretely means for JSON Workbench

Per §35 step 1 onward: founder opens an opportunity issue ("JSON Workbench: activation is low —
improve first-run and listing") -> OPP record (see
`research/opportunities/OPP-0001-json-workbench-activation.yaml`, seeded from the same underlying
brief) -> CPO growth brief -> PRD delta -> CTO design -> Builder opens draft PR(s) in
`json-workbench` (telemetry via kit, onboarding change, listing-experiment support) -> CI + kit
checks green -> QA -> security -> RC -> board approval -> staged publish.

## Related

- `products/json-workbench/product-facts.yaml`, `products/json-workbench/history.md`
- `research/opportunities/OPP-0001-json-workbench-activation.yaml`
- `playbooks/launch-playbook.md`
