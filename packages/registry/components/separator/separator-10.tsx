"use client";

import { SendHorizontal } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Separator } from "@/registry/base/ui/separator";

type Message = {
  id: number;
  from: "agent" | "customer";
  text: string;
  time: string;
  day: "Yesterday" | "Today";
  unread?: boolean;
};

const initialMessages: Message[] = [
  {
    id: 1,
    from: "customer",
    text: "My invoice for September shows two charges for the Team plan.",
    time: "4:12 PM",
    day: "Yesterday",
  },
  {
    id: 2,
    from: "agent",
    text: "Thanks for flagging this. I'm checking with billing now.",
    time: "4:20 PM",
    day: "Yesterday",
  },
  {
    id: 3,
    from: "agent",
    text: "The duplicate charge has been refunded. It should reach your card in 3-5 business days.",
    time: "9:02 AM",
    day: "Today",
    unread: true,
  },
  {
    id: 4,
    from: "agent",
    text: "Anything else I can help with?",
    time: "9:03 AM",
    day: "Today",
    unread: true,
  },
];

function DayDivider({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3 py-1">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <Separator className="flex-1" />
    </li>
  );
}

function UnreadDivider({ count }: { count: number }) {
  return (
    <li className="flex items-center gap-3 py-1">
      <Separator className="flex-1 bg-destructive/60" />
      <span className="text-xs font-medium text-destructive">
        {count} new {count === 1 ? "message" : "messages"}
      </span>
      <Separator className="flex-1 bg-destructive/60" />
    </li>
  );
}

export default function Separator10() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [draft, setDraft] = React.useState("");
  const firstUnread = messages.findIndex((message) => message.unread);
  const unreadCount = messages.filter((message) => message.unread).length;

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [
      ...current.map((message) => ({ ...message, unread: false })),
      { id: current.length + 1, from: "customer", text, time: "Now", day: "Today" },
    ]);
    setDraft("");
  };

  return (
    <section
      aria-labelledby="separator-10-heading"
      className="flex w-full max-w-sm flex-col rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-3 px-4 py-3">
        <span aria-hidden="true" className="size-2 rounded-full bg-success" />
        <div className="min-w-0">
          <h3 id="separator-10-heading" className="text-sm font-medium">
            Billing support
          </h3>
          <p className="text-xs text-muted-foreground">
            Jordan from Acme usually replies in minutes
          </p>
        </div>
      </header>
      <Separator />

      <ol aria-label="Conversation" className="flex flex-col gap-3 p-4">
        {messages.map((message, index) => {
          const showDay = index === 0 || messages[index - 1].day !== message.day;
          const isCustomer = message.from === "customer";
          return (
            <React.Fragment key={message.id}>
              {showDay ? <DayDivider label={message.day} /> : null}
              {index === firstUnread ? (
                <UnreadDivider count={unreadCount} />
              ) : null}
              <li
                className={
                  isCustomer
                    ? "flex flex-col items-end gap-1"
                    : "flex flex-col items-start gap-1"
                }
              >
                <p
                  className={
                    isCustomer
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm"
                  }
                >
                  <span className="sr-only">
                    {isCustomer ? "You said: " : "Jordan said: "}
                  </span>
                  {message.text}
                </p>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {message.time}
                </span>
              </li>
            </React.Fragment>
          );
        })}
      </ol>

      <Separator />
      <form onSubmit={send} className="flex items-center gap-2 p-3">
        <Input
          aria-label="Reply to billing support"
          placeholder="Write a reply..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" size="icon" disabled={!draft.trim()}>
          <SendHorizontal aria-hidden="true" />
          <span className="sr-only">Send reply</span>
        </Button>
      </form>
    </section>
  );
}
