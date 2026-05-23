import { parseCron, describeField } from '../parser/cronParser';

export interface HumanReadableResult {
  expression: string;
  description: string;
  parts: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

function replaceMonthNames(field: string): string {
  return field.replace(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi,
    (m) => String(MONTH_NAMES.findIndex(n => n.toLowerCase().startsWith(m.toLowerCase())) + 1)
  );
}

function replaceDayNames(field: string): string {
  return field.replace(
    /\b(sun|mon|tue|wed|thu|fri|sat)\b/gi,
    (m) => String(DAY_NAMES.findIndex(n => n.toLowerCase().startsWith(m.toLowerCase())))
  );
}

export function toHumanReadable(expression: string): HumanReadableResult {
  const normalized = expression.trim();
  const fields = normalized.split(/\s+/);

  if (fields.length !== 5) {
    throw new Error(`Invalid cron expression: expected 5 fields, got ${fields.length}`);
  }

  const [minute, hour, dom, month, dow] = fields;

  const parts = {
    minute: describeField(minute, 'minute'),
    hour: describeField(hour, 'hour'),
    dayOfMonth: describeField(replaceMonthNames(dom), 'day of month'),
    month: describeField(replaceMonthNames(month), 'month'),
    dayOfWeek: describeField(replaceDayNames(dow), 'day of week'),
  };

  const description = buildSentence(parts, minute, hour);

  return { expression: normalized, description, parts };
}

function buildSentence(
  parts: HumanReadableResult['parts'],
  rawMinute: string,
  rawHour: string
): string {
  const timePart =
    rawMinute === '*' && rawHour === '*'
      ? 'every minute'
      : `at ${parts.hour}, ${parts.minute}`;

  const dayPart =
    parts.dayOfMonth !== 'every day of month' && parts.dayOfWeek !== 'every day of week'
      ? `on ${parts.dayOfMonth} and ${parts.dayOfWeek}`
      : parts.dayOfMonth !== 'every day of month'
      ? `on ${parts.dayOfMonth}`
      : parts.dayOfWeek !== 'every day of week'
      ? `on ${parts.dayOfWeek}`
      : '';

  const monthPart =
    parts.month !== 'every month' ? `in ${parts.month}` : '';

  return ['Runs', timePart, dayPart, monthPart]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
