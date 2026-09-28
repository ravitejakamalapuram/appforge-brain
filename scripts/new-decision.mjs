#!/usr/bin/env node
// Allocates the next free DEC id and scaffolds decisions/DEC-xxxx-<slug>.md.
//
// The allocation half of DEC-0015 (APP-84). Hand-picking the next number by looking at `main`
// is what produced two separate DEC-0009s and two separate DEC-0010s: the colliding records
// lived on unmerged branches, so `main` never showed them. This enumerates every local and
// remote ref plus the working tree instead.
//
// Usage:
//   npm run new-decision -- "<slug>" [--title "..."] [--owner "..."] [--json]
//   npm run new-decision -- --next-id            # print the next free id and exit, write nothing
//
// Exit code 0 = pass, 1 = fail. `--json` prints a single cli-output@1 line.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOutput, printOutput } from './lib/cli-output.mjs';
import { enumerateDecisionIds, findDuplicateIds, nextFreeId } from './lib/decision-ids.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DECISION_SCHEMA = JSON.parse(readFileSync(path.join(ROOT, 'schemas/decision.schema.json'), 'utf8'));

const PLACEHOLDER = 'TODO';

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * Builds the frontmatter block from the schema's own `required` list, so a future required field
 * shows up in new scaffolds without anyone remembering to update this template.
 */
function scaffoldFrontmatter(id, slug, opts) {
  const required = DECISION_SCHEMA.required ?? [];
  const props = DECISION_SCHEMA.properties ?? {};
  const today = new Date();
  const reviewDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const known = {
    id,
    title: opts.title ?? `${PLACEHOLDER}: one-line statement of what was decided (${slug})`,
    owner: opts.owner ?? PLACEHOLDER,
    date: isoDate(today),
    review_date: isoDate(reviewDate),
    status: 'active',
  };

  const lines = [];
  for (const key of required) {
    if (key in known) {
      lines.push(`${key}: ${JSON.stringify(known[key])}`);
      continue;
    }
    const spec = props[key] ?? {};
    if (spec.type === 'array') {
      const minItems = spec.minItems ?? 1;
      lines.push(`${key}:`);
      for (let i = 0; i < minItems; i += 1) lines.push(`  - "${PLACEHOLDER} ${key} ${i + 1}"`);
    } else {
      // Block scalar: these are the long prose fields (context, decision, reason, ...).
      lines.push(`${key}: >`);
      lines.push(`  ${PLACEHOLDER} — ${key}`);
    }
  }
  // Optional-but-expected INDEX.md fields (§9.2) — not in `required`, but every record carries them.
  lines.push('tags: []');
  lines.push(`summary: "${PLACEHOLDER} one-line summary for INDEX.md"`);
  return lines.join('\n');
}

function scaffoldBody(id) {
  return [
    '',
    '## Why this was decided here',
    '',
    `${PLACEHOLDER} — the authority this sits under, and why it was not escalated further.`,
    '',
    '## Related',
    '',
    `- ${PLACEHOLDER} — link sibling DEC/PM records, or delete this section.`,
    '',
  ].join('\n');
}

export function createDecision({ slug, title, owner, cwd = ROOT, dryRun = false }) {
  const errors = [];
  const cleanSlug = slugify(slug ?? '');
  if (!cleanSlug) {
    return { ok: false, errors: ['a slug is required: npm run new-decision -- "some-slug"'], data: {} };
  }

  const ids = enumerateDecisionIds(cwd);

  // Refuse to allocate on top of an already-broken id space: if a duplicate is outstanding, the
  // next number is not trustworthy until it is resolved.
  const duplicates = findDuplicateIds(ids);
  if (duplicates.length > 0) {
    for (const d of duplicates) {
      errors.push(
        `${d.id} is already claimed by ${d.claims.length} different files (${d.claims.map((c) => c.filename).join(', ')}) — resolve that collision before allocating a new id`,
      );
    }
    return { ok: false, errors, data: { duplicates } };
  }

  const id = nextFreeId(ids);
  const filename = `${id}-${cleanSlug}.md`;
  const filePath = path.join(cwd, 'decisions', filename);

  if (existsSync(filePath)) {
    return { ok: false, errors: [`${filename} already exists`], data: { id, filename } };
  }

  const content = `---\n${scaffoldFrontmatter(id, cleanSlug, { title, owner })}\n---\n${scaffoldBody(id)}`;

  if (!dryRun) {
    mkdirSync(path.join(cwd, 'decisions'), { recursive: true });
    writeFileSync(filePath, content, 'utf8');
  }

  return {
    ok: true,
    errors: [],
    data: {
      id,
      filename,
      path: path.relative(cwd, filePath),
      refsScanned: ids.size,
      written: !dryRun,
    },
  };
}

function main() {
  const args = process.argv.slice(2);
  const jsonFlag = args.includes('--json');

  if (args.includes('--next-id')) {
    const ids = enumerateDecisionIds(ROOT);
    const duplicates = findDuplicateIds(ids);
    const result = {
      ok: duplicates.length === 0,
      errors: duplicates.map((d) => `${d.id} is claimed by ${d.claims.map((c) => c.filename).join(', ')}`),
      data: { nextFreeId: nextFreeId(ids), idsClaimed: ids.size },
    };
    const output = buildOutput('new-decision --next-id', result.ok, result.data, result.errors);
    printOutput(output, jsonFlag);
    if (!jsonFlag && result.ok) console.log(`  next free id: ${result.data.nextFreeId}`);
    process.exit(result.ok ? 0 : 1);
  }

  const readOpt = (name) => {
    const i = args.indexOf(name);
    return i === -1 ? undefined : args[i + 1];
  };
  const positional = args.filter((a, i) => {
    if (a.startsWith('--')) return false;
    const prev = args[i - 1];
    return prev !== '--title' && prev !== '--owner';
  });

  const result = createDecision({
    slug: positional[0],
    title: readOpt('--title'),
    owner: readOpt('--owner'),
    dryRun: args.includes('--dry-run'),
  });

  const output = buildOutput('new-decision', result.ok, result.data, result.errors);
  printOutput(output, jsonFlag);
  if (!jsonFlag && result.ok) {
    console.log(`  allocated ${result.data.id} -> ${result.data.path}`);
    console.log(`  fill in every ${PLACEHOLDER}, then run: npm run validate:schema && npm run generate-index`);
  }
  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
