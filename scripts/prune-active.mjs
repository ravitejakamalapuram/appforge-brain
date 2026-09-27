#!/usr/bin/env node
// _active/ is TEMPORARY (§9.1): "auto-expires (CI deletes _active/ files older than 30 days and
// opens an issue if something should be promoted)". This script only computes *which* files are
// expired (pure, unit-tested in scripts/tests/prune-active.test.mjs) — the actual deletion and
// `gh issue create` calls are done by .github/workflows/prune-active.yml, which shells out to
// `gh`/`git` for each expired path this script reports. Every _active/ file must carry a
// `created: YYYY-MM-DD` frontmatter field so expiry is deterministic (not dependent on git
// history surviving a rebase/squash).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { buildOutput, printOutput } from './lib/cli-output.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ACTIVE_DIR = path.join(ROOT, '_active');
const IGNORED = new Set(['INDEX.md', 'README.md', '.gitkeep']);
const DEFAULT_MAX_AGE_DAYS = 30;

function fallbackCreatedDate(filePath) {
  // No `created:` field — fall back to the file's first commit date.
  try {
    const out = execFileSync(
      'git',
      ['log', '--diff-filter=A', '--follow', '--format=%aI', '--', filePath],
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
    const firstLine = out.split('\n').filter(Boolean).pop(); // oldest entry
    return firstLine ? firstLine.slice(0, 10) : null;
  } catch {
    return null;
  }
}

export function listActiveFiles() {
  if (!existsSync(ACTIVE_DIR)) return [];
  return readdirSync(ACTIVE_DIR).filter((f) => !IGNORED.has(f));
}

export function readActiveEntry(fileName) {
  const filePath = path.join(ACTIVE_DIR, fileName);
  const content = readFileSync(filePath, 'utf8');
  let created = null;
  try {
    const { data } = parseFrontmatter(content);
    if (typeof data.created === 'string') created = data.created;
  } catch {
    // not frontmatter-parseable; fall through to git fallback
  }
  if (!created) created = fallbackCreatedDate(path.relative(ROOT, filePath));
  return { path: `_active/${fileName}`, created, content };
}

/**
 * Pure function: given entries with a `created` ISO date (or null if unknown) and `now`,
 * returns which are expired vs kept. Entries with an unknown `created` date are always kept
 * (never silently deleted) but flagged via `unknownAge`.
 * @param {{path: string, created: string | null}[]} entries
 * @param {Date} now
 * @param {number} maxAgeDays
 */
export function findExpired(entries, now, maxAgeDays = DEFAULT_MAX_AGE_DAYS) {
  const expired = [];
  const kept = [];
  for (const entry of entries) {
    if (!entry.created) {
      kept.push({ ...entry, unknownAge: true });
      continue;
    }
    const createdMs = Date.parse(entry.created);
    if (Number.isNaN(createdMs)) {
      kept.push({ ...entry, unknownAge: true });
      continue;
    }
    const ageDays = (now.getTime() - createdMs) / (1000 * 60 * 60 * 24);
    if (ageDays >= maxAgeDays) {
      expired.push({ ...entry, ageDays: Math.floor(ageDays) });
    } else {
      kept.push({ ...entry, ageDays: Math.floor(ageDays) });
    }
  }
  return { expired, kept };
}

function main() {
  const args = process.argv.slice(2);
  const jsonFlag = args.includes('--json');
  const maxAgeArg = args.find((a) => a.startsWith('--max-age-days='));
  const maxAgeDays = maxAgeArg ? Number(maxAgeArg.split('=')[1]) : DEFAULT_MAX_AGE_DAYS;
  const mode = args.find((a) => !a.startsWith('--')) ?? 'list';

  if (mode !== 'list') {
    console.error('Usage: node scripts/prune-active.mjs list [--max-age-days=30] [--json]');
    process.exit(2);
  }

  const files = listActiveFiles();
  const entries = files.map(readActiveEntry);
  const { expired, kept } = findExpired(entries, new Date(), maxAgeDays);

  const output = buildOutput(
    'prune-active list',
    true,
    {
      expired: expired.map(({ path: p, created, ageDays }) => ({ path: p, created, ageDays })),
      kept: kept.map(({ path: p, created, ageDays, unknownAge }) => ({ path: p, created, ageDays, unknownAge: !!unknownAge })),
    },
    [],
  );
  printOutput(output, jsonFlag);
  if (!jsonFlag) {
    for (const e of expired) console.log(`EXPIRED (${e.ageDays}d): ${e.path}`);
    for (const k of kept) if (k.unknownAge) console.log(`WARNING no created date, kept by default: ${k.path}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
