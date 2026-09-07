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
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

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
