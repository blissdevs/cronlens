export interface CronField {
  raw: string;
  description: string;
}

export interface ParsedCron {
  seconds?: CronField;
  minutes: CronField;
  hours: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
  humanReadable: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function describeField(value: string, type: 'minute' | 'hour' | 'dom' | 'month' | 'dow'): string {
  if (value === '*') return `every ${type === 'dom' ? 'day' : type}`;

  if (value.startsWith('*/')) {
    const step = value.slice(2);
    return `every ${step} ${type}${parseInt(step) !== 1 ? 's' : ''}`;
  }

  if (value.includes('-')) {
    const [start, end] = value.split('-');
    if (type === 'month') {
      return `from ${MONTH_NAMES[parseInt(start) - 1]} to ${MONTH_NAMES[parseInt(end) - 1]}`;
    }
    if (type === 'dow') {
      return `from ${DAY_NAMES[parseInt(start)]} to ${DAY_NAMES[parseInt(end)]}`;
    }
    return `from ${start} to ${end}`;
  }

  if (value.includes(',')) {
    const parts = value.split(',');
    if (type === 'month') return parts.map(p => MONTH_NAMES[parseInt(p) - 1]).join(', ');
    if (type === 'dow') return parts.map(p => DAY_NAMES[parseInt(p)]).join(', ');
    return parts.join(', ');
  }

  if (type === 'month') return MONTH_NAMES[parseInt(value) - 1] ?? value;
  if (type === 'dow') return DAY_NAMES[parseInt(value)] ?? value;
  return `at ${value}`;
}

export function parseCron(expression: string): ParsedCron {
  const parts = expression.trim().split(/\s+/);

  if (parts.length < 5 || parts.length > 6) {
    throw new Error(`Invalid cron expression: expected 5 or 6 fields, got ${parts.length}`);
  }

  const has6Fields = parts.length === 6;
  const [sec, min, hour, dom, month, dow] = has6Fields ? parts : [undefined, ...parts];

  const minutes: CronField = { raw: min!, description: describeField(min!, 'minute') };
  const hours: CronField = { raw: hour!, description: describeField(hour!, 'hour') };
  const dayOfMonth: CronField = { raw: dom!, description: describeField(dom!, 'dom') };
  const monthField: CronField = { raw: month!, description: describeField(month!, 'month') };
  const dayOfWeek: CronField = { raw: dow!, description: describeField(dow!, 'dow') };

  const humanReadable = [
    `At ${hours.description} ${minutes.description}`,
    `on ${dayOfMonth.description}`,
    `in ${monthField.description}`,
    `on ${dayOfWeek.description}`,
  ].join(', ');

  const result: ParsedCron = { minutes, hours, dayOfMonth, month: monthField, dayOfWeek, humanReadable };

  if (has6Fields && sec) {
    result.seconds = { raw: sec, description: describeField(sec, 'minute') };
  }

  return result;
}
