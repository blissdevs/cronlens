import { toHumanReadable, HumanReadableResult } from './humanReadable';

export interface CronPreset {
  label: string;
  expression: string;
  description: string;
}

const PRESET_EXPRESSIONS: Array<{ label: string; expression: string }> = [
  { label: 'Every minute',         expression: '* * * * *' },
  { label: 'Every hour',           expression: '0 * * * *' },
  { label: 'Every day at midnight',expression: '0 0 * * *' },
  { label: 'Every day at noon',    expression: '0 12 * * *' },
  { label: 'Every Sunday',         expression: '0 0 * * 0' },
  { label: 'Weekdays at 9am',      expression: '0 9 * * 1-5' },
  { label: 'Every 15 minutes',     expression: '*/15 * * * *' },
  { label: 'First of every month', expression: '0 0 1 * *' },
  { label: 'Every 6 hours',        expression: '0 */6 * * *' },
  { label: 'Twice daily',          expression: '0 8,20 * * *' },
];

export function getPresets(): CronPreset[] {
  return PRESET_EXPRESSIONS.map(({ label, expression }) => {
    let description = '';
    try {
      description = toHumanReadable(expression).description;
    } catch {
      description = 'Unable to parse expression';
    }
    return { label, expression, description };
  });
}

export function findPreset(expression: string): CronPreset | undefined {
  const normalized = expression.trim().replace(/\s+/g, ' ');
  return getPresets().find((p) => p.expression === normalized);
}

export function matchesPreset(expression: string): boolean {
  return findPreset(expression) !== undefined;
}
