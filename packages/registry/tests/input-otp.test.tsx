import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

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
    await user.click(slots[0]);
    await user.keyboard("123");
    expect(slots[0].value).toBe("1");
    expect(slots[1].value).toBe("2");
    expect(slots[2].value).toBe("3");
    expect(slots[3].value).toBe("");
  });

  it("fires onValueChange with the accumulated value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<OTP onValueChange={onValueChange} />);
    await user.click(getSlots(container)[0]);
    await user.keyboard("42");
    expect(onValueChange).toHaveBeenLastCalledWith("42", expect.anything());
  });

  it("fires onValueComplete when every slot is filled", async () => {
    const user = userEvent.setup();
    const onValueComplete = vi.fn();
    const { container } = render(<OTP onValueComplete={onValueComplete} />);
    await user.click(getSlots(container)[0]);
    await user.keyboard("12345");
    expect(onValueComplete).not.toHaveBeenCalled();
    await user.keyboard("6");
    expect(onValueComplete).toHaveBeenCalledTimes(1);
    expect(onValueComplete).toHaveBeenCalledWith("123456", expect.anything());
  });

  it("fills all slots from a paste", async () => {
    const user = userEvent.setup();
    const onValueComplete = vi.fn();
    const { container } = render(<OTP onValueComplete={onValueComplete} />);
    const slots = getSlots(container);
    await user.click(slots[0]);
    await user.paste("987654");
    expect(slots.map((slot) => slot.value).join("")).toBe("987654");
    expect(onValueComplete).toHaveBeenCalledWith("987654", expect.anything());
  });

  it("exposes data-filled on filled slots and data-complete when full", async () => {
    const user = userEvent.setup();
    const { container } = render(<OTP />);
    const root = container.querySelector('[data-slot="input-otp"]')!;
    const slots = getSlots(container);
    expect(root.hasAttribute("data-complete")).toBe(false);
    await user.click(slots[0]);
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
    await user.click(slots[0]);
    await user.keyboard("ab");
    expect(slots[0].value).toBe("");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables every slot when the root is disabled", () => {
    const { container } = render(<OTP disabled />);
    for (const slot of getSlots(container)) {
      expect(slot.disabled).toBe(true);
    }
  });

  it("renders a default value spread across the slots", () => {
    const { container } = render(<OTP defaultValue="1234" />);
    const slots = getSlots(container);
    expect(slots.map((slot) => slot.value).join("")).toBe("1234");
  });
});
