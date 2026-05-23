export interface CronAnnotation {
  expression: string;
  label: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationStore {
  annotations: Record<string, CronAnnotation>;
}

export function createAnnotationStore(): AnnotationStore {
  return { annotations: {} };
}

export function annotate(
  store: AnnotationStore,
  expression: string,
  label: string,
  notes: string = ""
): CronAnnotation {
  const now = new Date();
  const existing = store.annotations[expression];
  const annotation: CronAnnotation = {
    expression,
    label,
    notes,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
  };
  store.annotations[expression] = annotation;
  return annotation;
}

export function removeAnnotation(
  store: AnnotationStore,
  expression: string
): boolean {
  if (!store.annotations[expression]) return false;
  delete store.annotations[expression];
  return true;
}

export function getAnnotation(
  store: AnnotationStore,
  expression: string
): CronAnnotation | undefined {
  return store.annotations[expression];
}

export function searchAnnotations(
  store: AnnotationStore,
  query: string
): CronAnnotation[] {
  const q = query.toLowerCase();
  return Object.values(store.annotations).filter(
    (a) =>
      a.label.toLowerCase().includes(q) ||
      a.notes.toLowerCase().includes(q) ||
      a.expression.includes(q)
  );
}

export function listAnnotations(store: AnnotationStore): CronAnnotation[] {
  return Object.values(store.annotations).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}
