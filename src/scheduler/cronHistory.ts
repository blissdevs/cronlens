import { getNextRuns } from './nextRuns';

export interface HistoryEntry {
  expression: string;
  label?: string;
  addedAt: Date;
  lastUsed: Date;
  useCount: number;
}

export interface RunHistory {
  entries: HistoryEntry[];
  maxSize: number;
}

export function createHistory(maxSize = 20): RunHistory {
  return { entries: [], maxSize };
}

export function addToHistory(
  history: RunHistory,
  expression: string,
  label?: string
): RunHistory {
  const now = new Date();
  const existing = history.entries.find((e) => e.expression === expression);

  if (existing) {
    existing.lastUsed = now;
    existing.useCount += 1;
    if (label) existing.label = label;
    return { ...history, entries: [...history.entries] };
  }

  const newEntry: HistoryEntry = {
    expression,
    label,
    addedAt: now,
    lastUsed: now,
    useCount: 1,
  };

  const entries = [newEntry, ...history.entries].slice(0, history.maxSize);
  return { ...history, entries };
}

export function removeFromHistory(history: RunHistory, expression: string): RunHistory {
  return {
    ...history,
    entries: history.entries.filter((e) => e.expression !== expression),
  };
}

export function getRecentEntries(history: RunHistory, limit = 5): HistoryEntry[] {
  return [...history.entries]
    .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
    .slice(0, limit);
}

export function getMostUsed(history: RunHistory, limit = 5): HistoryEntry[] {
  return [...history.entries]
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, limit);
}

export function enrichWithNextRun(
  entry: HistoryEntry,
  from: Date = new Date()
): HistoryEntry & { nextRun: Date | null } {
  try {
    const runs = getNextRuns(entry.expression, from, 1);
    return { ...entry, nextRun: runs[0] ?? null };
  } catch {
    return { ...entry, nextRun: null };
  }
}
