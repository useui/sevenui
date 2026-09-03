import { render, screen } from "@testing-library/react";
import { Bar, BarChart } from "recharts";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  ChartContainer,
  ChartLegendContent,
  ChartStyle,
  ChartTooltipContent,
  type ChartConfig,
} from "@/registry/base/ui/chart";

// ResponsiveContainer unmounts children unless it measures a positive size;
// jsdom rects are 0x0, so seed a fixed measurement. The ResizeObserver stub in
// tests/setup.ts never fires, so the seeded size sticks for the whole test.
beforeAll(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 400,
    height: 225,
    top: 0,
    left: 0,
    right: 400,
    bottom: 225,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
});

afterAll(() => {
  vi.restoreAllMocks();
});

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: {
    label: "Mobile",
    theme: {
      light: "oklch(0.6 0.118 184.704)",
      dark: "oklch(0.696 0.17 162.48)",
    },
  },
} satisfies ChartConfig;

describe("ChartStyle", () => {
  it("emits per-series color variables scoped to the chart id", () => {
    const { container } = render(<ChartStyle id="chart-test" config={config} />);
    const css = container.querySelector("style")?.innerHTML ?? "";
    expect(css).toContain("[data-chart=chart-test]");
    expect(css).toContain("--color-desktop: var(--chart-1);");
    expect(css).toContain("--color-mobile: oklch(0.6 0.118 184.704);");
  });

  it("emits dark values under both dark-mode selectors", () => {
    const { container } = render(<ChartStyle id="chart-test" config={config} />);
    const css = container.querySelector("style")?.innerHTML ?? "";
    expect(css).toContain(".dark [data-chart=chart-test]");
    expect(css).toContain('[data-theme="dark"] [data-chart=chart-test]');
    expect(css).toContain("--color-mobile: oklch(0.696 0.17 162.48);");
  });
});

describe("ChartContainer", () => {
  it("renders a data-chart scope containing the style tag and the chart", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <BarChart data={[{ month: "Jan", desktop: 1 }]}>
          <Bar dataKey="desktop" />
        </BarChart>
      </ChartContainer>,
    );
    const scope = container.querySelector("[data-chart]");
    expect(scope).not.toBeNull();
    expect(scope?.querySelector("style")).not.toBeNull();
    expect(scope?.querySelector(".recharts-responsive-container")).not.toBeNull();
  });
});

describe("ChartTooltipContent", () => {
  const payload = [
    {
      dataKey: "desktop",
      name: "desktop",
      value: 186,
      color: "var(--color-desktop)",
      payload: { month: "January", desktop: 186 },
      graphicalItemId: "bar-desktop",
    },
  ];

  it("renders config labels and values when active", () => {
    render(
      <ChartContainer config={config}>
        <ChartTooltipContent
          active
          payload={payload}
          label="desktop"
          coordinate={{ x: 0, y: 0 }}
          accessibilityLayer
          activeIndex={undefined}
        />
      </ChartContainer>,
    );
    expect(screen.getAllByText("Desktop").length).toBeGreaterThan(0);
    expect(screen.getByText("186")).toBeDefined();
  });

  it("renders nothing when inactive", () => {
    render(
      <ChartContainer config={config}>
        <ChartTooltipContent
          active={false}
          payload={payload}
          coordinate={{ x: 0, y: 0 }}
          accessibilityLayer
          activeIndex={undefined}
        />
      </ChartContainer>,
    );
    expect(screen.queryByText("186")).toBeNull();
  });
});

describe("ChartLegendContent", () => {
  it("renders config labels for legend payload entries", () => {
    render(
      <ChartContainer config={config}>
        <ChartLegendContent
          payload={[
            { value: "desktop", dataKey: "desktop", color: "#111" },
            { value: "mobile", dataKey: "mobile", color: "#222" },
          ]}
        />
      </ChartContainer>,
    );
    expect(screen.getByText("Desktop")).toBeDefined();
    expect(screen.getByText("Mobile")).toBeDefined();
  });
});
