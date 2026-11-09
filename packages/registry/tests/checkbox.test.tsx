import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { must } from "./helpers/must";

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

  describe("styles", () => {
    it("uses the ring-3 focus halo, not the offset focus ring", () => {
      render(<Checkbox />);
      const cls = screen.getByRole("checkbox").className;
      expect(cls).toContain("focus-visible:border-ring");
      expect(cls).toContain("focus-visible:ring-3");
      expect(cls).toContain("focus-visible:ring-ring/50");
      expect(cls).not.toMatch(/:focus-ring(\s|$)/);
      expect(cls).not.toContain("--focus-color");
      expect(cls).toContain("aria-invalid:ring-destructive/20");
    });

    it("sizes the box from the density scale with a 14px floor", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox").className).toContain(
        "size-[max(0.875rem,calc(var(--control-h,2.125rem)*0.47))]",
      );
    });

    it("draws a plain input border when off, with no inset surface or hairline", () => {
      render(<Checkbox />);
      const cls = screen.getByRole("checkbox").className;
      expect(cls.split(/\s+/)).toEqual(expect.arrayContaining(["border", "border-input"]));
      expect(cls).toContain("dark:bg-input/30");
      expect(cls).not.toMatch(/surface-|hairline|shadow-inset|elevation-inset/);
    });

    it("fills with primary when checked or indeterminate", () => {
      render(<Checkbox defaultChecked />);
      const cls = screen.getByRole("checkbox").className;
      expect(cls).toContain("data-checked:bg-primary");
      expect(cls).toContain("data-checked:text-primary-foreground");
      expect(cls).toContain("data-checked:border-primary");
      expect(cls).toContain("data-indeterminate:bg-primary");
      expect(cls).not.toContain("brand");
    });

    it("fades the check icon with a reduced-motion counterpart", () => {
      const { container } = render(<Checkbox defaultChecked />);
      const indicator = must(
        container.querySelector("[data-slot=checkbox-indicator]"),
      );
      expect(indicator.className).toContain("transition-opacity");
      expect(indicator.className).toContain("motion-reduce:transition-none");
    });
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
