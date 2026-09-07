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
