import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Spinner } from "@/registry/base/ui/spinner";

describe("Spinner", () => {
  it("renders an svg with role status and data-slot", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status");
    expect(spinner.tagName.toLowerCase()).toBe("svg");
    expect(spinner.getAttribute("data-slot")).toBe("spinner");
  });

  it("has an accessible Loading label by default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
      "Loading",
    );
  });

  it("allows overriding the accessible label", () => {
    render(<Spinner aria-label="Saving" />);
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
      "Saving",
    );
  });

  it("has the spin animation class by default", () => {
    render(<Spinner />);
    const className = screen.getByRole("status").getAttribute("class") ?? "";
    expect(className).toContain("animate-spin");
    expect(className).toContain("size-4");
  });

  it("appends a custom className", () => {
    render(<Spinner className="size-8" />);
    const className = screen.getByRole("status").getAttribute("class") ?? "";
    expect(className).toContain("size-8");
    expect(className).toContain("animate-spin");
  });

  it("is muted and slows down, rather than stopping, under reduced motion (v2)", () => {
    render(<Spinner />);
    const className = screen.getByRole("status").getAttribute("class") ?? "";
    expect(className).toContain("text-muted-foreground");
    expect(className).toContain("motion-reduce:animate-[spin_2.5s_linear_infinite]");
  });

  it("keeps the current colour inside a button or badge it sits in (v2)", () => {
    render(<Spinner />);
    const className = screen.getByRole("status").getAttribute("class") ?? "";
    expect(className).toContain("in-data-[slot=button]:text-current");
    expect(className).toContain("in-data-[slot=badge]:text-current");
  });
});
