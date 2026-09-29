// Covers the one thing decisions/INDEX.md cannot get from the records themselves: a correction.
// `summary` is frozen by the append-only check, so when a later record overturns part of an
// earlier one the only editable carrier is `review_outcome` — and the index has to show that,
// or agents following §6.1 rule 3 read the superseded claim as current (APP-120).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { renderIndex, readMarkdownEntry, readYamlEntry } from '../generate-index.mjs';

const ROW = (line) => line.split('\n').find((l) => l.startsWith('| [DEC-0001]'));

function entry(overrides = {}) {
  return {
    file: 'DEC-0001-x.md',
    id: 'DEC-0001',
    title: 'A decision',
    tags: ['security'],
    summary: 'Isolation comes from credential scoping rather than OS permissions.',
    status: 'reviewed',
    reviewOutcome: null,
    ...overrides,
  };
}

test('a record with no review_outcome renders an unmarked summary cell', () => {
  const row = ROW(renderIndex('decisions', [entry()]));
  assert.ok(row.endsWith('| reviewed | Isolation comes from credential scoping rather than OS permissions. |'));
  assert.ok(!row.includes('⚠'));
});

test('a record with a review_outcome is flagged as partly corrected', () => {
  const row = ROW(renderIndex('decisions', [entry({ reviewOutcome: 'The blast radius is the OS uid, not the App token.' })]));
  assert.match(row, /⚠ \*\*partly corrected\*\* — see `review_outcome` in the record\./);
});

test('the marker precedes the summary, so skimming hits the warning before the stale claim', () => {
  const row = ROW(renderIndex('decisions', [entry({ reviewOutcome: 'corrected by DEC-0016' })]));
  assert.ok(row.indexOf('⚠') < row.indexOf('Isolation comes from credential scoping'));
});

test('the marker survives a summary long enough to hit the 200-char truncation', () => {
  const long = 'x'.repeat(400);
  const row = ROW(renderIndex('decisions', [entry({ summary: long, reviewOutcome: 'corrected' })]));
  assert.ok(row.includes('⚠ **partly corrected**'));
  assert.ok(!row.includes('x'.repeat(201)), 'summary should still be truncated at 200 chars');
});

test('status alone does not trigger the marker — only review_outcome does', () => {
  for (const status of ['active', 'reviewed', 'superseded']) {
    const row = ROW(renderIndex('decisions', [entry({ status })]));
    assert.ok(!row.includes('⚠'), `status: ${status} should not be marked without a review_outcome`);
  }
});

test('review_outcome is read off markdown frontmatter, not just accepted as a passed-in field', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-index-'));
  const file = path.join(dir, 'DEC-0001-x.md');
  writeFileSync(
    file,
    ['---', 'id: DEC-0001', 'title: A decision', 'summary: Frozen claim.', 'status: reviewed', 'review_outcome: Corrected by DEC-0016.', '---', '', 'body'].join('\n'),
    'utf8',
  );
  const read = readMarkdownEntry(file);
  assert.equal(read.reviewOutcome, 'Corrected by DEC-0016.');
  assert.match(ROW(renderIndex('decisions', [read])), /⚠ \*\*partly corrected\*\*/);
});

test('yaml records (research/opportunities, experiments) carry the marker the same way', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-index-'));
  const file = path.join(dir, 'DEC-0001-x.yaml');
  writeFileSync(file, ['id: DEC-0001', 'title: An opportunity', 'summary: Frozen claim.', 'review_outcome: Reach estimate was wrong.'].join('\n'), 'utf8');
  const read = readYamlEntry(file);
  assert.equal(read.reviewOutcome, 'Reach estimate was wrong.');
  assert.match(ROW(renderIndex('experiments', [read])), /⚠ \*\*partly corrected\*\*/);
});
