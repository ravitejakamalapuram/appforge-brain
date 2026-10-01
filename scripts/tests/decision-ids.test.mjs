// Tests for the cross-ref DEC-id enumeration (DEC-0015 / APP-84).
//
// These build a throwaway git repo per test rather than reading the real one, so the
// cross-ref behaviour — the part that actually matters — is exercised hermetically.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { enumerateDecisionIds, findDuplicateIds, nextFreeId } from '../lib/decision-ids.mjs';

function git(cwd, ...args) {
  execFileSync('git', args, { cwd, stdio: 'ignore' });
}

function makeRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), 'dec-ids-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@example.com');
  git(dir, 'config', 'user.name', 'test');
  mkdirSync(path.join(dir, 'decisions'), { recursive: true });
  return dir;
}

function addDecision(dir, filename) {
  writeFileSync(path.join(dir, 'decisions', filename), '---\nid: X\n---\n');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', `add ${filename}`);
}

test('enumerates ids from committed refs and the working tree', () => {
  const dir = makeRepo();
  try {
    addDecision(dir, 'DEC-0001-first.md');
    // uncommitted, working tree only
    writeFileSync(path.join(dir, 'decisions', 'DEC-0002-scaffolded.md'), '---\nid: X\n---\n');

    const ids = enumerateDecisionIds(dir);
    assert.deepEqual([...ids.keys()].sort(), ['DEC-0001', 'DEC-0002']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('INDEX.md and non-DEC files are ignored', () => {
  const dir = makeRepo();
  try {
    addDecision(dir, 'DEC-0001-first.md');
    writeFileSync(path.join(dir, 'decisions', 'INDEX.md'), '# Index\n');
    writeFileSync(path.join(dir, 'decisions', 'notes.md'), 'x\n');

    const ids = enumerateDecisionIds(dir);
    assert.deepEqual([...ids.keys()], ['DEC-0001']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the same id on the same filename across two branches is NOT a duplicate', () => {
  const dir = makeRepo();
  try {
    addDecision(dir, 'DEC-0001-first.md');
    git(dir, 'checkout', '-q', '-b', 'feature');
    addDecision(dir, 'DEC-0002-second.md');

    assert.deepEqual(findDuplicateIds(enumerateDecisionIds(dir)), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the DEC-0015 failure: one id, two filenames, two unmerged branches', () => {
  const dir = makeRepo();
  try {
    addDecision(dir, 'DEC-0001-base.md');
    git(dir, 'checkout', '-q', '-b', 'branch-a');
    addDecision(dir, 'DEC-0009-portfolio-measurement.md');
    git(dir, 'checkout', '-q', 'main');
    git(dir, 'checkout', '-q', '-b', 'branch-b');
    addDecision(dir, 'DEC-0009-credential-containment.md');

    const duplicates = findDuplicateIds(enumerateDecisionIds(dir));
    assert.equal(duplicates.length, 1);
    assert.equal(duplicates[0].id, 'DEC-0009');
    assert.deepEqual(
      duplicates[0].claims.map((c) => c.filename).sort(),
      ['DEC-0009-credential-containment.md', 'DEC-0009-portfolio-measurement.md'],
    );
    // Each claim names the ref it came from, so the error message can point at the branch.
    for (const claim of duplicates[0].claims) assert.ok(claim.refs.length > 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a single-tree check would have missed that collision', () => {
  // Guards the reason the fix is cross-ref: neither branch, read alone, shows a duplicate.
  const dir = makeRepo();
  try {
    addDecision(dir, 'DEC-0001-base.md');
    git(dir, 'checkout', '-q', '-b', 'branch-a');
    addDecision(dir, 'DEC-0009-portfolio-measurement.md');
    git(dir, 'checkout', '-q', 'main');
    git(dir, 'checkout', '-q', '-b', 'branch-b');
    addDecision(dir, 'DEC-0009-credential-containment.md');

    // Emulate a single-tree check: only the checked-out branch's files.
    const checkedOut = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', '--', 'decisions/'], {
      cwd: dir,
      encoding: 'utf8',
    })
      .split('\n')
      .filter(Boolean);
    const idsInTree = checkedOut.map((f) => /DEC-\d{4}/.exec(f)?.[0]).filter(Boolean);
    assert.equal(new Set(idsInTree).size, idsInTree.length, 'single tree looks clean — which is the bug');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('nextFreeId takes the number above the highest claimed, not a gap', () => {
  const ids = new Map([
    ['DEC-0001', { number: 1 }],
    ['DEC-0003', { number: 3 }],
  ]);
  // DEC-0002 is a hole — reusing it would resurrect a retired number and break citations.
  assert.equal(nextFreeId(ids), 'DEC-0004');
});

test('nextFreeId on an empty repo starts at DEC-0001', () => {
  assert.equal(nextFreeId(new Map()), 'DEC-0001');
});
