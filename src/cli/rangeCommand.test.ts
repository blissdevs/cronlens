import { runRangeCommand } from './rangeCommand';

const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as never);

beforeEach(() => {
  logSpy.mockClear();
  errorSpy.mockClear();
  exitSpy.mockClear();
});

afterAll(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
  exitSpy.mockRestore();
});

describe('runRangeCommand', () => {
  it('prints formatted range result for valid input', () => {
    runRangeCommand({
      expression: '*/15 * * * *',
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-01T01:00:00Z',
    });
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls[0][0] as string;
    expect(output).toContain('*/15 * * * *');
    expect(output).toContain('Runs found : 4');
  });

  it('outputs JSON when json flag is set', () => {
    runRangeCommand({
      expression: '0 * * * *',
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-01T03:00:00Z',
      json: true,
    });
    const output = logSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.count).toBe(4);
    expect(Array.isArray(parsed.runs)).toBe(true);
  });

  it('exits with error on invalid cron expression', () => {
    runRangeCommand({
      expression: 'not-a-cron',
      from: '2024-01-01T00:00:00Z',
      to: '2024-01-01T01:00:00Z',
    });
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('exits with error on invalid from date', () => {
    runRangeCommand({
      expression: '* * * * *',
      from: 'not-a-date',
      to: '2024-01-01T01:00:00Z',
    });
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits with error on invalid to date', () => {
    runRangeCommand({
      expression: '* * * * *',
      from: '2024-01-01T00:00:00Z',
      to: 'bad-date',
    });
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
