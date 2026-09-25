"use client";

import { CheckCheckIcon, SendHorizontalIcon } from "lucide-react";
import * as React from "react";

import { cn } from "cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

type Reaction = { emoji: string; label: string; people: string[] };

type Message = {
  id: string;
  from: "agent" | "customer";
  text: string;
  relative: string;
  exact: string;
  iso: string;
  reactions?: Reaction[];
};

const initialMessages: Message[] = [
  {
    id: "m1",
    from: "customer",
    text: "Hi! Our invoice for September shows 14 seats but we only have 12 people.",
    relative: "9:41",
    exact: "Thursday, Sep 24, 2026 at 9:41 AM",
    iso: "2026-09-24T09:41",
  },
  {
    id: "m2",
    from: "agent",
    text: "Thanks Priya. Two invites were still pending on Sep 1, so they were billed. I've credited $36 to your next invoice.",
    relative: "9:44",
    exact: "Thursday, Sep 24, 2026 at 9:44 AM",
    iso: "2026-09-24T09:44",
    reactions: [
      {
        emoji: "🙏",
        label: "thank you",
        people: ["Priya Nair", "Owen Clarke"],
      },
      { emoji: "👍", label: "thumbs up", people: ["Priya Nair"] },
    ],
  },
  {
    id: "m3",
    from: "customer",
    text: "Perfect, that explains it. Can pending invites expire automatically?",
    relative: "9:46",
    exact: "Thursday, Sep 24, 2026 at 9:46 AM",
    iso: "2026-09-24T09:46",
  },
];

function formatNames(people: string[]) {
  if (people.length === 1) return people[0];
  return `${people.slice(0, -1).join(", ")} and ${people.at(-1)}`;
}

export default function Tooltip12() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [draft, setDraft] = React.useState("");

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      {
        id: `m${current.length + 1}`,
        from: "agent",
        text,
        relative: "Now",
        exact: "Thursday, Sep 24, 2026 at 9:47 AM",
        iso: "2026-09-24T09:47",
      },
    ]);
    setDraft("");
  }

  const lastAgentId = [...messages]
    .reverse()
    .find((m) => m.from === "agent")?.id;

  return (
    <TooltipProvider delay={300}>
      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt="" />
            <AvatarFallback>PN</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">Priya Nair</span>
            <span className="truncate text-xs text-muted-foreground">
              Northwind · Billing question
            </span>
          </div>
        </div>

        <ol aria-label="Conversation" className="flex flex-col gap-3 px-4 py-4">
          {messages.map((message) => {
            const mine = message.from === "agent";
            return (
              <li
                key={message.id}
                className={cn(
                  "flex flex-col gap-1",
                  mine ? "items-end" : "items-start",
                )}
              >
                <p
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug",
                    mine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground",
                  )}
                >
                  {message.text}
                </p>
                {message.reactions ? (
                  <div className="flex gap-1">
                    {message.reactions.map((reaction) => (
                      <Tooltip key={reaction.emoji}>
                        <TooltipTrigger
                          aria-label={`${reaction.label}, ${reaction.people.length}: ${formatNames(reaction.people)}`}
                          className="inline-flex h-6 items-center gap-1 rounded-full border border-border bg-background px-2 text-xs tabular-nums outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <span aria-hidden="true">{reaction.emoji}</span>
                          {reaction.people.length}
                        </TooltipTrigger>
                        <TooltipContent>
                          {formatNames(reaction.people)} reacted with{" "}
                          {reaction.label}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger
                      render={<time dateTime={message.iso} />}
                      tabIndex={0}
                      className="rounded-sm tabular-nums outline-none underline-offset-2 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {message.relative}
                    </TooltipTrigger>
                    <TooltipContent side={mine ? "left" : "right"}>
                      {message.exact}
                    </TooltipContent>
                  </Tooltip>
                  {mine && message.id === lastAgentId ? (
                    <Tooltip>
                      <TooltipTrigger
                        aria-label={
                          message.relative === "Now"
                            ? "Delivered"
                            : "Seen by Priya Nair at 9:45 AM"
                        }
                        className="inline-flex rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <CheckCheckIcon
                          className={cn(
                            "size-3.5",
                            message.relative === "Now"
                              ? "text-muted-foreground"
                              : "text-chart-2",
                          )}
                          aria-hidden="true"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        {message.relative === "Now"
                          ? "Delivered · not seen yet"
                          : "Seen by Priya Nair at 9:45 AM"}
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        <form
          onSubmit={send}
          className="flex items-center gap-2 border-t border-border p-3"
        >
          <Input
            aria-label="Reply to Priya"
            placeholder="Write a reply…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send reply"
                  disabled={!draft.trim()}
                />
              }
            >
              <SendHorizontalIcon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>Send reply</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </TooltipProvider>
  );
}
