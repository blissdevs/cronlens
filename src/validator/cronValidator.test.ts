import { validateCron } from './cronValidator';

describe('validateCron', () => {
  it('accepts a standard valid expression', () => {
    const result = validateCron('0 9 * * 1-5');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects wrong number of fields', () => {
    const result = validateCron('0 9 * *');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Expected 5 fields/);
  });

  it('rejects out-of-range minute', () => {
    const result = validateCron('60 9 * * *');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/minute/);
  });

  it('rejects out-of-range hour', () => {
    const result = validateCron('0 24 * * *');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/hour/);
  });

  it('accepts step expressions', () => {
    const result = validateCron('*/15 * * * *');
    expect(result.valid).toBe(true);
  });

  it('rejects invalid step value', () => {
    const result = validateCron('*/0 * * * *');
    expect(result.valid).toBe(false);
  });

  it('accepts named months', () => {
    const result = validateCron('0 0 1 Jan *');
    expect(result.valid).toBe(true);
  });

  it('accepts named days of week', () => {
    const result = validateCron('0 9 * * Mon-Fri');
    expect(result.valid).toBe(true);
  });

  it('warns when both dom and dow are set', () => {
    const result = validateCron('0 9 1 * 1');
    expect(result.warnings.some(w => w.includes('OR-ed'))).toBe(true);
  });

  it('warns on every-minute expression', () => {
    const result = validateCron('* * * * *');
    expect(result.warnings.some(w => w.includes('every minute'))).toBe(true);
  });

  it('rejects invalid range order', () => {
    const result = validateCron('0 9-5 * * *');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/start must be <=/);
  });

  it('accepts comma-separated list', () => {
    const result = validateCron('0 8,12,17 * * *');
    expect(result.valid).toBe(true);
  });
});
