#!/usr/bin/env node
import { parseCron } from '../parser/cronParser';
import { getNextRuns, formatRunPreview } from '../scheduler/nextRuns';
import { toHumanReadable } from '../formatter/humanReadable';
import { findPreset } from '../formatter/presets';
import { formatOutput } from './output';

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
cronlens — Human-readable cron expression parser and scheduler visualizer

Usage:
  cronlens <expression> [options]

Options:
  --count, -n <number>   Number of next runs to preview (default: 5)
  --from <ISO date>      Start date for next run calculation
  --help, -h             Show this help message

Examples:
  cronlens "0 9 * * 1-5"
  cronlens "*/15 * * * *" --count 3
  cronlens "0 0 1 * *" --from 2024-06-01
`);
  process.exit(0);
}

const expression = args[0];
const countFlag = args.indexOf('--count') !== -1 ? args.indexOf('--count') : args.indexOf('-n');
const count = countFlag !== -1 ? parseInt(args[countFlag + 1], 10) || 5 : 5;
const fromFlag = args.indexOf('--from');
const fromDate = fromFlag !== -1 ? new Date(args[fromFlag + 1]) : new Date();

try {
  const parsed = parseCron(expression);
  const preset = findPreset(expression);
  const humanReadable = toHumanReadable(parsed);
  const nextRuns = getNextRuns(parsed, count, fromDate);
  const previews = nextRuns.map(formatRunPreview);

  formatOutput({
    expression,
    preset: preset?.name,
    humanReadable,
    nextRuns: previews,
  });
} catch (err) {
  console.error(`Error: ${(err as Error).message}`);
  process.exit(1);
}
