// Minimal YAML-frontmatter parser for the brain's markdown records (DEC-xxxx, PM-xxxx).
// Deliberately tiny (this is a knowledge repo, not a code package) — no remark/gray-matter
// dependency, just a `---\n...\n---\n` fence parsed with js-yaml.
import yaml from 'js-yaml';

const FENCE = '---';

/**
 * @param {string} content raw file content
 * @returns {{ data: Record<string, unknown>, body: string }}
 */
export function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0]?.trim() !== FENCE) {
    return { data: {}, body: content };
  }
  const end = lines.indexOf(FENCE, 1);
  if (end === -1) {
    throw new Error('Unterminated frontmatter fence (opening --- with no closing ---)');
  }
  const yamlText = lines.slice(1, end).join('\n');
  const body = lines.slice(end + 1).join('\n');
  const data = yaml.load(yamlText) ?? {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Frontmatter must be a YAML mapping');
  }
  return { data, body };
}

/**
 * Serializes frontmatter + body back to file content, preserving key order given.
 * @param {Record<string, unknown>} data
 * @param {string} body
 */
export function stringifyFrontmatter(data, body) {
  const yamlText = yaml.dump(data, { lineWidth: -1, noRefs: true });
  return `${FENCE}\n${yamlText}${FENCE}\n${body}`;
}
