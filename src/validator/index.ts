export { validateCron } from './cronValidator';
export type { ValidationResult } from './cronValidator';
export { getFieldHint, getHintsForPosition, formatHint, FIELD_HINTS } from './fieldHints';
export type { FieldHint } from './fieldHints';

import { validateCron, ValidationResult } from './cronValidator';
import { FIELD_HINTS, formatHint } from './fieldHints';

export interface ValidationReport {
  expression: string;
  result: ValidationResult;
  fieldHints: string[];
}

/**
 * Validates a cron expression and returns a full report including
 * per-field hints for any fields that have errors.
 */
export function validateWithReport(expression: string): ValidationReport {
  const result = validateCron(expression);
  const parts = expression.trim().split(/\s+/);

  const fieldHints: string[] = [];

  if (!result.valid) {
    const errorFields = new Set<number>();
    result.errors.forEach(err => {
      FIELD_HINTS.forEach((hint, i) => {
        if (err.toLowerCase().includes(hint.field.toLowerCase())) {
          errorFields.add(i);
        }
      });
    });

    if (errorFields.size === 0 && parts.length !== 5) {
      FIELD_HINTS.forEach((hint, i) => fieldHints.push(formatHint(hint)));
    } else {
      errorFields.forEach(i => fieldHints.push(formatHint(FIELD_HINTS[i])));
    }
  }

  return { expression, result, fieldHints };
}
