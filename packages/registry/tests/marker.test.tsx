import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
  markerVariants,
} from "@/registry/base/ui/marker";

describe("Marker", () => {
  it("renders a div by default with state data attributes", () => {
    render(<Marker data-testid="marker">Today</Marker>);
    const marker = screen.getByTestId("marker");
    expect(marker.tagName).toBe("DIV");
    expect(marker.getAttribute("data-slot")).toBe("marker");
    expect(marker.getAttribute("data-variant")).toBe("default");
  });

  it("applies separator variant tokens", () => {
    render(
      <Marker data-testid="marker" variant="separator">
        Yesterday
      </Marker>,
    );
    const marker = screen.getByTestId("marker");
    expect(marker.getAttribute("data-variant")).toBe("separator");
    expect(marker.classList.contains("before:flex-1")).toBe(true);
    expect(marker.classList.contains("after:flex-1")).toBe(true);
  });

  it("applies border variant tokens", () => {
    render(
      <Marker data-testid="marker" variant="border">
        Section
      </Marker>,
    );
    const marker = screen.getByTestId("marker");
    expect(marker.getAttribute("data-variant")).toBe("border");
    expect(marker.classList.contains("border-b")).toBe(true);
  });

  it("renders through a custom element via the render prop", () => {
    render(
      <Marker render={<a href="/changelog" />}>View changelog</Marker>,
    );
    const link = screen.getByRole("link", { name: "View changelog" });
    expect(link.getAttribute("href")).toBe("/changelog");
    expect(link.getAttribute("data-slot")).toBe("marker");
  });

  it("hides the icon from assistive tech", () => {
    render(
      <Marker>
        <MarkerIcon data-testid="icon">
          <svg />
        </MarkerIcon>
        <MarkerContent>Deployed</MarkerContent>
      </Marker>,
    );
    const icon = screen.getByTestId("icon");
    expect(icon.getAttribute("data-slot")).toBe("marker-icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders the content slot as a span", () => {
    render(<MarkerContent>Deployed to production</MarkerContent>);
    const content = screen.getByText("Deployed to production");
    expect(content.tagName).toBe("SPAN");
    expect(content.getAttribute("data-slot")).toBe("marker-content");
  });

  it("appends custom className on every part", () => {
    render(
      <Marker data-testid="marker" className="marker-extra">
        <MarkerIcon data-testid="icon" className="icon-extra" />
        <MarkerContent className="content-extra">C</MarkerContent>
      </Marker>,
    );
    expect(
      screen.getByTestId("marker").classList.contains("marker-extra"),
    ).toBe(true);
    expect(
      screen.getByTestId("icon").classList.contains("icon-extra"),
    ).toBe(true);
    expect(screen.getByText("C").classList.contains("content-extra")).toBe(
      true,
    );
  });

  it("exports markerVariants for external composition", () => {
    expect(markerVariants({ variant: "border" })).toContain("border-b");
  });
});
