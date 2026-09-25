"use client";

import * as React from "react";
import { AtSignIcon, CornerDownLeftIcon, HashIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

type Mention = {
  id: string;
  author: string;
  initials: string;
  channel: string;
  time: string;
  text: string;
};

const mentions: Mention[] = [
  {
    id: "m1",
    author: "Nina Okafor",
    initials: "NO",
    channel: "launch-plan",
    time: "12m",
    text: "@you can you confirm the pricing page copy is final? Legal signs off at 4pm.",
  },
  {
    id: "m2",
    author: "Tom Becker",
    initials: "TB",
    channel: "infra",
    time: "1h",
    text: "@you the staging database migration is queued behind your PR — ok to rebase?",
  },
  {
    id: "m3",
    author: "Ana Ruiz",
    initials: "AR",
    channel: "design-crit",
    time: "3h",
    text: "Loved the empty state illustrations, @you. Sharing them with the brand team.",
  },
];

export default function Bubble12() {
  const [unread, setUnread] = React.useState<Set<string>>(
    () => new Set(["m1", "m2"]),
  );
  const [replies, setReplies] = React.useState<Record<string, string>>({});
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState("");

  function markRead(id: string) {
    setUnread((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  function sendReply(id: string) {
    const value = draft.trim();
    if (!value) return;
    setReplies((current) => ({ ...current, [id]: value }));
    markRead(id);
    setDraft("");
    setOpenId(null);
  }

  return (
    <section
      aria-labelledby="bubble-12-title"
      className="flex w-full max-w-md flex-col rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <AtSignIcon aria-hidden className="size-4 text-muted-foreground" />
        <h2 id="bubble-12-title" className="text-sm font-medium">
          Mentions
        </h2>
        {unread.size > 0 && (
          <Badge variant="secondary" className="tabular-nums">
            {unread.size} new
          </Badge>
        )}
        <Button
          variant="ghost"
          size="xs"
          className="ml-auto"
          disabled={unread.size === 0}
          onClick={() => setUnread(new Set())}
        >
          Mark all read
        </Button>
      </header>

      <ul className="flex flex-col divide-y">
        {mentions.map((mention) => {
          const isUnread = unread.has(mention.id);
          const reply = replies[mention.id];
          const isOpen = openId === mention.id;
          return (
            <li
              key={mention.id}
              className="flex gap-3 px-4 py-4 data-[unread=true]:bg-muted/40"
              data-unread={isUnread}
            >
              <Avatar size="sm" className="mt-0.5">
                <AvatarFallback>{mention.initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {mention.author}
                  </span>
                  in
                  <span className="inline-flex items-center">
                    <HashIcon aria-hidden className="size-3" />
                    {mention.channel}
                  </span>
                  <span aria-hidden>·</span>
                  <time>{mention.time} ago</time>
                  {isUnread && <span className="sr-only">(unread)</span>}
                </p>
                <Bubble
                  variant={isUnread ? "tinted" : "muted"}
                  className="max-w-full"
                >
                  <BubbleContent className="rounded-2xl rounded-tl-md">
                    {mention.text}
                  </BubbleContent>
                </Bubble>
                {reply && (
                  <Bubble align="end">
                    <BubbleContent className="rounded-2xl rounded-br-md">
                      {reply}
                    </BubbleContent>
                  </Bubble>
                )}
                {isOpen ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      sendReply(mention.id);
                    }}
                  >
                    <InputGroup>
                      <InputGroupInput
                        autoFocus
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") setOpenId(null);
                        }}
                        placeholder={`Reply in #${mention.channel}`}
                        aria-label={`Reply to ${mention.author}`}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="submit"
                          size="icon-xs"
                          aria-label="Send reply"
                        >
                          <CornerDownLeftIcon aria-hidden />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </form>
                ) : (
                  !reply && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setDraft("");
                          setOpenId(mention.id);
                        }}
                      >
                        Reply
                      </Button>
                      {isUnread && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => markRead(mention.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
