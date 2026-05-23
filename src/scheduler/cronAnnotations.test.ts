import {
  createAnnotationStore,
  annotate,
  removeAnnotation,
  getAnnotation,
  searchAnnotations,
  listAnnotations,
} from "./cronAnnotations";

describe("cronAnnotations", () => {
  it("creates an empty annotation store", () => {
    const store = createAnnotationStore();
    expect(store.annotations).toEqual({});
  });

  it("adds an annotation to the store", () => {
    const store = createAnnotationStore();
    const ann = annotate(store, "0 9 * * 1", "Weekly standup", "Every Monday 9am");
    expect(ann.expression).toBe("0 9 * * 1");
    expect(ann.label).toBe("Weekly standup");
    expect(ann.notes).toBe("Every Monday 9am");
    expect(store.annotations["0 9 * * 1"]).toBeDefined();
  });

  it("preserves createdAt when updating annotation", () => {
    const store = createAnnotationStore();
    const first = annotate(store, "0 9 * * 1", "First label");
    const second = annotate(store, "0 9 * * 1", "Updated label");
    expect(second.createdAt).toEqual(first.createdAt);
    expect(second.label).toBe("Updated label");
  });

  it("removes an annotation", () => {
    const store = createAnnotationStore();
    annotate(store, "*/5 * * * *", "Every 5 min");
    const removed = removeAnnotation(store, "*/5 * * * *");
    expect(removed).toBe(true);
    expect(store.annotations["*/5 * * * *"]).toBeUndefined();
  });

  it("returns false when removing non-existent annotation", () => {
    const store = createAnnotationStore();
    expect(removeAnnotation(store, "0 0 * * *")).toBe(false);
  });

  it("retrieves an annotation by expression", () => {
    const store = createAnnotationStore();
    annotate(store, "0 0 * * *", "Midnight job");
    const ann = getAnnotation(store, "0 0 * * *");
    expect(ann?.label).toBe("Midnight job");
  });

  it("returns undefined for missing annotation", () => {
    const store = createAnnotationStore();
    expect(getAnnotation(store, "0 0 * * *")).toBeUndefined();
  });

  it("searches annotations by label", () => {
    const store = createAnnotationStore();
    annotate(store, "0 9 * * 1", "Weekly standup");
    annotate(store, "0 0 * * *", "Midnight cleanup");
    const results = searchAnnotations(store, "standup");
    expect(results).toHaveLength(1);
    expect(results[0].expression).toBe("0 9 * * 1");
  });

  it("searches annotations by expression", () => {
    const store = createAnnotationStore();
    annotate(store, "*/10 * * * *", "Polling job");
    const results = searchAnnotations(store, "*/10");
    expect(results).toHaveLength(1);
  });

  it("lists annotations sorted by updatedAt descending", () => {
    const store = createAnnotationStore();
    annotate(store, "0 1 * * *", "Job A");
    annotate(store, "0 2 * * *", "Job B");
    const list = listAnnotations(store);
    expect(list).toHaveLength(2);
    expect(list[0].updatedAt.getTime()).toBeGreaterThanOrEqual(
      list[1].updatedAt.getTime()
    );
  });
});
