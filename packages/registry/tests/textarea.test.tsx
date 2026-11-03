import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "@/registry/base/ui/textarea";

describe("Textarea", () => {
  it("renders a textarea with the data-slot attribute and placeholder", () => {
    render(<Textarea placeholder="Your message" />);
    const textarea = screen.getByPlaceholderText("Your message");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("data-slot")).toBe("textarea");
  });

  it("updates its value and fires onChange as the user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea placeholder="Notes" onChange={onChange} />);
    const textarea = screen.getByPlaceholderText(
      "Notes",
    ) as HTMLTextAreaElement;
    await user.click(textarea);
    await user.keyboard("Hello");
    expect(textarea.value).toBe("Hello");
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  it("supports multiline input", async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="Notes" />);
    const textarea = screen.getByPlaceholderText(
      "Notes",
    ) as HTMLTextAreaElement;
    await user.click(textarea);
    await user.keyboard("line one{Enter}line two");
    expect(textarea.value).toBe("line one\nline two");
  });

  it("does not accept input when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea placeholder="Notes" disabled onChange={onChange} />);
    const textarea = screen.getByPlaceholderText(
      "Notes",
    ) as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
    await user.type(textarea, "Hello", { skipClick: true });
    expect(textarea.value).toBe("");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("exposes aria-invalid when passed", () => {
    render(<Textarea placeholder="Notes" aria-invalid />);
    expect(
      screen.getByPlaceholderText("Notes").getAttribute("aria-invalid"),
    ).toBe("true");
  });
});

describe("Textarea v2 styles", () => {
  it("uses the offset focus ring, inset surface and density tokens", () => {
    render(<Textarea placeholder="Styled" />);
    const cls = screen.getByPlaceholderText("Styled").className;
    expect(cls).toContain("focus-visible:focus-ring");
    expect(cls).not.toContain("ring-3");
    expect(cls).not.toContain("focus-visible:border-ring");
    expect(cls).toContain("min-h-[calc(var(--control-h,2.125rem)*2.5)]");
    expect(cls).toContain("py-[calc(var(--control-px,0.75rem)*0.66)]");
    expect(cls).toContain("bg-surface-inset");
    expect(cls).toContain("inset_0_0_0_1px_var(--hairline-strong");
    expect(cls).toContain("placeholder:text-muted-foreground/70");
    expect(cls).toContain("aria-invalid:[--focus-color:var(--destructive)]");
    expect(cls).toContain("motion-reduce:transition-none");
  });
});
