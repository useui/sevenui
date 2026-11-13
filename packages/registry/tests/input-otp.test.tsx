import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { isUiSdk } from "./helpers/flavour";
import { must } from "./helpers/must";

function OTP(
  props: Omit<React.ComponentProps<typeof InputOTP>, "length" | "children">,
) {
  return (
    <InputOTP length={6} {...props}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  );
}

function getSlots(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLInputElement>(
      '[data-slot="input-otp-slot"]',
    ),
  );
}

// Base UI renders one <input> per slot. UI SDK renders one native input over
// the slots, which are boxes showing its characters: the flavour types into
// that input and reads each slot's text.
function typingTarget(container: HTMLElement) {
  return isUiSdk
    ? must(container.querySelector<HTMLInputElement>("input"))
    : getSlots(container)[0];
}

function slotValue(slot: HTMLInputElement) {
  return isUiSdk ? (slot.textContent ?? "") : slot.value;
}

describe("InputOTP", () => {
  it("renders one input per slot plus a separator", () => {
    const { container } = render(<OTP />);
    expect(getSlots(container)).toHaveLength(6);
    expect(
      container.querySelector('[data-slot="input-otp-separator"]'),
    ).not.toBeNull();
  });

  it("distributes typed characters across the slots", async () => {
    const user = userEvent.setup();
    const { container } = render(<OTP />);
    const slots = getSlots(container);
    await user.click(typingTarget(container));
    await user.keyboard("123");
    expect(slotValue(slots[0])).toBe("1");
    expect(slotValue(slots[1])).toBe("2");
    expect(slotValue(slots[2])).toBe("3");
    expect(slotValue(slots[3])).toBe("");
  });

  it("fires onValueChange with the accumulated value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OTP onValueChange={onValueChange} />);
    await user.click(typingTarget(container));
    await user.keyboard("42");
    expect(onValueChange).toHaveBeenLastCalledWith("42", expect.anything());
  });

  it("fires onValueComplete when every slot is filled", async () => {
    const user = userEvent.setup();
    const onValueComplete = vi.fn();
    const { container } = render(<OTP onValueComplete={onValueComplete} />);
    await user.click(typingTarget(container));
    await user.keyboard("12345");
    expect(onValueComplete).not.toHaveBeenCalled();
    await user.keyboard("6");
    expect(onValueComplete).toHaveBeenCalledTimes(1);
    expect(onValueComplete).toHaveBeenCalledWith("123456", expect.anything());
  });

  // UI SDK 0.1.0-beta.1 bug: under __UI_SDK_STRICT__ its dev check throws on
  // its own `paste` reason and the paste is lost. Asserted exactly, so the
  // case fails once UI SDK fixes it, and for no other reason. It runs before
  // the next case: UI SDK reports a dev message once per page, so a warning
  // there would keep this one from throwing.
  it("pastes under strict mode (UI SDK: the dev check rejects its own paste reason)", async () => {
    const errors: string[] = [];
    const capture = (event: ErrorEvent) => {
      errors.push(String(event.error?.message ?? event.message));
      event.preventDefault();
    };
    window.addEventListener("error", capture);
    onTestFinished(() => window.removeEventListener("error", capture));
    const user = userEvent.setup();
    const { container } = render(<OTP />);
    await user.click(typingTarget(container));
    await user.paste("987654");
    const pasted = getSlots(container).map(slotValue).join("");
    if (isUiSdk) {
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/reported `paste` with a ClipboardEvent \(`paste`\), which the vocabulary doesn't list/);
      expect(pasted).toBe("");
    } else {
      expect(errors).toEqual([]);
      expect(pasted).toBe("987654");
    }
  });

  // Strict mode is off for this case in the flavour: UI SDK 0.1.0-beta.1's
  // dev check rejects its own `paste` reason (the case above pins that bug).
  it("fills all slots from a paste", async () => {
    if (isUiSdk) {
      globalThis.__UI_SDK_STRICT__ = false;
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      onTestFinished(() => {
        globalThis.__UI_SDK_STRICT__ = true;
        warn.mockRestore();
      });
    }
    const user = userEvent.setup();
    const onValueComplete = vi.fn();
    const { container } = render(<OTP onValueComplete={onValueComplete} />);
    const slots = getSlots(container);
    await user.click(typingTarget(container));
    await user.paste("987654");
    expect(slots.map(slotValue).join("")).toBe("987654");
    expect(onValueComplete).toHaveBeenCalledWith("987654", expect.anything());
  });

  it("exposes data-filled on filled slots and data-complete when full", async () => {
    const user = userEvent.setup();
    const { container } = render(<OTP />);
    const root = container.querySelector('[data-slot="input-otp"]')!;
    const slots = getSlots(container);
    expect(root.hasAttribute("data-complete")).toBe(false);
    await user.click(typingTarget(container));
    await user.keyboard("7");
    expect(slots[0].hasAttribute("data-filled")).toBe(true);
    expect(slots[1].hasAttribute("data-filled")).toBe(false);
    await user.keyboard("77777");
    expect(root.hasAttribute("data-complete")).toBe(true);
  });

  it("rejects non-numeric characters with the default numeric validation", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OTP onValueChange={onValueChange} />);
    const slots = getSlots(container);
    await user.click(typingTarget(container));
    await user.keyboard("ab");
    expect(slotValue(slots[0])).toBe("");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables every slot when the root is disabled", () => {
    const { container } = render(<OTP disabled />);
    for (const slot of getSlots(container)) {
      if (isUiSdk) expect(slot.hasAttribute("data-disabled")).toBe(true);
      else expect(slot.disabled).toBe(true);
    }
    if (isUiSdk) expect(typingTarget(container).disabled).toBe(true);
  });

  it("renders a default value spread across the slots", () => {
    const { container } = render(<OTP defaultValue="1234" />);
    const slots = getSlots(container);
    expect(slots.map(slotValue).join("")).toBe("1234");
  });

  // Base UI renders masked slots as password inputs: assistive technology
  // does not read the code out and browsers do not offer to save it.
  it("keeps a masked code in password inputs", async () => {
    const user = userEvent.setup();
    const { container } = render(<OTP mask aria-label="Code" />);
    await user.click(typingTarget(container));
    await user.keyboard("123");
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    const typed = container.querySelectorAll<HTMLInputElement>("input[type=password]");
    expect(typed.length).toBeGreaterThan(0);
    expect((document.activeElement as HTMLInputElement).type).toBe("password");
    expect(getSlots(container).map(slotValue).join("")).toBe(isUiSdk ? "•••" : "123");
  });
});

describe("InputOTP v2 styles", () => {
  it("renders joined control-height slots with the halo focus ring", () => {
    const { container } = render(<OTP />);
    const cls = getSlots(container)[0].className;
    const classes = cls.split(" ");
    for (const c of [
      "border-y",
      "border-r",
      "border-input",
      "first:border-l",
      "first:rounded-l-lg",
      "last:rounded-r-lg",
      "focus:border-ring",
      "focus:ring-3",
      "focus:ring-ring/50",
      "aria-invalid:border-destructive",
      "dark:bg-input/30",
      "caret-foreground",
      "motion-reduce:transition-none",
    ]) {
      expect(classes).toContain(c);
    }
    expect(cls).toContain("size-[var(--control-h,2.125rem)]");
    expect(cls).not.toContain("focus-ring");
    expect(cls).not.toContain("surface-");
    expect(cls).not.toContain("hairline");
    expect(cls).not.toContain("--elevation-inset");
  });
});
