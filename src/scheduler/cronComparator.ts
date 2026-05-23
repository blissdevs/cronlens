import { getNextRuns } from './nextRuns';

export interface ComparisonResult {
  expressionA: string;
  expressionB: string;
  nextRunsA: Date[];
  nextRunsB: Date[];
  overlap: Date[];
  onlyInA: Date[];
  onlyInB: Date[];
  frequencyA: number;
  frequencyB: number;
  frequencyDiff: string;
}

function datesAreEqual(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

export function compareCronExpressions(
  expressionA: string,
  expressionB: string,
  from: Date = new Date(),
  count: number = 10
): ComparisonResult {
  const nextRunsA = getNextRuns(expressionA, from, count);
  const nextRunsB = getNextRuns(expressionB, from, count);

  const overlap = nextRunsA.filter(a =>
    nextRunsB.some(b => datesAreEqual(a, b))
  );

  const onlyInA = nextRunsA.filter(a =>
    !nextRunsB.some(b => datesAreEqual(a, b))
  );

  const onlyInB = nextRunsB.filter(b =>
    !nextRunsA.some(a => datesAreEqual(a, b))
  );

  const frequencyA = computeAverageIntervalMinutes(nextRunsA);
  const frequencyB = computeAverageIntervalMinutes(nextRunsB);

  const frequencyDiff = describeFrequencyDiff(frequencyA, frequencyB);

  return {
    expressionA,
    expressionB,
    nextRunsA,
    nextRunsB,
    overlap,
    onlyInA,
    onlyInB,
    frequencyA,
    frequencyB,
    frequencyDiff,
  };
}

function computeAverageIntervalMinutes(dates: Date[]): number {
  if (dates.length < 2) return 0;
  let totalMs = 0;
  for (let i = 1; i < dates.length; i++) {
    totalMs += dates[i].getTime() - dates[i - 1].getTime();
  }
  return Math.round(totalMs / (dates.length - 1) / 60000);
}

function describeFrequencyDiff(a: number, b: number): string {
  if (a === 0 || b === 0) return 'Unable to compare frequencies';
  if (a === b) return 'Same average frequency';
  const ratio = (Math.max(a, b) / Math.min(a, b)).toFixed(1);
  const faster = a < b ? 'A' : 'B';
  return `Expression ${faster} runs ~${ratio}x more frequently`;
}
