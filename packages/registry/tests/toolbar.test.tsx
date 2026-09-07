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
