import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

describe("Field", () => {
  it("associates label and control automatically", () => {
    render(
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).not.toBeNull();
  });

  it("links the description to the control via aria-describedby", () => {
    render(
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
        <FieldDescription>Order updates.</FieldDescription>
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    const description = screen.getByText("Order updates.");
    expect(description.id).not.toBe("");
    expect(input.getAttribute("aria-describedby") ?? "").toContain(
      description.id,
    );
  });

  it("sets data-orientation from the orientation variant", () => {
    render(<Field orientation="horizontal" data-testid="field-root" />);
    expect(
      screen.getByTestId("field-root").getAttribute("data-orientation"),
    ).toBe("horizontal");
  });
});

describe("FieldError", () => {
  it("renders external errors deduped by message", () => {
    render(
      <Field invalid>
        <FieldError
          errors={[{ message: "Too short." }, { message: "Too short." }]}
        />
      </Field>,
    );
    expect(screen.getAllByText("Too short.")).toHaveLength(1);
  });

  it("renders multiple distinct errors as a list", () => {
    render(
      <Field invalid>
        <FieldError
          errors={[{ message: "Too short." }, { message: "Needs a number." }]}
        />
      </Field>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders nothing for an empty errors array", () => {
    const { container } = render(
      <Field invalid>
        <FieldError errors={[]} />
      </Field>,
    );
    expect(container.querySelector('[data-slot="field-error"]')).toBeNull();
  });

  it("auto-renders the validate() message when bare", async () => {
    const user = userEvent.setup();
    render(
      <Field
        name="username"
        validationMode="onBlur"
        validate={(value) =>
          String(value ?? "").length >= 3 ? null : "Too short."
        }
      >
        <FieldLabel>Username</FieldLabel>
        <Input placeholder="x" />
        <FieldError />
      </Field>,
    );
    await user.click(screen.getByLabelText("Username"));
    await user.keyboard("ab");
    await user.tab();
    expect(await screen.findByText("Too short.")).toBeTruthy();
  });

  it("renders children when given", () => {
    render(
      <Field invalid>
        <FieldError>Custom message</FieldError>
      </Field>,
    );
    expect(screen.getByText("Custom message")).not.toBeNull();
  });
});
