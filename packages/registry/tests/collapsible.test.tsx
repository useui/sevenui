import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";

function BasicCollapsible(props: React.ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>Toggle details</CollapsibleTrigger>
      <CollapsibleContent>Hidden details</CollapsibleContent>
    </Collapsible>
  );
}

describe("Collapsible", () => {
  it("hides the content by default", () => {
    render(<BasicCollapsible />);
    expect(
      screen.getByRole("button", { name: "Toggle details" }).getAttribute(
        "aria-expanded",
      ),
    ).toBe("false");
    expect(screen.queryByText("Hidden details")).toBeNull();
  });

  it("shows the content initially with defaultOpen", () => {
    render(<BasicCollapsible defaultOpen />);
    expect(
      screen.getByRole("button", { name: "Toggle details" }).getAttribute(
        "aria-expanded",
      ),
    ).toBe("true");
    expect(screen.getByText("Hidden details")).toBeTruthy();
  });

  it("opens and closes on trigger click", async () => {
    const user = userEvent.setup();
    render(<BasicCollapsible />);
    const trigger = screen.getByRole("button", { name: "Toggle details" });
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Hidden details")).toBeTruthy();
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Hidden details")).toBeNull();
  });

  it("links the trigger to the panel via aria-controls", async () => {
    const user = userEvent.setup();
    const { container } = render(<BasicCollapsible />);
    const trigger = screen.getByRole("button", { name: "Toggle details" });
    await user.click(trigger);
    const panel = container.querySelector('[data-slot="collapsible-content"]');
    expect(panel).not.toBeNull();
    expect(trigger.getAttribute("aria-controls")).toBe(panel?.id);
  });

  it("respects controlled open and reports onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<BasicCollapsible open onOpenChange={onOpenChange} />);
    expect(screen.getByText("Hidden details")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Toggle details" }));
    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls[0][0]).toBe(false);
    // Controlled: stays open until the owner flips the prop.
    expect(screen.getByText("Hidden details")).toBeTruthy();
  });

  it("does not toggle when the trigger is disabled", async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger disabled>Toggle details</CollapsibleTrigger>
        <CollapsibleContent>Hidden details</CollapsibleContent>
      </Collapsible>,
    );
    await user.click(screen.getByRole("button", { name: "Toggle details" }));
    expect(screen.queryByText("Hidden details")).toBeNull();
  });
});

describe("Collapsible v2 style", () => {
  it("keeps the panel keyframes and drops them for reduced motion", () => {
    const { container } = render(<BasicCollapsible defaultOpen />);
    const panel = container.querySelector('[data-slot="collapsible-content"]');
    expect(panel?.className).toContain("data-open:animate-collapsible-down");
    expect(panel?.className).toContain("motion-reduce:animate-none");
  });
});

describe("Collapsible state attributes", () => {
  it("marks the trigger of an open panel with data-panel-open", async () => {
    const user = userEvent.setup();
    render(<BasicCollapsible />);
    const trigger = screen.getByRole("button", { name: "Toggle details" });
    expect(trigger.hasAttribute("data-panel-open")).toBe(false);
    await user.click(trigger);
    expect(trigger.hasAttribute("data-panel-open")).toBe(true);
  });

  it("lets a caller's data-slot replace the default", () => {
    render(
      <Collapsible data-slot="menu-collapsible" defaultOpen>
        <CollapsibleTrigger data-slot="menu-button">Toggle</CollapsibleTrigger>
        <CollapsibleContent data-slot="menu-sub">Details</CollapsibleContent>
      </Collapsible>,
    );
    expect(
      screen.getByRole("button", { name: "Toggle" }).getAttribute("data-slot"),
    ).toBe("menu-button");
    expect(screen.getByText("Details").getAttribute("data-slot")).toBe(
      "menu-sub",
    );
  });
});
