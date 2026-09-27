import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diffIsAppendOnlySafe, runSchemaValidation } from '../validate-decisions.mjs';

const BASE = `---
id: DEC-9001
title: "Example"
context: "c"
question: "q"
options: ["a", "b"]
decision: "a"
evidence: ["e1"]
reason: "r"
expected_result: "er"
risk: "risk"
owner: founder
date: "2026-01-01"
review_date: "2026-06-01"
status: active
---
Body text that must never change.
`;

test('append-only: identical file is safe', () => {
  const result = diffIsAppendOnlySafe(BASE, BASE);
  assert.equal(result.ok, true);
});

test('append-only: changing only status + review_outcome is allowed', () => {
  const after = BASE.replace('status: active', 'status: reviewed\nreview_outcome: "Confirmed still correct at 6-month review."');
  const result = diffIsAppendOnlySafe(BASE, after);
  assert.equal(result.ok, true, JSON.stringify(result));
});

test('append-only: changing the decision field is rejected', () => {
  const after = BASE.replace('decision: "a"', 'decision: "b"');
  const result = diffIsAppendOnlySafe(BASE, after);
  assert.equal(result.ok, false);
  assert.match(result.reason, /decision/);
});

test('append-only: changing the body text is rejected even if frontmatter is untouched', () => {
  const after = BASE.replace('Body text that must never change.', 'Body text that WAS changed.');
  const result = diffIsAppendOnlySafe(BASE, after);
  assert.equal(result.ok, false);
  assert.match(result.reason, /body/i);
});

test('append-only: adding an unrelated new field is rejected', () => {
  const after = BASE.replace('status: active', 'status: active\nsneaky_field: "oops"');
  const result = diffIsAppendOnlySafe(BASE, after);
  assert.equal(result.ok, false);
  assert.match(result.reason, /sneaky_field/);
});

test('schema validation runs against the real decisions/ folder and passes', () => {
  const result = runSchemaValidation();
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.ok(result.data.decisionsChecked >= 5, `expected at least 5 seeded decisions, got ${result.data.decisionsChecked}`);
});
