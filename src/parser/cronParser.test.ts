import { parseCron, ParsedCron } from './cronParser';

describe('parseCron', () => {
  it('parses a standard 5-field cron expression', () => {
    const result = parseCron('0 9 * * 1');
    expect(result.minutes.raw).toBe('0');
    expect(result.hours.raw).toBe('9');
    expect(result.dayOfMonth.raw).toBe('*');
    expect(result.month.raw).toBe('*');
    expect(result.dayOfWeek.raw).toBe('1');
  });

  it('generates human-readable output for a simple expression', () => {
    const result = parseCron('0 9 * * 1');
    expect(result.humanReadable).toContain('Monday');
    expect(result.humanReadable).toContain('at 9');
  });

  it('handles wildcard fields correctly', () => {
    const result = parseCron('* * * * *');
    expect(result.minutes.description).toBe('every minute');
    expect(result.hours.description).toBe('every hour');
    expect(result.dayOfMonth.description).toBe('every day');
  });

  it('handles step values (*/n)', () => {
    const result = parseCron('*/15 */2 * * *');
    expect(result.minutes.description).toBe('every 15 minutes');
    expect(result.hours.description).toBe('every 2 hours');
  });

  it('handles range values', () => {
    const result = parseCron('0 9-17 * * 1-5');
    expect(result.hours.description).toBe('from 9 to 17');
    expect(result.dayOfWeek.description).toBe('from Monday to Friday');
  });

  it('handles comma-separated values', () => {
    const result = parseCron('0 9 * 1,6,12 *');
    expect(result.month.description).toContain('January');
    expect(result.month.description).toContain('June');
    expect(result.month.description).toContain('December');
  });

  it('parses a 6-field cron expression with seconds', () => {
    const result = parseCron('30 0 9 * * 1');
    expect(result.seconds).toBeDefined();
    expect(result.seconds!.raw).toBe('30');
  });

  it('throws on invalid number of fields', () => {
    expect(() => parseCron('* * *')).toThrow('Invalid cron expression');
    expect(() => parseCron('* * * * * * *')).toThrow('Invalid cron expression');
  });

  it('maps month numbers to names', () => {
    const result = parseCron('0 0 1 3 *');
    expect(result.month.description).toBe('March');
  });

  it('maps day-of-week numbers to names', () => {
    const result = parseCron('0 0 * * 0');
    expect(result.dayOfWeek.description).toBe('Sunday');
  });
});
