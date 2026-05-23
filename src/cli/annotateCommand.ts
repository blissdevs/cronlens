import {
  AnnotationStore,
  annotate,
  removeAnnotation,
  getAnnotation,
  searchAnnotations,
  listAnnotations,
} from "../scheduler/cronAnnotations";
import { colorize } from "./output";

export interface AnnotateCommandOptions {
  action: "add" | "remove" | "get" | "search" | "list";
  expression?: string;
  label?: string;
  notes?: string;
  query?: string;
}

export function runAnnotateCommand(
  store: AnnotationStore,
  opts: AnnotateCommandOptions
): void {
  switch (opts.action) {
    case "add": {
      if (!opts.expression || !opts.label) {
        console.error(colorize("red", "Error: expression and label are required for add."));
        return;
      }
      const ann = annotate(store, opts.expression, opts.label, opts.notes);
      console.log(colorize("green", `Annotated: ${ann.expression} → "${ann.label}"${
        ann.notes ? ` (${ann.notes})` : ""
      }`));
      break;
    }
    case "remove": {
      if (!opts.expression) {
        console.error(colorize("red", "Error: expression is required for remove."));
        return;
      }
      const removed = removeAnnotation(store, opts.expression);
      if (removed) {
        console.log(colorize("yellow", `Removed annotation for: ${opts.expression}`));
      } else {
        console.log(colorize("red", `No annotation found for: ${opts.expression}`));
      }
      break;
    }
    case "get": {
      if (!opts.expression) {
        console.error(colorize("red", "Error: expression is required for get."));
        return;
      }
      const ann = getAnnotation(store, opts.expression);
      if (!ann) {
        console.log(colorize("red", `No annotation found for: ${opts.expression}`));
      } else {
        console.log(colorize("cyan", `${ann.expression}  →  ${ann.label}`));
        if (ann.notes) console.log(`  Notes: ${ann.notes}`);
      }
      break;
    }
    case "search": {
      const results = searchAnnotations(store, opts.query ?? "");
      if (results.length === 0) {
        console.log(colorize("yellow", "No matching annotations found."));
      } else {
        results.forEach((a) =>
          console.log(colorize("cyan", `${a.expression}  →  ${a.label}`))
        );
      }
      break;
    }
    case "list": {
      const all = listAnnotations(store);
      if (all.length === 0) {
        console.log(colorize("yellow", "No annotations stored."));
      } else {
        all.forEach((a) =>
          console.log(`${colorize("cyan", a.expression)}  →  ${a.label}`)
        );
      }
      break;
    }
  }
}
