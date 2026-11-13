import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";
import { expectClosed, isUiSdk, movePointerAway } from "./helpers/flavour";

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
// UI SDK keeps a closed tooltip mounted with `hidden`; expectClosed covers both.

describe("Tooltip", () => {
  it("stays closed initially", () => {
    render(<ExampleTooltip />);
    expectClosed(screen.queryByText("Add to library"));
  });

  // Base UI describes nothing while closed. Hidden content referenced by
  // aria-describedby is still read out (accname), so a closed tooltip whose
  // text repeats the trigger's would be announced twice.
  it("does not describe its trigger while closed, and keeps the caller's description", () => {
    render(
      <>
        <span id="hint">Saves a copy</span>
        <ExampleTooltip />
        <Tooltip>
          <TooltipTrigger aria-describedby="hint">Save</TooltipTrigger>
          <TooltipContent>Save the file</TooltipContent>
        </Tooltip>
      </>,
    );
    expect(screen.getByRole("button", { name: "Hover me" }).hasAttribute("aria-describedby")).toBe(
      false,
    );
    expect(screen.getByRole("button", { name: "Save" }).getAttribute("aria-describedby")).toBe(
      "hint",
    );
  });

  it("never describes its trigger while disabled", async () => {
    const user = userEvent.setup();
    render(<ExampleTooltip disabled />);
    const trigger = screen.getByRole("button", { name: "Hover me" });
    await user.hover(trigger);
    await user.tab();
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  });

  it("opens on hover and closes on unhover", async () => {
    const user = userEvent.setup();
    render(<ExampleTooltip />);
    const trigger = screen.getByText("Hover me");
    await user.hover(trigger);
    const popup = await screen.findByText("Add to library");
    expect(popup.getAttribute("data-open")).toBe("");
    await movePointerAway(user, trigger);
    await waitFor(() => {
      expectClosed(screen.queryByText("Add to library"));
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
      expectClosed(screen.queryByText("Add to library"));
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
    await movePointerAway(user, screen.getByText("Hover me"));
    await waitFor(() => {
      expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    });
  });

  it("supports the controlled open prop", async () => {
    const { rerender } = render(<ExampleTooltip open />);
    await screen.findByText("Add to library");
    rerender(<ExampleTooltip open={false} />);
    await waitFor(() => {
      expectClosed(screen.queryByText("Add to library"));
    });
  });
});

// Base UI options UI SDK has no counterpart for, which the flavour emulates.
describe("Tooltip pointer options", () => {
  // The element that carries the popup's position: Base UI's positioner, or
  // UI SDK's content.
  const positioned = (text: string) =>
    screen.getByText(text).closest<HTMLElement>('[style*="position"]');

  it("follows the pointer along trackCursorAxis", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delay={0} closeDelay={0}>
        <Tooltip trackCursorAxis="x">
          <TooltipTrigger delay={0}>Hover me</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = screen.getByText("Hover me");
    trigger.getBoundingClientRect = () => new DOMRect(100, 100, 200, 20);
    await user.pointer({ target: trigger, coords: { clientX: 120, clientY: 110 } });
    await screen.findByText("Tip");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    const before = positioned("Tip")?.style.cssText;
    await user.pointer({ target: trigger, coords: { clientX: 260, clientY: 110 } });
    await waitFor(() => expect(positioned("Tip")?.style.cssText).not.toBe(before));
  });

  it("lets the pointer through the popup with disableHoverablePopup", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delay={0} closeDelay={0}>
        <Tooltip disableHoverablePopup>
          <TooltipTrigger delay={0}>Hover me</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await user.hover(screen.getByText("Hover me"));
    const popup = await screen.findByText("Tip");
    // Base UI sets pointer-events: none on the popup; the flavour sets the
    // class (jsdom applies no Tailwind). Moving onto the popup then closes it,
    // checked in Chrome (guide §8).
    const passThrough = (el: HTMLElement | null): boolean =>
      el !== null &&
      (getComputedStyle(el).pointerEvents === "none" ||
        (isUiSdk && el.className.includes("pointer-events-none")) ||
        passThrough(el.parentElement));
    expect(passThrough(popup)).toBe(true);
  });
});

describe("Tooltip v2 styles", () => {
  it("renders a compact primary bubble", async () => {
    render(<ExampleTooltip open />);
    const popup = await screen.findByText("Add to library");
    for (const cls of [
      "bg-primary",
      "text-primary-foreground",
      "text-xs",
      "px-2",
      "py-1",
      "rounded-md",
    ]) {
      expect(popup.className).toContain(cls);
    }
    expect(popup.className).not.toContain("bg-foreground");
  });

  it("fades in over 100ms without scaling", async () => {
    render(<ExampleTooltip open />);
    const popup = await screen.findByText("Add to library");
    expect(popup.className).toContain("transition-opacity");
    expect(popup.className).toContain("duration-100");
    expect(popup.className).not.toContain("scale-95");
    expect(popup.className).toContain("motion-reduce:transition-none");
  });

  it("matches the arrow to the bubble without a shadow", async () => {
    render(<ExampleTooltip open />);
    const popup = await screen.findByText("Add to library");
    const arrow = popup.lastElementChild;
    expect(arrow?.className).toContain("bg-primary");
    expect(arrow?.className).not.toContain("shadow");
  });
});
