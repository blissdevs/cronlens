import { createAnnotationStore } from "../scheduler/cronAnnotations";
import { runAnnotateCommand } from "./annotateCommand";

describe("runAnnotateCommand", () => {
  let consoleSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("adds an annotation and logs success", () => {
    const store = createAnnotationStore();
    runAnnotateCommand(store, {
      action: "add",
      expression: "0 9 * * 1",
      label: "Weekly standup",
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Weekly standup")
    );
    expect(store.annotations["0 9 * * 1"]).toBeDefined();
  });

  it("errors when add is missing expression", () => {
    const store = createAnnotationStore();
    runAnnotateCommand(store, { action: "add", label: "No expr" });
    expect(errorSpy).toHaveBeenCalled();
  });

  it("removes an annotation and logs success", () => {
    const store = createAnnotationStore();
    store.annotations["*/5 * * * *"] = {
      expression: "*/5 * * * *",
      label: "Polling",
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    runAnnotateCommand(store, { action: "remove", expression: "*/5 * * * *" });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Removed"));
  });

  it("logs not found when removing missing annotation", () => {
    const store = createAnnotationStore();
    runAnnotateCommand(store, { action: "remove", expression: "0 0 * * *" });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No annotation"));
  });

  it("gets an existing annotation", () => {
    const store = createAnnotationStore();
    store.annotations["0 0 * * *"] = {
      expression: "0 0 * * *",
      label: "Midnight",
      notes: "runs at midnight",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    runAnnotateCommand(store, { action: "get", expression: "0 0 * * *" });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Midnight"));
  });

  it("searches and returns matching annotations", () => {
    const store = createAnnotationStore();
    store.annotations["0 9 * * 1"] = {
      expression: "0 9 * * 1",
      label: "Standup",
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    runAnnotateCommand(store, { action: "search", query: "standup" });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Standup"));
  });

  it("lists all annotations", () => {
    const store = createAnnotationStore();
    store.annotations["*/15 * * * *"] = {
      expression: "*/15 * * * *",
      label: "Heartbeat",
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    runAnnotateCommand(store, { action: "list" });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Heartbeat"));
  });

  it("shows empty message when listing with no annotations", () => {
    const store = createAnnotationStore();
    runAnnotateCommand(store, { action: "list" });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No annotations"));
  });
});
