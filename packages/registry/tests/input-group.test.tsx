import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/base/ui/input-group";

describe("InputGroup", () => {
  it("renders a group container with the control input inside", () => {
    render(
      <InputGroup data-testid="group">
        <InputGroupInput placeholder="Search" />
      </InputGroup>,
    );
    const group = screen.getByTestId("group");
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("data-slot")).toBe("input-group");
    const input = screen.getByPlaceholderText("Search");
    expect(input.getAttribute("data-slot")).toBe("input-group-control");
  });

  it("lets the user type into the grouped input", async () => {
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Domain" />
      </InputGroup>,
    );
    const input = screen.getByPlaceholderText("Domain") as HTMLInputElement;
    await user.click(input);
    await user.keyboard("sevenui.dev");
    expect(input.value).toBe("sevenui.dev");
  });

  it("marks addons with their alignment via data-align", () => {
    render(
      <InputGroup>
        <InputGroupAddon data-testid="start">
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Username" />
        <InputGroupAddon align="inline-end" data-testid="end">
          <InputGroupText>.dev</InputGroupText>
        </InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByTestId("start").getAttribute("data-align")).toBe(
      "inline-start",
    );
    expect(screen.getByTestId("start").getAttribute("data-slot")).toBe(
      "input-group-addon",
    );
    expect(screen.getByTestId("end").getAttribute("data-align")).toBe(
      "inline-end",
    );
  });

  it("supports block alignment for addons", () => {
    render(
      <InputGroup>
        <InputGroupTextarea placeholder="Message" />
        <InputGroupAddon align="block-end" data-testid="footer">
          <InputGroupText>120 characters left</InputGroupText>
        </InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByTestId("footer").getAttribute("data-align")).toBe(
      "block-end",
    );
  });

  it("focuses the input when an addon is clicked", async () => {
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupAddon data-testid="addon">
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Username" />
      </InputGroup>,
    );
    await user.click(screen.getByTestId("addon"));
    expect(document.activeElement).toBe(
      screen.getByPlaceholderText("Username"),
    );
  });

  it("does not steal focus when a button inside an addon is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <InputGroup>
        <InputGroupInput placeholder="Search" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onClick}>Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(document.activeElement).not.toBe(
      screen.getByPlaceholderText("Search"),
    );
  });

  it("renders group buttons as type=button with their size attribute", () => {
    render(
      <InputGroup>
        <InputGroupInput placeholder="Search" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs">Clear</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    const button = screen.getByRole("button", { name: "Clear" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("data-size")).toBe("icon-xs");
  });

  it("renders a textarea control with the control data-slot", () => {
    render(
      <InputGroup>
        <InputGroupTextarea placeholder="Message" />
      </InputGroup>,
    );
    const textarea = screen.getByPlaceholderText("Message");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("data-slot")).toBe("input-group-control");
  });
});

describe("InputGroup v2 styles", () => {
  it("puts the surface and the focus ring on the wrapper, not the control", () => {
    render(
      <InputGroup data-testid="group">
        <InputGroupAddon data-testid="addon">
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Styled" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    const group = screen.getByTestId("group").className;
    expect(group).toContain(
      "has-[[data-slot=input-group-control]:focus-visible]:focus-ring",
    );
    expect(group).not.toContain("ring-3");
    expect(group).toContain("h-[var(--control-h,");
    expect(group).toContain("bg-surface-inset");
    // The edge is a real border so consumer border-* classes merge against it.
    expect(group.split(" ")).toEqual(expect.arrayContaining(["border", "border-hairline-strong"]));
    expect(group).not.toContain("0_0_0_1px_var(--hairline");
    expect(group).toContain(
      "has-[[data-slot][aria-invalid=true]]:[--focus-color:var(--destructive)]",
    );
    expect(group).toContain("motion-reduce:transition-none");

    const control = screen.getByPlaceholderText("Styled").className;
    expect(control).toContain("bg-transparent");
    expect(control).toContain("shadow-none");
    // The inner control stays borderless; the wrapper owns the edge.
    expect(control.split(" ")).toContain("border-0");
    expect(control.split(" ")).not.toContain("border");
    expect(control).not.toContain("--elevation-inset");
    expect(control).toContain("[--focus-width:0px]");
    expect(control).not.toContain("bg-surface-inset");

    expect(screen.getByTestId("addon").className).toContain(
      "text-muted-foreground",
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.className).toContain(
      "h-[calc(var(--control-h,2.125rem)-0.5rem)]",
    );
  });
});
