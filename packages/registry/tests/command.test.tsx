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
});
