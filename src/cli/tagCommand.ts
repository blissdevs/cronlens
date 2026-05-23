/**
 * tagCommand.ts
 * CLI command handler for tagging and querying cron expressions.
 */

import {
  createTagStore,
  tagCron,
  removeTag,
  findByTag,
  getAllTags,
  formatTaggedCron,
  TagStore,
} from "../scheduler/cronTagging";
import { colorize } from "./output";

// In a real app this would be persisted; here we use a module-level store.
const globalStore: TagStore = createTagStore();

export interface TagCommandOptions {
  expression?: string;
  tags?: string[];
  label?: string;
  remove?: string;
  search?: string;
  listTags?: boolean;
}

export function runTagCommand(options: TagCommandOptions): void {
  const { expression, tags, label, remove, search, listTags } = options;

  if (listTags) {
    const all = getAllTags(globalStore);
    if (all.length === 0) {
      console.log(colorize("No tags found.", "yellow"));
    } else {
      console.log(colorize("All tags:", "cyan"));
      all.forEach((t) => console.log(`  • ${t}`));
    }
    return;
  }

  if (search) {
    const results = findByTag(globalStore, search);
    if (results.length === 0) {
      console.log(colorize(`No expressions tagged with "${search}".`, "yellow"));
    } else {
      console.log(colorize(`Expressions tagged "${search}":`, "cyan"));
      results.forEach((e) => console.log(`  ${formatTaggedCron(e)}`));
    }
    return;
  }

  if (!expression) {
    console.error(colorize("Error: --expression is required.", "red"));
    return;
  }

  if (remove) {
    const ok = removeTag(globalStore, expression, remove);
    if (ok) {
      console.log(
        colorize(`Removed tag "${remove}" from ${expression}.`, "green")
      );
    } else {
      console.log(
        colorize(`Tag "${remove}" not found on ${expression}.`, "yellow")
      );
    }
    return;
  }

  if (tags && tags.length > 0) {
    const entry = tagCron(globalStore, expression, tags, label);
    console.log(colorize("Tagged:", "green"));
    console.log(`  ${formatTaggedCron(entry)}`);
    return;
  }

  console.error(colorize("Error: provide --tags or --remove.", "red"));
}
