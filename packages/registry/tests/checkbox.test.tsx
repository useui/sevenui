import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";

describe("Checkbox", () => {
  it("renders an unchecked checkbox role by default", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(checkbox.getAttribute("data-slot")).toBe("checkbox");
  });

  it("toggles aria-checked on click (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    await user.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("starts checked with defaultChecked", () => {
    render(<Checkbox defaultChecked />);
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "true",
    );
  });

  it("stays at the controlled value and reports changes via onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange.mock.calls[0][0]).toBe(true);
    // Controlled: without a state update the checkbox remains unchecked.
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("updates when the controlled value changes", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = React.useState(false);
      return <Checkbox checked={checked} onCheckedChange={setChecked} />;
    }
    render(<Controlled />);
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
  });

  it("exposes the indeterminate state as aria-checked=mixed", () => {
    render(<Checkbox indeterminate />);
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "mixed",
    );
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox disabled onCheckedChange={onCheckedChange} />);
    const checkbox = screen.getByRole("checkbox");
    // Base UI renders the disabled state via aria-disabled/data-disabled,
    // not the native disabled attribute, on the checkbox button.
    expect(checkbox.getAttribute("data-disabled")).not.toBeNull();
    await user.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("renders a hidden input carrying name and value for form submission", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Checkbox name="terms" value="accepted" defaultChecked />
      </form>,
    );
    const input = container.querySelector<HTMLInputElement>(
      "input[name='terms']",
    );
    expect(input).not.toBeNull();
    expect(input!.value).toBe("accepted");
    expect(input!.checked).toBe(true);
    // Unchecking syncs the hidden input.
    await user.click(screen.getByRole("checkbox"));
    expect(input!.checked).toBe(false);
  });

  it("is labeled automatically inside a Field with FieldLabel", async () => {
    const user = userEvent.setup();
    render(
      <Field name="terms">
        <FieldLabel>Accept terms</FieldLabel>
        <Checkbox />
      </Field>,
    );
    // The label is associated with both the checkbox button and its hidden
    // input, so query by role.
    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    await user.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
  });
});
