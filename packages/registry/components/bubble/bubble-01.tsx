"use client";

import { cn } from "cn";

import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";

type Run = {
  id: string;
  from: "them" | "me";
  messages: string[];
};

const runs: Run[] = [
  {
    id: "run-1",
    from: "them",
    messages: [
      "Morning! The staging build is green again.",
      "I reverted the font preload change that broke Safari.",
      "Can you check the checkout flow before lunch?",
    ],
  },
  {
    id: "run-2",
    from: "me",
    messages: ["On it.", "Running the payment smoke tests now."],
  },
  {
    id: "run-3",
    from: "them",
    messages: ["Perfect, thank you."],
  },
];

// Square off the corner that faces the sender's side, except on the
// last bubble of a run, which keeps its tail corner.
function cornerClass(from: Run["from"], index: number, total: number) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  if (from === "them") {
    return cn(!isFirst && "rounded-tl-md", !isLast && "rounded-bl-md");
  }
  return cn(!isFirst && "rounded-tr-md", !isLast && "rounded-br-md");
}

export default function Bubble01() {
  return (
    <div
      role="log"
      aria-label="Conversation with Maya Chen"
      className="flex w-full max-w-md flex-col gap-4"
    >
      {runs.map((run) => (
        <BubbleGroup
          key={run.id}
          className={cn("gap-0.5", run.from === "me" && "items-end")}
        >
          {run.messages.map((message, index) => (
            <Bubble
              key={message}
              variant={run.from === "me" ? "default" : "muted"}
              align={run.from === "me" ? "end" : "start"}
            >
              <BubbleContent
                className={cornerClass(run.from, index, run.messages.length)}
              >
                {message}
              </BubbleContent>
            </Bubble>
          ))}
        </BubbleGroup>
      ))}
    </div>
  );
}
