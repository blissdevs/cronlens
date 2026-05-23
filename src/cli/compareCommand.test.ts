import { runCompareCommand } from './compareCommand';

const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
  throw new Error(`process.exit: ${code}`);
});

const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  mockExit.mockRestore();
  consoleSpy.mockRestore();
  errorSpy.mockRestore();
});

describe('runCompareCommand', () => {
  it('runs without error for two valid expressions', () => {
    expect(() => runCompareCommand('* * * * *', '*/5 * * * *', 5)).not.toThrow();
  });

  it('prints comparison header', () => {
    runCompareCommand('0 9 * * 1', '0 17 * * 5', 5);
    const output = consoleSpy.mock.calls.flat().join(' ');
    expect(output).toMatch(/Cron Comparison/);
  });

  it('prints frequency information', () => {
    runCompareCommand('* * * * *', '*/10 * * * *', 10);
    const output = consoleSpy.mock.calls.flat().join(' ');
    expect(output).toMatch(/Frequency/);
  });

  it('exits with error for invalid expression A', () => {
    expect(() => runCompareCommand('99 * * * *', '* * * * *', 5)).toThrow('process.exit: 1');
    const errOutput = errorSpy.mock.calls.flat().join(' ');
    expect(errOutput).toMatch(/Invalid expression A/);
  });

  it('exits with error for invalid expression B', () => {
    expect(() => runCompareCommand('* * * * *', '* * * * 9', 5)).toThrow('process.exit: 1');
    const errOutput = errorSpy.mock.calls.flat().join(' ');
    expect(errOutput).toMatch(/Invalid expression B/);
  });

  it('shows overlap and only-in sections', () => {
    runCompareCommand('*/5 * * * *', '*/10 * * * *', 5);
    const output = consoleSpy.mock.calls.flat().join(' ');
    expect(output).toMatch(/Overlapping runs/);
    expect(output).toMatch(/Only in A/);
    expect(output).toMatch(/Only in B/);
  });
});
