export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const FIELD_RANGES: Record<string, { min: number; max: number }> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 7 },
};

const MONTH_NAMES = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const DAY_NAMES = ['sun','mon','tue','wed','thu','fri','sat'];

function normalizeField(value: string, field: string): string {
  let v = value.toLowerCase();
  if (field === 'month') {
    MONTH_NAMES.forEach((m, i) => { v = v.replace(new RegExp(m, 'gi'), String(i + 1)); });
  }
  if (field === 'dayOfWeek') {
    DAY_NAMES.forEach((d, i) => { v = v.replace(new RegExp(d, 'gi'), String(i)); });
  }
  return v;
}

function validateSingleValue(val: string, min: number, max: number): boolean {
  const n = Number(val);
  return !isNaN(n) && Number.isInteger(n) && n >= min && n <= max;
}

function validateFieldToken(token: string, field: string, errors: string[]): void {
  const { min, max } = FIELD_RANGES[field];
  const normalized = normalizeField(token, field);

  if (normalized === '*') return;

  if (normalized.includes('/')) {
    const [range, step] = normalized.split('/');
    if (!step || isNaN(Number(step)) || Number(step) <= 0) {
      errors.push(`Invalid step value in '${token}' for ${field}`);
    }
    if (range !== '*' && range.includes('-')) {
      const [lo, hi] = range.split('-').map(Number);
      if (lo < min || hi > max || lo > hi) errors.push(`Range '${range}' out of bounds for ${field} (${min}-${max})`);
    }
    return;
  }

  if (normalized.includes('-')) {
    const [lo, hi] = normalized.split('-');
    if (!validateSingleValue(lo, min, max) || !validateSingleValue(hi, min, max)) {
      errors.push(`Invalid range '${token}' for ${field} (${min}-${max})`);
    } else if (Number(lo) > Number(hi)) {
      errors.push(`Range start must be <= end in '${token}' for ${field}`);
    }
    return;
  }

  if (!validateSingleValue(normalized, min, max)) {
    errors.push(`Value '${token}' out of bounds for ${field} (${min}-${max})`);
  }
}

export function validateCron(expression: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { valid: false, errors: [`Expected 5 fields, got ${parts.length}`], warnings };
  }

  const fields = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  parts.forEach((part, i) => {
    part.split(',').forEach(token => validateFieldToken(token, fields[i], errors));
  });

  if (parts[2] !== '*' && parts[4] !== '*') {
    warnings.push('Both day-of-month and day-of-week are set; they will be OR-ed together');
  }

  if (parts[0] === '*' && parts[1] === '*') {
    warnings.push('Expression runs every minute — is this intentional?');
  }

  return { valid: errors.length === 0, errors, warnings };
}
