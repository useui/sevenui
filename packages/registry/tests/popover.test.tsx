import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

function ExamplePopover(props: React.ComponentProps<typeof Popover>) {
  return (
    <Popover {...props}>
      <PopoverTrigger>Open popover</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the layer dimensions.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

function getContent() {
  return document.querySelector('[data-slot="popover-content"]');
}

describe("Popover", () => {
  it("exposes popup semantics on the trigger", async () => {
    const user = userEvent.setup();
    render(<ExamplePopover />);
    const trigger = screen.getByText("Open popover");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await user.click(trigger);
    await waitFor(() => {
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });
  });

  it("opens on trigger click and closes on a second click", async () => {
    const user = userEvent.setup();
    render(<ExamplePopover />);
    expect(getContent()).toBeNull();
    const trigger = screen.getByText("Open popover");
    await user.click(trigger);
    await screen.findByText("Dimensions");
    expect(getContent()).toBeTruthy();
    await user.click(trigger);
    await waitFor(() => {
      expect(getContent()).toBeNull();
    });
  });

  it("wires the title and description via aria attributes", async () => {
    const user = userEvent.setup();
    render(<ExamplePopover />);
    await user.click(screen.getByText("Open popover"));
    await screen.findByText("Dimensions");
    const popup = getContent();
    const title = screen.getByText("Dimensions");
    const description = screen.getByText("Set the layer dimensions.");
    expect(popup?.getAttribute("aria-labelledby")).toBe(title.id);
    expect(popup?.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("closes on Escape and reports it through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ExamplePopover onOpenChange={onOpenChange} />);
    await user.click(screen.getByText("Open popover"));
    await screen.findByText("Dimensions");
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(getContent()).toBeNull();
    });
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });

  it("supports the controlled open prop", async () => {
    const { rerender } = render(<ExamplePopover open />);
    await screen.findByText("Dimensions");
    rerender(<ExamplePopover open={false} />);
    await waitFor(() => {
      expect(getContent()).toBeNull();
    });
  });
});

describe("Popover v2 styles", () => {
  it("renders the popover surface with a ring edge and the panel padding", async () => {
    render(<ExamplePopover open />);
    await screen.findByText("Dimensions");
    const content = getContent();
    const classes = content?.className.split(" ") ?? [];
    for (const cls of [
      "bg-popover",
      "ring-1",
      "ring-foreground/10",
      "shadow-overlay",
      "p-[var(--panel-pad,1.125rem)]",
    ]) {
      expect(classes).toContain(cls);
    }
    expect(content?.className).not.toContain("surface-");
    expect(content?.className).not.toContain("ring-3");
  });

  it("animates like the select popup and drops motion when reduced", async () => {
    render(<ExamplePopover open />);
    await screen.findByText("Dimensions");
    const content = getContent();
    expect(content?.className).toContain("data-starting-style:opacity-0");
    expect(content?.className).toContain("data-starting-style:scale-[0.98]");
    expect(content?.className).toContain("motion-reduce:transition-none");
  });

  it("keeps the positioner's stacking context", async () => {
    render(<ExamplePopover open />);
    await screen.findByText("Dimensions");
    expect(getContent()?.parentElement?.className).toContain("isolate z-50");
  });
});
