import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DirectionProvider } from "@/registry/base/ui/direction";
import { Slider } from "@/registry/base/ui/slider";
import { isUiSdk } from "./helpers/flavour";
import { must } from "./helpers/must";

// Base UI sets aria-valuenow on each thumb's range input. UI SDK leaves the
// native <input type="range"> to expose its own value, so the flavour reads
// the input's value instead.
function valueNow(slider: HTMLInputElement) {
  return isUiSdk ? slider.value : slider.getAttribute("aria-valuenow");
}

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
    expect(valueNow(slider)).toBe("25");
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("100");
  });

  // Right to left comes from DirectionProvider in both flavours: the arrows
  // follow the reading direction, horizontal and for every thumb of a range.
  it.each([[[40]], [[20, 80]]])("mirrors Left/Right under DirectionProvider rtl (%j)", async (value) => {
    const user = userEvent.setup();
    render(
      <DirectionProvider direction="rtl">
        <Slider defaultValue={value} aria-label="Volume" />
      </DirectionProvider>,
    );
    for (const [index, slider] of getSliders().entries()) {
      await focusSlider(slider);
      await user.keyboard("{ArrowRight}");
      expect(valueNow(slider)).toBe(String(value[index] - 1));
      await user.keyboard("{ArrowLeft}{ArrowLeft}");
      expect(valueNow(slider)).toBe(String(value[index] + 1));
      await user.keyboard("{ArrowUp}");
      expect(valueNow(slider)).toBe(String(value[index] + 2));
    }
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
    expect(valueNow(slider)).toBe("51");
    // An array defaultValue makes the slider value an array, so the
    // callback receives [51] rather than a bare number.
    expect(onValueChange).toHaveBeenCalledWith([51], expect.anything());
    await user.keyboard("{ArrowDown}");
    expect(valueNow(slider)).toBe("50");
  });

  it("steps by the given step size", async () => {
    const user = userEvent.setup();
    render(<Slider defaultValue={[50]} step={10} aria-label="Volume" />);
    const slider = getSlider();
    await focusSlider(slider);
    await user.keyboard("{ArrowRight}");
    expect(valueNow(slider)).toBe("60");
  });

  it("does not move below min or above max", async () => {
    const user = userEvent.setup();
    render(<Slider defaultValue={[0]} aria-label="Volume" />);
    const slider = getSlider();
    await focusSlider(slider);
    await user.keyboard("{ArrowLeft}");
    expect(valueNow(slider)).toBe("0");
    await user.keyboard("{Home}");
    expect(valueNow(slider)).toBe("0");
    await user.keyboard("{End}");
    expect(valueNow(slider)).toBe("100");
    await user.keyboard("{ArrowRight}");
    expect(valueNow(slider)).toBe("100");
  });

  it("supports a controlled value", () => {
    render(<Slider value={[42]} aria-label="Volume" />);
    expect(valueNow(getSlider())).toBe("42");
  });

  it("renders one thumb per value for range sliders", () => {
    render(<Slider defaultValue={[20, 60]} />);
    const sliders = getSliders();
    expect(sliders).toHaveLength(2);
    expect(valueNow(sliders[0])).toBe("20");
    expect(valueNow(sliders[1])).toBe("60");
  });

  it("renders a single thumb at min when no value is given", () => {
    // Base UI defaults an uncontrolled slider to the scalar `min`, so the
    // wrapper's thumb-count fallback is [min]: one thumb, matching the
    // effective visual of a bare shadcn/Radix slider.
    render(<Slider />);
    const sliders = getSliders();
    expect(sliders).toHaveLength(1);
    expect(valueNow(sliders[0])).toBe("0");
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
    expect(valueNow(slider)).toBe("50");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

// Edge alignment keeps a thumb inside the track at 0% and 100%. Base UI
// measures the thumb and positions it with `var(--position)`; the flavour
// shifts UI SDK's centred thumb by (50% - --slider-thumb-position) of its own
// size. jsdom has no layout, so this checks the mechanism; the geometry was
// compared in Chrome (guide §8, slider).
function edgeAligned(thumb: HTMLElement) {
  return isUiSdk
    ? thumb.className.includes("calc(50%-var(--slider-thumb-position))") &&
        thumb.className.includes("[translate:-50%_var(--slider-thumb-position)]")
    : thumb.style.insetInlineStart === "var(--position)";
}

describe("Slider thumb alignment", () => {
  it("keeps thumbs inside the track by default", () => {
    const { container } = render(<Slider defaultValue={[0, 100]} />);
    const thumbs = container.querySelectorAll<HTMLElement>("[data-slot=slider-thumb]");
    expect(thumbs).toHaveLength(2);
    for (const thumb of thumbs) expect(edgeAligned(thumb)).toBe(true);
  });

  it("centres thumbs on their value with thumbAlignment=\"center\"", () => {
    const { container } = render(<Slider defaultValue={[0]} thumbAlignment="center" />);
    expect(edgeAligned(must(container.querySelector<HTMLElement>("[data-slot=slider-thumb]")))).toBe(false);
  });
});

describe("Slider styles", () => {
  function parts() {
    const { container } = render(
      <Slider defaultValue={[40]} aria-label="Volume" />,
    );
    const q = (slot: string) =>
      must(container.querySelector(`[data-slot=${slot}]`));
    return {
      root: q("slider"),
      track: q("slider-track"),
      range: q("slider-range"),
      thumb: q("slider-thumb"),
    };
  }

  it("puts the ring-3 halo on the thumb when its range input has focus", () => {
    const { thumb } = parts();
    // Base UI focuses the nested <input type="range">, not the thumb <div>.
    expect(thumb.className).toContain("has-focus-visible:ring-3");
    expect(thumb.className).toContain("focus-visible:ring-3");
    expect(thumb.className).toContain("ring-ring/50");
    expect(thumb.className).toContain("border-ring");
    expect(thumb.className).not.toMatch(/:focus-ring(\s|$)/);
    expect(thumb.className).not.toContain("hairline");
  });

  it("uses muted for the track and primary for the range", () => {
    const { track, range } = parts();
    expect(track.className).toContain("bg-muted");
    expect(track.className).not.toContain("hairline");
    expect(range.className).toContain("bg-primary");
    expect(range.className).not.toContain("brand");
  });

  it("gives the thumb a white raised surface", () => {
    const { thumb } = parts();
    expect(thumb.className).toContain("bg-white");
    expect(thumb.className).toContain("shadow-raised");
  });

  it("steps the thumb size with density", () => {
    const { root, thumb } = parts();
    expect(root.className).toContain("[--slider-thumb:0.875rem]");
    expect(root.className).toContain(
      "[[data-density=compact]_&]:[--slider-thumb:0.75rem]",
    );
    expect(thumb.className).toContain("size-(--slider-thumb)");
  });
});
