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

describe("Input styles", () => {
  it("uses the ring-3 focus halo, the input border and density tokens", () => {
    render(<Input placeholder="Styled" />);
    const cls = screen.getByPlaceholderText("Styled").className;
    expect(cls).toContain("focus-visible:border-ring");
    expect(cls).toContain("focus-visible:ring-3");
    expect(cls).toContain("focus-visible:ring-ring/50");
    expect(cls).not.toMatch(/:focus-ring(\s|$)/);
    expect(cls).toContain("h-[var(--control-h,");
    expect(cls).toContain("px-[var(--control-px,");
    expect(cls).toContain("--control-text");
    // The edge is a real border so consumer border-* classes merge against it.
    expect(cls.split(" ")).toEqual(
      expect.arrayContaining(["border", "border-input", "bg-transparent", "dark:bg-input/30"]),
    );
    expect(cls).not.toMatch(/surface-|hairline|elevation-inset|shadow-/);
    // Full-strength placeholder: an alpha-reduced muted tone drops below 4.5:1.
    expect(cls).toContain("placeholder:text-muted-foreground");
    expect(cls).not.toContain("placeholder:text-muted-foreground/");
    expect(cls).toContain("aria-invalid:border-destructive");
    expect(cls).toContain("aria-invalid:ring-3");
    expect(cls).toContain("aria-invalid:ring-destructive/20");
    expect(cls).not.toContain("--focus-color");
    expect(cls).toContain("motion-reduce:transition-none");
  });
});

describe("Input className contract", () => {
  const classes = (className: string) => {
    render(<Input placeholder={className} className={className} />);
    return screen.getByPlaceholderText(className).className.split(" ");
  };

  it("lets border-0 border-b drop the box edge for an underline", () => {
    const cls = classes("border-0 border-b");
    expect(cls).toEqual(expect.arrayContaining(["border-0", "border-b"]));
    expect(cls).not.toContain("border");
  });

  it("keeps the edge when a consumer replaces the shadow", () => {
    for (const shadow of ["shadow-none", "shadow-md", "dark:shadow-none"]) {
      const cls = classes(shadow);
      expect(cls).toEqual(expect.arrayContaining(["border", "border-input", shadow]));
    }
  });

  it("lets a consumer border colour replace the input border", () => {
    const cls = classes("border-transparent");
    expect(cls).toContain("border");
    expect(cls).toContain("border-transparent");
    expect(cls).not.toContain("border-input");
  });
});
