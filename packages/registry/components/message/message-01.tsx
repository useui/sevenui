"use client";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/registry/base/ui/message";

const entries = [
  {
    id: "m1",
    author: "Priya Raman",
    initials: "PR",
    time: "10:02",
    body: "Staging is green again. The flaky checkout test was waiting on a font request that never resolved in CI.",
  },
  {
    id: "m2",
    author: "Marcus Hale",
    initials: "MH",
    time: "10:05",
    body: "Nice catch. Can we mock fonts globally in the test setup so this does not come back with the next suite?",
  },
  {
    id: "m3",
    author: "Priya Raman",
    initials: "PR",
    time: "10:07",
    body: "Already on it — the open PR stubs every font request and adds a guard that fails loudly on unmocked network calls.",
  },
];

export default function Message01() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-5">
      {entries.map((entry) => (
        <Message key={entry.id}>
          <MessageAvatar className="self-start">
            <Avatar className="size-8">
              <AvatarFallback>{entry.initials}</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent className="gap-1">
            <MessageHeader className="gap-2">
              <span className="text-foreground">{entry.author}</span>
              <time className="font-normal tabular-nums">{entry.time}</time>
            </MessageHeader>
            <Bubble variant="ghost">
              <BubbleContent>{entry.body}</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      ))}
    </div>
  );
}
