"use client";

import * as React from "react";
import { CornerUpLeftIcon, SendHorizontalIcon, XIcon } from "lucide-react";
import { cn } from "cn";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

type ChatMessage = {
  id: string;
  author: string;
  mine: boolean;
  text: string;
  replyTo?: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "q1",
    author: "Maya Chen",
    mine: false,
    text: "The hotel block closes Friday, so I need a final headcount by Thursday.",
  },
  {
    id: "q2",
    author: "Maya Chen",
    mine: false,
    text: "Also, does anyone need a vegetarian option for the team dinner?",
  },
  {
    id: "q3",
    author: "You",
    mine: true,
    text: "Put me down for vegetarian, please.",
    replyTo: "q2",
  },
];

export default function Bubble03() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [replyTo, setReplyTo] = React.useState<ChatMessage | null>(null);
  const [highlighted, setHighlighted] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const nextId = React.useRef(1);

  React.useEffect(() => {
    if (!highlighted) return;
    const timeout = window.setTimeout(() => setHighlighted(null), 1600);
    return () => window.clearTimeout(timeout);
  }, [highlighted]);

  function startReply(message: ChatMessage) {
    setReplyTo(message);
    inputRef.current?.focus();
  }

  function jumpTo(id: string) {
    document
      .getElementById(`bubble-03-${id}`)
      ?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    setHighlighted(id);
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    const id = `new-${nextId.current++}`;
    setMessages((current) => [
      ...current,
      { id, author: "You", mine: true, text, replyTo: replyTo?.id },
    ]);
    setDraft("");
    setReplyTo(null);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div
        role="log"
        aria-label="Offsite planning"
        className="flex flex-col gap-2"
      >
        {messages.map((message) => {
          const quoted = messages.find((item) => item.id === message.replyTo);
          return (
            <div
              key={message.id}
              className={cn(
                "group flex items-center gap-1",
                message.mine && "flex-row-reverse",
              )}
            >
              <Bubble
                variant={message.mine ? "default" : "muted"}
                align={message.mine ? "end" : "start"}
              >
                <BubbleContent
                  id={`bubble-03-${message.id}`}
                  className={cn(
                    "flex flex-col gap-1.5 transition-shadow",
                    highlighted === message.id &&
                      "ring-2 ring-ring ring-offset-2 ring-offset-background",
                  )}
                >
                  {quoted ? (
                    <button
                      type="button"
                      onClick={() => jumpTo(quoted.id)}
                      aria-label={`Replying to ${quoted.author}: ${quoted.text}. Show original message`}
                      className={cn(
                        "flex flex-col rounded-xl px-2.5 py-1.5 text-left text-xs outline-none focus-visible:ring-2",
                        message.mine
                          ? "bg-primary-foreground/15 hover:bg-primary-foreground/25 focus-visible:ring-primary-foreground"
                          : "bg-background/70 hover:bg-background focus-visible:ring-ring",
                      )}
                    >
                      <span className="font-medium">{quoted.author}</span>
                      <span className="line-clamp-1 opacity-80">
                        {quoted.text}
                      </span>
                    </button>
                  ) : null}
                  <span>{message.text}</span>
                </BubbleContent>
              </Bubble>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Reply to ${message.author}`}
                onClick={() => startReply(message)}
                className="shrink-0 text-muted-foreground sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
              >
                <CornerUpLeftIcon aria-hidden="true" />
              </Button>
            </div>
          );
        })}
      </div>
      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        {replyTo ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs">
            <CornerUpLeftIcon
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">Replying to {replyTo.author}</span>
              <span className="truncate text-muted-foreground">
                {replyTo.text}
              </span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Cancel reply"
              onClick={() => setReplyTo(null)}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </div>
        ) : null}
        <InputGroup>
          <InputGroupInput
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setReplyTo(null);
            }}
            placeholder={replyTo ? "Write a reply" : "Message Maya"}
            aria-label={
              replyTo ? `Reply to ${replyTo.author}` : "Message Maya Chen"
            }
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-xs"
              aria-label="Send message"
              disabled={!draft.trim()}
            >
              <SendHorizontalIcon aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
