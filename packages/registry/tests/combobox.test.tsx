import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
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

describe("Combobox v2 styles", () => {
  async function openPopup() {
    const user = userEvent.setup();
    render(<FruitCombobox defaultValue="Cherry" />);
    await user.click(getInput());
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
  }

  it("gives the input wrapper the inset field surface, density height and offset focus ring", () => {
    render(<FruitCombobox />);
    const group = getInput().closest("[data-slot=input-group]") as HTMLElement;
    expect(group.className).toContain("bg-surface-inset");
    expect(group.className).toContain(
      "shadow-[inset_0_0_0_1px_var(--hairline-strong),var(--elevation-inset)]",
    );
    expect(group.className).toContain("h-[var(--control-h,2.125rem)]");
    expect(group.className).toContain(
      "has-[[data-slot=input-group-control]:focus-visible]:focus-ring",
    );
    expect(group.className).not.toContain("ring-3");
    // InputGroup carries no halo or dark fill any more, so no shims displace them.
    expect(group.className).not.toContain("ring-0");
    expect(group.className).not.toContain("dark:bg-surface-inset");
  });

  it("keeps the className on the input-group root", () => {
    render(
      <Combobox items={fruits}>
        <ComboboxInput placeholder="Search fruit" className="w-64" />
      </Combobox>,
    );
    const group = getInput().closest("[data-slot=input-group]") as HTMLElement;
    expect(group.className).toContain("w-64");
  });

  it("lifts muted descendants of a highlighted item to the foreground", async () => {
    await openPopup();
    const item = document.querySelector("[data-slot=combobox-item]") as HTMLElement;
    expect(item.className.split(" ")).toContain(
      "data-highlighted:[&_.text-muted-foreground]:text-foreground",
    );
    expect(item.className).not.toContain("**:text-foreground");
  });

  it("renders the popup as a raised overlay with a reduced-motion-safe entry", async () => {
    await openPopup();
    const popup = document.querySelector(
      "[data-slot=combobox-content]",
    ) as HTMLElement;
    expect(popup.className).toContain("bg-surface-raised");
    expect(popup.className).toContain("shadow-overlay");
    expect(popup.className).toContain("rounded-lg");
    expect(popup.className).toContain("data-starting-style:opacity-0");
    expect(popup.className).toContain("data-starting-style:scale-[0.98]");
    expect(popup.className).toContain("motion-reduce:transition-none");
    expect(popup.className).not.toContain("ring-3");
    expect(popup.className).not.toContain("zoom-in-95");
  });

  it("sizes items by --item-h, highlights with the hairline and marks the selection in brand", async () => {
    await openPopup();
    const option = screen.getByRole("option", { name: "Cherry" });
    expect(option.className).toContain("min-h-[var(--item-h,2rem)]");
    expect(option.className).toContain("data-highlighted:bg-hairline");
    expect(option.className).toContain("data-highlighted:text-foreground");
    expect(option.className).not.toContain("surface-panel");
    expect(option.className).not.toContain("data-highlighted:shadow-");
    expect(option.className).toContain("data-disabled:data-highlighted:bg-transparent");
    expect(option.className).not.toContain("bg-accent");
    const indicator = option.querySelector("svg")?.parentElement as HTMLElement;
    expect(indicator.className).toContain("text-brand");
  });

  it("gives chips the inset field surface and a focus-within ring", () => {
    function Chips() {
      const anchor = useComboboxAnchor();
      return (
        <Combobox items={fruits} multiple defaultValue={["Apple"]}>
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(values: string[]) =>
                values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput placeholder="Add fruit" />
          </ComboboxChips>
        </Combobox>
      );
    }
    render(<Chips />);
    const chips = document.querySelector(
      "[data-slot=combobox-chips]",
    ) as HTMLElement;
    expect(chips.className).toContain("bg-surface-inset");
    expect(chips.className).toContain("focus-within:focus-ring");
    expect(chips.className).toContain("min-h-[var(--control-h,2.125rem)]");
    expect(chips.className).not.toContain("ring-3");
    const chip = document.querySelector(
      "[data-slot=combobox-chip]",
    ) as HTMLElement;
    expect(chip.className).toContain("bg-surface-raised");
  });
});
