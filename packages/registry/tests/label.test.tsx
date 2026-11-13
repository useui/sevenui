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

  it("lets a caller's data-slot replace the default", () => {
    render(<Label data-slot="field-label">Email</Label>);
    expect(screen.getByText("Email").getAttribute("data-slot")).toBe(
      "field-label",
    );
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

describe("Label v2 styles", () => {
  it("reads the control text size and dims disabled peers to 60%", () => {
    render(<Label>Styled</Label>);
    const cls = screen.getByText("Styled").className;
    expect(cls).toContain("text-[length:var(--control-text,");
    expect(cls).toContain("font-medium");
    // No colour of its own: an invalid Field colours its label through inheritance, as on main.
    expect(cls.split(" ")).not.toContain("text-foreground");
    expect(cls).toContain("peer-disabled:opacity-60");
    expect(cls).not.toContain("opacity-50");
  });
});
