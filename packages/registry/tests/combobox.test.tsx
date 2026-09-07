import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";

const fruits = ["Apple", "Banana", "Cherry", "Grape"];

function FruitCombobox({
  onValueChange = () => {},
  defaultValue = null as string | null,
}: {
  onValueChange?: (value: string | null) => void;
  defaultValue?: string | null;
}) {
  return (
    <Combobox items={fruits} defaultValue={defaultValue} onValueChange={onValueChange}>
      <ComboboxInput placeholder="Search fruit" />
      <ComboboxContent>
        <ComboboxEmpty>No fruit found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function getInput() {
  return screen.getByPlaceholderText("Search fruit") as HTMLInputElement;
}

describe("Combobox", () => {
  it("opens the popup and lists all options when typing begins", async () => {
    const user = userEvent.setup();
    render(<FruitCombobox />);
    await user.click(getInput());
    await user.keyboard("a");
    await screen.findByRole("listbox");
    // "a" matches Apple, Banana, Grape (substring match)
    expect(screen.getByRole("option", { name: "Apple" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Banana" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Grape" })).toBeTruthy();
  });

  it("filters options as the user types", async () => {
    const user = userEvent.setup();
    render(<FruitCombobox />);
    await user.click(getInput());
    await user.keyboard("cher");
    await screen.findByRole("listbox");
    expect(screen.getByRole("option", { name: "Cherry" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Apple" })).toBeNull();
    expect(screen.queryByRole("option", { name: "Banana" })).toBeNull();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<FruitCombobox />);
    await user.click(getInput());
    await user.keyboard("zzzz");
    await waitFor(() => {
      expect(screen.getByText("No fruit found.")).toBeTruthy();
    });
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("selects an option on click, setting the input value and firing onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FruitCombobox onValueChange={onValueChange} />);
    await user.click(getInput());
    await user.keyboard("ban");
    const option = await screen.findByRole("option", { name: "Banana" });
    await user.click(option);
    expect(onValueChange).toHaveBeenCalledWith("Banana", expect.anything());
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    expect(getInput().value).toBe("Banana");
  });

  it("supports keyboard navigation: arrow keys highlight, Enter selects", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FruitCombobox onValueChange={onValueChange} />);
    await user.click(getInput());
    await user.keyboard("a");
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}");
    const highlighted = document.querySelector("[data-highlighted]");
    expect(highlighted?.textContent).toContain("Apple");
    await user.keyboard("{ArrowDown}");
    expect(document.querySelector("[data-highlighted]")?.textContent).toContain("Banana");
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("Banana", expect.anything());
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    expect(getInput().value).toBe("Banana");
  });

  it("prefills the input from a default value", () => {
    render(<FruitCombobox defaultValue="Cherry" />);
    expect(getInput().value).toBe("Cherry");
  });

  it("marks the selected option with aria-selected when reopened", async () => {
    const user = userEvent.setup();
    render(<FruitCombobox defaultValue="Cherry" />);
    const input = getInput();
    await user.click(input);
    // ArrowDown opens the popup without editing the input, keeping the selection.
    await user.keyboard("{ArrowDown}");
    const option = await screen.findByRole("option", { name: "Cherry" });
    expect(option.getAttribute("aria-selected")).toBe("true");
    expect(
      screen.getByRole("option", { name: "Apple" }).getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("closes the popup on Escape", async () => {
    const user = userEvent.setup();
    render(<FruitCombobox />);
    await user.click(getInput());
    await user.keyboard("a");
    await screen.findByRole("listbox");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });
});
