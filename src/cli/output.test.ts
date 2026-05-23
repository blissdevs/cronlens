import { formatOutput, CronOutput } from './output';

describe('formatOutput', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    process.env.NO_COLOR = '1';
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    delete process.env.NO_COLOR;
  });

  it('should print expression and human readable schedule', () => {
    const output: CronOutput = {
      expression: '0 9 * * 1-5',
      humanReadable: 'At 09:00, Monday through Friday',
      nextRuns: ['Mon, 01 Jan 2024 09:00:00', 'Tue, 02 Jan 2024 09:00:00'],
    };

    formatOutput(output);

    const calls = consoleSpy.mock.calls.map((c) => c.join(' '));
    expect(calls.some((c) => c.includes('0 9 * * 1-5'))).toBe(true);
    expect(calls.some((c) => c.includes('At 09:00, Monday through Friday'))).toBe(true);
    expect(calls.some((c) => c.includes('Next runs:'))).toBe(true);
    expect(calls.some((c) => c.includes('Mon, 01 Jan 2024 09:00:00'))).toBe(true);
  });

  it('should print preset name when provided', () => {
    const output: CronOutput = {
      expression: '@daily',
      preset: 'daily',
      humanReadable: 'At midnight every day',
      nextRuns: ['Mon, 01 Jan 2024 00:00:00'],
    };

    formatOutput(output);

    const calls = consoleSpy.mock.calls.map((c) => c.join(' '));
    expect(calls.some((c) => c.includes('@daily'))).toBe(true);
  });

  it('should not print preset line when preset is undefined', () => {
    const output: CronOutput = {
      expression: '*/5 * * * *',
      humanReadable: 'Every 5 minutes',
      nextRuns: [],
    };

    formatOutput(output);

    const calls = consoleSpy.mock.calls.map((c) => c.join(' '));
    expect(calls.some((c) => c.includes('Preset:'))).toBe(false);
  });
});
