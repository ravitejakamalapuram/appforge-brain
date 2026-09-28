#!/usr/bin/env node
// Validates decisions/DEC-xxxx-*.md and postmortems/PM-xxxx-*.md against schemas/*.schema.json,
// plus the structural rules from appforge-ai-master-plan.md §26/§9.1 that a JSON Schema alone
// can't express (filename/id match, required postmortem body sections, the mandatory
// playbook_to_update linkage, and the append-only rule for edits to existing files).
//
// Usage:
//   node scripts/validate-decisions.mjs schema [--json]
//   node scripts/validate-decisions.mjs append-only <baseRef> <headRef> [--json]
//   node scripts/validate-decisions.mjs duplicate-ids [--json]
//
// `schema` also runs the duplicate-id check, so `npm run validate:schema` catches a collision on
// every branch. That check deliberately reads every ref rather than the checked-out tree: the
// DEC-0009/DEC-0010 collisions (DEC-0015, APP-84) were each individually valid on their own
// unmerged branch, so a single-tree check could never have seen them.
//
// Exit code 0 = pass, 1 = fail. `--json` prints a single cli-output@1 line (see scripts/lib/cli-output.mjs).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { parseFrontmatter } from './lib/frontmatter.mjs';
import { buildOutput, printOutput } from './lib/cli-output.mjs';
import { enumerateDecisionIds, findDuplicateIds } from './lib/decision-ids.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DECISION_SCHEMA = JSON.parse(readFileSync(path.join(ROOT, 'schemas/decision.schema.json'), 'utf8'));
const POSTMORTEM_SCHEMA = JSON.parse(readFileSync(path.join(ROOT, 'schemas/postmortem.schema.json'), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateDecision = ajv.compile(DECISION_SCHEMA);
const validatePostmortem = ajv.compile(POSTMORTEM_SCHEMA);

// Fields the append-only CI rule allows changing on an already-committed DEC/PM file, per
// §9.1: "LEARNED is append-only (CI rejects edits to existing DEC/PM files except
// `review_outcome` fields)". We also allow `status` and `superseded_by` to move together with
// `review_outcome`, because §26's own status enum (`active|superseded(by DEC-x)|reviewed`)
// only makes sense if a review can flip status too — a "review outcome" that could never change
// `status` from `active` to `reviewed` would be a no-op field. This is a ruling, documented in
// README.md's "Rulings" section.
const APPEND_ONLY_EXEMPT_FIELDS = new Set(['status', 'superseded_by', 'review_outcome']);

const REQUIRED_PM_SECTIONS = [
  'what happened',
  'expected',
  'actual',
  'why',
  'missed signals',
  'root cause',
  'what changes',
  'reusable lesson',
];

function formatAjvErrors(errors) {
  return (errors ?? []).map((e) => `${e.instancePath || '(root)'}: ${e.message}`);
}

function listRecordFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'INDEX.md')
    .map((f) => path.join(dir, f));
}

function checkFilenameIdMatch(filePath, id, prefix) {
  const base = path.basename(filePath, '.md');
  if (!base.startsWith(`${prefix}-`)) {
    return [`filename "${path.basename(filePath)}" does not start with "${prefix}-"`];
  }
  if (id && !base.startsWith(id)) {
    return [`frontmatter id "${id}" does not match filename "${path.basename(filePath)}"`];
  }
  return [];
}

function checkPlaybookField(value) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return ['playbook_to_update is empty — §26 requires either a playbooks/ path or a linked PR reference'];
  }
  const referencesPlaybook = /playbooks\//i.test(value);
  const referencesPr = /PR\s*#\d+/i.test(value) || /https?:\/\/\S+\/pull\/\d+/i.test(value);
  if (!referencesPlaybook && !referencesPr) {
    return [
      `playbook_to_update ("${value}") must reference either a playbooks/ path or a linked PR (e.g. "PR #12"), per §26's mandatory-linkage rule`,
    ];
  }
  return [];
}

