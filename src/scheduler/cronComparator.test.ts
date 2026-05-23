import { compareCronExpressions } from './cronComparator';

const BASE_DATE = new Date('2024-01-01T00:00:00Z');

describe('compareCronExpressions', () => {
  it('returns next runs for both expressions', () => {
    const result = compareCronExpressions('* * * * *', '*/5 * * * *', BASE_DATE, 5);
    expect(result.nextRunsA).toHaveLength(5);
    expect(result.nextRunsB).toHaveLength(5);
  });

  it('finds overlapping run times between two expressions', () => {
    // every minute vs every 5 minutes — every 5-min run should overlap
    const result = compareCronExpressions('* * * * *', '*/5 * * * *', BASE_DATE, 20);
    expect(result.overlap.length).toBeGreaterThan(0);
    result.overlap.forEach(date => {
      expect(result.nextRunsA.some(d => d.getTime() === date.getTime())).toBe(true);
      expect(result.nextRunsB.some(d => d.getTime() === date.getTime())).toBe(true);
    });
  });

  it('identifies runs only in A', () => {
    const result = compareCronExpressions('* * * * *', '*/5 * * * *', BASE_DATE, 10);
    result.onlyInA.forEach(date => {
      expect(result.nextRunsB.some(d => d.getTime() === date.getTime())).toBe(false);
    });
  });

  it('identifies runs only in B', () => {
    const result = compareCronExpressions('*/7 * * * *', '*/11 * * * *', BASE_DATE, 10);
    result.onlyInB.forEach(date => {
      expect(result.nextRunsA.some(d => d.getTime() === date.getTime())).toBe(false);
    });
  });

  it('computes frequency difference description', () => {
    const result = compareCronExpressions('* * * * *', '*/5 * * * *', BASE_DATE, 10);
    expect(result.frequencyDiff).toMatch(/Expression [AB] runs ~\d+\.\dx more frequently/);
  });

  it('returns same frequency message for identical expressions', () => {
    const result = compareCronExpressions('*/5 * * * *', '*/5 * * * *', BASE_DATE, 10);
    expect(result.frequencyDiff).toBe('Same average frequency');
  });

  it('stores original expressions in result', () => {
    const result = compareCronExpressions('0 9 * * 1', '0 17 * * 5', BASE_DATE, 5);
    expect(result.expressionA).toBe('0 9 * * 1');
    expect(result.expressionB).toBe('0 17 * * 5');
  });
});
