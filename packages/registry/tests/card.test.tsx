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
});
