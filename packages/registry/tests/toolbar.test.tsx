import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

function BasicToolbar() {
  return (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarButton>Bold</ToolbarButton>
        <ToolbarButton>Italic</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton>Underline</ToolbarButton>
      <ToolbarLink href="/help">Help</ToolbarLink>
    </Toolbar>
  );
}

describe("Toolbar", () => {
  it("renders a toolbar landmark containing its controls", () => {
    render(<BasicToolbar />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar.getAttribute("aria-orientation")).toBe("horizontal");
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Help" }).getAttribute("href")).toBe(
      "/help",
    );
  });

  it("renders the separator with the opposite orientation of the toolbar", () => {
    render(<BasicToolbar />);
    const separator = screen.getByRole("separator");
    expect(separator.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("uses a roving tabindex: only one control is tabbable", () => {
    render(<BasicToolbar />);
    const buttons = screen.getAllByRole("button");
    const tabbable = buttons.filter(
      (button) => button.getAttribute("tabindex") === "0",
    );
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].textContent).toBe("Bold");
  });

  it("moves focus between controls with arrow keys", async () => {
    const user = userEvent.setup();
    render(<BasicToolbar />);
    await user.tab();
    expect(document.activeElement?.textContent).toBe("Bold");
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement?.textContent).toBe("Italic");
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement?.textContent).toBe("Underline");
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement?.textContent).toBe("Italic");
  });

  it("supports vertical orientation", () => {
    render(
      <Toolbar orientation="vertical">
        <ToolbarButton>One</ToolbarButton>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar").getAttribute("aria-orientation")).toBe(
      "vertical",
    );
  });

  it("marks a disabled button and keeps it out of activation", async () => {
    const user = userEvent.setup();
    let clicks = 0;
    render(
      <Toolbar>
        <ToolbarButton disabled onClick={() => clicks++}>
          Bold
        </ToolbarButton>
      </Toolbar>,
    );
    const button = screen.getByText("Bold");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await user.click(button);
    expect(clicks).toBe(0);
  });

  it("renders a toolbar input that accepts text", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar>
        <ToolbarInput placeholder="Font size" />
      </Toolbar>,
    );
    const input = screen.getByPlaceholderText("Font size");
    await user.click(input);
    await user.keyboard("16");
    expect((input as HTMLInputElement).value).toBe("16");
  });
});

describe("Toolbar v2 design language", () => {
  function split(el: Element) {
    return el.className.split(/\s+/);
  }

  it("sits on a recessed tray with a hairline edge and density gap", () => {
    render(<BasicToolbar />);
    const list = split(screen.getByRole("toolbar"));
    expect(list).toContain("bg-surface-tray");
    expect(list).toContain("p-0.5");
    expect(list).toContain("shadow-[inset_0_0_0_1px_var(--hairline,var(--border))]");
    expect(list).toContain("gap-[var(--control-gap,0.5rem)]");
    expect(list).not.toContain("shadow-xs");
  });

  it("sizes buttons 4px under the control height and uses the offset focus ring", () => {
    render(<BasicToolbar />);
    const list = split(screen.getByText("Underline"));
    expect(list).toContain("h-[calc(var(--control-h,2.125rem)-4px)]");
    expect(list).toContain("text-[length:var(--control-text,0.8125rem)]");
    expect(list).toContain("focus-visible:focus-ring");
    expect(list).toContain("data-[pressed]:bg-surface-raised");
    expect(list.join(" ")).not.toMatch(/ring-2|ring-3|ring-ring/);
    expect(list.some((c) => c.includes("brand"))).toBe(false);
  });

  it("uses the offset focus ring on links and an inset field for inputs", () => {
    render(
      <Toolbar>
        <ToolbarLink href="/help">Help</ToolbarLink>
        <ToolbarInput placeholder="Font size" />
      </Toolbar>,
    );
    expect(split(screen.getByRole("link", { name: "Help" }))).toContain(
      "focus-visible:focus-ring",
    );
    const input = split(screen.getByPlaceholderText("Font size"));
    expect(input).toContain("focus-visible:focus-ring");
    expect(input).toContain("bg-surface-inset");
    expect(input).toContain(
      "shadow-[inset_0_0_0_1px_var(--hairline-strong,var(--input)),var(--elevation-inset,0_0_#0000)]",
    );
  });

  it("draws separators with the hairline", () => {
    render(<BasicToolbar />);
    const list = split(screen.getByRole("separator"));
    expect(list).toContain("bg-hairline");
    expect(list).not.toContain("bg-border");
  });
});
