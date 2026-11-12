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
  // The input group draws its focus ring from [data-slot=input-group-control].
  it("renders the input as the input group's control", () => {
    render(<FruitCombobox />);
    expect(getInput().getAttribute("data-slot")).toBe("input-group-control");
    expect(getInput().closest("[data-slot=input-group]")).not.toBeNull();
  });

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

  it("gives the input wrapper the bordered field, density height and halo focus ring", () => {
    render(<FruitCombobox />);
    const group = getInput().closest("[data-slot=input-group]") as HTMLElement;
    const classes = group.className.split(" ");
    for (const c of [
      "border",
      "border-input",
      "dark:bg-input/30",
      "has-[[data-slot=input-group-control]:focus-visible]:border-ring",
      "has-[[data-slot=input-group-control]:focus-visible]:ring-3",
      "has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
      "h-[var(--control-h,2.125rem)]",
    ]) {
      expect(classes).toContain(c);
    }
    expect(classes).not.toContain("border-0");
    expect(group.className).not.toContain("focus-ring");
    expect(group.className).not.toContain("surface-");
    expect(group.className).not.toContain("hairline");
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
      "data-highlighted:[&_.text-muted-foreground]:text-accent-foreground",
    );
    expect(item.className).not.toContain("**:text-foreground");
  });

  it("renders the popup as an overlay with a reduced-motion-safe entry", async () => {
    await openPopup();
    const popup = document.querySelector(
      "[data-slot=combobox-content]",
    ) as HTMLElement;
    expect(popup.className.split(" ")).toEqual(
      expect.arrayContaining(["bg-popover", "ring-1", "ring-foreground/10"]),
    );
    expect(popup.className).toContain("shadow-overlay");
    expect(popup.className).not.toContain("surface-");
    expect(popup.className).not.toContain("hairline");
    expect(popup.className).toContain("rounded-lg");
    expect(popup.className).toContain("data-starting-style:opacity-0");
    expect(popup.className).toContain("data-starting-style:scale-[0.98]");
    expect(popup.className).toContain("motion-reduce:transition-none");
    expect(popup.className).not.toContain("ring-3");
    expect(popup.className).not.toContain("zoom-in-95");
  });

  it("sizes items by --item-h, highlights with the accent and marks the selection in the item colour", async () => {
    await openPopup();
    const option = screen.getByRole("option", { name: "Cherry" });
    expect(option.className).toContain("min-h-[var(--item-h,2rem)]");
    expect(option.className).toContain("data-highlighted:bg-accent");
    expect(option.className).toContain("data-highlighted:text-accent-foreground");
    expect(option.className).not.toContain("surface-panel");
    expect(option.className).not.toContain("data-highlighted:shadow-");
    expect(option.className).toContain("data-disabled:data-highlighted:bg-transparent");
    const indicator = option.querySelector("svg")?.parentElement as HTMLElement;
    expect(indicator.className).not.toMatch(/text-(brand|primary)/);
  });

  it("gives chips the bordered field and a focus-within halo ring", () => {
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
    const chipsClasses = chips.className.split(" ");
    for (const c of [
      "border",
      "border-input",
      "dark:bg-input/30",
      "focus-within:border-ring",
      "focus-within:ring-3",
      "focus-within:ring-ring/50",
      "has-aria-invalid:border-destructive",
      "has-aria-invalid:ring-destructive/20",
      "min-h-[var(--control-h,2.125rem)]",
    ]) {
      expect(chipsClasses).toContain(c);
    }
    expect(chips.className).not.toContain("focus-ring");
    expect(chips.className).not.toContain("surface-");
    const chip = document.querySelector(
      "[data-slot=combobox-chip]",
    ) as HTMLElement;
    expect(chip.className.split(" ")).toContain("bg-muted");
    expect(chip.className).not.toContain("--elevation-highlight");
    expect(chip.className).not.toContain("hairline");
  });
});
