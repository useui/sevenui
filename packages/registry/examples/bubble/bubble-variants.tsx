"use client";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";

const variants = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
] as const;

export default function BubbleVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      {variants.map((variant) => (
        <Bubble key={variant} variant={variant}>
          <BubbleContent className="capitalize">{variant}</BubbleContent>
        </Bubble>
      ))}
    </div>
  );
}
