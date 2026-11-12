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
import { Toggle } from "@/registry/base/ui/toggle";

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

  it("keeps one tab stop when buttons render as toggles", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar>
        <ToolbarButton render={<Toggle />} aria-label="Bold">
          B
        </ToolbarButton>
        <ToolbarButton render={<Toggle />} aria-label="Italic">
          I
        </ToolbarButton>
        <ToolbarButton>Underline</ToolbarButton>
      </Toolbar>,
    );
    await user.tab();
    expect(document.activeElement?.textContent).toBe("B");
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement?.textContent).toBe("I");
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement?.textContent).toBe("Underline");
    const bold = screen.getByRole("button", { name: "Bold" });
    await user.click(bold);
    expect(bold.getAttribute("aria-pressed")).toBe("true");
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

  it("sits on the background with a border edge and density gap", () => {
    render(<BasicToolbar />);
    const list = split(screen.getByRole("toolbar"));
    expect(list).toContain("bg-background");
    expect(list).toContain("border");
    expect(list).toContain("p-0.5");
    expect(list.join(" ")).not.toMatch(/surface-|hairline/);
    expect(list).toContain("gap-[var(--control-gap,0.5rem)]");
    expect(list).not.toContain("shadow-xs");
  });

  it("sizes buttons 4px under the control height and uses main's focus ring", () => {
    render(<BasicToolbar />);
    const list = split(screen.getByText("Underline"));
    expect(list).toContain("h-[calc(var(--control-h,2.125rem)-4px)]");
    expect(list).toContain("text-[length:var(--control-text,0.8125rem)]");
    expect(list).toContain("focus-visible:ring-2");
    expect(list).toContain("focus-visible:ring-ring/50");
    expect(list).not.toContain("focus-visible:focus-ring");
    expect(list).toContain("data-[pressed]:bg-accent");
    expect(list).toContain("hover:bg-accent");
    expect(list.some((c) => c.includes("brand"))).toBe(false);
  });

  it("uses main's focus ring on links and a bordered field for inputs", () => {
    render(
      <Toolbar>
        <ToolbarLink href="/help">Help</ToolbarLink>
        <ToolbarInput placeholder="Font size" />
      </Toolbar>,
    );
    expect(split(screen.getByRole("link", { name: "Help" }))).toContain(
      "focus-visible:ring-2",
    );
    const input = split(screen.getByPlaceholderText("Font size"));
    expect(input).toContain("focus-visible:ring-2");
    expect(input).toContain("border-input");
    expect(input).toContain("bg-transparent");
    expect(input.join(" ")).not.toMatch(/surface-|hairline|elevation-inset|focus-ring/);
  });

  it("draws separators with the border colour", () => {
    render(<BasicToolbar />);
    const list = split(screen.getByRole("separator"));
    expect(list).toContain("bg-border");
    expect(list).not.toContain("bg-hairline");
  });
});
