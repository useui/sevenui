import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";

describe("ButtonGroup", () => {
  it("renders a group role with data-slot and its buttons", () => {
    render(
      <ButtonGroup>
        <Button>Copy</Button>
        <Button>Paste</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group");
    expect(group.getAttribute("data-slot")).toBe("button-group");
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("defaults to horizontal layout classes without a data-orientation attribute", () => {
    render(
      <ButtonGroup>
        <Button>Copy</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group");
    // orientation is undefined by default, so no data-orientation is set,
    // but the cva default still applies horizontal rounding rules.
    expect(group.hasAttribute("data-orientation")).toBe(false);
    expect(group.className).toContain("rounded-r-none");
    expect(group.className.split(/\s+/)).not.toContain("flex-col");
  });

  it("sets data-orientation and stacks vertically when orientation is vertical", () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>Copy</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group");
    expect(group.getAttribute("data-orientation")).toBe("vertical");
    expect(group.className.split(/\s+/)).toContain("flex-col");
  });

  it("forwards aria-label for an accessible group name", () => {
    render(
      <ButtonGroup aria-label="Text alignment">
        <Button>Left</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Text alignment" })).toBeTruthy();
  });
});

describe("ButtonGroupText", () => {
  it("renders a div with the button-group-text slot", () => {
    render(<ButtonGroupText>https://</ButtonGroupText>);
    const text = screen.getByText("https://");
    expect(text.tagName).toBe("DIV");
    expect(text.getAttribute("data-slot")).toBe("button-group-text");
  });

  it("supports the render prop to change the underlying element", () => {
    render(<ButtonGroupText render={<span />}>https://</ButtonGroupText>);
    const text = screen.getByText("https://");
    expect(text.tagName).toBe("SPAN");
    expect(text.getAttribute("data-slot")).toBe("button-group-text");
  });

  it("merges a custom className", () => {
    render(<ButtonGroupText className="custom-class">kg</ButtonGroupText>);
    const text = screen.getByText("kg");
    expect(text.className.split(/\s+/)).toContain("custom-class");
    expect(text.className.split(/\s+/)).toContain("bg-muted");
  });
});

describe("ButtonGroupSeparator", () => {
  it("renders a vertical separator by default", () => {
    render(
      <ButtonGroup>
        <Button>Copy</Button>
        <ButtonGroupSeparator />
        <Button>Paste</Button>
      </ButtonGroup>,
    );
    const separator = screen.getByRole("separator");
    expect(separator.getAttribute("data-slot")).toBe("button-group-separator");
    expect(separator.getAttribute("data-orientation")).toBe("vertical");
  });

  it("supports a horizontal orientation", () => {
    render(<ButtonGroupSeparator orientation="horizontal" />);
    const separator = screen.getByRole("separator");
    expect(separator.getAttribute("data-orientation")).toBe("horizontal");
  });
});
