"use client";

import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/registry/base/ui/bubble";

export default function BubbleReactionsDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <Bubble variant="muted">
        <BubbleContent>We just hit 1,000 installs! 🎉</BubbleContent>
        <BubbleReactions>👍 🎉 3</BubbleReactions>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>Shipping the announcement now.</BubbleContent>
        <BubbleReactions side="top" align="start">
          ❤️ 1
        </BubbleReactions>
      </Bubble>
    </div>
  );
}
