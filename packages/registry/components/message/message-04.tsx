"use client";

import * as React from "react";
import { ChevronDownIcon, SendHorizontalIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarGroup } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/registry/base/ui/message";

type Reply = {
  id: string;
  author: string;
  initials: string;
  time: string;
  body: string;
};

const initialReplies: Reply[] = [
  {
    id: "r1",
    author: "Kofi Mensah",
    initials: "KM",
    time: "14:12",
    body: "The migration note under Breaking changes needs the new env var name.",
  },
  {
    id: "r2",
    author: "Lea Fischer",
    initials: "LF",
    time: "14:20",
    body: "Added. I also linked the rollback guide from the top.",
  },
  {
    id: "r3",
    author: "Kofi Mensah",
    initials: "KM",
    time: "14:31",
    body: "Looks good to me. Ship it after the 15:00 freeze lifts.",
  },
];

export default function Message04() {
  const [replies, setReplies] = React.useState(initialReplies);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  const participants = Array.from(
    new Map(replies.map((reply) => [reply.initials, reply])).values(),
  );
  const last = replies[replies.length - 1];

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setReplies((current) => [
      ...current,
      {
        id: `r${current.length + 1}`,
        author: "You",
        initials: "YO",
        time: "Just now",
        body,
      },
    ]);
    setDraft("");
  }

  return (
    <div className="flex w-full max-w-md flex-col">
      <Message>
        <MessageAvatar className="self-start">
          <Avatar className="size-8">
            <AvatarFallback>ID</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent className="gap-1.5">
          <MessageHeader className="gap-1.5">
            <span className="text-foreground">Inês Duarte</span>
            <span aria-hidden="true">·</span>
            <time>14:05</time>
          </MessageHeader>
          <Bubble variant="ghost">
            <BubbleContent>
              Release notes for 4.2 are drafted in the handbook. Please review
              before we publish this afternoon.
            </BubbleContent>
          </Bubble>
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-2 h-auto max-w-full gap-2 py-1 text-left"
                />
              }
            >
              <AvatarGroup>
                {participants.slice(0, 3).map((person) => (
                  <Avatar key={person.initials} size="sm">
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <span className="font-semibold text-primary">
                {replies.length} replies
              </span>
              <span className="min-w-0 truncate text-xs font-normal text-muted-foreground max-sm:hidden">
                Last reply {last.time}
              </span>
              <ChevronDownIcon
                data-icon="inline-end"
                aria-hidden="true"
                className="text-muted-foreground transition-transform group-data-panel-open/button:rotate-180"
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 flex flex-col gap-3 border-l border-border pl-3">
                {replies.map((reply) => (
                  <Message key={reply.id}>
                    <MessageAvatar className="self-start">
                      <Avatar size="sm">
                        <AvatarFallback>{reply.initials}</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent className="gap-0.5">
                      <MessageHeader className="gap-1.5">
                        <span className="text-foreground">{reply.author}</span>
                        <time className="font-normal">{reply.time}</time>
                      </MessageHeader>
                      <Bubble variant="ghost">
                        <BubbleContent>{reply.body}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                ))}
                <form onSubmit={send}>
                  <InputGroup className="h-9">
                    <InputGroupInput
                      aria-label="Reply in thread"
                      placeholder="Reply in thread…"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="submit"
                        size="icon-xs"
                        variant="default"
                        disabled={!draft.trim()}
                        aria-label="Send reply"
                      >
                        <SendHorizontalIcon aria-hidden="true" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </form>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </MessageContent>
      </Message>
    </div>
  );
}
