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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { AA, contrastOn, destructivePull, destructiveTint, mix, palette } from "./helpers/palette";

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

  // An async handler (item-12's copy link) must not hold the menu open: Base
  // UI ignores the returned Promise, where UI SDK would mark the item busy.
  it("closes at once when an item's onClick returns a pending Promise", async () => {
    const user = userEvent.setup();
    const onProfile = vi.fn(() => new Promise<void>(() => {}));
    render(<BasicMenu onProfile={onProfile} />);
    await user.click(screen.getByText("Open menu"));
    const item = await screen.findByRole("menuitem", { name: /Profile/ });
    await user.click(item);
    expect(onProfile).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(item.hasAttribute("aria-busy")).toBe(false);
    expect(item.hasAttribute("data-pending")).toBe(false);
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

// Base UI's finalFocus forms: a boolean, a ref, or a function returning an
// element, true (the default) or false (leave focus). sidebar-04 relies on
// the function form.
describe("DropdownMenu finalFocus", () => {
  function FocusMenu({
    finalFocus,
  }: {
    finalFocus?: React.ComponentProps<typeof DropdownMenuContent>["finalFocus"];
  }) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
          <DropdownMenuContent finalFocus={finalFocus}>
            <DropdownMenuItem>Rename</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button type="button" id="elsewhere">
          Elsewhere
        </button>
      </>
    );
  }

  async function closeWithEscape(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByText("Open menu"));
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    // Let a deferred focus return settle before reading it.
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const trigger = () => screen.getByText("Open menu").closest("button");
  const elsewhere = () => document.getElementById("elsewhere");

  it("returns focus to the trigger by default and for true", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<FocusMenu />);
    await closeWithEscape(user);
    expect(document.activeElement).toBe(trigger());
    unmount();
    render(<FocusMenu finalFocus={() => true} />);
    await closeWithEscape(user);
    expect(document.activeElement).toBe(trigger());
  });

  it("leaves focus alone for false", async () => {
    const user = userEvent.setup();
    render(<FocusMenu finalFocus={false} />);
    await closeWithEscape(user);
    expect(document.activeElement).not.toBe(trigger());
  });

  // UI SDK's getter cannot say "leave focus", so the flavour cannot drop focus
  // as Base UI does when it is still inside the closing menu; what examples
  // need is that the field their action mounts keeps it (sidebar-04).
  it("lets a field mounted by the action keep focus for a function returning false", async () => {
    function RenameMenu() {
      const [renaming, setRenaming] = React.useState(false);
      const renamingRef = React.useRef(false);
      renamingRef.current = renaming;
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
            <DropdownMenuContent finalFocus={() => !renamingRef.current}>
              <DropdownMenuItem onClick={() => setRenaming(true)}>Rename</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* biome-ignore lint/a11y/noAutofocus: the rename field takes focus as sidebar-04's does. */}
          {renaming && <input aria-label="Name" autoFocus />}
        </>
      );
    }
    const user = userEvent.setup();
    render(<RenameMenu />);
    await user.click(screen.getByText("Open menu"));
    await user.click(await screen.findByRole("menuitem", { name: "Rename" }));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.activeElement).toBe(screen.getByLabelText("Name"));
  });

  it("moves focus to a ref or to the element a function returns", async () => {
    const user = userEvent.setup();
    const ref = { current: null as HTMLElement | null };
    const { unmount } = render(<FocusMenu finalFocus={ref} />);
    ref.current = elsewhere();
    await closeWithEscape(user);
    expect(document.activeElement).toBe(elsewhere());
    unmount();
    render(<FocusMenu finalFocus={() => elsewhere()} />);
    await closeWithEscape(user);
    expect(document.activeElement).toBe(elsewhere());
  });
});

