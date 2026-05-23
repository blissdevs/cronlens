/**
 * cronRange.ts
 * Computes a time range of scheduled runs between two dates.
 */

import { getNextRuns } from './nextRuns';

export interface RangeOptions {
  expression: string;
  from: Date;
  to: Date;
  maxResults?: number;
}

export interface RangeResult {
  expression: string;
  from: Date;
  to: Date;
  runs: Date[];
  count: number;
  averageIntervalMs: number | null;
}

export function getRunsInRange(options: RangeOptions): RangeResult {
  const { expression, from, to, maxResults = 500 } = options;

  if (to <= from) {
    throw new Error('"to" date must be after "from" date');
  }

  const candidateCount = Math.min(maxResults, 10000);
  const candidates = getNextRuns(expression, candidateCount, from);
  const runs = candidates.filter((d) => d >= from && d <= to);

  let averageIntervalMs: number | null = null;
  if (runs.length >= 2) {
    const totalMs = runs[runs.length - 1].getTime() - runs[0].getTime();
    averageIntervalMs = totalMs / (runs.length - 1);
  }

  return {
    expression,
    from,
    to,
    runs,
    count: runs.length,
    averageIntervalMs,
  };
}

export function formatRangeResult(result: RangeResult): string {
  const lines: string[] = [
    `Expression : ${result.expression}`,
    `From       : ${result.from.toISOString()}`,
    `To         : ${result.to.toISOString()}`,
    `Runs found : ${result.count}`,
  ];

  if (result.averageIntervalMs !== null) {
    const mins = Math.round(result.averageIntervalMs / 60000);
    lines.push(`Avg interval: ~${mins} minute(s)`);
  }

  if (result.runs.length > 0) {
    lines.push('\nScheduled runs:');
    result.runs.forEach((d, i) => {
      lines.push(`  ${i + 1}. ${d.toISOString()}`);
    });
  } else {
    lines.push('\nNo runs scheduled in this range.');
  }

  return lines.join('\n');
}
