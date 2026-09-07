import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/registry/base/ui/badge";

describe("Badge", () => {
  it("renders a span with data-slot and children", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.getAttribute("data-slot")).toBe("badge");
  });

  it("applies the default variant classes and data attribute", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge.getAttribute("data-variant")).toBe("default");
    expect(badge.className).toContain("bg-primary");
  });

  it("applies the secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.getAttribute("data-variant")).toBe("secondary");
    expect(badge.className).toContain("bg-secondary");
  });

  it("applies the destructive variant", () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badge = screen.getByText("Destructive");
    expect(badge.getAttribute("data-variant")).toBe("destructive");
    expect(badge.className).toContain("text-destructive");
  });

  it("applies the outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge.getAttribute("data-variant")).toBe("outline");
    expect(badge.className).toContain("border-border");
  });

  it("applies the ghost variant", () => {
    render(<Badge variant="ghost">Ghost</Badge>);
    const badge = screen.getByText("Ghost");
    expect(badge.getAttribute("data-variant")).toBe("ghost");
    expect(badge.className).toContain("hover:bg-muted");
  });

  it("applies the link variant", () => {
    render(<Badge variant="link">Link</Badge>);
    const badge = screen.getByText("Link");
    expect(badge.getAttribute("data-variant")).toBe("link");
    expect(badge.className).toContain("underline-offset-4");
  });

  it("appends a custom className after the variant classes", () => {
    render(<Badge className="custom-badge">Styled</Badge>);
    const badge = screen.getByText("Styled");
    expect(badge.className).toContain("custom-badge");
    expect(badge.className).toContain("inline-flex");
  });

  it("supports rendering as a different element via the render prop", () => {
    render(<Badge render={<a href="/releases" />}>v1.0</Badge>);
    const badge = screen.getByText("v1.0");
    expect(badge.tagName).toBe("A");
    expect(badge.getAttribute("href")).toBe("/releases");
    expect(badge.getAttribute("data-slot")).toBe("badge");
    expect(badge.className).toContain("inline-flex");
  });

  it("passes through arbitrary props such as aria attributes", () => {
    render(<Badge aria-invalid="true">Invalid</Badge>);
    expect(screen.getByText("Invalid").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });
});
