import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

function BasicAccordion(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>Ships within 2 days.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Free returns for 30 days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("renders collapsed triggers with aria-expanded=false and no panels", () => {
    render(<BasicAccordion />);
    const triggers = screen.getAllByRole("button");
    expect(triggers).toHaveLength(2);
    for (const trigger of triggers) {
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    }
    expect(screen.queryByText("Ships within 2 days.")).toBeNull();
  });

  it("expands and collapses an item on trigger click", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Shipping" });
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Ships within 2 days.")).toBeTruthy();
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Ships within 2 days.")).toBeNull();
  });

  it("only keeps one item open by default (single mode)", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    await user.click(screen.getByRole("button", { name: "Shipping" }));
    await user.click(screen.getByRole("button", { name: "Returns" }));
    expect(screen.queryByText("Ships within 2 days.")).toBeNull();
    expect(screen.getByText("Free returns for 30 days.")).toBeTruthy();
  });

  it("keeps several items open with the multiple prop", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion multiple />);
    await user.click(screen.getByRole("button", { name: "Shipping" }));
    await user.click(screen.getByRole("button", { name: "Returns" }));
    expect(screen.getByText("Ships within 2 days.")).toBeTruthy();
    expect(screen.getByText("Free returns for 30 days.")).toBeTruthy();
  });

  it("opens the item from defaultValue initially", () => {
    render(<BasicAccordion defaultValue={["returns"]} />);
    expect(
      screen.getByRole("button", { name: "Returns" }).getAttribute(
        "aria-expanded",
      ),
    ).toBe("true");
    expect(screen.getByText("Free returns for 30 days.")).toBeTruthy();
  });

  it("reports the new value array through onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicAccordion onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Shipping" }));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls[0][0]).toEqual(["shipping"]);
  });

  it("toggles the focused trigger with Enter and Space", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Shipping" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await user.keyboard(" ");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("ignores clicks on a disabled item", async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <AccordionItem value="locked" disabled>
          <AccordionTrigger>Locked</AccordionTrigger>
          <AccordionContent>Hidden content.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole("button", { name: "Locked" });
    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Hidden content.")).toBeNull();
  });
});

describe("Accordion v2 style", () => {
  it("separates rows with the border colour", () => {
    const { container } = render(<BasicAccordion />);
    const item = container.querySelector('[data-slot="accordion-item"]');
    expect(item?.className).toContain("not-last:border-b");
    expect(item?.className).not.toContain("hairline");
  });

  it("sizes triggers to the item height and focuses with the ring", () => {
    render(<BasicAccordion />);
    for (const trigger of screen.getAllByRole("button")) {
      expect(trigger.className).toContain("min-h-[var(--item-h,2rem)]");
      expect(trigger.className).toContain("focus-visible:border-ring");
      expect(trigger.className).toContain("focus-visible:ring-3");
      expect(trigger.className).toContain("focus-visible:ring-ring/50");
      expect(trigger.className).toContain("focus-visible:after:border-ring");
      expect(trigger.className).not.toContain("focus-ring");
    }
  });

  it("mutes the chevron", () => {
    render(<BasicAccordion />);
    expect(screen.getAllByRole("button")[0].className).toContain(
      "**:data-[slot=accordion-trigger-icon]:text-muted-foreground",
    );
  });

  it("keeps the panel keyframes and drops them for reduced motion", () => {
    const { container } = render(<BasicAccordion defaultValue={["shipping"]} />);
    const panel = container.querySelector('[data-slot="accordion-content"]');
    expect(panel?.className).toContain("data-open:animate-accordion-down");
    expect(panel?.className).toContain("motion-reduce:animate-none");
  });
});

describe("Accordion state attributes", () => {
  it("marks the trigger of an open item with data-panel-open", async () => {
    const user = userEvent.setup();
    render(<BasicAccordion />);
    const trigger = screen.getByRole("button", { name: "Shipping" });
    expect(trigger.hasAttribute("data-panel-open")).toBe(false);
    await user.click(trigger);
    expect(trigger.hasAttribute("data-panel-open")).toBe(true);
  });
});
