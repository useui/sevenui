import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/registry/base/ui/button";

function tokens(element: HTMLElement) {
  return element.className.split(/\s+/);
}

describe("Button", () => {
  it("renders a native button with data-slot", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("data-slot")).toBe("button");
  });

  it("applies the default variant and size tokens", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(tokens(button)).toContain("bg-primary");
    expect(tokens(button)).toContain("h-8");
  });

  it.each([
    ["outline", "bg-background"],
    ["secondary", "bg-secondary"],
    ["ghost", "hover:bg-muted"],
    ["destructive", "text-destructive"],
    ["link", "underline-offset-4"],
  ] as const)("applies the %s variant token", (variant, token) => {
    render(<Button variant={variant}>Save</Button>);
    expect(tokens(screen.getByRole("button", { name: "Save" }))).toContain(
      token,
    );
  });

  it.each([
    ["xs", "h-6"],
    ["sm", "h-7"],
    ["lg", "h-9"],
    ["icon", "size-8"],
    ["icon-sm", "size-7"],
  ] as const)("applies the %s size token", (size, token) => {
    render(<Button size={size}>Save</Button>);
    expect(tokens(screen.getByRole("button", { name: "Save" }))).toContain(
      token,
    );
  });

  it("merges a custom className with variant classes", () => {
    render(<Button className="custom-class">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(tokens(button)).toContain("custom-class");
    expect(tokens(button)).toContain("bg-primary");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.hasAttribute("disabled")).toBe(true);
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as a link via the render prop, keeping button classes", () => {
    render(<Button render={<a href="/docs" />}>Docs</Button>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("data-slot")).toBe("button");
    expect(tokens(link)).toContain("bg-primary");
  });
});
