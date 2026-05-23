/**
 * cronTagging.ts
 * Allows users to attach tags/labels to cron expressions for organization.
 */

export interface TaggedCron {
  expression: string;
  tags: string[];
  label?: string;
  createdAt: Date;
}

export interface TagStore {
  entries: TaggedCron[];
}

export function createTagStore(): TagStore {
  return { entries: [] };
}

export function tagCron(
  store: TagStore,
  expression: string,
  tags: string[],
  label?: string
): TaggedCron {
  const existing = store.entries.find((e) => e.expression === expression);
  if (existing) {
    existing.tags = Array.from(new Set([...existing.tags, ...tags]));
    if (label) existing.label = label;
    return existing;
  }
  const entry: TaggedCron = {
    expression,
    tags: Array.from(new Set(tags)),
    label,
    createdAt: new Date(),
  };
  store.entries.push(entry);
  return entry;
}

export function removeTag(
  store: TagStore,
  expression: string,
  tag: string
): boolean {
  const entry = store.entries.find((e) => e.expression === expression);
  if (!entry) return false;
  const before = entry.tags.length;
  entry.tags = entry.tags.filter((t) => t !== tag);
  return entry.tags.length < before;
}

export function findByTag(store: TagStore, tag: string): TaggedCron[] {
  return store.entries.filter((e) => e.tags.includes(tag));
}

export function getAllTags(store: TagStore): string[] {
  const tagSet = new Set<string>();
  for (const entry of store.entries) {
    for (const tag of entry.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

export function formatTaggedCron(entry: TaggedCron): string {
  const label = entry.label ? `[${entry.label}] ` : "";
  const tags = entry.tags.length > 0 ? ` (tags: ${entry.tags.join(", ")})` : "";
  return `${label}${entry.expression}${tags}`;
}
