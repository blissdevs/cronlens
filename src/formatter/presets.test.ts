import { getPresets, findPreset, matchesPreset } from './presets';

describe('getPresets', () => {
  it('returns a non-empty list of presets', () => {
    const presets = getPresets();
    expect(presets.length).toBeGreaterThan(0);
  });

  it('each preset has label, expression, and description', () => {
    const presets = getPresets();
    for (const preset of presets) {
      expect(preset.label).toBeTruthy();
      expect(preset.expression).toBeTruthy();
      expect(preset.description).toBeTruthy();
    }
  });

  it('descriptions are human-readable strings', () => {
    const presets = getPresets();
    for (const preset of presets) {
      expect(typeof preset.description).toBe('string');
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });
});

describe('findPreset', () => {
  it('finds a known preset by expression', () => {
    const preset = findPreset('* * * * *');
    expect(preset).toBeDefined();
    expect(preset?.label).toBe('Every minute');
  });

  it('returns undefined for unknown expression', () => {
    const preset = findPreset('13 7 * * 3');
    expect(preset).toBeUndefined();
  });

  it('normalizes whitespace before matching', () => {
    const preset = findPreset('  0  0  *  *  *  ');
    expect(preset).toBeDefined();
    expect(preset?.label).toBe('Every day at midnight');
  });
});

describe('matchesPreset', () => {
  it('returns true for a known preset', () => {
    expect(matchesPreset('0 12 * * *')).toBe(true);
  });

  it('returns false for a custom expression', () => {
    expect(matchesPreset('5 4 * * 2')).toBe(false);
  });
});
