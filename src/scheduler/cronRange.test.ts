import { getRunsInRange, formatRangeResult } from './cronRange';

describe('getRunsInRange', () => {
  it('returns runs within the specified range', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const to = new Date('2024-01-01T01:00:00Z');
    const result = getRunsInRange({ expression: '*/15 * * * *', from, to });
    expect(result.count).toBe(4);
    expect(result.runs[0].getMinutes()).toBe(0);
    expect(result.runs[3].getMinutes()).toBe(45);
  });

  it('returns zero runs when no match in range', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const to = new Date('2024-01-01T00:30:00Z');
    // runs only at midnight on Jan 1st — already passed the window
    const result = getRunsInRange({ expression: '0 12 * * *', from, to });
    expect(result.count).toBe(0);
    expect(result.averageIntervalMs).toBeNull();
  });

  it('throws when "to" is before "from"', () => {
    const from = new Date('2024-01-02T00:00:00Z');
    const to = new Date('2024-01-01T00:00:00Z');
    expect(() => getRunsInRange({ expression: '* * * * *', from, to })).toThrow(
      '"to" date must be after "from" date'
    );
  });

  it('computes averageIntervalMs for multiple runs', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const to = new Date('2024-01-01T00:05:00Z');
    const result = getRunsInRange({ expression: '* * * * *', from, to });
    expect(result.count).toBe(6);
    expect(result.averageIntervalMs).toBeCloseTo(60000, -2);
  });

  it('respects maxResults cap', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const to = new Date('2024-12-31T23:59:00Z');
    const result = getRunsInRange({ expression: '* * * * *', from, to, maxResults: 10 });
    expect(result.count).toBeLessThanOrEqual(10);
  });
});

describe('formatRangeResult', () => {
  it('includes expression and run count', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const to = new Date('2024-01-01T01:00:00Z');
    const result = getRunsInRange({ expression: '*/30 * * * *', from, to });
    const output = formatRangeResult(result);
    expect(output).toContain('*/30 * * * *');
    expect(output).toContain('Runs found : 3');
  });

  it('shows no-runs message when empty', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const to = new Date('2024-01-01T00:10:00Z');
    const result = getRunsInRange({ expression: '0 12 * * *', from, to });
    const output = formatRangeResult(result);
    expect(output).toContain('No runs scheduled in this range.');
  });
});
