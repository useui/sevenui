import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "@/registry/base/ui/label";

describe("Label", () => {
  it("renders a native label element with data-slot", () => {
    render(<Label>Email</Label>);
    const label = screen.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("data-slot")).toBe("label");
  });

  it("passes htmlFor through to the label element", () => {
    render(
      <>
        <Label htmlFor="email-input">Email</Label>
        <input id="email-input" type="email" />
      </>,
    );
    const label = screen.getByText("Email");
    expect(label.getAttribute("for")).toBe("email-input");
    expect(screen.getByLabelText("Email")).not.toBeNull();
  });

  it("associates with a wrapped control implicitly", () => {
    render(
      <Label>
        Subscribe
        <input type="checkbox" />
      </Label>,
    );
    expect(screen.getByLabelText("Subscribe")).not.toBeNull();
  });

  it("appends a custom className to the base classes", () => {
    render(<Label className="custom-label">Name</Label>);
    const label = screen.getByText("Name");
    expect(label.className).toContain("custom-label");
    expect(label.className).toContain("select-none");
  });

  it("passes through arbitrary props", () => {
    render(<Label id="the-label">Field</Label>);
    expect(screen.getByText("Field").getAttribute("id")).toBe("the-label");
  });
});
