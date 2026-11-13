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
import { byFlavour, isUiSdk, waitForPopupFocus } from "./helpers/flavour";
import { must } from "./helpers/must";

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
    await waitForPopupFocus(await screen.findByRole("listbox"));
    await user.keyboard("{ArrowDown}{Enter}");
    // Opening with a pointer highlights nothing in Base UI, so ArrowDown
    // reaches the first option; UI SDK highlights the first option on open,
    // so ArrowDown moves on to the second.
    expect(onValueChange).toHaveBeenCalledWith(
      byFlavour({ base: "apple", "ui-sdk": "banana" }),
      expect.anything(),
    );
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
          <button type="button" onClick={() => setValue("cherry")}>Set cherry</button>
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

  it("labels the trigger from grouped items", () => {
    render(
      <Select items={[{ label: "Fruits", items: fruits }]} defaultValue="banana">
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
      </Select>,
    );
    expect(screen.getByRole("combobox").textContent).toContain("Banana");
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

// alignItemWithTrigger (the default) lays the selected item, or the first
// item while nothing is selected, over the trigger. Base UI measures and
// positions it (data-align-trigger drives it); the flavour anchors UI SDK's
// content to where its top must go. jsdom has no layout, so the rects are
// stubbed; the placement was compared with Base UI's in Chrome (guide §8).
describe("Select alignItemWithTrigger", () => {
  // A caller's ref on the content reaches the popup, and the wrapper's own
  // measuring ref keeps working beside it.
  it.each([
    ["without a ref", false],
    ["with a caller ref on the content", true],
  ])("lays the first item over the trigger while nothing is selected (%s)", async (_, withRef) => {
    const user = userEvent.setup();
    const contentRef = React.createRef<HTMLDivElement>();
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const slot = this.getAttribute("data-slot");
      if (slot === "select-trigger") return new DOMRect(0, 300, 180, 34);
      if (slot === "select-content") return new DOMRect(0, 0, 180, 200);
      if (slot === "select-item") {
        const index = [...document.querySelectorAll("[data-slot=select-item]")].indexOf(this);
        return new DOMRect(0, 28 + 32 * index, 180, 32);
      }
      return original.call(this);
    };
    try {
      render(
        <Select items={fruits}>
          <SelectTrigger aria-label="Fruit">
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent ref={withRef ? contentRef : undefined}>
            {fruits.map((fruit) => (
              <SelectItem key={fruit.value} value={fruit.value}>
                {fruit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>,
      );
      await user.click(screen.getByRole("combobox", { name: "Fruit" }));
      const popup = must(document.querySelector<HTMLElement>("[data-slot=select-content]"));
      expect(popup.getAttribute("data-align-trigger")).toBe("true");
      if (withRef) expect(contentRef.current).toBe(popup);
      if (isUiSdk) {
        // trigger top 300 + (34 - item height, 0 in jsdom) / 2 - first item offset 28
        await waitFor(() => expect(popup.style.top).toBe("289px"));
      }
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });
});

describe("Select alignItemWithTrigger geometry", () => {
  // Base UI lines the item's text up with the value's text, and near the top
  // of the viewport keeps the popup 10px from the edge (scrolling its list by
  // the difference). Both compared with base in Chrome to the pixel.
  it("lines up the text and keeps 10px from the viewport top", async () => {
    const user = userEvent.setup();
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const slot = this.getAttribute("data-slot");
      if (slot === "select-trigger") return new DOMRect(32, 20, 180, 34);
      if (slot === "select-value") return new DOMRect(45, 28, 150, 18);
      if (slot === "select-content") return new DOMRect(0, 0, 180, 200);
      if (slot === "select-item") {
        const index = [...document.querySelectorAll("[data-slot=select-item]")].indexOf(this);
        return new DOMRect(4, 28 + 32 * index, 172, 32);
      }
      if (slot === "select-item-text") return new DOMRect(12, 0, 100, 18);
      return original.call(this);
    };
    try {
      render(
        <Select items={fruits}>
          <SelectTrigger aria-label="Fruit">
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            {fruits.map((fruit) => (
              <SelectItem key={fruit.value} value={fruit.value}>
                {fruit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>,
      );
      await user.click(screen.getByRole("combobox", { name: "Fruit" }));
      const popup = must(document.querySelector<HTMLElement>("[data-slot=select-content]"));
      expect(popup.getAttribute("data-align-trigger")).toBe("true");
      if (isUiSdk) {
        // trigger top 20 + 34 / 2 - first item offset 28 = 9, below the 10px margin
        await waitFor(() => expect(popup.style.top).toBe("10px"));
        // value text at 45, item text 12px into the popup
        expect(popup.style.left).toBe("33px");
      }
    } finally {
      Element.prototype.getBoundingClientRect = original;
    }
  });
});

describe("Select v2 styles", () => {
  it("renders a bordered trigger with the halo focus ring and control scale", () => {
    render(<FruitSelect />);
    const cls = screen.getByRole("combobox").className;
    const classes = cls.split(" ");
    for (const c of [
      "border",
      "border-input",
      "bg-transparent",
      "dark:bg-input/30",
      "dark:hover:bg-input/50",
      "focus-visible:border-ring",
      "focus-visible:ring-3",
      "focus-visible:ring-ring/50",
      "aria-invalid:border-destructive",
      "aria-invalid:ring-3",
      "aria-invalid:ring-destructive/20",
      "dark:aria-invalid:ring-destructive/40",
      "data-[size=default]:h-[var(--control-h,2.125rem)]",
      "data-[size=sm]:h-[calc(var(--control-h,2.125rem)-0.25rem)]",
    ]) {
      expect(classes).toContain(c);
    }
    expect(cls).not.toContain("focus-ring");
    expect(cls).not.toContain("surface-");
    expect(cls).not.toContain("hairline");
    expect(cls).not.toContain("--elevation-highlight");
  });

  it("renders the popup as an overlay surface with a reduced-motion counterpart", async () => {
    const user = userEvent.setup();
    render(<FruitSelect defaultValue="banana" />);
    await user.click(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    const popup = must(listbox.closest("[data-slot=select-content]"));
    const cls = popup.className;
    expect(cls.split(" ")).toEqual(
      expect.arrayContaining(["bg-popover", "ring-1", "ring-foreground/10"]),
    );
    expect(cls).toContain("shadow-overlay");
    expect(cls).not.toContain("surface-");
    expect(cls).toContain("rounded-lg");
    expect(cls).toContain("p-1");
    expect(cls).toContain("data-starting-style:opacity-0");
    expect(cls).toContain("data-starting-style:scale-[0.98]");
    expect(cls).toContain("motion-reduce:transition-none");
    // Base UI positioning classes stay.
    expect(cls).toContain("max-h-(--available-height)");
    expect(cls).toContain("origin-(--transform-origin)");
    if (isUiSdk) {
      // No Positioner: UI SDK positions the content itself, in the top layer.
      expect(popup.hasAttribute("popover")).toBe(true);
    } else {
      expect(must(popup.parentElement).className).toContain("isolate z-50");
    }
  });

  it("sizes items from --item-h, highlights with the accent and checks in the item colour", async () => {
    const user = userEvent.setup();
    render(<FruitSelect defaultValue="banana" />);
    await user.click(screen.getByRole("combobox"));
    const item = await screen.findByRole("option", { name: "Banana" });
    expect(item.className).toContain("min-h-[var(--item-h,2rem)]");
    expect(item.className).toContain("data-highlighted:bg-accent");
    expect(item.className).toContain("data-highlighted:text-accent-foreground");
    expect(item.className).not.toContain("surface-panel");
    expect(item.className).not.toContain("data-highlighted:shadow-");
    expect(item.className).toContain("data-disabled:data-highlighted:bg-transparent");
    // The highlight marks keyboard focus; the item draws no focus ring.
    expect(item.className).not.toContain("focus-ring");
    const check = must(item.querySelector("[data-slot=select-item-indicator]"));
    expect(check.className).not.toContain("brand");
    // Muted descendants lift to the foreground on the highlight (AA), the
    // check keeps the item colour.
    expect(item.className.split(" ")).toContain(
      "data-highlighted:[&_.text-muted-foreground]:text-accent-foreground",
    );
    expect(item.className).not.toContain("**:text-foreground");
  });

  it("ellipsizes a long trigger value and long item text instead of hard-clipping", async () => {
    const user = userEvent.setup();
    render(<FruitSelect defaultValue="banana" />);
    const trigger = screen.getByRole("combobox");
    // line-clamp loses to the flex display, which clips with no ellipsis.
    expect(trigger.className).not.toContain("line-clamp-1");
    expect(trigger.className).toContain("*:data-[slot=select-value]:min-w-0");
    expect(trigger.className).toContain("*:data-[slot=select-value]:truncate");
    // Plain-text values switch to block so text-overflow can apply; rich
    // values (icon plus label) stay flex.
    expect(trigger.className).toContain("*:data-[slot=select-value]:not-has-[*]:block");
    const value = trigger.querySelector("[data-slot=select-value]") as HTMLElement;
    for (const c of ["min-w-0", "truncate", "not-has-[*]:block"]) {
      expect(value.classList.contains(c)).toBe(true);
    }
    await user.click(trigger);
    const item = await screen.findByRole("option", { name: "Banana" });
    const text = item.firstElementChild as HTMLElement;
    for (const c of ["min-w-0", "truncate", "not-has-[*]:block"]) {
      expect(text.classList.contains(c)).toBe(true);
    }
    expect(text.classList.contains("shrink-0")).toBe(false);
  });
});
