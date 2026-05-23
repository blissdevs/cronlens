export interface FieldHint {
  field: string;
  label: string;
  min: number;
  max: number;
  examples: string[];
  description: string;
}

export const FIELD_HINTS: FieldHint[] = [
  {
    field: 'minute',
    label: 'Minute',
    min: 0,
    max: 59,
    examples: ['0', '*/15', '0,30', '0-5'],
    description: 'The minute(s) at which the job runs (0–59).',
  },
  {
    field: 'hour',
    label: 'Hour',
    min: 0,
    max: 23,
    examples: ['0', '9-17', '*/6', '8,12,20'],
    description: 'The hour(s) at which the job runs, in 24-hour format (0–23).',
  },
  {
    field: 'dayOfMonth',
    label: 'Day of Month',
    min: 1,
    max: 31,
    examples: ['1', '15', '1,15', '*/5'],
    description: 'The day(s) of the month the job runs (1–31).',
  },
  {
    field: 'month',
    label: 'Month',
    min: 1,
    max: 12,
    examples: ['*', '1', 'Jan', '6-8', 'Jan,Jul'],
    description: 'The month(s) the job runs (1–12 or Jan–Dec).',
  },
  {
    field: 'dayOfWeek',
    label: 'Day of Week',
    min: 0,
    max: 7,
    examples: ['*', '1-5', 'Mon-Fri', '0,6'],
    description: 'The day(s) of the week the job runs (0–7, where 0 and 7 are Sunday, or Sun–Sat).',
  },
];

export function getFieldHint(field: string): FieldHint | undefined {
  return FIELD_HINTS.find(h => h.field === field);
}

export function getHintsForPosition(position: number): FieldHint | undefined {
  return FIELD_HINTS[position];
}

export function formatHint(hint: FieldHint): string {
  return [
    `${hint.label} (${hint.min}–${hint.max}): ${hint.description}`,
    `  Examples: ${hint.examples.join(', ')}`,
  ].join('\n');
}
