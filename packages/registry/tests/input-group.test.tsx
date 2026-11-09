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
  it("puts the edge and the focus ring on the wrapper, not the control", () => {
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
    const groupClasses = group.split(" ");
    for (const c of [
      "border",
      "border-input",
      "dark:bg-input/30",
      "has-[[data-slot=input-group-control]:focus-visible]:border-ring",
      "has-[[data-slot=input-group-control]:focus-visible]:ring-3",
      "has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
      "has-[[data-slot][aria-invalid=true]]:border-destructive",
      "has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
      "dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
      "motion-reduce:transition-none",
    ]) {
      expect(groupClasses).toContain(c);
    }
    expect(group).toContain("h-[var(--control-h,");
    expect(group).not.toContain("focus-ring");
    expect(group).not.toContain("surface-");
    expect(group).not.toContain("hairline");
    expect(group).not.toContain("--elevation-inset");

    const control = screen.getByPlaceholderText("Styled").className.split(" ");
    // The inner control stays borderless and ringless; the wrapper owns both.
    for (const c of [
      "bg-transparent",
      "shadow-none",
      "border-0",
      "ring-0",
      "focus-visible:ring-0",
      "aria-invalid:ring-0",
    ]) {
      expect(control).toContain(c);
    }

    expect(screen.getByTestId("addon").className).toContain(
      "text-muted-foreground",
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button.className).toContain(
      "h-[calc(var(--control-h,2.125rem)-0.5rem)]",
    );
  });
});
