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