describe("DropdownMenu submenus", () => {
  it("opens a submenu with ArrowRight, marks its trigger and runs its items", async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>One</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={onInvite}>Invite</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText("Open"));
    await screen.findByRole("menu");
    expect(screen.getByText("Open").hasAttribute("data-popup-open")).toBe(true);
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowRight}");
    const invite = await screen.findByText("Invite");
    await waitFor(() => {
      expect(invite.closest("[data-slot=dropdown-menu-sub-content]")).toBeTruthy();
    });
    const subTrigger = screen.getByText("More").closest("[data-slot=dropdown-menu-sub-trigger]");
    expect(subTrigger?.hasAttribute("data-popup-open")).toBe(true);
    await waitFor(() => expect(document.activeElement?.textContent).toBe("Invite"));
    await user.keyboard("{Enter}");
    expect(onInvite).toHaveBeenCalledTimes(1);
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

  it.each(["light", "dark"] as const)("keeps destructive item text at AA at rest and highlighted in %s", async (mode) => {
    render(<StyledMenu />);
    await screen.findByRole("menu");
    const classes =
      document.querySelector(`[data-slot="dropdown-menu-item"][data-variant="destructive"]`)?.className ?? "";
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
    await screen.findByRole("menu");
    // Muted descendants follow the row to accent-foreground on the highlight.
    expect(slot("dropdown-menu-shortcut").split(" ")).toContain(
      "group-data-highlighted/dropdown-menu-item:text-accent-foreground",
    );
    expect(slot("dropdown-menu-item").split(" ")).toContain(
      "not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground",
    );
    for (const row of ["dropdown-menu-checkbox-item", "dropdown-menu-radio-item"]) {
      // Only muted text, so the check indicator keeps the item colour.
      expect(slot(row).split(" ")).toContain(
        "data-highlighted:[&_.text-muted-foreground]:text-accent-foreground",
      );
      expect(slot(row)).not.toContain("**:text-foreground");
    }
  });

  it("renders the popup on the popover with a ring edge, the overlay shadow and a reduced-motion fallback", async () => {
    render(<StyledMenu />);
    await screen.findByRole("menu");
    const popup = slot("dropdown-menu-content");
    expect(popup).toContain("bg-popover");
    expect(popup).toContain("ring-1 ring-foreground/10");
    expect(popup).toContain("shadow-overlay");
    expect(popup).not.toContain("surface-");
    expect(popup).not.toContain("hairline");
    expect(popup).toContain("p-1");
    expect(popup).toContain("data-starting-style:opacity-0");
    expect(popup).toContain("data-starting-style:scale-[0.98]");
    expect(popup).toContain("motion-reduce:transition-none");
    expect(popup).not.toContain("ring-3");
  });

  it("sizes items from --item-h, highlights with the accent and hides the outline like main", async () => {
    render(<StyledMenu />);
    await screen.findByRole("menu");
    for (const name of [
      "dropdown-menu-item",
      "dropdown-menu-checkbox-item",
      "dropdown-menu-radio-item",
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
      if (name === "dropdown-menu-item") {
        // The destructive highlight outranks the generic guard, so it needs its own.
        expect(cls).toContain(
          "data-[variant=destructive]:data-disabled:data-highlighted:bg-transparent",
        );
      }
      expect(cls).not.toContain("ring-3");
    }
  });

  it("uses neutral indicators, mono shortcuts, border separators and destructive text", async () => {
    render(<StyledMenu />);
    await screen.findByRole("menu");
    expect(slot("dropdown-menu-checkbox-item-indicator")).not.toContain("brand");
    expect(slot("dropdown-menu-radio-item-indicator")).not.toContain("brand");
    expect(slot("dropdown-menu-shortcut")).toContain("font-mono");
    expect(slot("dropdown-menu-shortcut")).toContain("text-muted-foreground");
    expect(slot("dropdown-menu-separator")).toContain("bg-border");
    const destructive = document.querySelector('[data-variant="destructive"]');
    expect(destructive?.getAttribute("class")).toContain(
      "data-[variant=destructive]:text-[color:color-mix(in_oklch,var(--foreground)_10%,var(--destructive))]",
    );
  });
});

// --- Contrast -------------------------------------------------------------
// A highlighted row is the shadcn accent fill with accent-foreground text, and
// muted descendants are lifted to accent-foreground on it.

describe("Highlighted menu row contrast (AA)", () => {
  it.each(["light", "dark"] as const)("accent-foreground passes on the accent highlight in %s", (mode) => {
    const p = palette(mode);
    const ratio = contrastOn(p.accentForeground, p.accent);
    expect(ratio, `${mode} ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(AA);
  });
});
