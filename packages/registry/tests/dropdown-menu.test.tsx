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

describe("DropdownMenu v2 styles", () => {
  function StyledMenu() {
    return (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Status Bar</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="top">
            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  const slot = (name: string) =>
    document.querySelector(`[data-slot="${name}"]`)?.getAttribute("class") ?? "";

  it("renders the popup as a raised overlay with a reduced-motion fallback", async () => {
    render(<StyledMenu />);
    await screen.findByRole("menu");
    const popup = slot("dropdown-menu-content");
    expect(popup).toContain("bg-surface-raised");
    expect(popup).toContain("shadow-overlay");
    expect(popup).toContain("p-1");
    expect(popup).toContain("data-starting-style:opacity-0");
    expect(popup).toContain("data-starting-style:scale-[0.98]");
    expect(popup).toContain("motion-reduce:transition-none");
    expect(popup).not.toContain("ring-3");
  });

  it("sizes items from --item-h, highlights with the hairline and carries the focus ring except when disabled", async () => {
    render(<StyledMenu />);
    await screen.findByRole("menu");
    for (const name of [
      "dropdown-menu-item",
      "dropdown-menu-checkbox-item",
      "dropdown-menu-radio-item",
    ]) {
      const cls = slot(name);
      expect(cls).toContain("min-h-[var(--item-h,2rem)]");
      expect(cls).toContain("data-highlighted:bg-hairline");
      expect(cls).toContain("data-highlighted:text-foreground");
      expect(cls).not.toContain("surface-panel");
      expect(cls).not.toContain("data-highlighted:shadow-");
      expect(cls).toContain("data-disabled:data-highlighted:bg-transparent");
      expect(cls).toContain("focus-visible:focus-ring");
      // Disabled rows keep the inset keyboard focus ring.
      expect(cls).not.toContain("data-disabled:focus-visible:outline-none");
      if (name === "dropdown-menu-item") {
        // The destructive highlight outranks the generic guard, so it needs its own.
        expect(cls).toContain(
          "data-[variant=destructive]:data-disabled:data-highlighted:bg-transparent",
        );
      }
      expect(cls).not.toContain("ring-3");
      expect(cls).not.toContain("bg-accent");
    }
  });

  it("uses brand indicators, mono shortcuts, hairline separators and destructive text", async () => {
    render(<StyledMenu />);
    await screen.findByRole("menu");
    expect(slot("dropdown-menu-checkbox-item-indicator")).toContain("text-brand");
    expect(slot("dropdown-menu-radio-item-indicator")).toContain("text-brand");
    expect(slot("dropdown-menu-shortcut")).toContain("font-mono");
    expect(slot("dropdown-menu-shortcut")).toContain("text-muted-foreground");
    expect(slot("dropdown-menu-separator")).toContain("bg-hairline");
    const destructive = document.querySelector('[data-variant="destructive"]');
    expect(destructive?.getAttribute("class")).toContain(
      "data-[variant=destructive]:text-destructive",
    );
  });
});
