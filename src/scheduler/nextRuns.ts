import { parseCron } from '../parser/cronParser';

export interface NextRunOptions {
  count?: number;
  from?: Date;
}

/**
 * Checks if a given date matches a cron field value.
 */
function matchesField(value: number, field: string): boolean {
  if (field === '*') return true;

  if (field.includes('/')) {
    const [, step] = field.split('/');
    return value % parseInt(step, 10) === 0;
  }

  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number);
    return value >= start && value <= end;
  }

  if (field.includes(',')) {
    return field.split(',').map(Number).includes(value);
  }

  return parseInt(field, 10) === value;
}

/**
 * Returns the next N run times for a given cron expression.
 */
export function getNextRuns(expression: string, options: NextRunOptions = {}): Date[] {
  const { count = 5, from = new Date() } = options;
  const parsed = parseCron(expression);

  if (!parsed) {
    throw new Error(`Invalid cron expression: "${expression}"`);
  }

  const { fields } = parsed;
  const results: Date[] = [];

  // Start from the next minute
  const cursor = new Date(from);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIterations = 60 * 24 * 366; // up to ~1 year of minutes
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    const minute = cursor.getMinutes();
    const hour = cursor.getHours();
    const dayOfMonth = cursor.getDate();
    const month = cursor.getMonth() + 1; // cron months are 1-12
    const dayOfWeek = cursor.getDay(); // 0 = Sunday

    if (
      matchesField(minute, fields.minute) &&
      matchesField(hour, fields.hour) &&
      matchesField(dayOfMonth, fields.dayOfMonth) &&
      matchesField(month, fields.month) &&
      matchesField(dayOfWeek, fields.dayOfWeek)
    ) {
      results.push(new Date(cursor));
    }

    cursor.setMinutes(cursor.getMinutes() + 1);
    iterations++;
  }

  return results;
}

/**
 * Formats a Date as a human-readable preview string.
 */
export function formatRunPreview(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
