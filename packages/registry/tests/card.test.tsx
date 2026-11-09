import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

describe("Card", () => {
  it("renders a div with data-slot and default size", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("DIV");
    expect(card.getAttribute("data-slot")).toBe("card");
    expect(card.getAttribute("data-size")).toBe("default");
  });

  it("applies the sm size via data-size", () => {
    render(<Card size="sm" data-testid="card" />);
    expect(screen.getByTestId("card").getAttribute("data-size")).toBe("sm");
  });

  it("appends a custom className", () => {
    render(<Card className="custom-card" data-testid="card" />);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("custom-card");
    expect(card.className).toContain("rounded-xl");
  });

  it("composes all parts with their data-slot attributes", () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>Monthly Report</CardTitle>
          <CardDescription>Summary of activity.</CardDescription>
          <CardAction data-testid="action">Edit</CardAction>
        </CardHeader>
        <CardContent data-testid="content">Body text</CardContent>
        <CardFooter data-testid="footer">Footer text</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId("header").getAttribute("data-slot")).toBe(
      "card-header",
    );
    expect(
      screen.getByText("Monthly Report").getAttribute("data-slot"),
    ).toBe("card-title");
    expect(
      screen.getByText("Summary of activity.").getAttribute("data-slot"),
    ).toBe("card-description");
    expect(screen.getByTestId("action").getAttribute("data-slot")).toBe(
      "card-action",
    );
    expect(screen.getByTestId("content").getAttribute("data-slot")).toBe(
      "card-content",
    );
    expect(screen.getByTestId("footer").getAttribute("data-slot")).toBe(
      "card-footer",
    );
  });

  it("nests parts inside the card root", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Nested</CardTitle>
        </CardHeader>
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(
      card.querySelector('[data-slot="card-header"] [data-slot="card-title"]'),
    ).not.toBeNull();
  });

  it("merges custom classNames on subcomponents", () => {
    render(
      <Card>
        <CardHeader className="custom-header" data-testid="header" />
        <CardContent className="custom-content" data-testid="content" />
        <CardFooter className="custom-footer" data-testid="footer" />
      </Card>,
    );
    expect(screen.getByTestId("header").className).toContain("custom-header");
    expect(screen.getByTestId("content").className).toContain("custom-content");
    expect(screen.getByTestId("footer").className).toContain("custom-footer");
  });

  describe("v2 design language", () => {
    it("keeps the ring edge when a consumer overrides the shadow", () => {
      // The edge lives in the ring group, the lift in the shadow group, so a
      // consumer shadow-* or dark:shadow-none merges away only the lift.
      render(<Card data-testid="md" className="shadow-md" />);
      const md = screen.getByTestId("md").className.split(" ");
      expect(md).toEqual(expect.arrayContaining(["ring-1", "ring-foreground/10", "shadow-md"]));

      render(<Card data-testid="flat" className="dark:shadow-none" />);
      const flat = screen.getByTestId("flat").className.split(" ");
      expect(flat).toEqual(
        expect.arrayContaining(["ring-1", "ring-foreground/10", "dark:shadow-none"]),
      );

      // A consumer ring colour replaces the edge colour, not the width.
      render(<Card data-testid="ring" className="ring-primary" />);
      const ring = screen.getByTestId("ring").className.split(" ");
      expect(ring).toEqual(expect.arrayContaining(["ring-1", "ring-primary"]));
      expect(ring).not.toContain("ring-foreground/10");
    });

    it("draws main's card surface and ring with a raised lift, no highlight or inset", () => {
      render(<Card data-testid="card" />);
      const cls = screen.getByTestId("card").className;
      expect(cls.split(" ")).toEqual(
        expect.arrayContaining(["bg-card", "ring-1", "ring-foreground/10"]),
      );
      expect(cls).toContain("var(--elevation-raised,");
      expect(cls).not.toContain("elevation-highlight");
      expect(cls).not.toContain("elevation-inset");
      expect(cls).not.toContain("hairline");
      expect(cls).not.toContain("surface-");
    });

    it("spaces its parts from --panel-pad, read with a fallback so density inherits", () => {
      render(<Card data-testid="card" />);
      const cls = screen.getByTestId("card").className;
      expect(cls).toContain("[--card-spacing:var(--panel-pad,1.125rem)]");
      expect(cls).toContain(
        "data-[size=sm]:[--card-spacing:calc(var(--panel-pad,1.125rem)*0.75)]",
      );
      // A :where() default on the card itself would shadow an ancestor's
      // data-density="compact" value.
      expect(cls).not.toContain("[:where(&)]:[--panel-pad");
    });

    it("sets the footer on main's muted band behind a top border", () => {
      render(<CardFooter data-testid="footer" />);
      const cls = screen.getByTestId("footer").className.split(" ");
      expect(cls).toEqual(expect.arrayContaining(["border-t", "bg-muted/50"]));
      expect(cls.join(" ")).not.toContain("hairline");
      expect(cls.join(" ")).not.toContain("surface-");
    });
  });
});
