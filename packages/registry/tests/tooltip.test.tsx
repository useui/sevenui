import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

function ExampleTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip {...props}>
        <TooltipTrigger delay={0} closeDelay={0}>
          Hover me
        </TooltipTrigger>
        <TooltipContent>Add to library</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Note: Base UI 1.7 renders the tooltip popup without role="tooltip", so
// these tests assert on the popup content and data attributes instead.

describe("Tooltip", () => {
  it("stays closed initially", () => {
    render(<ExampleTooltip />);
    expect(screen.queryByText("Add to library")).toBeNull();
  });

  it("opens on hover and closes on unhover", async () => {
    const user = userEvent.setup();
    render(<ExampleTooltip />);
    const trigger = screen.getByText("Hover me");
    await user.hover(trigger);
    const popup = await screen.findByText("Add to library");
    expect(popup.getAttribute("data-open")).toBe("");
    await user.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByText("Add to library")).toBeNull();
    });
  });

  it("opens on keyboard focus and closes on blur", async () => {
    const user = userEvent.setup();
    render(<ExampleTooltip />);
    await user.tab();
    expect(document.activeElement?.textContent).toBe("Hover me");
    await screen.findByText("Add to library");
    await user.tab();
    await waitFor(() => {
      expect(screen.queryByText("Add to library")).toBeNull();
    });
  });

  it("marks the trigger as open via data attributes", async () => {
    const user = userEvent.setup();
    render(<ExampleTooltip />);
    const trigger = screen.getByText("Hover me");
    expect(trigger.hasAttribute("data-popup-open")).toBe(false);
    await user.hover(trigger);
    await screen.findByText("Add to library");
    expect(trigger.hasAttribute("data-popup-open")).toBe(true);
  });

  it("reports open state changes through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ExampleTooltip onOpenChange={onOpenChange} />);
    await user.hover(screen.getByText("Hover me"));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    });
    await user.unhover(screen.getByText("Hover me"));
    await waitFor(() => {
      expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    });
  });

  it("supports the controlled open prop", async () => {
    const { rerender } = render(<ExampleTooltip open />);
    await screen.findByText("Add to library");
    rerender(<ExampleTooltip open={false} />);
    await waitFor(() => {
      expect(screen.queryByText("Add to library")).toBeNull();
    });
  });
});
