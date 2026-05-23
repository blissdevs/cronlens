import {
  diffCronExpressions,
  describeDiff,
  summarizeDiff,
} from './diffDescription';

describe('diffCronExpressions', () => {
  it('returns no changes for identical expressions', () => {
    const diffs = diffCronExpressions('0 9 * * 1', '0 9 * * 1');
    expect(diffs.every((d) => !d.changed)).toBe(true);
  });

  it('detects a single field change', () => {
    const diffs = diffCronExpressions('0 9 * * 1', '0 10 * * 1');
    const changed = diffs.filter((d) => d.changed);
    expect(changed).toHaveLength(1);
    expect(changed[0].field).toBe('hour');
    expect(changed[0].from).toBe('9');
    expect(changed[0].to).toBe('10');
  });

  it('detects multiple field changes', () => {
    const diffs = diffCronExpressions('0 9 * * 1', '30 18 * * 5');
    const changed = diffs.filter((d) => d.changed);
    expect(changed).toHaveLength(3);
    const fields = changed.map((d) => d.field);
    expect(fields).toContain('minute');
    expect(fields).toContain('hour');
    expect(fields).toContain('day of week');
  });

  it('throws on invalid expression length', () => {
    expect(() => diffCronExpressions('0 9 *', '0 9 * * 1')).toThrow();
  });
});

describe('describeDiff', () => {
  it('returns no-change message for identical expressions', () => {
    const result = describeDiff('* * * * *', '* * * * *');
    expect(result).toBe('No changes between the two expressions.');
  });

  it('includes changed field details', () => {
    const result = describeDiff('0 9 * * 1', '0 10 * * 1');
    expect(result).toContain('hour');
    expect(result).toContain('9');
    expect(result).toContain('10');
    expect(result).toContain('Changed fields (1)');
  });
});

describe('summarizeDiff', () => {
  it('returns "identical" for same expressions', () => {
    expect(summarizeDiff('0 0 * * *', '0 0 * * *')).toBe('identical');
  });

  it('returns single field summary', () => {
    expect(summarizeDiff('0 9 * * *', '0 10 * * *')).toBe('hour changed');
  });

  it('returns multi-field summary with "and"', () => {
    const result = summarizeDiff('0 9 1 * *', '30 18 15 * *');
    expect(result).toContain('and');
    expect(result).toContain('day of month');
  });
});
