import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

describe("Meter", () => {
  it("renders a meter role with aria value attributes", () => {
    render(<Meter value={40} aria-label="Storage" />);
    const meter = screen.getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("40");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
  });

  it("respects custom min and max", () => {
    render(<Meter value={5} min={1} max={10} aria-label="Battery cells" />);
    const meter = screen.getByRole("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("5");
    expect(meter.getAttribute("aria-valuemin")).toBe("1");
    expect(meter.getAttribute("aria-valuemax")).toBe("10");
  });

  it("labels the meter with MeterLabel", () => {
    render(
      <Meter value={40}>
        <MeterLabel>Storage used</MeterLabel>
      </Meter>,
    );
    expect(screen.getByRole("meter", { name: "Storage used" })).not.toBeNull();
  });

  it("shows the formatted value with MeterValue", () => {
    render(
      <Meter value={40} aria-label="Storage">
        <MeterValue data-testid="value" />
      </Meter>,
    );
    expect(screen.getByTestId("value").textContent).toBe("40%");
  });

  it("passes the formatted value to a MeterValue render function", () => {
    render(
      <Meter value={40} max={200} aria-label="Storage">
        <MeterValue data-testid="value">
          {(formatted, value) => `${value} of 200 (${formatted})`}
        </MeterValue>
      </Meter>,
    );
    expect(screen.getByTestId("value").textContent).toBe("40 of 200 (20%)");
  });

  it("always renders the track and indicator", () => {
    const { container } = render(<Meter value={40} aria-label="Storage" />);
    // Track and Indicator are baked into the wrapper after children.
    const track = container.querySelector('.overflow-hidden.rounded-full');
    expect(track).not.toBeNull();
    expect(track!.firstElementChild).not.toBeNull();
  });
});

describe("Meter v2 styling", () => {
  it("uses a hairline track and a neutral foreground indicator", () => {
    const { container } = render(<Meter value={40} aria-label="Storage" />);
    const track = container.querySelector('[data-slot="meter-track"]')!;
    const indicator = container.querySelector('[data-slot="meter-indicator"]')!;
    expect(track.className).toContain("bg-hairline-strong");
    expect(track.className).toContain("h-1");
    expect(track.className).toContain("in-data-[density=compact]:h-[3px]");
    expect(indicator.className).toContain("bg-foreground");
    expect(indicator.className).not.toContain("bg-brand");
    expect(indicator.className).toContain("motion-reduce:transition-none");
  });
});
