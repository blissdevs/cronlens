/**
 * diffDescription.ts
 * Generates a human-readable diff/summary between two cron expressions,
 * highlighting what changed between them.
 */

import { parseCron } from '../parser/cronParser';

export interface CronDiff {
  field: string;
  from: string;
  to: string;
  changed: boolean;
}

const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'];

export function diffCronExpressions(
  fromExpr: string,
  toExpr: string
): CronDiff[] {
  const fromParts = fromExpr.trim().split(/\s+/);
  const toParts = toExpr.trim().split(/\s+/);

  if (fromParts.length !== 5 || toParts.length !== 5) {
    throw new Error('Both cron expressions must have exactly 5 fields');
  }

  return FIELD_NAMES.map((field, index) => ({
    field,
    from: fromParts[index],
    to: toParts[index],
    changed: fromParts[index] !== toParts[index],
  }));
}

export function describeDiff(fromExpr: string, toExpr: string): string {
  const diffs = diffCronExpressions(fromExpr, toExpr);
  const changes = diffs.filter((d) => d.changed);

  if (changes.length === 0) {
    return 'No changes between the two expressions.';
  }

  const lines = changes.map(
    (d) => `  • ${d.field}: "${d.from}" → "${d.to}"`
  );

  return `Changed fields (${changes.length}):\n${lines.join('\n')}`;
}

export function summarizeDiff(fromExpr: string, toExpr: string): string {
  const diffs = diffCronExpressions(fromExpr, toExpr);
  const changed = diffs.filter((d) => d.changed).map((d) => d.field);

  if (changed.length === 0) return 'identical';
  if (changed.length === 1) return `${changed[0]} changed`;
  return `${changed.slice(0, -1).join(', ')} and ${changed[changed.length - 1]} changed`;
}
