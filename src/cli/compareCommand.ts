import { compareCronExpressions, ComparisonResult } from '../scheduler/cronComparator';
import { validateCron } from '../validator/cronValidator';
import { colorize } from './output';

function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
}

function printSection(title: string, dates: Date[]): void {
  console.log(colorize(title, 'cyan'));
  if (dates.length === 0) {
    console.log('  (none)');
  } else {
    dates.forEach(d => console.log(`  • ${formatDate(d)}`));
  }
}

export function runCompareCommand(
  expressionA: string,
  expressionB: string,
  count: number = 8
): void {
  const errA = validateCron(expressionA);
  const errB = validateCron(expressionB);

  if (errA.length > 0) {
    console.error(colorize(`Invalid expression A: ${expressionA}`, 'red'));
    errA.forEach(e => console.error(`  ${e}`));
    process.exit(1);
  }

  if (errB.length > 0) {
    console.error(colorize(`Invalid expression B: ${expressionB}`, 'red'));
    errB.forEach(e => console.error(`  ${e}`));
    process.exit(1);
  }

  const result: ComparisonResult = compareCronExpressions(
    expressionA,
    expressionB,
    new Date(),
    count
  );

  console.log();
  console.log(colorize('=== Cron Comparison ===', 'bold'));
  console.log(`  A: ${colorize(expressionA, 'yellow')}`);
  console.log(`  B: ${colorize(expressionB, 'yellow')}`);
  console.log();
  console.log(colorize(`Frequency: ${result.frequencyDiff}`, 'green'));
  console.log();

  printSection('Overlapping runs (both A and B):', result.overlap);
  console.log();
  printSection('Only in A:', result.onlyInA);
  console.log();
  printSection('Only in B:', result.onlyInB);
  console.log();
}
