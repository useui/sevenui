"use client";

import * as React from "react";
import { LockIcon, SendHorizontalIcon } from "lucide-react";
import { cn } from "cn";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/registry/base/ui/message";
import { Textarea } from "@/registry/base/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Mode = "reply" | "note";

type Entry = {
  id: string;
  kind: "customer" | "reply" | "note";
  author: string;
  initials: string;
  text: string;
};

const initialEntries: Entry[] = [
  {
    id: "t1",
    kind: "customer",
    author: "Hannah Brooks",
    initials: "HB",
    text: "I was charged twice for the Pro plan this month. Can you refund the duplicate?",
  },
  {
    id: "t2",
    kind: "note",
    author: "Leo Martin",
    initials: "LM",
    text: "Confirmed in Stripe: two charges 40 seconds apart after a retry. Safe to refund the second one.",
  },
];

// Internal notes reuse the outline bubble with a dashed warning treatment,
// so they never read as something the customer can see.
const noteBubble =
  "*:data-[slot=bubble-content]:border-dashed *:data-[slot=bubble-content]:border-warning *:data-[slot=bubble-content]:bg-warning/10";

export default function Bubble11() {
  const [entries, setEntries] = React.useState(initialEntries);
  const [mode, setMode] = React.useState<Mode>("reply");
  const [draft, setDraft] = React.useState("");
  const nextId = React.useRef(1);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    const id = `new-${nextId.current++}`;
    setEntries((current) => [
      ...current,
      { id, kind: mode, author: "You", initials: "ME", text },
    ]);
    setDraft("");
  }

  const isNote = mode === "note";

  return (
    <section
      aria-labelledby="bubble-11-title"
      className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <h2 id="bubble-11-title" className="text-sm font-medium">
          Duplicate charge on Pro plan
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          Ticket 4821
        </span>
        <Badge variant="secondary" className="ml-auto">
          Open
        </Badge>
      </header>

      <div
        role="log"
        aria-label="Ticket conversation"
        className="flex flex-col gap-4 px-4 py-4"
      >
        {entries.map((entry) => {
          const outgoing = entry.kind !== "customer";
          return (
            <Message key={entry.id} align={outgoing ? "end" : "start"}>
              <MessageAvatar>
                <Avatar size="sm">
                  <AvatarFallback>{entry.initials}</AvatarFallback>
                </Avatar>
              </MessageAvatar>
              <MessageContent className="gap-1">
                <MessageHeader className="gap-1">
                  {entry.author}
                  {entry.kind === "note" ? (
                    <span className="flex items-center gap-1 font-normal">
                      <LockIcon aria-hidden="true" className="size-3" />
                      Internal note
                    </span>
                  ) : null}
                </MessageHeader>
                <Bubble
                  align={outgoing ? "end" : "start"}
                  variant={
                    entry.kind === "customer"
                      ? "muted"
                      : entry.kind === "note"
                        ? "outline"
                        : "default"
                  }
                  className={cn(entry.kind === "note" && noteBubble)}
                >
                  <BubbleContent>{entry.text}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          );
        })}
      </div>

      <form
        className={cn(
          "flex flex-col gap-2 rounded-b-xl border-t p-3 transition-colors",
          isNote && "bg-warning/10",
        )}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <ToggleGroup
          aria-label="Response type"
          variant="outline"
          size="sm"
          spacing={0}
          value={[mode]}
          onValueChange={(value) => {
            const next = value[0] as Mode | undefined;
            if (next) setMode(next);
          }}
        >
          <ToggleGroupItem value="reply">Reply</ToggleGroupItem>
          <ToggleGroupItem value="note">
            <LockIcon aria-hidden="true" data-icon="inline-start" />
            Internal note
          </ToggleGroupItem>
        </ToggleGroup>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            isNote
              ? "Only your team will see this note"
              : "Write a reply to Hannah"
          }
          aria-label={isNote ? "Internal note" : "Reply to Hannah Brooks"}
          className="min-h-16 bg-background dark:bg-background"
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {isNote ? "Hidden from the customer" : "Sent to hannah@brooks.co"}
          </p>
          <Button
            type="submit"
            size="sm"
            variant={isNote ? "outline" : "default"}
            disabled={!draft.trim()}
          >
            {isNote ? (
              <LockIcon aria-hidden="true" data-icon="inline-start" />
            ) : (
              <SendHorizontalIcon aria-hidden="true" data-icon="inline-start" />
            )}
            {isNote ? "Add note" : "Send reply"}
          </Button>
        </div>
      </form>
    </section>
  );
}
