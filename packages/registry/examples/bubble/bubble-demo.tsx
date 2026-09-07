"use client";

import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";

export default function BubbleDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <BubbleGroup>
        <Bubble variant="muted">
          <BubbleContent>Are we still on for the design review?</BubbleContent>
        </Bubble>
        <Bubble variant="muted">
          <BubbleContent>I can move it if you need more time.</BubbleContent>
        </Bubble>
      </BubbleGroup>
      <Bubble align="end">
        <BubbleContent>Yes — see you at 3pm.</BubbleContent>
      </Bubble>
    </div>
  );
}
