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
    // v2: the default badge is a hairline outline, not a primary fill.
    expect(badge.className).toContain("border-hairline-strong");
    expect(badge.className).not.toContain("bg-primary");
  });

  it("applies the secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge.getAttribute("data-variant")).toBe("secondary");
    expect(badge.className).toContain("bg-surface-panel");
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

  describe("v2 design language", () => {
    it("takes the reference badge shape", () => {
      render(<Badge>Shape</Badge>);
      const classes = screen.getByText("Shape").className.split(" ");
      expect(classes).toContain("rounded-full");
      expect(classes).toContain("px-2");
      expect(classes).toContain("text-[11px]");
      expect(classes).not.toContain("rounded-4xl");
    });

    it("draws the offset focus ring instead of the halo", () => {
      render(<Badge render={<a href="/x" />}>Focus</Badge>);
      const cls = screen.getByText("Focus").className;
      expect(cls).toContain("focus-visible:focus-ring");
      expect(cls).not.toContain("ring-3");
      expect(cls).not.toContain("ring-[3px]");
      expect(cls).not.toContain("focus-visible:border-ring");
      // The ring geometry is inherited from the tokens, never declared here.
      expect(cls).not.toContain("[:where(&)]:[--focus-");
    });

    it("adds an accent highlight variant", () => {
      render(<Badge variant="highlight">New</Badge>);
      const badge = screen.getByText("New");
      expect(badge.getAttribute("data-variant")).toBe("highlight");
      expect(badge.className).toContain("bg-brand/14");
      expect(badge.className).toContain("text-brand");
      expect(badge.className).toContain("border-brand/30");
    });

    it("keeps the accent out of every other variant", () => {
      for (const variant of ["default", "secondary", "destructive", "outline", "ghost"] as const) {
        render(<Badge variant={variant}>{variant}</Badge>);
        expect(screen.getByText(variant).className).not.toMatch(/(bg|border)-brand/);
      }
    });

    it.each(["destructive", "success", "warning"] as const)(
      "tints the %s status tone and marks it with a dot",
      (variant) => {
        render(<Badge variant={variant}>{variant}</Badge>);
        const cls = screen.getByText(variant).className;
        expect(cls).toContain("[--badge-tone:var(--");
        expect(cls).toContain(
          "bg-[color:color-mix(in_oklch,transparent_90%,var(--badge-tone))]",
        );
        expect(cls).toContain("before:size-1.5");
        expect(cls).toContain("before:bg-(--badge-tone)");
        // An icon replaces the dot.
        expect(cls).toContain("has-[>svg]:before:hidden");
      },
    );

    it("falls back to the SevenUI status values when a project lacks the status tokens", () => {
      render(<Badge variant="success">ok</Badge>);
      expect(screen.getByText("ok").className).toContain(
        "[--badge-tone:var(--success,oklch(",
      );
      render(<Badge variant="warning">warn</Badge>);
      expect(screen.getByText("warn").className).toContain(
        "[--badge-tone:var(--warning,oklch(",
      );
    });

    it("drops transitions under reduced motion", () => {
      render(<Badge>M</Badge>);
      expect(screen.getByText("M").className).toContain("motion-reduce:transition-none");
    });
  });
});
