import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import mainRegistry from "../../../packages/registry/registry.json";
import { REGISTRY_DIR } from "./ui-sdk-examples";

const PRIMITIVES = new Set(mainRegistry.items.filter((item) => item.type === "registry:ui").map((item) => item.name));

export const isPrimitive = (item: string): boolean => PRIMITIVES.has(item);

/** Whether an item has a UI SDK flavour: a primitive, or a demo or gallery example of one. */
export const isFlavouredItem = (item: string): boolean =>
  PRIMITIVES.has(item) || item.startsWith("component/") || item.startsWith("demo/");

export interface Foundation {
  /** `@ui-sdk/react/<entry>` (or `@base-ui/react/<entry>`) entries the primitive's file imports. */
  entries: string[];
  /** Other SevenUI primitives it is composed from. */
  primitives: string[];
  /** Third-party libraries it wraps instead (recharts, @shadcn/react). */
  libraries: string[];
}

const FOUNDATION_LIBRARIES = ["recharts", "@shadcn/react", "react-day-picker", "embla-carousel-react", "react-resizable-panels"];

/**
 * What one flavour of a primitive is built on, read from its source file's imports so it can never drift
 * from the code: `ui-sdk` reads registry/ui-sdk/ui/<name>.tsx, `base-ui` reads registry/base/ui/<name>.tsx.
 */
export async function primitiveFoundation(name: string, flavour: "base-ui" | "ui-sdk"): Promise<Foundation> {
  const dir = flavour === "ui-sdk" ? "ui-sdk" : "base";
  const source = await readFile(path.join(REGISTRY_DIR, "registry", dir, "ui", `${name}.tsx`), "utf8");
  const specifiers = [...source.matchAll(/from\s+"([^"]+)"/g)].map((match) => match[1]);
  const pkg = flavour === "ui-sdk" ? "@ui-sdk/react/" : "@base-ui/react/";
  const unique = (values: string[]) => [...new Set(values)].sort();
  return {
    entries: unique(
      specifiers
        .filter((spec) => spec.startsWith(pkg))
        .map((spec) => spec.slice(pkg.length))
        // `primitive` and the shared helpers are UI SDK's building blocks, not components with a page.
        .filter((entry) => !["primitive", "merge-props", "use-render", "utils"].includes(entry)),
    ),
    primitives: unique(
      specifiers
        .filter((spec) => /^@\/registry\/[^/]+\/ui\//.test(spec))
        .map((spec) => spec.replace(/^@\/registry\/[^/]+\/ui\//, ""))
        .filter((other) => other !== name),
    ),
    libraries: unique(
      specifiers
        .map((spec) => FOUNDATION_LIBRARIES.find((lib) => spec === lib || spec.startsWith(`${lib}/`)))
        .filter((lib): lib is string => Boolean(lib)),
    ),
  };
}
