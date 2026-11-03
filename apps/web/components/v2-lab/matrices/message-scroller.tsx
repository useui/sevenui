"use client";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";
import { LabSection } from "../lab-frame";

const MESSAGES = Array.from({ length: 14 }, (_, i) => ({
  id: `m${i}`,
  own: i % 3 === 0,
  text: i % 3 === 0 ? `Question ${i / 3 + 1}?` : `Answer line ${i}, long enough to wrap once.`,
}));

function Log({
  position,
  direction,
}: {
  position: "start" | "end";
  direction: "start" | "end";
}) {
  return (
    <MessageScrollerProvider defaultScrollPosition={position}>
      <div className="h-56 w-full max-w-xs rounded-lg border">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="gap-3 p-3">
              {MESSAGES.map((m) => (
                <MessageScrollerItem key={m.id} messageId={m.id}>
                  <Bubble variant={m.own ? "default" : "ghost"} align={m.own ? "end" : "start"}>
                    <BubbleContent>{m.text}</BubbleContent>
                  </Bubble>
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction={direction} />
        </MessageScroller>
      </div>
    </MessageScrollerProvider>
  );
}

export default function MessageScrollerMatrix() {
  return (
    <div>
      <LabSection title="jump to latest (direction=end, scrolled to start)">
        <Log position="start" direction="end" />
      </LabSection>
      <LabSection title="jump to first (direction=start, scrolled to end)">
        <Log position="end" direction="start" />
      </LabSection>
      <LabSection title="at the end: button hidden (inactive)">
        <Log position="end" direction="end" />
      </LabSection>
    </div>
  );
}
