// Same `cli-output@1` JSON contract as appforge-kit/packages/cli/src/output.ts, reused here
// (plain JS, not TS, since this repo has no build step) for consistency across every AppForge
// CLI-ish tool.
/**
 * @template T
 * @param {string} command
 * @param {boolean} ok
 * @param {T} [data]
 * @param {string[]} [errors]
 */
export function buildOutput(command, ok, data, errors = []) {
  return { schema: 'cli-output@1', ok, command, data, errors };
}

export function printOutput(output, json) {
  if (json) {
    process.stdout.write(JSON.stringify(output) + '\n');
    return;
  }
  if (output.ok) {
    console.log(`✔ ${output.command} passed`);
  } else {
    console.error(`✘ ${output.command} failed`);
    for (const err of output.errors) console.error(`  - ${err}`);
  }
}
