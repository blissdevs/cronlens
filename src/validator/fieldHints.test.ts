import { FIELD_HINTS, getFieldHint, getHintsForPosition, formatHint } from './fieldHints';

describe('fieldHints', () => {
  it('exports 5 field hints', () => {
    expect(FIELD_HINTS).toHaveLength(5);
  });

  it('getFieldHint returns correct hint by name', () => {
    const hint = getFieldHint('minute');
    expect(hint).toBeDefined();
    expect(hint!.min).toBe(0);
    expect(hint!.max).toBe(59);
  });

  it('getFieldHint returns undefined for unknown field', () => {
    expect(getFieldHint('second')).toBeUndefined();
  });

  it('getHintsForPosition returns correct field', () => {
    expect(getHintsForPosition(0)?.field).toBe('minute');
    expect(getHintsForPosition(4)?.field).toBe('dayOfWeek');
  });

  it('getHintsForPosition returns undefined for out-of-range index', () => {
    expect(getHintsForPosition(5)).toBeUndefined();
  });

  it('formatHint includes label, range and examples', () => {
    const hint = getFieldHint('hour')!;
    const formatted = formatHint(hint);
    expect(formatted).toContain('Hour');
    expect(formatted).toContain('0–23');
    expect(formatted).toContain('Examples');
    expect(formatted).toContain('*/6');
  });

  it('all hints have at least one example', () => {
    FIELD_HINTS.forEach(h => {
      expect(h.examples.length).toBeGreaterThan(0);
    });
  });
});
