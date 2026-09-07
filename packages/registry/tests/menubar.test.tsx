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
