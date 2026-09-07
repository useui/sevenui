import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "@/registry/base/ui/separator";

describe("Separator", () => {
  it("renders with role separator and data-slot", () => {
    render(<Separator />);
    const separator = screen.getByRole("separator");
    expect(separator.getAttribute("data-slot")).toBe("separator");
  });

  it("defaults to horizontal orientation", () => {
    render(<Separator data-testid="separator" />);
    expect(
      screen.getByTestId("separator").getAttribute("data-orientation"),
    ).toBe("horizontal");
  });

  it("supports vertical orientation with matching aria-orientation", () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    const separator = screen.getByTestId("separator");
    expect(separator.getAttribute("data-orientation")).toBe("vertical");
    expect(separator.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("appends a custom className to the base classes", () => {
    render(<Separator className="custom-separator" data-testid="separator" />);
    const separator = screen.getByTestId("separator");
    expect(separator.className).toContain("custom-separator");
    expect(separator.className).toContain("bg-border");
  });

  it("passes through arbitrary props", () => {
    render(<Separator aria-label="Section divider" data-testid="separator" />);
    expect(
      screen.getByTestId("separator").getAttribute("aria-label"),
    ).toBe("Section divider");
  });
});
