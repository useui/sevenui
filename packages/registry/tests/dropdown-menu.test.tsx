import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

function BasicMenu({
  onProfile = () => {},
  onDisabled = () => {},
}: {
  onProfile?: () => void;
  onDisabled?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* GroupLabel must live inside a Group in Base UI 1.7 */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={onProfile}>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem disabled onClick={onDisabled}>
            API
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens the menu on trigger click and shows menu items", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    expect(screen.queryByRole("menu")).toBeNull();
    await user.click(screen.getByText("Open menu"));
    const menu = await screen.findByRole("menu");
    expect(menu).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Profile/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Billing" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Log out" })).toBeTruthy();
  });

  it("renders label and separator parts inside the menu", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByText("Open menu"));
    await screen.findByRole("menu");
    expect(screen.getByText("My Account")).toBeTruthy();
    expect(document.querySelector('[data-slot="dropdown-menu-separator"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="dropdown-menu-shortcut"]')?.textContent).toBe(
      "⇧⌘P",
    );
  });

  it("activates an item on click, firing onClick and closing the menu", async () => {
    const user = userEvent.setup();
    const onProfile = vi.fn();
    render(<BasicMenu onProfile={onProfile} />);
    await user.click(screen.getByText("Open menu"));
    const item = await screen.findByRole("menuitem", { name: /Profile/ });
    await user.click(item);
    expect(onProfile).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("highlights items with arrow keys and activates with Enter", async () => {
    const user = userEvent.setup();
    const onProfile = vi.fn();
    render(<BasicMenu onProfile={onProfile} />);
    await user.click(screen.getByText("Open menu"));
    await screen.findByRole("menu");
    await user.keyboard("{ArrowDown}");
    const highlighted = document.querySelector("[data-highlighted]");
    expect(highlighted?.textContent).toContain("Profile");
    await user.keyboard("{Enter}");
    expect(onProfile).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("does not activate a disabled item", async () => {
    const user = userEvent.setup();
    const onDisabled = vi.fn();
    render(<BasicMenu onDisabled={onDisabled} />);
    await user.click(screen.getByText("Open menu"));
    const item = await screen.findByRole("menuitem", { name: "API" });
    expect(item.getAttribute("aria-disabled")).toBe("true");
    await user.click(item);
    expect(onDisabled).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByText("Open menu"));
    await screen.findByRole("menu");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("toggles checkbox items and reflects aria-checked", async () => {
    const user = userEvent.setup();

    function CheckboxMenu() {
      const [checked, setChecked] = React.useState(false);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>View</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
              closeOnClick={false}
            >
              Status Bar
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    render(<CheckboxMenu />);
    await user.click(screen.getByText("View"));
    const item = await screen.findByRole("menuitemcheckbox", { name: "Status Bar" });
    expect(item.getAttribute("aria-checked")).toBe("false");
    await user.click(item);
    await waitFor(() => {
      expect(
        screen.getByRole("menuitemcheckbox", { name: "Status Bar" }).getAttribute("aria-checked"),
      ).toBe("true");
    });
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Status Bar" }));
    await waitFor(() => {
      expect(
        screen.getByRole("menuitemcheckbox", { name: "Status Bar" }).getAttribute("aria-checked"),
      ).toBe("false");
    });
  });

  it("selects a radio item within a radio group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    function RadioMenu() {
      const [value, setValue] = React.useState("bottom");
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>Panel</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={value}
              onValueChange={(next) => {
                setValue(next as string);
                onValueChange(next);
              }}
            >
              <DropdownMenuRadioItem value="top" closeOnClick={false}>
                Top
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bottom" closeOnClick={false}>
                Bottom
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    render(<RadioMenu />);
    await user.click(screen.getByText("Panel"));
    const bottom = await screen.findByRole("menuitemradio", { name: "Bottom" });
    expect(bottom.getAttribute("aria-checked")).toBe("true");
    const top = screen.getByRole("menuitemradio", { name: "Top" });
    expect(top.getAttribute("aria-checked")).toBe("false");
    await user.click(top);
    expect(onValueChange).toHaveBeenCalledWith("top");
    await waitFor(() => {
      expect(
        screen.getByRole("menuitemradio", { name: "Top" }).getAttribute("aria-checked"),
      ).toBe("true");
    });
  });
});
