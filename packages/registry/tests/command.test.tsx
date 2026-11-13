import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
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
import { expectFilteredOut } from "./helpers/flavour";

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

  // Base UI tells object items apart by identity, so two groups may each
  // hold an item labelled "Settings" without a string value or id.
  it("keeps object items apart when they share a label", async () => {
    const user = userEvent.setup();
    const onTeamA = vi.fn();
    const onTeamB = vi.fn();
    type Entry = { label: string; run: () => void };
    // Fresh objects on every render, as an inline literal gives.
    const teams = (): { value: string; items: Entry[] }[] => [
      { value: "Team A", items: [{ label: "Settings", run: onTeamA }] },
      { value: "Team B", items: [{ label: "Settings", run: onTeamB }] },
    ];
    const palette = () => (
      <Command items={teams()}>
        <CommandInput placeholder="Search" />
        <CommandList>
          {(team: ReturnType<typeof teams>[number]) => (
            <CommandGroup key={team.value} heading={team.value} items={team.items}>
              {(item: Entry) => (
                <CommandItem key={team.value} value={item} onClick={item.run}>
                  {item.label}
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    );
    const { rerender } = render(palette());
    rerender(palette());
    const options = screen.getAllByRole("option", { name: "Settings" });
    expect(options).toHaveLength(2);
    await user.click(options[1]);
    expect(onTeamB).toHaveBeenCalledTimes(1);
    expect(onTeamA).not.toHaveBeenCalled();
    await user.click(options[0]);
    expect(onTeamA).toHaveBeenCalledTimes(1);
  });

  // The filter gets the item, not its key, from the first render on, which
  // on the server is the only one (command-07 reads `item.label`).
  it("hands a custom filter the item during a server render", () => {
    const filter = vi.fn((item: Item, query: string) =>
      item.label.toLowerCase().includes(query.toLowerCase()),
    );
    const html = renderToString(
      <Command items={groups} filter={filter} defaultValue="cal">
        <CommandInput placeholder="Search" />
        <CommandList>
          {(group: Group) => (
            <CommandGroup key={group.value} heading={group.value} items={group.items}>
              {(item: Item) => (
                <CommandItem key={item.value} value={item}>
                  {item.label}
                </CommandItem>
              )}
            </CommandGroup>
          )}
        </CommandList>
      </Command>,
    );
    expect(html).toContain("Calendar");
    for (const [item] of filter.mock.calls) expect(typeof item).toBe("object");
  });

  it("filters items as the user types", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("cal");
    expect(screen.getByText("Calendar")).toBeTruthy();
    expect(screen.getByText("Calculator")).toBeTruthy();
    expectFilteredOut(screen.queryByText("Profile"));
    expectFilteredOut(screen.queryByText("Settings"));
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.click(screen.getByPlaceholderText("Type a command or search..."));
    await user.keyboard("zzzz");
    expect(screen.getByText("No results found.")).toBeTruthy();
    expectFilteredOut(screen.queryByText("Calendar"));
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

  // Base UI ignores a Promise from onClick; UI SDK would mark the command
  // busy and ignore presses until it settled.
  it("runs an item again while its onClick's Promise is pending", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn(() => new Promise<void>(() => {}));
    render(<Palette onSelect={onSelect} />);
    const item = screen.getByRole("option", { name: "Calendar" });
    await user.click(item);
    await user.click(item);
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(item.hasAttribute("aria-busy")).toBe(false);
    expect(item.getAttribute("aria-disabled")).not.toBe("true");
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

  it("renders the dialog content with the overlay shadow and no v2 surface", () => {
    render(
      <CommandDialog open>
        <Palette />
      </CommandDialog>,
    );
    const content = document.querySelector(
      "[data-slot=dialog-content]",
    ) as HTMLElement;
    expect(content.className).not.toContain("surface-");
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

  it("puts the palette on the popover with no root focus ring or hairline edge", () => {
    const { container } = render(<ShortcutPalette />);
    const root = container.querySelector("[data-slot=command]") as HTMLElement;
    expect(root.className).toContain("bg-popover");
    expect(root.className).not.toContain("surface-");
    expect(root.className).not.toContain("focus-ring");
    expect(root.className).not.toContain("hairline");
  });

  it("renders the search row as main's inset input sized from --control-h", () => {
    const { container } = render(<ShortcutPalette />);
    const wrapper = container.querySelector(
      "[data-slot=command-input-wrapper]",
    ) as HTMLElement;
    expect(wrapper.className).toContain("p-1");
    expect(wrapper.className).not.toContain("hairline");
    const group = wrapper.firstElementChild as HTMLElement;
    expect(group.className).toContain("bg-input/30");
    expect(group.className).toContain("h-[var(--control-h,2.125rem)]!");
    expect(group.className).not.toContain("ring-0!");
  });

  it("renders the placeholder in full-strength muted text", () => {
    render(<ShortcutPalette />);
    const input = screen.getByPlaceholderText("Type a command or search...");
    expect(input.className).toContain("placeholder:text-muted-foreground");
    expect(input.className).not.toContain("placeholder:text-muted-foreground/");
  });

  it("sizes items by --item-h and highlights them with the accent", () => {
    render(<ShortcutPalette />);
    const item = screen.getByText("Calendar").closest(
      "[data-slot=command-item]",
    ) as HTMLElement;
    expect(item.className).toContain("min-h-[var(--item-h,2rem)]");
    // padding small enough that a 20px keycap fits a compact 26px row
    expect(item.className).toContain("py-0.5");
    expect(item.className).toContain("data-highlighted:bg-accent");
    expect(item.className).toContain("data-highlighted:text-accent-foreground");
    expect(item.className).not.toContain("surface-panel");
    expect(item.className).not.toContain("data-highlighted:shadow-");
    expect(item.className).toContain("data-disabled:data-highlighted:bg-transparent");
    expect(item.className).not.toContain("hairline");
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

  it("styles shortcuts as mono key hints and the separator with the border colour", () => {
    const { container } = render(<ShortcutPalette />);
    const shortcut = container.querySelector(
      "[data-slot=command-shortcut]",
    ) as HTMLElement;
    expect(shortcut.className).not.toContain("surface-");
    expect(shortcut.className).not.toContain("hairline");
    expect(shortcut.className).toContain("font-mono");
    expect(shortcut.className).toContain("text-[10.5px]");
    const separator = container.querySelector(
      "[data-slot=command-separator]",
    ) as HTMLElement;
    expect(separator.className).toContain("bg-border");
  });
});
