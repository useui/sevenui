import type * as React from "react";
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

  // Base UI validates every field on submit whether or not onFormSubmit is
  // set, and a failure stops onSubmit (and a native action) from running.
  it("runs field validators before a plain onSubmit and blocks it on failure", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <Field
          name="username"
          validate={(value) => (String(value ?? "").length >= 3 ? null : "Too short.")}
        >
          <FieldLabel>Username</FieldLabel>
          <Input />
          <FieldError />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Too short.")).toBeTruthy();
    const input = screen.getByLabelText("Username");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(input);

    await user.type(input, "ada");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // Base UI's Form is noValidate: a native constraint failure shows in the
  // field, not as a browser bubble that stops the submit event, so the other
  // fields' validators still run and show their messages.
  it("is noValidate and reports native and validate errors together", async () => {
    const user = userEvent.setup();
    const onFormSubmit = vi.fn();
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input required />
          <FieldError />
        </Field>
        <Field
          name="username"
          validate={(value) => (String(value ?? "").length >= 3 ? null : "Too short.")}
        >
          <FieldLabel>Username</FieldLabel>
          <Input />
          <FieldError />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    const form = document.querySelector("form") as HTMLFormElement;
    expect(form.noValidate).toBe(true);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onFormSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Too short.")).toBeTruthy();
    const email = screen.getByLabelText("Email");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(email);
  });

  it("shows a native error on a field with invalid={false}", async () => {
    const user = userEvent.setup();
    render(
      <Form onFormSubmit={() => {}}>
        <Field name="email" invalid={false}>
          <FieldLabel>Email</FieldLabel>
          <Input required />
          <FieldError />
        </Field>
        <button type="submit">Submit</button>
      </Form>,
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByLabelText("Email").getAttribute("aria-invalid")).toBe("true");
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

describe("Form v2 styles", () => {
  it("carries layout only: no surface, focus, colour or density classes to restyle", () => {
    const { container } = render(<Form />);
    const form = container.querySelector("form");
    // The v2 look lives in the fields and controls inside a form; the form
    // itself stays a plain grid, so the restyle leaves it untouched.
    expect(form?.className).toBe("grid gap-4");
  });
});
