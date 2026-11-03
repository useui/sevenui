import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { must } from "./helpers/must";

function Fruits(props: React.ComponentProps<typeof NativeSelect>) {
  return (
    <NativeSelect aria-label="Fruit" {...props}>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
      <NativeSelectOption value="cherry">Cherry</NativeSelectOption>
    </NativeSelect>
  );
}

describe("NativeSelect", () => {
  it("renders a native select with its options", () => {
    render(<Fruits />);
    const select = screen.getByLabelText("Fruit");
    expect(select.tagName).toBe("SELECT");
    expect(select.getAttribute("data-slot")).toBe("native-select");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(
      screen.getByRole("option", { name: "Banana" }).getAttribute("value"),
    ).toBe("banana");
  });

  it("selects the default value", () => {
    render(<Fruits defaultValue="banana" />);
    const select = screen.getByLabelText("Fruit") as HTMLSelectElement;
    expect(select.value).toBe("banana");
    expect(
      (screen.getByRole("option", { name: "Banana" }) as HTMLOptionElement)
        .selected,
    ).toBe(true);
  });

  it("updates the value and fires onChange when the user selects an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Fruits defaultValue="apple" onChange={onChange} />);
    const select = screen.getByLabelText("Fruit") as HTMLSelectElement;
    await user.selectOptions(select, "cherry");
    expect(select.value).toBe("cherry");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("cannot be changed when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Fruits defaultValue="apple" disabled onChange={onChange} />);
    const select = screen.getByLabelText("Fruit") as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    await user.selectOptions(select, "cherry");
    expect(select.value).toBe("apple");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("stamps the size on the wrapper and the select", () => {
    const { container } = render(<Fruits size="sm" />);
    const wrapper = container.querySelector(
      '[data-slot="native-select-wrapper"]',
    )!;
    expect(wrapper.getAttribute("data-size")).toBe("sm");
    expect(screen.getByLabelText("Fruit").getAttribute("data-size")).toBe("sm");
  });

  it("defaults the size to default", () => {
    render(<Fruits />);
    expect(screen.getByLabelText("Fruit").getAttribute("data-size")).toBe(
      "default",
    );
  });

  it("renders a decorative chevron icon", () => {
    const { container } = render(<Fruits />);
    const icon = container.querySelector('[data-slot="native-select-icon"]')!;
    expect(icon).not.toBeNull();
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  });

  it("groups options with NativeSelectOptGroup", () => {
    render(
      <NativeSelect aria-label="Food">
        <NativeSelectOptGroup label="Fruits">
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Vegetables">
          <NativeSelectOption value="carrot">Carrot</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>,
    );
    expect(screen.getAllByRole("group")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Fruits" })).not.toBeNull();
  });
});

describe("NativeSelect v2 styles", () => {
  it("uses the offset focus ring, never the old halo", () => {
    render(<Fruits />);
    const cls = screen.getByLabelText("Fruit").className;
    expect(cls).toContain("focus-visible:focus-ring");
    expect(cls).not.toContain("ring-3");
    expect(cls).not.toContain("ring-ring");
    expect(cls).not.toContain("focus-visible:border-ring");
  });

  it("reads its height, padding and text size from the control scale", () => {
    render(<Fruits />);
    const cls = screen.getByLabelText("Fruit").className;
    expect(cls).toContain("h-[var(--control-h,2.125rem)]");
    expect(cls).toContain("pl-[var(--control-px,0.75rem)]");
    expect(cls).toContain("text-[length:var(--control-text,0.8125rem)]");
    expect(cls).toContain(
      "data-[size=sm]:h-[calc(var(--control-h,2.125rem)-0.25rem)]",
    );
  });

  it("sits on the inset field surface", () => {
    render(<Fruits />);
    const cls = screen.getByLabelText("Fruit").className;
    expect(cls).toContain("bg-surface-inset");
    // The edge is a real border so consumer border-* classes merge against it.
    expect(cls.split(" ")).toEqual(expect.arrayContaining(["border", "border-hairline-strong"]));
    expect(cls).not.toContain("0_0_0_1px_var(--hairline");
    expect(cls).not.toContain("bg-transparent");
  });

  it("keeps the chevron muted", () => {
    const { container } = render(<Fruits />);
    const icon = must(container.querySelector("[data-slot=native-select-icon]"));
    expect(icon.getAttribute("class")).toContain("text-muted-foreground");
  });
});
