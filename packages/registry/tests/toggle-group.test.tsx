import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

function Formatting(props: React.ComponentProps<typeof ToggleGroup>) {
  return (
    <ToggleGroup aria-label="Formatting" {...props}>
      <ToggleGroupItem value="bold" aria-label="Bold" />
      <ToggleGroupItem value="italic" aria-label="Italic" />
      <ToggleGroupItem value="underline" aria-label="Underline" />
    </ToggleGroup>
  );
}

describe("ToggleGroup", () => {
  it("renders a group with toggle items and data attributes", () => {
    render(<Formatting />);
    const group = screen.getByRole("group", { name: "Formatting" });
    expect(group.getAttribute("data-slot")).toBe("toggle-group");
    expect(group.getAttribute("data-orientation")).toBe("horizontal");
    expect(group.getAttribute("data-spacing")).toBe("2");
    const items = screen.getAllByRole("button");
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item.getAttribute("data-slot")).toBe("toggle-group-item");
      expect(item.getAttribute("aria-pressed")).toBe("false");
    }
  });

  it("only keeps one item pressed in single-selection mode (default)", async () => {
    const user = userEvent.setup();
    render(<Formatting />);
    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    await user.click(bold);
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    await user.click(italic);
    expect(italic.getAttribute("aria-pressed")).toBe("true");
    expect(bold.getAttribute("aria-pressed")).toBe("false");
  });

  it("allows several pressed items with multiple", async () => {
    const user = userEvent.setup();
    render(<Formatting multiple />);
    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    await user.click(bold);
    await user.click(italic);
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    expect(italic.getAttribute("aria-pressed")).toBe("true");
  });

  it("calls onValueChange with an array payload in single mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Formatting onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(onValueChange.mock.calls[0][0]).toEqual(["bold"]);
    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange.mock.calls[1][0]).toEqual(["italic"]);
    // Toggling the active item off yields an empty array.
    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange.mock.calls[2][0]).toEqual([]);
  });

  it("accumulates values in the payload with multiple", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Formatting multiple onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Bold" }));
    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange.mock.calls[1][0]).toEqual(["bold", "italic"]);
  });

  it("presses items listed in defaultValue", () => {
    render(<Formatting multiple defaultValue={["bold", "underline"]} />);
    expect(
      screen.getByRole("button", { name: "Bold" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Underline" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Italic" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("respects a controlled value", async () => {
    const user = userEvent.setup();
    render(<Formatting value={["bold"]} />);
    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    await user.click(italic);
    // Controlled: without a state update the pressed item does not change.
    expect(bold.getAttribute("aria-pressed")).toBe("true");
    expect(italic.getAttribute("aria-pressed")).toBe("false");
  });

  it("moves focus between items with arrow keys", async () => {
    const user = userEvent.setup();
    render(<Formatting />);
    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    bold.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(italic);
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(bold);
  });

  it("ignores interaction when the whole group is disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Formatting disabled onValueChange={onValueChange} />);
    const bold = screen.getByRole("button", { name: "Bold" });
    await user.click(bold);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(bold.getAttribute("aria-pressed")).toBe("false");
  });

  it("ignores clicks on a disabled item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="Formatting" onValueChange={onValueChange}>
        <ToggleGroupItem value="bold" aria-label="Bold" disabled />
        <ToggleGroupItem value="italic" aria-label="Italic" />
      </ToggleGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("propagates variant and size from the group to items via context", () => {
    render(
      <ToggleGroup aria-label="Formatting" variant="outline" size="sm">
        <ToggleGroupItem value="bold" aria-label="Bold" />
      </ToggleGroup>,
    );
    const item = screen.getByRole("button", { name: "Bold" });
    expect(item.getAttribute("data-variant")).toBe("outline");
    expect(item.getAttribute("data-size")).toBe("sm");
    const classes = item.className.split(/\s+/);
    expect(classes).toContain("border-hairline-strong");
    expect(classes).toContain("h-[calc(var(--control-h,2.125rem)-0.25rem)]");
  });

  it("sets vertical orientation data on the group", () => {
    render(<Formatting orientation="vertical" />);
    expect(
      screen
        .getByRole("group", { name: "Formatting" })
        .getAttribute("data-orientation"),
    ).toBe("vertical");
  });

  describe("v2 design language", () => {
    it("renders the default variant as a segmented tray", () => {
      render(<Formatting />);
      const classes = screen
        .getByRole("group", { name: "Formatting" })
        .className.split(/\s+/);
      expect(classes).toContain("not-data-[variant=outline]:bg-surface-tray");
      expect(classes).toContain("not-data-[variant=outline]:p-0.5");
      expect(classes).toContain(
        "not-data-[variant=outline]:shadow-[inset_0_0_0_1px_var(--hairline,var(--border)),var(--elevation-inset,0_0_#0000)]",
      );
    });

    it("fits items 4px inside the tray at every size", () => {
      render(<Formatting />);
      const classes = screen
        .getByRole("button", { name: "Bold" })
        .className.split(/\s+/);
      expect(classes).toContain(
        "data-[variant=default]:data-[size=default]:h-[calc(var(--control-h,2.125rem)-4px)]",
      );
      expect(classes).toContain(
        "data-[variant=default]:data-[size=sm]:h-[calc(var(--control-h,2.125rem)-0.25rem-4px)]",
      );
      expect(classes).toContain(
        "data-[variant=default]:data-[size=lg]:h-[calc(var(--control-h,2.125rem)+0.25rem-4px)]",
      );
    });

    it("styles items like toggles: offset focus ring, neutral raised selection", () => {
      render(<Formatting />);
      const classes = screen
        .getByRole("button", { name: "Bold" })
        .className.split(/\s+/);
      expect(classes).toContain("focus-visible:focus-ring");
      expect(classes).toContain("focus-visible:z-10");
      expect(classes).toContain("aria-pressed:bg-surface-raised");
      expect(classes.some((c) => c.includes("brand"))).toBe(false);
    });

    it("keeps the joined outline segments without a tray", () => {
      render(
        <ToggleGroup aria-label="Outline" variant="outline" spacing={0}>
          <ToggleGroupItem value="a" aria-label="A" />
        </ToggleGroup>,
      );
      const group = screen.getByRole("group", { name: "Outline" });
      expect(group.getAttribute("data-variant")).toBe("outline");
      const item = screen.getByRole("button", { name: "A" }).className.split(/\s+/);
      expect(item).toContain(
        "group-data-[spacing=0]/toggle-group:data-[variant=outline]:rounded-none",
      );
    });
  });
});
