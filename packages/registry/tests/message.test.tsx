import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/registry/base/ui/message";

function FullMessage(props: React.ComponentProps<typeof Message>) {
  return (
    <Message {...props}>
      <MessageAvatar>EC</MessageAvatar>
      <MessageContent>
        <MessageHeader>Emma · 09:41</MessageHeader>
        <p>Did you see the new landing page?</p>
        <MessageFooter>Delivered</MessageFooter>
      </MessageContent>
    </Message>
  );
}

describe("Message", () => {
  it("renders avatar, header, body, and footer content", () => {
    render(<FullMessage />);
    expect(screen.getByText("EC")).not.toBeNull();
    expect(screen.getByText("Emma · 09:41")).not.toBeNull();
    expect(screen.getByText("Did you see the new landing page?")).not.toBeNull();
    expect(screen.getByText("Delivered")).not.toBeNull();
  });

  it("defaults to start alignment", () => {
    render(<FullMessage data-testid="message" />);
    expect(screen.getByTestId("message").getAttribute("data-align")).toBe(
      "start",
    );
  });

  it("reflects align=end for outgoing messages", () => {
    render(<FullMessage data-testid="message" align="end" />);
    const message = screen.getByTestId("message");
    expect(message.getAttribute("data-align")).toBe("end");
    // End-aligned messages reverse the row so the avatar sits on the right.
    expect(message.className).toContain("data-[align=end]:flex-row-reverse");
  });

  it("tags every composition part with a data-slot", () => {
    const { container } = render(<FullMessage />);
    for (const slot of [
      "message",
      "message-avatar",
      "message-content",
      "message-header",
      "message-footer",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
  });

  it("appends custom classNames on each part", () => {
    const { container } = render(
      <Message className="mt-4">
        <MessageAvatar className="ring-2">EC</MessageAvatar>
        <MessageContent className="gap-1">
          <MessageHeader className="uppercase">Emma</MessageHeader>
          <MessageFooter className="italic">Read</MessageFooter>
        </MessageContent>
      </Message>,
    );
    const q = (slot: string) =>
      container.querySelector(`[data-slot="${slot}"]`) as HTMLElement;
    expect(q("message").className).toContain("mt-4");
    expect(q("message").className).toContain("group/message");
    expect(q("message-avatar").className).toContain("ring-2");
    expect(q("message-content").className).toContain("gap-1");
    expect(q("message-header").className).toContain("uppercase");
    expect(q("message-footer").className).toContain("italic");
  });

  it("renders without avatar, header, or footer", () => {
    const { container } = render(
      <Message>
        <MessageContent>
          <p>Bare message</p>
        </MessageContent>
      </Message>,
    );
    expect(screen.getByText("Bare message")).not.toBeNull();
    expect(container.querySelector('[data-slot="message-avatar"]')).toBeNull();
    expect(container.querySelector('[data-slot="message-header"]')).toBeNull();
    expect(container.querySelector('[data-slot="message-footer"]')).toBeNull();
  });
});

describe("MessageGroup", () => {
  it("stacks multiple messages", () => {
    const { container } = render(
      <MessageGroup>
        <FullMessage />
        <FullMessage align="end" />
      </MessageGroup>,
    );
    const group = container.querySelector('[data-slot="message-group"]');
    expect(group?.querySelectorAll('[data-slot="message"]')).toHaveLength(2);
  });

  it("renders empty without children and appends a custom className", () => {
    render(<MessageGroup data-testid="group" className="gap-6" />);
    const group = screen.getByTestId("group");
    expect(group.childElementCount).toBe(0);
    expect(group.className).toContain("gap-6");
    expect(group.className).toContain("flex-col");
  });
});
