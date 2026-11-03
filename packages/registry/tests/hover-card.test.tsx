import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

function ExampleHoverCard(props: React.ComponentProps<typeof HoverCard>) {
  return (
    <HoverCard {...props}>
      <HoverCardTrigger delay={0} closeDelay={0} href="#">
        @sevenui
      </HoverCardTrigger>
      <HoverCardContent>The Base UI component registry.</HoverCardContent>
    </HoverCard>
  );
}

function getContent() {
  return document.querySelector('[data-slot="hover-card-content"]');
}

describe("HoverCard", () => {
  it("stays closed initially", () => {
    render(<ExampleHoverCard />);
    expect(getContent()).toBeNull();
    expect(screen.queryByText("The Base UI component registry.")).toBeNull();
  });

  it("opens on hover and closes on unhover", async () => {
    const user = userEvent.setup();
    render(<ExampleHoverCard />);
    const trigger = screen.getByText("@sevenui");
    await user.hover(trigger);
    await screen.findByText("The Base UI component registry.");
    expect(getContent()).toBeTruthy();
    await user.unhover(trigger);
    await waitFor(() => {
      expect(getContent()).toBeNull();
    });
  });

  it("reports open state changes through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ExampleHoverCard onOpenChange={onOpenChange} />);
    const trigger = screen.getByText("@sevenui");
    await user.hover(trigger);
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
    });
    await user.unhover(trigger);
    await waitFor(() => {
      expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    });
  });

  it("supports the controlled open prop", async () => {
    const { rerender } = render(<ExampleHoverCard open />);
    await screen.findByText("The Base UI component registry.");
    rerender(<ExampleHoverCard open={false} />);
    await waitFor(() => {
      expect(getContent()).toBeNull();
    });
  });

  it("marks the trigger with its data slot", () => {
    render(<ExampleHoverCard />);
    const trigger = screen.getByText("@sevenui");
    expect(trigger.getAttribute("data-slot")).toBe("hover-card-trigger");
  });
});

describe("HoverCard v2 styles", () => {
  it("renders a single raised surface with the panel padding", async () => {
    render(<ExampleHoverCard open />);
    await screen.findByText("The Base UI component registry.");
    const content = getContent();
    expect(content?.className).toContain("bg-surface-raised");
    expect(content?.className).toContain("shadow-overlay");
    expect(content?.className).toContain("p-[var(--panel-pad,1.125rem)]");
    expect(content?.className).not.toContain("ring-3");
  });

  it("animates like the select popup and drops motion when reduced", async () => {
    render(<ExampleHoverCard open />);
    await screen.findByText("The Base UI component registry.");
    const content = getContent();
    expect(content?.className).toContain("data-starting-style:opacity-0");
    expect(content?.className).toContain("data-starting-style:scale-[0.98]");
    expect(content?.className).toContain("motion-reduce:transition-none");
  });

  it("keeps the positioner's stacking context", async () => {
    render(<ExampleHoverCard open />);
    await screen.findByText("The Base UI component registry.");
    expect(getContent()?.parentElement?.className).toContain("isolate z-50");
  });
});
