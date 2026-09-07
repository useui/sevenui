import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";

describe("AspectRatio", () => {
  it("renders a div with data-slot", () => {
    render(<AspectRatio ratio={16 / 9} data-testid="ratio" />);
    const element = screen.getByTestId("ratio");
    expect(element.tagName).toBe("DIV");
    expect(element.getAttribute("data-slot")).toBe("aspect-ratio");
  });

  it("exposes the ratio through the --ratio custom property", () => {
    render(<AspectRatio ratio={16 / 9} data-testid="ratio" />);
    const element = screen.getByTestId("ratio");
    expect(element.style.getPropertyValue("--ratio")).toBe(
      String(16 / 9),
    );
    expect(element.className).toContain("aspect-(--ratio)");
  });

  it("updates the custom property for a different ratio", () => {
    render(<AspectRatio ratio={1} data-testid="ratio" />);
    expect(
      screen.getByTestId("ratio").style.getPropertyValue("--ratio"),
    ).toBe("1");
  });

  it("appends a custom className to the base classes", () => {
    render(
      <AspectRatio ratio={4 / 3} className="custom-ratio" data-testid="ratio" />,
    );
    const element = screen.getByTestId("ratio");
    expect(element.className).toContain("custom-ratio");
    expect(element.className).toContain("relative");
  });

  it("renders children inside the ratio container", () => {
    render(
      <AspectRatio ratio={16 / 9}>
        <img src="/placeholder.svg" alt="Landscape photo" />
      </AspectRatio>,
    );
    expect(screen.getByAltText("Landscape photo")).not.toBeNull();
  });
});
