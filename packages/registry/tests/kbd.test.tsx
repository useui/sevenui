import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

describe("Kbd", () => {
  it("renders a kbd element with data-slot and children", () => {
    render(<Kbd>Ctrl</Kbd>);
    const kbd = screen.getByText("Ctrl");
    expect(kbd.tagName).toBe("KBD");
    expect(kbd.getAttribute("data-slot")).toBe("kbd");
  });

  it("appends a custom className to the base classes", () => {
    render(<Kbd className="custom-kbd">K</Kbd>);
    const kbd = screen.getByText("K");
    expect(kbd.className).toContain("custom-kbd");
    expect(kbd.className).toContain("bg-muted");
  });

  it("passes through arbitrary props", () => {
    render(<Kbd aria-label="Command key">Cmd</Kbd>);
    expect(screen.getByText("Cmd").getAttribute("aria-label")).toBe(
      "Command key",
    );
  });
});

describe("KbdGroup", () => {
  // A <kbd> wrapping <kbd> elements is spec-valid HTML for key combinations.
  it("renders with data-slot kbd-group as a kbd element", () => {
    render(<KbdGroup data-testid="group" />);
    const group = screen.getByTestId("group");
    expect(group.getAttribute("data-slot")).toBe("kbd-group");
    expect(group.tagName).toBe("KBD");
  });

  it("groups multiple Kbd children", () => {
    render(
      <KbdGroup data-testid="group">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );
    const group = screen.getByTestId("group");
    expect(group.querySelectorAll('[data-slot="kbd"]')).toHaveLength(2);
  });

  it("appends a custom className", () => {
    render(<KbdGroup className="custom-group" data-testid="group" />);
    const group = screen.getByTestId("group");
    expect(group.className).toContain("custom-group");
    expect(group.className).toContain("inline-flex");
  });
});
