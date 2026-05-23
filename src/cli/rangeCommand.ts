/**
 * rangeCommand.ts
 * CLI command handler for the `range` subcommand.
 * Usage: cronlens range <expression> --from <ISO> --to <ISO>
 */

import { getRunsInRange, formatRangeResult } from '../scheduler/cronRange';
import { validateWithReport } from '../validator/index';
import { colorize } from './output';

export interface RangeCommandArgs {
  expression: string;
  from: string;
  to: string;
  maxResults?: number;
  json?: boolean;
}

export function runRangeCommand(args: RangeCommandArgs): void {
  const { expression, from: fromStr, to: toStr, maxResults, json } = args;

  const report = validateWithReport(expression);
  if (!report.valid) {
    console.error(colorize('red', `Invalid expression: ${report.errors.join('; ')}`) );
    process.exit(1);
  }

  const from = new Date(fromStr);
  const to = new Date(toStr);

  if (isNaN(from.getTime())) {
    console.error(colorize('red', `Invalid --from date: ${fromStr}`));
    process.exit(1);
  }
  if (isNaN(to.getTime())) {
    console.error(colorize('red', `Invalid --to date: ${toStr}`));
    process.exit(1);
  }

  let result;
  try {
    result = getRunsInRange({ expression, from, to, maxResults });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(colorize('red', `Error: ${msg}`));
    process.exit(1);
  }

  if (json) {
    console.log(
      JSON.stringify(
        {
          expression: result.expression,
          from: result.from.toISOString(),
          to: result.to.toISOString(),
          count: result.count,
          averageIntervalMs: result.averageIntervalMs,
          runs: result.runs.map((d) => d.toISOString()),
        },
        null,
        2
      )
    );
  } else {
    console.log(formatRangeResult(result));
  }
}
