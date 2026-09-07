import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/registry/base/ui/progress";

describe("Progress", () => {
  it("renders a progressbar with aria value attributes", () => {
    render(<Progress value={60} aria-label="Upload" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("60");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("respects custom min and max", () => {
    render(<Progress value={3} min={1} max={5} aria-label="Steps" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
    expect(bar.getAttribute("aria-valuemin")).toBe("1");
    expect(bar.getAttribute("aria-valuemax")).toBe("5");
  });

  it("always renders the track and indicator slots", () => {
    const { container } = render(<Progress value={60} aria-label="Upload" />);
    expect(
      container.querySelector('[data-slot="progress-track"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-slot="progress-indicator"]'),
    ).not.toBeNull();
  });

  it("labels the progressbar with ProgressLabel", () => {
    render(
      <Progress value={60}>
        <ProgressLabel>Uploading</ProgressLabel>
      </Progress>,
    );
    expect(
      screen.getByRole("progressbar", { name: "Uploading" }),
    ).not.toBeNull();
  });

  it("shows the formatted value with ProgressValue", () => {
    render(
      <Progress value={60} aria-label="Upload">
        <ProgressValue data-testid="value" />
      </Progress>,
    );
    expect(screen.getByTestId("value").textContent).toBe("60%");
  });

  it("is indeterminate when value is null", () => {
    render(<Progress value={null} aria-label="Loading" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBeNull();
    expect(bar.getAttribute("aria-valuetext")).toBe("indeterminate progress");
    expect(bar.hasAttribute("data-indeterminate")).toBe(true);
  });

  it("renders no value text while indeterminate", () => {
    render(
      <Progress value={null} aria-label="Loading">
        <ProgressValue data-testid="value" />
      </Progress>,
    );
    expect(screen.getByTestId("value").textContent).toBe("");
  });

  it("marks completion with data-complete", () => {
    render(<Progress value={100} aria-label="Upload" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.hasAttribute("data-complete")).toBe(true);
  });
});
