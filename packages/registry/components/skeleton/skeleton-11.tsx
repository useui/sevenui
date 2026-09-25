"use client";

import { ChevronUp } from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";

type Message = { id: string; from: "agent" | "customer"; text: string };

const earlier: Message[] = [
  {
    id: "e1",
    from: "customer",
    text: "Hi, my invoice for September shows two charges for the Team plan.",
  },
  {
    id: "e2",
    from: "agent",
    text: "Sorry about that. Could you share the last four digits of the card?",
  },
  { id: "e3", from: "customer", text: "Sure, it ends in 4417." },
];

const recent: Message[] = [
  {
    id: "r1",
    from: "agent",
    text: "Found it. The second charge was a retry that should have been voided.",
  },
  {
    id: "r2",
    from: "agent",
    text: "I've refunded $96.00. It will show on your statement in 3 to 5 days.",
  },
  { id: "r3", from: "customer", text: "Perfect, thanks Leo!" },
];

// Mirrors the shape of the messages about to load: side and rough length.
const placeholders = [
  { id: "p1", side: "customer", size: "h-14 w-56" },
  { id: "p2", side: "agent", size: "h-14 w-52" },
  { id: "p3", side: "customer", size: "h-9 w-36" },
] as const;

function Bubble({ message }: { message: Message }) {
  const mine = message.from === "customer";
  return (
    <li className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
      {mine ? null : (
        <Avatar className="size-6">
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback className="text-[10px]">LK</AvatarFallback>
        </Avatar>
      )}
      <p
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug",
          mine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted",
        )}
      >
        <span className="sr-only">{mine ? "You: " : "Leo: "}</span>
        {message.text}
      </p>
    </li>
  );
}

export default function Skeleton11() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">(
    "idle",
  );

  React.useEffect(() => {
    if (status !== "loading") return;
    const timer = window.setTimeout(() => setStatus("done"), 1300);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <section
      aria-label="Support conversation with Leo from Billing"
      className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Avatar className="size-8">
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback>LK</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight">Leo Kowalski</p>
          <p className="text-xs text-muted-foreground">Billing support</p>
        </div>
      </header>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto p-4">
        {status === "idle" ? (
          <Button
            variant="ghost"
            size="sm"
            className="self-center text-muted-foreground"
            onClick={() => setStatus("loading")}
          >
            <ChevronUp aria-hidden="true" />
            Load earlier messages
          </Button>
        ) : status === "done" ? (
          <p className="self-center text-xs text-muted-foreground">
            Conversation started Tuesday, 9:41 AM
          </p>
        ) : null}

        <p role="status" className="sr-only">
          {status === "loading"
            ? "Loading earlier messages"
            : status === "done"
              ? "Earlier messages loaded"
              : ""}
        </p>

        <ul
          role="log"
          aria-busy={status === "loading"}
          className="flex flex-col gap-3"
        >
          {status === "loading"
            ? placeholders.map((row) => (
                <li
                  key={row.id}
                  aria-hidden="true"
                  className={cn(
                    "flex items-end gap-2",
                    row.side === "customer" && "flex-row-reverse",
                  )}
                >
                  {row.side === "agent" ? (
                    <Skeleton className="size-6 shrink-0 rounded-full" />
                  ) : null}
                  <Skeleton
                    className={cn(
                      "max-w-[80%] rounded-2xl",
                      row.side === "customer"
                        ? "rounded-br-md"
                        : "rounded-bl-md",
                      row.size,
                    )}
                  />
                </li>
              ))
            : null}
          {status === "done"
            ? earlier.map((message) => (
                <Bubble key={message.id} message={message} />
              ))
            : null}
          {recent.map((message) => (
            <Bubble key={message.id} message={message} />
          ))}
        </ul>
      </div>
    </section>
  );
}
