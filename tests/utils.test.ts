import { describe, expect, it } from "vitest";

import { cn } from "@/registry/base/lib/utils";

describe("cn", () => {
  it("merges tailwind classes with later overrides winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});
