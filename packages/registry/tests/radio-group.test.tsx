import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

function Sizes(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup aria-label="Size" {...props}>
      <RadioGroupItem value="sm" aria-label="Small" />
      <RadioGroupItem value="md" aria-label="Medium" />
      <RadioGroupItem value="lg" aria-label="Large" />
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("renders a radiogroup with radio items, none selected by default", () => {
    render(<Sizes />);
    expect(screen.getByRole("radiogroup").getAttribute("data-slot")).toBe(
      "radio-group",
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
    for (const radio of radios) {
      expect(radio.getAttribute("aria-checked")).toBe("false");
    }
  });

  it("selects an item on click and unselects the previous one", async () => {
    const user = userEvent.setup();
    render(<Sizes />);
    const small = screen.getByRole("radio", { name: "Small" });
    const medium = screen.getByRole("radio", { name: "Medium" });
    await user.click(small);
    expect(small.getAttribute("aria-checked")).toBe("true");
    await user.click(medium);
    expect(medium.getAttribute("aria-checked")).toBe("true");
    expect(small.getAttribute("aria-checked")).toBe("false");
  });

  it("pre-selects the defaultValue item", () => {
    render(<Sizes defaultValue="md" />);
    expect(
      screen.getByRole("radio", { name: "Medium" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("calls onValueChange with the selected value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Sizes onValueChange={onValueChange} />);
    await user.click(screen.getByRole("radio", { name: "Large" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toBe("lg");
  });

  it("moves selection with arrow keys", async () => {
    const user = userEvent.setup();
    render(<Sizes defaultValue="sm" />);
    const small = screen.getByRole("radio", { name: "Small" });
    const medium = screen.getByRole("radio", { name: "Medium" });
    small.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(medium);
    expect(medium.getAttribute("aria-checked")).toBe("true");
    expect(small.getAttribute("aria-checked")).toBe("false");
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(small);
    expect(small.getAttribute("aria-checked")).toBe("true");
  });

  it("keeps the selected radio as the single tab stop (roving focus)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Sizes defaultValue="md" />
      </>,
    );
    screen.getByRole("button", { name: "Before" }).focus();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: "Medium" }),
    );
  });

  it("does not select a disabled item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Size" onValueChange={onValueChange}>
        <RadioGroupItem value="sm" aria-label="Small" />
        <RadioGroupItem value="md" aria-label="Medium" disabled />
      </RadioGroup>,
    );
    const medium = screen.getByRole("radio", { name: "Medium" });
    await user.click(medium);
    expect(medium.getAttribute("aria-checked")).toBe("false");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("respects a controlled value", async () => {
    const user = userEvent.setup();
    render(<Sizes value="sm" />);
    const small = screen.getByRole("radio", { name: "Small" });
    const large = screen.getByRole("radio", { name: "Large" });
    await user.click(large);
    // Controlled: without a state update the selection does not move.
    expect(small.getAttribute("aria-checked")).toBe("true");
    expect(large.getAttribute("aria-checked")).toBe("false");
  });
});
