import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

const fruits = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

function FruitSelect({
  onValueChange = () => {},
  defaultValue = null as string | null,
  disabledValue,
  name,
}: {
  onValueChange?: (value: string | null) => void;
  defaultValue?: string | null;
  disabledValue?: string;
  name?: string;
}) {
  return (
    <Select
      items={fruits}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
    >
      <SelectTrigger>
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          {fruits.map((fruit) => (
            <SelectItem
              key={fruit.value}
              value={fruit.value}
              disabled={fruit.value === disabledValue}
            >
              {fruit.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("shows the placeholder when no value is selected", () => {
    render(<FruitSelect />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("Pick a fruit");
    expect(trigger.hasAttribute("data-placeholder")).toBe(true);
  });

  it("opens the listbox on trigger click and lists all options", async () => {
    const user = userEvent.setup();
    render(<FruitSelect />);
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    expect(screen.getByRole("option", { name: "Apple" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Banana" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Cherry" })).toBeTruthy();
    expect(screen.getByText("Fruits")).toBeTruthy();
  });

  it("selects an option on click, updating trigger text and firing onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FruitSelect onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: "Banana" });
    await user.click(option);
    expect(onValueChange).toHaveBeenCalledWith("banana", expect.anything());
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("Banana");
    expect(trigger.hasAttribute("data-placeholder")).toBe(false);
  });

  it("supports keyboard selection with arrow keys and Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FruitSelect onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await screen.findByRole("listbox");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("apple", expect.anything());
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  it("marks the selected option and renders its label for a default value", async () => {
    const user = userEvent.setup();
    render(<FruitSelect defaultValue="cherry" />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("Cherry");
    await user.click(trigger);
    const selected = await screen.findByRole("option", { name: "Cherry" });
    expect(selected.getAttribute("aria-selected")).toBe("true");
    expect(
      screen.getByRole("option", { name: "Apple" }).getAttribute("aria-selected"),
    ).toBe("false");
  });

  it("renders a controlled value and updates when it changes", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<string | null>("apple");
      return (
        <div>
          <button onClick={() => setValue("cherry")}>Set cherry</button>
          <Select items={fruits} value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a fruit" />
            </SelectTrigger>
            <SelectContent>
              {fruits.map((fruit) => (
                <SelectItem key={fruit.value} value={fruit.value}>
                  {fruit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    const user = userEvent.setup();
    render(<Controlled />);
    expect(screen.getByRole("combobox").textContent).toContain("Apple");
    await user.click(screen.getByText("Set cherry"));
    await waitFor(() => {
      expect(screen.getByRole("combobox").textContent).toContain("Cherry");
    });
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FruitSelect onValueChange={onValueChange} disabledValue="banana" />);
    await user.click(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: "Banana" });
    expect(option.getAttribute("aria-disabled")).toBe("true");
    await user.click(option);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("renders a hidden input carrying the form name and selected value", async () => {
    const user = userEvent.setup();
    const { container } = render(<FruitSelect name="fruit" defaultValue="apple" />);
    const input = container.querySelector('input[name="fruit"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe("apple");
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Cherry" }));
    await waitFor(() => {
      expect((container.querySelector('input[name="fruit"]') as HTMLInputElement).value).toBe(
        "cherry",
      );
    });
  });

  it("closes on Escape without changing the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FruitSelect onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole("combobox").textContent).toContain("Pick a fruit");
  });
});
