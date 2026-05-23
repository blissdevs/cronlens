import { toHumanReadable } from './humanReadable';

describe('toHumanReadable', () => {
  it('describes every-minute cron', () => {
    const result = toHumanReadable('* * * * *');
    expect(result.description).toContain('every minute');
  });

  it('describes a specific time', () => {
    const result = toHumanReadable('30 9 * * *');
    expect(result.description).toContain('9');
    expect(result.description).toContain('30');
  });

  it('returns correct parts for daily at midnight', () => {
    const result = toHumanReadable('0 0 * * *');
    expect(result.parts.minute).toBeDefined();
    expect(result.parts.hour).toBeDefined();
  });

  it('describes day-of-week restriction', () => {
    const result = toHumanReadable('0 8 * * 1');
    expect(result.description).toContain('day of week');
  });

  it('describes monthly cron', () => {
    const result = toHumanReadable('0 0 1 1 *');
    expect(result.description).toContain('month');
    expect(result.description).toContain('day of month');
  });

  it('throws on invalid expression', () => {
    expect(() => toHumanReadable('* * *')).toThrow('Invalid cron expression');
  });

  it('returns the normalized expression', () => {
    const result = toHumanReadable('  0 12 * * 1-5  ');
    expect(result.expression).toBe('0 12 * * 1-5');
  });

  it('handles step values', () => {
    const result = toHumanReadable('*/15 * * * *');
    expect(result.parts.minute).toContain('15');
  });

  it('handles range in hours', () => {
    const result = toHumanReadable('0 9-17 * * 1-5');
    expect(result.parts.hour).toContain('9');
    expect(result.parts.hour).toContain('17');
  });
});
