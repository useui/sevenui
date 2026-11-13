import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";
import { AA, contrastOn, destructivePull, destructiveTint, mix, palette } from "./helpers/palette";

function BasicContextMenu({
  onBack = () => {},
  onDisabled = () => {},
}: {
  onBack?: () => void;
  onDisabled?: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>Right click here</ContextMenuTrigger>
      <ContextMenuContent>
        {/* GroupLabel must live inside a Group in Base UI 1.7 */}
        <ContextMenuGroup>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem onClick={onBack}>Back</ContextMenuItem>
          <ContextMenuItem disabled onClick={onDisabled}>
            Forward
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function openContextMenu(triggerText = "Right click here") {
  fireEvent.contextMenu(screen.getByText(triggerText));
  return screen.findByRole("menu");
}

describe("ContextMenu", () => {
  it("stays closed until a contextmenu event occurs", () => {
    render(<BasicContextMenu />);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("does not open while the root is disabled", async () => {
    render(
      <ContextMenu disabled>
        <ContextMenuTrigger>Right click here</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Back</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("Right click here"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens on right-click (contextmenu event) and lists items", async () => {
    render(<BasicContextMenu />);
    const menu = await openContextMenu();
    expect(menu).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Back" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Forward" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeTruthy();
    expect(screen.getByText("Actions")).toBeTruthy();
    expect(document.querySelector('[data-slot="context-menu-separator"]')).toBeTruthy();
  });

  it("activates an item on click, firing onClick and closing the menu", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<BasicContextMenu onBack={onBack} />);
    await openContextMenu();
    await user.click(screen.getByRole("menuitem", { name: "Back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("closes at once when an item's onClick returns a pending Promise", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn(() => new Promise<void>(() => {}));
    render(<BasicContextMenu onBack={onBack} />);
    await openContextMenu();
    const item = screen.getByRole("menuitem", { name: "Back" });
    await user.click(item);
    expect(onBack).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(item.hasAttribute("aria-busy")).toBe(false);
    expect(item.hasAttribute("data-pending")).toBe(false);
  });

  it("does not activate a disabled item", async () => {
    const user = userEvent.setup();
    const onDisabled = vi.fn();
    render(<BasicContextMenu onDisabled={onDisabled} />);
    await openContextMenu();
    const item = screen.getByRole("menuitem", { name: "Forward" });
    expect(item.getAttribute("aria-disabled")).toBe("true");
    await user.click(item);
    expect(onDisabled).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<BasicContextMenu />);
    await openContextMenu();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("toggles checkbox items and reflects aria-checked", async () => {
    const user = userEvent.setup();

    function CheckboxContextMenu() {
      const [checked, setChecked] = React.useState(true);
      return (
        <ContextMenu>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
              closeOnClick={false}
            >
              Show Bookmarks
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    }

    render(<CheckboxContextMenu />);
    await openContextMenu();
    const item = screen.getByRole("menuitemcheckbox", { name: "Show Bookmarks" });
    expect(item.getAttribute("aria-checked")).toBe("true");
    await user.click(item);
    await waitFor(() => {
      expect(
        screen
          .getByRole("menuitemcheckbox", { name: "Show Bookmarks" })
          .getAttribute("aria-checked"),
      ).toBe("false");
    });
  });

  it("selects a radio item within a radio group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    function RadioContextMenu() {
      const [value, setValue] = React.useState("pedro");
      return (
        <ContextMenu>
          <ContextMenuTrigger>Right click here</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuRadioGroup
              value={value}
              onValueChange={(next) => {
                setValue(next as string);
                onValueChange(next);
              }}
            >
              <ContextMenuRadioItem value="pedro" closeOnClick={false}>
                Pedro Duarte
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="colm" closeOnClick={false}>
                Colm Tuite
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      );
    }

    render(<RadioContextMenu />);
    await openContextMenu();
    expect(
      screen.getByRole("menuitemradio", { name: "Pedro Duarte" }).getAttribute("aria-checked"),
    ).toBe("true");
    await user.click(screen.getByRole("menuitemradio", { name: "Colm Tuite" }));
    expect(onValueChange).toHaveBeenCalledWith("colm");
    await waitFor(() => {
      expect(
        screen.getByRole("menuitemradio", { name: "Colm Tuite" }).getAttribute("aria-checked"),
      ).toBe("true");
    });
  });
});

describe("ContextMenu v2 styles", () => {
  function StyledMenu() {
    return (
      <ContextMenu>
        <ContextMenuTrigger>Right click here</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>Actions</ContextMenuLabel>
            <ContextMenuItem>
              Back
              <ContextMenuShortcut>⌘[</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked>Bookmarks</ContextMenuCheckboxItem>
          <ContextMenuRadioGroup value="a">
            <ContextMenuRadioItem value="a">Person A</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }
  const slot = (name: string) =>
    document.querySelector(`[data-slot="${name}"]`)?.getAttribute("class") ?? "";

  it.each(["light", "dark"] as const)("keeps destructive item text at AA at rest and highlighted in %s", async (mode) => {
    render(<StyledMenu />);
    await openContextMenu();
    const classes =
      document.querySelector(`[data-slot="context-menu-item"][data-variant="destructive"]`)?.className ?? "";
    const rest = destructivePull(classes, "data-[variant=destructive]:");
    const highlighted = destructivePull(classes, "data-[variant=destructive]:data-highlighted:");
    const alpha = destructiveTint(
      classes,
      `${mode === "dark" ? "dark:" : ""}data-[variant=destructive]:data-highlighted:`,
    );
    for (const n of [rest, highlighted, alpha]) expect(n).not.toBeNaN();
    const p = palette(mode);
    const ratios = {
      rest: contrastOn(mix(p.foreground, rest, p.destructive), p.surfaces.popover),
      highlighted: contrastOn(mix(p.foreground, highlighted, p.destructive), p.surfaces.popover, {
        color: p.destructive,
        alpha,
      }),
    };
    const report = Object.entries(ratios).map(([k, r]) => `${k} ${r.toFixed(2)}`).join(", ");
    expect(Math.min(...Object.values(ratios)), `${mode}: ${report}`).toBeGreaterThanOrEqual(AA);
  });

  it("lifts muted descendants to the foreground on a highlighted row", async () => {
    render(<StyledMenu />);
    await openContextMenu();
    // Muted descendants follow the row to accent-foreground on the highlight.
    expect(slot("context-menu-shortcut").split(" ")).toContain(
      "group-data-highlighted/context-menu-item:text-accent-foreground",
    );
    expect(slot("context-menu-item").split(" ")).toContain(
      "not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground",
    );
    for (const row of ["context-menu-checkbox-item", "context-menu-radio-item"]) {
      // Only muted text, so the check indicator keeps the item colour.
      expect(slot(row).split(" ")).toContain(
        "data-highlighted:[&_.text-muted-foreground]:text-accent-foreground",
      );
      expect(slot(row)).not.toContain("**:text-foreground");
    }
  });

  it("renders the popup on the popover with a ring edge, the overlay shadow and a reduced-motion fallback", async () => {
    render(<StyledMenu />);
    await openContextMenu();
    const popup = slot("context-menu-content");
    expect(popup).toContain("bg-popover");
    expect(popup).toContain("ring-1 ring-foreground/10");
    expect(popup).toContain("shadow-overlay");
    expect(popup).not.toContain("surface-");
    expect(popup).not.toContain("hairline");
    expect(popup).toContain("p-1");
    expect(popup).toContain("data-starting-style:opacity-0");
    expect(popup).toContain("data-starting-style:scale-[0.98]");
    expect(popup).toContain("motion-reduce:transition-none");
  });

  it("sizes items from --item-h, highlights with the accent and hides the outline like main", async () => {
    render(<StyledMenu />);
    await openContextMenu();
    for (const name of [
      "context-menu-item",
      "context-menu-checkbox-item",
      "context-menu-radio-item",
    ]) {
      const cls = slot(name);
      expect(cls).toContain("min-h-[var(--item-h,2rem)]");
      expect(cls).toContain("data-highlighted:bg-accent");
      expect(cls).toContain("data-highlighted:text-accent-foreground");
      expect(cls).not.toContain("surface-panel");
      expect(cls).not.toContain("data-highlighted:shadow-");
      expect(cls).toContain("data-disabled:data-highlighted:bg-transparent");
      expect(cls).toContain("outline-hidden");
      expect(cls).not.toContain("focus-ring");
      expect(cls).not.toContain("--focus-gap");
      if (name === "context-menu-item") {
        // The destructive highlight outranks the generic guard, so it needs its own.
        expect(cls).toContain(
          "data-[variant=destructive]:data-disabled:data-highlighted:bg-transparent",
        );
      }
      expect(cls).not.toContain("ring-3");
    }
  });

  it("uses neutral indicators, mono shortcuts and border separators", async () => {
    render(<StyledMenu />);
    await openContextMenu();
    for (const name of ["context-menu-checkbox-item", "context-menu-radio-item"]) {
      const indicator = document.querySelector(`[data-slot="${name}"] > span`);
      expect(indicator?.getAttribute("class")).not.toContain("brand");
    }
    expect(slot("context-menu-shortcut")).toContain("font-mono");
    expect(slot("context-menu-separator")).toContain("bg-border");
  });
});
