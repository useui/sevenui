import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

function BasicMenubar({
  onNewTab = () => {},
  onUndo = () => {},
}: {
  onNewTab?: () => void;
  onUndo?: () => void;
}) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNewTab}>
            New Tab
            <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Print</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onUndo}>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

describe("Menubar", () => {
  it("renders a menubar with all menu triggers and no open menu", () => {
    render(<BasicMenubar />);
    expect(screen.getByRole("menubar")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "File" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeTruthy();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens a menu on trigger click and shows its items", async () => {
    const user = userEvent.setup();
    render(<BasicMenubar />);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByRole("menu");
    expect(screen.getByRole("menuitem", { name: /New Tab/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Print" })).toBeTruthy();
    expect(document.querySelector('[data-slot="menubar-separator"]')).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "File" }).getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  it("moves to the sibling menu when the other trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<BasicMenubar />);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByRole("menuitem", { name: /New Tab/ });
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    await screen.findByRole("menuitem", { name: "Undo" });
    expect(screen.queryByRole("menuitem", { name: /New Tab/ })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Edit" }).getAttribute("aria-expanded")).toBe(
      "true",
    );
  });

  it("navigates between menus with arrow keys once open", async () => {
    const user = userEvent.setup();
    render(<BasicMenubar />);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByRole("menuitem", { name: /New Tab/ });
    // ArrowRight from an open menubar menu moves to the next menu.
    await user.keyboard("{ArrowRight}");
    await screen.findByRole("menuitem", { name: "Undo" });
    expect(screen.queryByRole("menuitem", { name: /New Tab/ })).toBeNull();
  });

  it("activates an item, firing onClick and closing the menu", async () => {
    const user = userEvent.setup();
    const onNewTab = vi.fn();
    render(<BasicMenubar onNewTab={onNewTab} />);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    const item = await screen.findByRole("menuitem", { name: /New Tab/ });
    await user.click(item);
    expect(onNewTab).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("closes the open menu on Escape", async () => {
    const user = userEvent.setup();
    render(<BasicMenubar />);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});

describe("Menubar v2 styles", () => {
  const cls = (el: Element | null) => el?.getAttribute("class") ?? "";

  it("renders the bar as a hairline toolbar tray sized from --control-h", () => {
    render(<BasicMenubar />);
    const bar = cls(screen.getByRole("menubar"));
    expect(bar).toContain("bg-surface-tray");
    expect(bar).toContain("ring-hairline");
    expect(bar).toContain("p-0.5");
    expect(bar).toContain("h-[var(--control-h,2.125rem)]");
    expect(bar).not.toMatch(/(^|\s)border(\s|$)/);
  });

  it("styles triggers as ghost toggles with the offset focus ring", () => {
    render(<BasicMenubar />);
    const trigger = cls(screen.getByRole("menuitem", { name: "File" }));
    expect(trigger).toContain("focus-visible:focus-ring");
    expect(trigger).not.toContain("ring-3");
    expect(trigger).toContain("hover:bg-surface-panel");
    expect(trigger).toContain("data-popup-open:bg-surface-raised");
    expect(trigger).toContain("px-[var(--control-px,0.75rem)]");
    expect(trigger).toContain("motion-reduce:transition-none");
  });

  it("renders menus with the dropdown popup, items and hairline separators", async () => {
    const user = userEvent.setup();
    render(<BasicMenubar />);
    await user.click(screen.getByRole("menuitem", { name: "File" }));
    const menu = await screen.findByRole("menu");
    expect(cls(menu)).toContain("bg-surface-raised");
    expect(cls(menu)).toContain("shadow-overlay");
    const item = screen.getByRole("menuitem", { name: /New Tab/ });
    expect(cls(item)).toContain("min-h-[var(--item-h,2rem)]");
    expect(cls(item)).toContain("data-highlighted:bg-surface-panel");
    expect(cls(document.querySelector('[data-slot="menubar-separator"]'))).toContain(
      "bg-hairline",
    );
    expect(cls(document.querySelector('[data-slot="menubar-shortcut"]'))).toContain("font-mono");
  });
});
