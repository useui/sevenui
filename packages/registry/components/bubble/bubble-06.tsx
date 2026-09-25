"use client";

import * as React from "react";
import {
  HeartIcon,
  LaughIcon,
  type LucideIcon,
  PartyPopperIcon,
  SmilePlusIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { cn } from "cn";

import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

type ReactionKey = "like" | "love" | "celebrate" | "funny";

const reactionIcons: Record<ReactionKey, { icon: LucideIcon; label: string }> =
  {
    like: { icon: ThumbsUpIcon, label: "Like" },
    love: { icon: HeartIcon, label: "Love" },
    celebrate: { icon: PartyPopperIcon, label: "Celebrate" },
    funny: { icon: LaughIcon, label: "Funny" },
  };

type Reaction = { count: number; mine: boolean };

const initialMessages: {
  id: string;
  mine: boolean;
  text: string;
  reactions: Partial<Record<ReactionKey, Reaction>>;
}[] = [
  {
    id: "r1",
    mine: false,
    text: "The new onboarding flow cut drop-off by 18% in the first week.",
    reactions: {
      celebrate: { count: 4, mine: false },
      like: { count: 2, mine: true },
    },
  },
  {
    id: "r2",
    mine: true,
    text: "Huge. Drinks are on me at the offsite.",
    reactions: { funny: { count: 3, mine: false } },
  },
];

export default function Bubble06() {
  const [messages, setMessages] = React.useState(initialMessages);

  function toggleReaction(messageId: string, key: ReactionKey) {
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message;
        const existing = message.reactions[key] ?? { count: 0, mine: false };
        const next: Reaction = existing.mine
          ? { count: existing.count - 1, mine: false }
          : { count: existing.count + 1, mine: true };
        const reactions = { ...message.reactions };
        if (next.count <= 0) delete reactions[key];
        else reactions[key] = next;
        return { ...message, reactions };
      }),
    );
  }

  return (
    <div
      role="log"
      aria-label="Growth team chat"
      className="flex w-full max-w-md flex-col gap-9 pb-4"
    >
      {messages.map((message) => {
        const entries = Object.entries(message.reactions) as [
          ReactionKey,
          Reaction,
        ][];
        return (
          <div
            key={message.id}
            className={cn(
              "flex items-center gap-1",
              message.mine && "flex-row-reverse",
            )}
          >
            <Bubble
              variant={message.mine ? "default" : "muted"}
              align={message.mine ? "end" : "start"}
            >
              <BubbleContent>{message.text}</BubbleContent>
              {entries.length > 0 ? (
                <BubbleReactions
                  align={message.mine ? "start" : "end"}
                  className="gap-0.5 px-0.5"
                >
                  {entries.map(([key, reaction]) => {
                    const { icon: Icon, label } = reactionIcons[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={reaction.mine}
                        aria-label={`${label}, ${reaction.count}`}
                        onClick={() => toggleReaction(message.id, key)}
                        className={cn(
                          "flex h-6 items-center gap-1 rounded-full px-1.5 text-xs tabular-nums transition-colors outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring",
                          reaction.mine &&
                            "bg-primary text-primary-foreground hover:bg-primary/85",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-3.5" />
                        {reaction.count}
                      </button>
                    );
                  })}
                </BubbleReactions>
              ) : null}
            </Bubble>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground"
                    aria-label="Add reaction"
                  />
                }
              >
                <SmilePlusIcon aria-hidden="true" />
              </PopoverTrigger>
              <PopoverContent
                side="top"
                className="w-fit flex-row gap-0.5 rounded-full p-1"
              >
                {(Object.keys(reactionIcons) as ReactionKey[]).map((key) => {
                  const { icon: Icon, label } = reactionIcons[key];
                  return (
                    <Button
                      key={key}
                      variant={
                        message.reactions[key]?.mine ? "secondary" : "ghost"
                      }
                      size="icon-sm"
                      className="rounded-full"
                      aria-label={label}
                      aria-pressed={message.reactions[key]?.mine ?? false}
                      onClick={() => toggleReaction(message.id, key)}
                    >
                      <Icon aria-hidden="true" />
                    </Button>
                  );
                })}
              </PopoverContent>
            </Popover>
          </div>
        );
      })}
    </div>
  );
}
