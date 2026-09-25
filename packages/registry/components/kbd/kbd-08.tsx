"use client";

import { SendHorizontal } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { Textarea } from "@/registry/base/ui/textarea";

type Message = { id: number; from: "agent" | "customer"; text: string };

const initialMessages: Message[] = [
  {
    id: 1,
    from: "customer",
    text: "Hi! My March invoice shows two charges for the Team plan.",
  },
  {
    id: 2,
    from: "agent",
    text: "Thanks, Lena. I can see both charges. Let me check what happened.",
  },
];

export default function Kbd08() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [draft, setDraft] = React.useState("");
  const [shiftHeld, setShiftHeld] = React.useState(false);
  const listRef = React.useRef<HTMLOListElement>(null);

  const canSend = draft.trim().length > 0;

  React.useEffect(() => {
    const list = listRef.current;
    if (list && messages.length > 0) {
      list.scrollTop = list.scrollHeight;
    }
  }, [messages]);

  function send() {
    if (!canSend) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, from: "agent", text: draft.trim() },
    ]);
    setDraft("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    setShiftHeld(event.shiftKey);
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <section
      aria-label="Support conversation with Lena Fischer"
      className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar className="size-8">
          <AvatarFallback>LF</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Lena Fischer</p>
          <p className="truncate text-xs text-muted-foreground">
            Billing · Ticket 4821
          </p>
        </div>
      </header>

      <ol
        ref={listRef}
        aria-label="Messages"
        className="flex max-h-56 flex-col gap-2 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.from === "agent"
                ? "ml-8 self-end rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                : "mr-8 self-start rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm"
            }
          >
            <span className="sr-only">
              {message.from === "agent" ? "You: " : "Lena: "}
            </span>
            <span className="whitespace-pre-wrap">{message.text}</span>
          </li>
        ))}
      </ol>

      <form
        className="border-t p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label htmlFor="kbd-08-reply" className="sr-only">
          Reply to Lena
        </label>
        <Textarea
          id="kbd-08-reply"
          value={draft}
          rows={2}
          placeholder="Write a reply…"
          aria-describedby="kbd-08-hint"
          className="max-h-32 resize-none"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={(event) => setShiftHeld(event.shiftKey)}
          onBlur={() => setShiftHeld(false)}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p
            id="kbd-08-hint"
            className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
          >
            <span
              className={
                shiftHeld
                  ? "flex items-center gap-1.5 opacity-50 transition-opacity"
                  : "flex items-center gap-1.5 transition-opacity"
              }
            >
              <Kbd>Enter</Kbd>
              <span>to send</span>
            </span>
            <span
              className={
                shiftHeld
                  ? "flex items-center gap-1.5 text-foreground transition-colors"
                  : "flex items-center gap-1.5 transition-colors"
              }
            >
              <KbdGroup>
                <Kbd
                  className={
                    shiftHeld ? "bg-primary text-primary-foreground" : undefined
                  }
                >
                  Shift
                </Kbd>
                <span aria-hidden="true">+</span>
                <Kbd>Enter</Kbd>
              </KbdGroup>
              <span>for a new line</span>
            </span>
          </p>
          <Button type="submit" size="sm" disabled={!canSend}>
            Send
            <SendHorizontal aria-hidden="true" data-icon="inline-end" />
          </Button>
        </div>
      </form>
    </section>
  );
}
