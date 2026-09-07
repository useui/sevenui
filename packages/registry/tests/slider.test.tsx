import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Slider } from "@/registry/base/ui/slider";

// The wrapper sets thumbAlignment="edge", which positions thumbs from layout
// measurements. jsdom has no layout, so thumbs keep their initial
// `visibility: hidden` style and must be queried with { hidden: true }.
function getSliders() {
  return screen.getAllByRole("slider", {
    hidden: true,
  }) as HTMLInputElement[];
}

function getSlider() {
  const sliders = getSliders();
  expect(sliders).toHaveLength(1);
  return sliders[0];
}

async function focusSlider(slider: HTMLInputElement) {
  await act(async () => {
    slider.focus();
  });
}

describe("Slider", () => {
  it("renders a slider with aria value attributes", () => {
    render(<Slider defaultValue={[25]} aria-label="Volume" />);
    const slider = getSlider();
    expect(slider.getAttribute("aria-valuenow")).toBe("25");
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("100");
  });

  it("respects custom min and max", () => {
    render(<Slider defaultValue={[5]} min={1} max={10} aria-label="Rating" />);
    const slider = getSlider();
    expect(slider.min).toBe("1");
    expect(slider.max).toBe("10");
  });

  it("moves the value with arrow keys and fires onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[50]}
        aria-label="Volume"
        onValueChange={onValueChange}
      />,
    );
    const slider = getSlider();
    await focusSlider(slider);
    await user.keyboard("{ArrowRight}");
    expect(slider.getAttribute("aria-valuenow")).toBe("51");
    // An array defaultValue makes the slider value an array, so the
    // callback receives [51] rather than a bare number.
    expect(onValueChange).toHaveBeenCalledWith([51], expect.anything());
    await user.keyboard("{ArrowDown}");
    expect(slider.getAttribute("aria-valuenow")).toBe("50");
  });

  it("steps by the given step size", async () => {
    const user = userEvent.setup();
    render(<Slider defaultValue={[50]} step={10} aria-label="Volume" />);
    const slider = getSlider();
    await focusSlider(slider);
    await user.keyboard("{ArrowRight}");
    expect(slider.getAttribute("aria-valuenow")).toBe("60");
  });

  it("does not move below min or above max", async () => {
    const user = userEvent.setup();
    render(<Slider defaultValue={[0]} aria-label="Volume" />);
    const slider = getSlider();
    await focusSlider(slider);
    await user.keyboard("{ArrowLeft}");
    expect(slider.getAttribute("aria-valuenow")).toBe("0");
    await user.keyboard("{Home}");
    expect(slider.getAttribute("aria-valuenow")).toBe("0");
    await user.keyboard("{End}");
    expect(slider.getAttribute("aria-valuenow")).toBe("100");
    await user.keyboard("{ArrowRight}");
    expect(slider.getAttribute("aria-valuenow")).toBe("100");
  });

  it("supports a controlled value", () => {
    render(<Slider value={[42]} aria-label="Volume" />);
    expect(getSlider().getAttribute("aria-valuenow")).toBe("42");
  });

  it("renders one thumb per value for range sliders", () => {
    render(<Slider defaultValue={[20, 60]} />);
    const sliders = getSliders();
    expect(sliders).toHaveLength(2);
    expect(sliders[0].getAttribute("aria-valuenow")).toBe("20");
    expect(sliders[1].getAttribute("aria-valuenow")).toBe("60");
  });

  it("renders a single thumb at min when no value is given", () => {
    // Base UI defaults an uncontrolled slider to the scalar `min`, so the
    // wrapper's thumb-count fallback is [min]: one thumb, matching the
    // effective visual of a bare shadcn/Radix slider.
    render(<Slider />);
    const sliders = getSliders();
    expect(sliders).toHaveLength(1);
    expect(sliders[0].getAttribute("aria-valuenow")).toBe("0");
  });

  it("ignores keyboard input when disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <Slider
        defaultValue={[50]}
        disabled
        aria-label="Volume"
        onValueChange={onValueChange}
      />,
    );
    const root = container.querySelector('[data-slot="slider"]')!;
    expect(root.hasAttribute("data-disabled")).toBe(true);
    const slider = getSlider();
    expect(slider.disabled).toBe(true);
    await focusSlider(slider);
    await user.keyboard("{ArrowRight}");
    expect(slider.getAttribute("aria-valuenow")).toBe("50");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
