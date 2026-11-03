import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "@/registry/base/ui/skeleton";

describe("Skeleton", () => {
  it("renders a div with data-slot and pulse animation class", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton.tagName).toBe("DIV");
    expect(skeleton.getAttribute("data-slot")).toBe("skeleton");
    expect(skeleton.className).toContain("animate-pulse");
  });

  it("appends a custom className for sizing", () => {
    render(<Skeleton className="h-4 w-40" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton.className).toContain("h-4");
    expect(skeleton.className).toContain("w-40");
    expect(skeleton.className).toContain("bg-hairline-strong");
  });

  it("pulses on the strong hairline and stops under reduced motion (v2)", () => {
    render(<Skeleton data-testid="skeleton" />);
    const classes = screen.getByTestId("skeleton").className.split(" ");
    expect(classes).toContain("bg-hairline-strong");
    expect(classes).toContain("animate-pulse");
    expect(classes).toContain("motion-reduce:animate-none");
    expect(classes).not.toContain("bg-muted");
  });

  it("passes through arbitrary props such as aria-hidden", () => {
    render(<Skeleton aria-hidden="true" data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton").getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("renders children when provided", () => {
    render(<Skeleton>placeholder</Skeleton>);
    expect(screen.getByText("placeholder")).not.toBeNull();
  });
});
