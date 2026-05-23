import {
  createTagStore,
  tagCron,
  removeTag,
  findByTag,
  getAllTags,
  formatTaggedCron,
} from "./cronTagging";

describe("cronTagging", () => {
  describe("tagCron", () => {
    it("adds a new tagged entry to the store", () => {
      const store = createTagStore();
      const entry = tagCron(store, "0 * * * *", ["hourly", "prod"]);
      expect(store.entries).toHaveLength(1);
      expect(entry.expression).toBe("0 * * * *");
      expect(entry.tags).toContain("hourly");
      expect(entry.tags).toContain("prod");
    });

    it("merges tags for duplicate expressions", () => {
      const store = createTagStore();
      tagCron(store, "0 * * * *", ["hourly"]);
      tagCron(store, "0 * * * *", ["prod"]);
      expect(store.entries).toHaveLength(1);
      expect(store.entries[0].tags).toContain("hourly");
      expect(store.entries[0].tags).toContain("prod");
    });

    it("deduplicates tags", () => {
      const store = createTagStore();
      const entry = tagCron(store, "0 0 * * *", ["daily", "daily"]);
      expect(entry.tags.filter((t) => t === "daily")).toHaveLength(1);
    });

    it("sets label on entry", () => {
      const store = createTagStore();
      const entry = tagCron(store, "*/5 * * * *", ["frequent"], "Heartbeat");
      expect(entry.label).toBe("Heartbeat");
    });
  });

  describe("removeTag", () => {
    it("removes an existing tag", () => {
      const store = createTagStore();
      tagCron(store, "0 * * * *", ["hourly", "prod"]);
      const result = removeTag(store, "0 * * * *", "prod");
      expect(result).toBe(true);
      expect(store.entries[0].tags).not.toContain("prod");
    });

    it("returns false for unknown expression", () => {
      const store = createTagStore();
      expect(removeTag(store, "0 * * * *", "prod")).toBe(false);
    });
  });

  describe("findByTag", () => {
    it("returns entries matching the tag", () => {
      const store = createTagStore();
      tagCron(store, "0 * * * *", ["prod"]);
      tagCron(store, "0 0 * * *", ["prod", "daily"]);
      tagCron(store, "*/5 * * * *", ["dev"]);
      const results = findByTag(store, "prod");
      expect(results).toHaveLength(2);
    });
  });

  describe("getAllTags", () => {
    it("returns sorted unique tags across all entries", () => {
      const store = createTagStore();
      tagCron(store, "0 * * * *", ["prod", "hourly"]);
      tagCron(store, "0 0 * * *", ["dev", "daily"]);
      const tags = getAllTags(store);
      expect(tags).toEqual(["daily", "dev", "hourly", "prod"]);
    });
  });

  describe("formatTaggedCron", () => {
    it("formats with label and tags", () => {
      const store = createTagStore();
      const entry = tagCron(store, "0 * * * *", ["prod"], "Hourly Job");
      expect(formatTaggedCron(entry)).toBe(
        "[Hourly Job] 0 * * * * (tags: prod)"
      );
    });

    it("formats without label", () => {
      const store = createTagStore();
      const entry = tagCron(store, "0 0 * * *", ["daily"]);
      expect(formatTaggedCron(entry)).toBe("0 0 * * * (tags: daily)");
    });

    it("formats with no tags", () => {
      const store = createTagStore();
      const entry = tagCron(store, "* * * * *", []);
      expect(formatTaggedCron(entry)).toBe("* * * * *");
    });
  });
});
