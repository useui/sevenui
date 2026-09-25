"use client";

import * as React from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { ScrollArea } from "@/registry/base/ui/scroll-area";

type Message = {
  id: number;
  from: "agent" | "customer";
  text: string;
  time: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    from: "agent",
    text: "Hi Alex, I'm Rosa from Parcelhub support. How can I help today?",
    time: "10:02",
  },
  {
    id: 2,
    from: "customer",
    text: "My order #PH-20931 says delivered, but nothing arrived.",
    time: "10:03",
  },
  {
    id: 3,
    from: "agent",
    text: "Sorry about that. I can see the courier marked it delivered at 4:12 PM yesterday with a photo at the side entrance.",
    time: "10:04",
  },
  {
    id: 4,
    from: "agent",
    text: "Could you check the side entrance or with a neighbor? If it isn't there, I can open a trace right away.",
    time: "10:04",
  },
  {
    id: 5,
    from: "customer",
    text: "I checked both, it's not there.",
    time: "10:06",
  },
  {
    id: 6,
    from: "agent",
    text: "Thanks for checking. I've opened trace #TR-5512 with the courier. You'll hear back within 24 hours.",
    time: "10:07",
  },
];

const quickReplies = [
  "Send a replacement instead",
  "Refund to my card",
  "Change delivery address",
  "Talk to a supervisor",
  "That's all, thanks",
];

export default function ScrollArea11() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState(initialMessages);
  const [draft, setDraft] = React.useState("");

  // Scroll to the newest message whenever the thread grows.
  React.useEffect(() => {
    if (messages.length === 0) return;
    const viewport = rootRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages.length]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { id: current.length + 1, from: "customer", text: trimmed, time: "10:08" },
    ]);
    setDraft("");
  }

  return (
    <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar>
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback>RM</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <h3 id="scroll-area-11-title" className="text-sm font-semibold">
            Rosa Martín
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
            Parcelhub support · Online
          </p>
        </div>
      </div>

      <ScrollArea
        ref={rootRef}
        role="log"
        aria-labelledby="scroll-area-11-title"
        className="h-80"
      >
        <div className="flex flex-col gap-2 px-4 py-4">
          <p className="pb-2 text-center text-xs text-muted-foreground">
            Today · Conversation started 10:02
          </p>
          {messages.map((message, index) => {
            const mine = message.from === "customer";
            const next = messages[index + 1];
            const lastInGroup = !next || next.from !== message.from;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[82%] flex-col gap-1",
                  mine ? "items-end self-end" : "items-start self-start",
                )}
              >
                <p
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm leading-snug",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                    lastInGroup && (mine ? "rounded-br-md" : "rounded-bl-md"),
                  )}
                >
                  <span className="sr-only">
                    {mine ? "You" : "Rosa"}:{" "}
                  </span>
                  {message.text}
                </p>
                {lastInGroup ? (
                  <span className="px-1 text-[0.7rem] text-muted-foreground tabular-nums">
                    {message.time}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex flex-col gap-2 border-t pt-3 pb-3">
        <ScrollArea orientation="horizontal">
          <ul aria-label="Suggested replies" className="flex w-max gap-2 px-4 pb-2.5">
            {quickReplies.map((reply) => (
              <li key={reply}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => send(reply)}
                >
                  {reply}
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <form
          className="flex gap-2 px-4"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
        >
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message"
            aria-label="Message"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={!draft.trim()}
          >
            <SendHorizontal aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  );
}
