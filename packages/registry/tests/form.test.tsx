import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Field, FieldError, FieldLabel } from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";

describe("Form", () => {
  it("passes the values of named fields to onFormSubmit", async () => {
    const user = userEvent.setup();
    const onFormSubmit = vi.fn();
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
        </Field>
        <Field name="username">
          <FieldLabel>Username</FieldLabel>
          <Input />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Username"), "ada");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onFormSubmit).toHaveBeenCalledTimes(1);
    expect(onFormSubmit.mock.calls[0][0]).toEqual({
      email: "ada@example.com",
      username: "ada",
    });
  });

  it("flows external errors into a nested bare FieldError", () => {
    render(
      <Form errors={{ email: "Email is already taken." }}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
          <FieldError />
        </Field>
      </Form>,
    );
    expect(screen.getByText("Email is already taken.")).toBeTruthy();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("clears an external error once the field value changes", async () => {
    const user = userEvent.setup();
    render(
      <Form errors={{ email: "Email is already taken." }}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
          <FieldError />
        </Field>
      </Form>,
    );
    expect(screen.getByText("Email is already taken.")).toBeTruthy();
    await user.type(screen.getByLabelText("Email"), "other@example.com");
    expect(screen.queryByText("Email is already taken.")).toBeNull();
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).not.toBe(
      "true",
    );
  });

  it("only marks the field named by the errors prop as invalid", () => {
    render(
      <Form errors={{ email: "Email is already taken." }}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input />
          <FieldError />
        </Field>
        <Field name="username">
          <FieldLabel>Username</FieldLabel>
          <Input />
          <FieldError />
        </Field>
      </Form>,
    );
    expect(
      screen.getByLabelText("Username").getAttribute("aria-invalid"),
    ).not.toBe("true");
    expect(screen.getAllByText("Email is already taken.")).toHaveLength(1);
  });

  it("renders a form element and merges custom classes", () => {
    const { container } = render(
      <Form aria-label="Checkout" className="gap-8" />,
    );
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form?.className).toContain("gap-8");
    expect(form?.getAttribute("aria-label")).toBe("Checkout");
  });
});
