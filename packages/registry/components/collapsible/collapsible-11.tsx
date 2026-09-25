"use client";

import * as React from "react";

import { SendIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Textarea } from "@/registry/base/ui/textarea";

type Message = {
  id: string;
  author: string;
  initials: string;
  staff?: boolean;
  time: string;
  body: string;
};

const thread: Message[] = [
  {
    id: "m1",
    author: "Olivia Bennett",
    initials: "OB",
    time: "Mon 9:12 AM",
    body: "Our March invoice charged us for 12 seats, but we removed four people on March 3. Can you correct the amount?",
  },
  {
    id: "m2",
    author: "Marcus from Support",
    initials: "MS",
    staff: true,
    time: "Mon 10:40 AM",
    body: "Thanks Olivia. I can see the seat change on March 3. Could you confirm the workspace ID so I can pull the billing log?",
  },
  {
    id: "m3",
    author: "Olivia Bennett",
    initials: "OB",
    time: "Mon 11:02 AM",
    body: "Sure, it is ws_48213. The four removed users were all on the design team.",
  },
  {
    id: "m4",
    author: "Marcus from Support",
    initials: "MS",
    staff: true,
    time: "Tue 8:30 AM",
    body: "Found it. The seats were removed after the invoice was generated, so they were billed for the full month. I have escalated this to billing.",
  },
  {
    id: "m5",
    author: "Olivia Bennett",
    initials: "OB",
    time: "Tue 8:47 AM",
    body: "Appreciate it. Will the credit show up on this invoice or the next one?",
  },
  {
    id: "m6",
    author: "Marcus from Support",
    initials: "MS",
    staff: true,
    time: "Today 2:15 PM",
    body: "Billing approved a prorated credit of $213.33. It is applied to your April invoice, and you will get an updated receipt by email.",
  },
];

function MessageRow({ message }: { message: Message }) {
  return (
    <li className="flex gap-3 px-4 py-3">
      <Avatar size="sm">
        <AvatarFallback>{message.initials}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium">{message.author}</span>
          {message.staff && <Badge variant="secondary">Staff</Badge>}
          <span className="text-xs text-muted-foreground">{message.time}</span>
        </div>
        <p className="text-sm text-pretty text-foreground/90">{message.body}</p>
      </div>
    </li>
  );
}

export default function Collapsible11() {
  const [open, setOpen] = React.useState(false);
  const [replies, setReplies] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState("");
  const first = thread[0];
  const hidden = thread.slice(1, -2);
  const recent = [...thread.slice(-2), ...replies];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setReplies((current) => [
      ...current,
      {
        id: `reply-${current.length + 1}`,
        author: "Olivia Bennett",
        initials: "OB",
        time: "Just now",
        body,
      },
    ]);
    setDraft("");
  }

  return (
    <section
      aria-labelledby="collapsible-11-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <h3 id="collapsible-11-title" className="text-sm font-semibold">
          Incorrect seat count on March invoice
        </h3>
        <Badge variant="outline">Ticket 4821 · Open</Badge>
      </header>

      <Collapsible open={open} onOpenChange={setOpen}>
        <ul className="flex flex-col">
          <MessageRow message={first} />
        </ul>
        <div className="relative px-4 py-1">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 border-t border-dashed"
          />
          <CollapsibleTrigger className="relative mx-auto flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
            <span className="flex -space-x-1" aria-hidden="true">
              {["OB", "MS"].map((initials) => (
                <span
                  key={initials}
                  className="flex size-4 items-center justify-center rounded-full bg-muted text-[0.55rem] ring-2 ring-background"
                >
                  {initials[0]}
                </span>
              ))}
            </span>
            {open
              ? "Hide earlier messages"
              : `Show ${hidden.length} earlier messages`}
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <ul className="flex flex-col">
            {hidden.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
          </ul>
        </CollapsibleContent>
        <ul className="flex flex-col">
          {recent.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </ul>
      </Collapsible>

      <form
        className="flex flex-col gap-2 border-t p-3"
        onSubmit={handleSubmit}
      >
        <label htmlFor="collapsible-11-reply" className="sr-only">
          Reply to Marcus
        </label>
        <Textarea
          id="collapsible-11-reply"
          placeholder="Write a reply…"
          className="min-h-16"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!draft.trim()}>
            <SendIcon aria-hidden="true" data-icon="inline-start" />
            Send reply
          </Button>
        </div>
      </form>
    </section>
  );
}
