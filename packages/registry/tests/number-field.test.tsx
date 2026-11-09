import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/registry/base/ui/number-field";

function Quantity(props: React.ComponentProps<typeof NumberField>) {
  return (
    <NumberField {...props}>
      <NumberFieldGroup>
        <NumberFieldDecrement aria-label="Decrease" />
        <NumberFieldInput aria-label="Quantity" />
        <NumberFieldIncrement aria-label="Increase" />
      </NumberFieldGroup>
    </NumberField>
  );
}

function getInput() {
  return screen.getByLabelText("Quantity") as HTMLInputElement;
}

describe("NumberField", () => {
  it("renders the default value in the input", () => {
    render(<Quantity defaultValue={5} />);
    expect(getInput().value).toBe("5");
  });

  it("increments the value when the increment button is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Quantity defaultValue={5} onValueChange={onValueChange} />);
    await user.click(screen.getByLabelText("Increase"));
    expect(getInput().value).toBe("6");
    expect(onValueChange).toHaveBeenCalledWith(6, expect.anything());
  });

  it("decrements the value when the decrement button is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Quantity defaultValue={5} onValueChange={onValueChange} />);
    await user.click(screen.getByLabelText("Decrease"));
    expect(getInput().value).toBe("4");
    expect(onValueChange).toHaveBeenCalledWith(4, expect.anything());
  });

  it("steps the value with ArrowUp and ArrowDown", async () => {
    const user = userEvent.setup();
    render(<Quantity defaultValue={5} />);
    const input = getInput();
    await user.click(input);
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(input.value).toBe("7");
    await user.keyboard("{ArrowDown}");
    expect(input.value).toBe("6");
  });

  it("respects the step size", async () => {
    const user = userEvent.setup();
    render(<Quantity defaultValue={10} step={5} />);
    await user.click(screen.getByLabelText("Increase"));
    expect(getInput().value).toBe("15");
  });

  it("does not increment past max", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Quantity defaultValue={10} max={10} onValueChange={onValueChange} />);
    const increase = screen.getByLabelText("Increase") as HTMLButtonElement;
    expect(increase.disabled).toBe(true);
    expect(getInput().value).toBe("10");
    await user.click(getInput());
    await user.keyboard("{ArrowUp}");
    expect(getInput().value).toBe("10");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("does not decrement past min", async () => {
    const user = userEvent.setup();
    render(<Quantity defaultValue={0} min={0} />);
    const decrease = screen.getByLabelText("Decrease") as HTMLButtonElement;
    expect(decrease.disabled).toBe(true);
    await user.click(getInput());
    await user.keyboard("{ArrowDown}");
    expect(getInput().value).toBe("0");
  });

  it("clamps a typed value to the allowed range on blur", async () => {
    const user = userEvent.setup();
    render(<Quantity defaultValue={5} min={0} max={10} />);
    const input = getInput();
    await user.click(input);
    await user.clear(input);
    await user.keyboard("42");
    await user.tab();
    expect(input.value).toBe("10");
  });

  it("commits a typed number and reports it through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Quantity defaultValue={1} onValueChange={onValueChange} />);
    const input = getInput();
    await user.click(input);
    await user.clear(input);
    await user.keyboard("8");
    await user.tab();
    expect(input.value).toBe("8");
    expect(onValueChange).toHaveBeenLastCalledWith(8, expect.anything());
  });

  it("disables the input and steppers when disabled", () => {
    render(<Quantity defaultValue={5} disabled />);
    expect(getInput().disabled).toBe(true);
    expect(
      (screen.getByLabelText("Increase") as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByLabelText("Decrease") as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("renders a scrub area", () => {
    render(
      <NumberField defaultValue={5}>
        <NumberFieldScrubArea data-testid="scrub">
          Quantity
        </NumberFieldScrubArea>
        <NumberFieldGroup>
          <NumberFieldInput aria-label="Quantity" />
        </NumberFieldGroup>
      </NumberField>,
    );
    const scrub = screen.getByTestId("scrub");
    expect(scrub.textContent).toBe("Quantity");
  });
});

describe("NumberField v2 styles", () => {
  it("draws the group with bordered steppers, density height and tabular digits", () => {
    render(<Quantity defaultValue={5} />);
    const group = (getInput().parentElement as HTMLElement).className;
    const groupClasses = group.split(" ");
    for (const c of [
      "border",
      "border-input",
      "shadow-xs",
      "focus-within:ring-2",
      "focus-within:ring-ring/50",
      "motion-reduce:transition-none",
    ]) {
      expect(groupClasses).toContain(c);
    }
    expect(group).toContain("h-[var(--control-h,");
    expect(group).not.toContain("focus-ring");
    expect(group).not.toContain("surface-");
    expect(group).not.toContain("hairline");
    expect(group).not.toContain("--elevation-inset");
    expect(getInput().className).toContain("tabular-nums");
    expect(getInput().className).toContain("placeholder:text-muted-foreground");
    expect(getInput().className).not.toContain("placeholder:text-muted-foreground/");
    expect(getInput().className).toContain("--control-text");
    const increment = screen.getByLabelText("Increase").className.split(" ");
    for (const c of [
      "bg-muted/50",
      "hover:bg-muted",
      "border-l",
      "border-input",
      "w-[var(--control-h,2.125rem)]",
      "motion-reduce:transition-none",
    ]) {
      expect(increment).toContain(c);
    }
    expect(screen.getByLabelText("Decrease").className.split(" ")).toContain(
      "border-r",
    );
  });
});
