// Cross-ref DEC-id enumeration.
//
// This is the mechanism half of DEC-0015 (APP-84). The DEC-0009/DEC-0010 collisions happened
// because every existing check reads only ONE tree: the checked-out working copy, or `main`.
// All four colliding records were individually valid on their own branch, and none of them had
// merged, so nothing that looked at `main` could ever have seen the clash. Any allocator or
// duplicate check that is going to work therefore has to enumerate EVERY ref — local branches,
// remote-tracking branches, and the working tree — not a single one.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const DECISION_PATH_RE = /^decisions\/(DEC-(\d{4}))-.+\.md$/;

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

/**
 * Every local and remote-tracking ref, de-duplicated by the commit they point at so that a branch
 * and its identical remote-tracking counterpart are only walked once.
 * @param {string} cwd
 * @returns {{ ref: string, oid: string }[]}
 */
export function listRefs(cwd) {
  let out;
  try {
    out = git(['for-each-ref', '--format=%(objectname) %(refname)', 'refs/heads', 'refs/remotes'], cwd);
  } catch {
    return []; // not a git repo, or no refs yet
  }
  const seenOids = new Set();
  const refs = [];
  for (const line of out.split('\n').filter(Boolean)) {
    const [oid, ref] = line.split(' ');
    if (!oid || !ref) continue;
    if (ref.endsWith('/HEAD')) continue; // symref duplicate of whatever it points at
    if (seenOids.has(oid)) continue;
    seenOids.add(oid);
    refs.push({ ref, oid });
  }
  return refs;
}

function decisionFilesAtRef(ref, cwd) {
  let out;
  try {
    out = git(['ls-tree', '-r', '--name-only', ref, '--', 'decisions/'], cwd);
  } catch {
    return []; // ref has no decisions/ directory
  }
  return out.split('\n').filter(Boolean);
}

function decisionFilesInWorkingTree(cwd) {
  const dir = path.join(cwd, 'decisions');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'INDEX.md')
    .map((f) => `decisions/${f}`);
}

/**
 * Enumerates every DEC id claimed anywhere in the repository.
 *
 * The working tree is included alongside the refs so that a record scaffolded by
 * `new-decision.mjs` but not yet committed still holds its number — otherwise two
 * back-to-back scaffolds in the same checkout would both be handed the same id.
 *
 * @param {string} [cwd] repo root
 * @returns {Map<string, { number: number, files: Map<string, string[]> }>} id -> { number, files: basename -> sources }
 */
export function enumerateDecisionIds(cwd = process.cwd()) {
  /** @type {Map<string, { number: number, files: Map<string, string[]> }>} */
  const ids = new Map();

  const sources = [
    ...listRefs(cwd).map(({ ref }) => ({ label: ref, files: decisionFilesAtRef(ref, cwd) })),
    { label: '(working tree)', files: decisionFilesInWorkingTree(cwd) },
  ];

  for (const { label, files } of sources) {
    for (const filePath of files) {
      const m = DECISION_PATH_RE.exec(filePath);
      if (!m) continue;
      const [, id, digits] = m;
      const basename = path.basename(filePath);
      if (!ids.has(id)) ids.set(id, { number: Number(digits), files: new Map() });
      const entry = ids.get(id);
      if (!entry.files.has(basename)) entry.files.set(basename, []);
      entry.files.get(basename).push(label);
    }
  }

  return ids;
}

/**
 * Ids claimed by two or more distinct filenames — the exact DEC-0015 failure.
 * @param {Map<string, { number: number, files: Map<string, string[]> }>} ids
 */
export function findDuplicateIds(ids) {
  const duplicates = [];
  for (const [id, entry] of [...ids.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (entry.files.size < 2) continue;
    duplicates.push({
      id,
      claims: [...entry.files.entries()].map(([filename, refs]) => ({ filename, refs: [...new Set(refs)].sort() })),
    });
  }
  return duplicates;
}

/**
 * The lowest DEC number not claimed anywhere. Fills gaps only above the highest claimed id —
 * reusing a hole left by a deleted record would resurrect a retired number and break citations.
 * @param {Map<string, { number: number }>} ids
 */
export function nextFreeId(ids) {
  let highest = 0;
  for (const { number } of ids.values()) if (number > highest) highest = number;
  const next = highest + 1;
  if (next > 9999) throw new Error('DEC id space exhausted (DEC-9999 is claimed)');
  return `DEC-${String(next).padStart(4, '0')}`;
}
