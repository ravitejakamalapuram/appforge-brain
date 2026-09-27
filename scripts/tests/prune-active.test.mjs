import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findExpired } from '../prune-active.mjs';

const NOW = new Date('2026-09-27T00:00:00Z');

test('a file created 40 days ago is expired at the 30-day threshold', () => {
  const { expired, kept } = findExpired([{ path: '_active/old.md', created: '2026-08-18' }], NOW, 30);
  assert.equal(expired.length, 1);
  assert.equal(kept.length, 0);
  assert.equal(expired[0].path, '_active/old.md');
});

test('a file created 10 days ago is kept', () => {
  const { expired, kept } = findExpired([{ path: '_active/new.md', created: '2026-09-17' }], NOW, 30);
  assert.equal(expired.length, 0);
  assert.equal(kept.length, 1);
});

test('exactly at the boundary (30 days) counts as expired', () => {
  const { expired } = findExpired([{ path: '_active/boundary.md', created: '2026-08-28' }], NOW, 30);
  assert.equal(expired.length, 1);
});

test('a file with no created date is kept, not silently deleted', () => {
  const { expired, kept } = findExpired([{ path: '_active/unknown.md', created: null }], NOW, 30);
  assert.equal(expired.length, 0);
  assert.equal(kept.length, 1);
  assert.equal(kept[0].unknownAge, true);
});

test('mixed batch: only the old one is reported expired', () => {
  const { expired, kept } = findExpired(
    [
      { path: '_active/old.md', created: '2026-01-01' },
      { path: '_active/new.md', created: '2026-09-20' },
    ],
    NOW,
    30,
  );
  assert.deepEqual(expired.map((e) => e.path), ['_active/old.md']);
  assert.deepEqual(kept.map((e) => e.path), ['_active/new.md']);
});
