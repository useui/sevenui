import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/base/ui/command";

type Item = { value: string; label: string };
type Group = { value: string; items: Item[] };

const groups: Group[] = [
  {
    value: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar" },
      { value: "search-emoji", label: "Search Emoji" },
      { value: "calculator", label: "Calculator" },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "profile", label: "Profile" },
      { value: "billing", label: "Billing" },
    ],
  },
];

function Palette({ onSelect = () => {} }: { onSelect?: (value: string) => void }) {
  return (
    <Command items={groups}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        {(group: Group) => (
          <CommandGroup key={group.value} heading={group.value} items={group.items}>
            {(item: Item) => (
              <CommandItem
                key={item.value}
                value={item}
                onClick={() => onSelect(item.value)}
              >
                {item.label}
              </CommandItem>
            )}
          </CommandGroup>
        )}
      </CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
    </Command>
  );
}

describe("Command", () => {
  it("renders all items and group headings initially", () => {
    render(<Palette />);
    expect(screen.getByText("Calendar")).toBeTruthy();
    expect(screen.getByText("Billing")).toBeTruthy();
    expect(screen.getByText("Suggestions")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("filters items as the user types", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("cal");
    expect(screen.getByText("Calendar")).toBeTruthy();
    expect(screen.getByText("Calculator")).toBeTruthy();
    expect(screen.queryByText("Profile")).toBeNull();
    expect(screen.queryByText("Settings")).toBeNull();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("zzzz");
    expect(screen.getByText("No results found.")).toBeTruthy();
    expect(screen.queryByText("Calendar")).toBeNull();
  });

  it("activates the highlighted item with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("cal");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("calendar");
  });

  it("moves the highlight with arrow keys before activating", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("cal");
    await user.keyboard("{ArrowDown}");
    const highlighted = document.querySelector("[data-highlighted]");
    expect(highlighted?.textContent).toBe("Calculator");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("calculator");
  });
});

describe("CommandDialog", () => {
  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <CommandDialog open onOpenChange={onOpenChange}>
        <Palette />
      </CommandDialog>,
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls[0][0]).toBe(false);
  });

  it("renders the dialog content on the tray surface", () => {
    render(
      <CommandDialog open>
        <Palette />
      </CommandDialog>,
    );
    const content = document.querySelector(
      "[data-slot=dialog-content]",
    ) as HTMLElement;
    expect(content.className).toContain("bg-surface-tray");
    expect(content.className).toContain("shadow-overlay");
  });
});

describe("Command v2 styles", () => {
  function ShortcutPalette() {
    return (
      <Command items={groups}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          {(group: Group) => (
            <CommandGroup key={group.value} heading={group.value} items={group.items}>
              {(item: Item) => (
                <CommandItem key={item.value} value={item}>
                  {item.label}
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
        <CommandSeparator />
      </Command>
    );
  }

  it("puts the palette on the tray surface with a focus ring while its input has focus", () => {
    const { container } = render(<ShortcutPalette />);
    const root = container.querySelector("[data-slot=command]") as HTMLElement;
    expect(root.className).toContain("bg-surface-tray");
    expect(root.className).toContain(
      "[&:not([data-slot=dialog-content]_*):has([data-slot=command-input]:focus-visible)]:focus-ring",
    );
    expect(root.className).not.toContain("ring-3");
  });

  it("separates the search row with a bottom hairline", () => {
    const { container } = render(<ShortcutPalette />);
    const wrapper = container.querySelector(
      "[data-slot=command-input-wrapper]",
    ) as HTMLElement;
    expect(wrapper.className).toContain("border-b");
    expect(wrapper.className).toContain("border-hairline");
  });

  it("sizes items by --item-h and highlights them with the hairline", () => {
    render(<ShortcutPalette />);
    const item = screen.getByText("Calendar").closest(
      "[data-slot=command-item]",
    ) as HTMLElement;
    expect(item.className).toContain("min-h-[var(--item-h,2rem)]");
    // padding small enough that a 20px keycap fits a compact 26px row
    expect(item.className).toContain("py-0.5");
    expect(item.className).toContain("data-highlighted:bg-hairline");
    expect(item.className).toContain("data-highlighted:text-foreground");
    expect(item.className).not.toContain("surface-panel");
    expect(item.className).not.toContain("data-highlighted:shadow-");
    expect(item.className).toContain("data-disabled:data-highlighted:bg-transparent");
    expect(item.className).not.toContain("data-highlighted:bg-muted");
  });

  it("renders group headings as mono 11px uppercase labels", () => {
    render(<ShortcutPalette />);
    const heading = screen.getByText("Suggestions");
    for (const cls of [
      "font-mono",
      "text-[11px]",
      "uppercase",
      "tracking-wide",
      "text-muted-foreground",
    ]) {
      expect(heading.className).toContain(cls);
    }
    // full-strength muted text: /80 drops below 4.5:1 on the light tray
    expect(heading.className).not.toContain("text-muted-foreground/");
  });

  it("styles shortcuts as keycaps and the separator as a hairline", () => {
    const { container } = render(<ShortcutPalette />);
    const shortcut = container.querySelector(
      "[data-slot=command-shortcut]",
    ) as HTMLElement;
    expect(shortcut.className).toContain("bg-surface-raised");
    expect(shortcut.className).toContain(
      "shadow-[inset_0_0_0_1px_var(--hairline),inset_0_-1px_0_var(--hairline-strong)]",
    );
    expect(shortcut.className).toContain("font-mono");
    expect(shortcut.className).toContain("text-[10.5px]");
    const separator = container.querySelector(
      "[data-slot=command-separator]",
    ) as HTMLElement;
    expect(separator.className).toContain("bg-hairline");
  });
});
