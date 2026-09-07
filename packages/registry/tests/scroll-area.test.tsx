import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScrollArea, ScrollBar } from "@/registry/base/ui/scroll-area";

describe("ScrollArea", () => {
  it("renders children inside the viewport", () => {
    const { container } = render(
      <ScrollArea>
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    const viewport = container.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    expect(viewport).not.toBeNull();
    expect(screen.getByText("Scrollable content").closest("div")).toBe(
      viewport,
    );
  });

  it("renders the root with its slot attribute and custom className", () => {
    const { container } = render(
      <ScrollArea className="h-40">Content</ScrollArea>,
    );
    const root = container.querySelector('[data-slot="scroll-area"]');
    expect(root).not.toBeNull();
    expect(root?.className).toContain("h-40");
  });

  it("hides scrollbars in jsdom because there is no overflow", () => {
    // Base UI unmounts scrollbars when the viewport is not scrollable
    // (jsdom has no layout, so nothing ever overflows).
    const { container } = render(
      <ScrollArea orientation="both">Content</ScrollArea>,
    );
    expect(
      container.querySelector('[data-slot="scroll-area-scrollbar"]'),
    ).toBeNull();
  });

  it("mounts a vertical scrollbar with a thumb when keepMounted is set", () => {
    const { container } = render(
      <ScrollArea>
        <ScrollBar keepMounted />
        Content
      </ScrollArea>,
    );
    const scrollbar = container.querySelector(
      '[data-slot="scroll-area-scrollbar"]',
    );
    expect(scrollbar).not.toBeNull();
    expect(scrollbar?.getAttribute("data-orientation")).toBe("vertical");
    expect(
      scrollbar?.querySelector('[data-slot="scroll-area-thumb"]'),
    ).not.toBeNull();
  });

  it("mounts a horizontal scrollbar when requested", () => {
    const { container } = render(
      <ScrollArea orientation="horizontal">
        <ScrollBar orientation="horizontal" keepMounted />
        Content
      </ScrollArea>,
    );
    const scrollbar = container.querySelector(
      '[data-slot="scroll-area-scrollbar"]',
    );
    expect(scrollbar?.getAttribute("data-orientation")).toBe("horizontal");
  });
});
