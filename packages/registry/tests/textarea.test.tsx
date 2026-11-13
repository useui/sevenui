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

  it("lets a caller's data-slot replace the default", () => {
    // InputGroupTextarea re-slots it as input-group-control.
    render(<Textarea placeholder="Note" data-slot="input-group-control" />);
    expect(screen.getByPlaceholderText("Note").getAttribute("data-slot")).toBe(
      "input-group-control",
    );
  });

  it("keeps a controlled value and fires onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Textarea
        placeholder="Fixed"
        value="Hello"
        onChange={() => {}}
        onSelect={onSelect}
      />,
    );
    const textarea = screen.getByPlaceholderText(
      "Fixed",
    ) as HTMLTextAreaElement;
    await user.click(textarea);
    await user.keyboard("x");
    expect(textarea.value).toBe("Hello");
    expect(onSelect).toHaveBeenCalled();
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

describe("Textarea styles", () => {
  it("uses the ring-3 focus halo, the input border and density tokens", () => {
    render(<Textarea placeholder="Styled" />);
    const cls = screen.getByPlaceholderText("Styled").className;
    expect(cls).toContain("focus-visible:border-ring");
    expect(cls).toContain("focus-visible:ring-3");
    expect(cls).toContain("focus-visible:ring-ring/50");
    expect(cls).not.toMatch(/:focus-ring(\s|$)/);
    expect(cls).toContain("min-h-[calc(var(--control-h,2.125rem)*2.5)]");
    expect(cls).toContain("py-[calc(var(--control-px,0.75rem)*0.66)]");
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
