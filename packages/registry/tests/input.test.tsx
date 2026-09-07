import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

describe("Input", () => {
  it("renders an input with the data-slot attribute and placeholder", () => {
    render(<Input placeholder="Email address" />);
    const input = screen.getByPlaceholderText("Email address");
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("data-slot")).toBe("input");
  });

  it("passes the type through", () => {
    render(<Input type="password" placeholder="Password" />);
    expect(
      screen.getByPlaceholderText("Password").getAttribute("type"),
    ).toBe("password");
  });

  it("updates its value and fires onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input placeholder="Name" onChange={onChange} />);
    const input = screen.getByPlaceholderText("Name") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("Ada");
    expect(input.value).toBe("Ada");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("does not accept input when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input placeholder="Name" disabled onChange={onChange} />);
    const input = screen.getByPlaceholderText("Name") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    await user.type(input, "Ada", { skipClick: true });
    expect(input.value).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is labelled automatically inside a Field", () => {
    render(
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).not.toBeNull();
  });

  it("receives aria-invalid inside an invalid Field", () => {
    render(
      <Field name="email" invalid>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
      </Field>,
    );
    expect(
      screen.getByLabelText("Email").getAttribute("aria-invalid"),
    ).toBe("true");
  });
});