function checkPmBodySections(body) {
  const errors = [];
  const lowerBody = body.toLowerCase();
  for (const section of REQUIRED_PM_SECTIONS) {
    // Accept any markdown heading level containing the section phrase, case-insensitive.
    const headingRe = new RegExp(`^#{1,6}\\s*.*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'im');
    if (!headingRe.test(body) && !lowerBody.includes(section)) {
      errors.push(`postmortem is missing a required section: "${section}"`);
    }
  }
  return errors;
}

function validateFile(filePath, kind) {
  const errors = [];
  const content = readFileSync(filePath, 'utf8');
  let data, body;
  try {
    ({ data, body } = parseFrontmatter(content));
  } catch (e) {
    return [`${filePath}: ${e.message}`];
  }

  const validateFn = kind === 'decision' ? validateDecision : validatePostmortem;
  const ok = validateFn(data);
  if (!ok) {
    for (const msg of formatAjvErrors(validateFn.errors)) errors.push(`${filePath}: ${msg}`);
  }

  const prefix = kind === 'decision' ? 'DEC' : 'PM';
  for (const msg of checkFilenameIdMatch(filePath, data.id, prefix)) errors.push(`${filePath}: ${msg}`);

  if (kind === 'postmortem') {
    for (const msg of checkPlaybookField(data.playbook_to_update)) errors.push(`${filePath}: ${msg}`);
    for (const msg of checkPmBodySections(body)) errors.push(`${filePath}: ${msg}`);
  }

  return errors;
}

/**
 * Fails when one DEC id is claimed by two different filenames anywhere in the repository.
 *
 * Scope is every local branch, every remote-tracking branch, and the working tree — NOT just the
 * checked-out tree. That is the whole point: `DEC-0009` named both the portfolio-measurement
 * rulings and the credential-containment ruling, on two branches neither of which had merged, and
 * both were schema-valid in isolation. A check that reads one tree cannot see that.
 */
export function runDuplicateIdCheck(cwd = ROOT) {
  const ids = enumerateDecisionIds(cwd);
  const duplicates = findDuplicateIds(ids);
  const errors = duplicates.map((d) => {
    const claims = d.claims.map((c) => `${c.filename} (on ${c.refs.join(', ')})`).join(' vs ');
    return `${d.id} is claimed by ${d.claims.length} different files: ${claims}`;
  });
  return {
    ok: errors.length === 0,
    errors,
    data: { idsClaimed: ids.size, duplicateIds: duplicates.map((d) => d.id) },
  };
}

export function runSchemaValidation() {
  const errors = [];
  const decisionFiles = listRecordFiles(path.join(ROOT, 'decisions'));
  const postmortemFiles = listRecordFiles(path.join(ROOT, 'postmortems'));

  for (const f of decisionFiles) errors.push(...validateFile(f, 'decision'));
  for (const f of postmortemFiles) errors.push(...validateFile(f, 'postmortem'));

  // Folded in rather than left as a separate npm script, so it runs on every branch that
  // validates — a collision is only visible from a check that looks across refs.
  const dup = runDuplicateIdCheck();
  errors.push(...dup.errors);

  return {
    ok: errors.length === 0,
    errors,
    data: {
      decisionsChecked: decisionFiles.length,
      postmortemsChecked: postmortemFiles.length,
      idsClaimed: dup.data.idsClaimed,
      duplicateIds: dup.data.duplicateIds,
    },
  };
}

// ---- append-only check ----

function gitShow(ref, filePath) {
  try {
    return execFileSync('git', ['show', `${ref}:${filePath}`], { cwd: ROOT, encoding: 'utf8' });
  } catch {
    return null; // file did not exist at this ref
  }
}

function relevantDiffPaths(baseRef, headRef) {
  const out = execFileSync(
    'git',
    ['diff', '--name-status', `${baseRef}...${headRef}`, '--', 'decisions', 'postmortems'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split('\t');
      return { status, filePath: rest[rest.length - 1] };
    })
    .filter(({ filePath }) => filePath.endsWith('.md') && !filePath.endsWith('INDEX.md'));
}

/**
 * Compares the frontmatter+body of a file at two refs, allowing only APPEND_ONLY_EXEMPT_FIELDS
 * to differ in frontmatter, and requiring the body to be byte-identical.
 * Exported for direct unit testing without shelling out to git.
 */
export function diffIsAppendOnlySafe(beforeContent, afterContent) {
  const before = parseFrontmatter(beforeContent);
  const after = parseFrontmatter(afterContent);

  if (before.body !== after.body) {
    return { ok: false, reason: 'body content changed (decisions/postmortems body text is append-only)' };
  }

  const beforeKeys = new Set(Object.keys(before.data));
  const afterKeys = new Set(Object.keys(after.data));
  const allKeys = new Set([...beforeKeys, ...afterKeys]);

  for (const key of allKeys) {
    const beforeVal = JSON.stringify(before.data[key]);
    const afterVal = JSON.stringify(after.data[key]);
    if (beforeVal !== afterVal && !APPEND_ONLY_EXEMPT_FIELDS.has(key)) {
      return {
        ok: false,
        reason: `frontmatter field "${key}" changed from ${beforeVal} to ${afterVal}, and is not one of the allowed review fields (${[...APPEND_ONLY_EXEMPT_FIELDS].join(', ')})`,
      };
    }
  }
  return { ok: true };
}

export function runAppendOnlyCheck(baseRef, headRef) {
  const errors = [];
  const diffs = relevantDiffPaths(baseRef, headRef);
  let checked = 0;

  for (const { status, filePath } of diffs) {
    if (status === 'A') continue; // new file: fine
    if (status === 'D') {
      errors.push(`${filePath}: deleted — decisions/ and postmortems/ are append-only, files cannot be removed`);
      continue;
    }
    if (status.startsWith('R')) {
      errors.push(`${filePath}: renamed — decisions/ and postmortems/ are append-only, files cannot be renamed`);
      continue;
    }
    // Modified (M)
    const before = gitShow(baseRef, filePath);
    const after = gitShow(headRef, filePath);
    if (before === null || after === null) continue; // shouldn't happen for status M
    checked += 1;
    const result = diffIsAppendOnlySafe(before, after);
    if (!result.ok) errors.push(`${filePath}: ${result.reason}`);
  }

  return { ok: errors.length === 0, errors, data: { filesChecked: checked, totalDiffEntries: diffs.length } };
}

// ---- CLI entry ----

function main() {
  const args = process.argv.slice(2);
  const jsonFlag = args.includes('--json');
  const positional = args.filter((a) => a !== '--json');
  const mode = positional[0];

  let result;
  let command;
  if (mode === 'schema') {
    command = 'validate-decisions schema';
    result = runSchemaValidation();
  } else if (mode === 'duplicate-ids') {
    command = 'validate-decisions duplicate-ids';
    result = runDuplicateIdCheck();
  } else if (mode === 'append-only') {
    const [, baseRef, headRef] = positional;
    if (!baseRef || !headRef) {
      console.error('Usage: node scripts/validate-decisions.mjs append-only <baseRef> <headRef>');
      process.exit(2);
    }
    command = 'validate-decisions append-only';
    result = runAppendOnlyCheck(baseRef, headRef);
  } else {
    console.error('Usage: node scripts/validate-decisions.mjs <schema|duplicate-ids|append-only> [...]');
    process.exit(2);
  }

  const output = buildOutput(command, result.ok, result.data, result.errors);
  printOutput(output, jsonFlag);
  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
