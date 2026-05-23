import { getNextRuns, formatRunPreview } from './nextRuns';

describe('getNextRuns', () => {
  const baseDate = new Date('2024-01-15T10:00:00.000Z');

  it('returns the correct number of next runs (default 5)', () => {
    const runs = getNextRuns('* * * * *', { from: baseDate });
    expect(runs).toHaveLength(5);
  });

  it('returns the correct number of next runs when count is specified', () => {
    const runs = getNextRuns('* * * * *', { from: baseDate, count: 3 });
    expect(runs).toHaveLength(3);
  });

  it('each run is exactly 1 minute apart for wildcard expression', () => {
    const runs = getNextRuns('* * * * *', { from: baseDate, count: 3 });
    const diff0 = runs[1].getTime() - runs[0].getTime();
    const diff1 = runs[2].getTime() - runs[1].getTime();
    expect(diff0).toBe(60 * 1000);
    expect(diff1).toBe(60 * 1000);
  });

  it('returns runs only at the specified minute', () => {
    const runs = getNextRuns('30 * * * *', { from: baseDate, count: 3 });
    runs.forEach((run) => {
      expect(run.getMinutes()).toBe(30);
    });
  });

  it('returns runs only at the specified hour', () => {
    const runs = getNextRuns('0 9 * * *', { from: baseDate, count: 3 });
    runs.forEach((run) => {
      expect(run.getHours()).toBe(9);
      expect(run.getMinutes()).toBe(0);
    });
  });

  it('handles step expressions correctly', () => {
    const runs = getNextRuns('*/15 * * * *', { from: baseDate, count: 4 });
    runs.forEach((run) => {
      expect(run.getMinutes() % 15).toBe(0);
    });
  });

  it('throws an error for an invalid cron expression', () => {
    expect(() => getNextRuns('invalid cron', { from: baseDate })).toThrow();
  });

  it('all returned dates are after the from date', () => {
    const runs = getNextRuns('* * * * *', { from: baseDate, count: 5 });
    runs.forEach((run) => {
      expect(run.getTime()).toBeGreaterThan(baseDate.getTime());
    });
  });
});

describe('formatRunPreview', () => {
  it('returns a non-empty string for a valid date', () => {
    const result = formatRunPreview(new Date('2024-06-01T14:30:00'));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the hour and minute in the output', () => {
    const date = new Date('2024-06-01T14:30:00');
    const result = formatRunPreview(date);
    expect(result).toMatch(/30/);
  });
});
