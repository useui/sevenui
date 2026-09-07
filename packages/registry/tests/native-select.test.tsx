import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";

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
