"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "cn";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";

const options = [
  { id: "tue", label: "Tuesday, after the design freeze", votes: 5 },
  { id: "thu", label: "Thursday, with the marketing push", votes: 3 },
  { id: "next", label: "Next Monday, after QA sign-off", votes: 2 },
];

export default function Bubble13() {
  const [vote, setVote] = React.useState<string | null>(null);

  const total = options.reduce((sum, option) => sum + option.votes, 0) + 1;
  const hasVoted = vote !== null;

  return (
    <Message className="w-full max-w-md">
      <MessageAvatar>
        <Avatar>
          <AvatarFallback>PN</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent className="gap-1">
        <MessageHeader className="gap-1">
          Priya Nair
          <span className="font-normal">started a poll</span>
        </MessageHeader>
        <Bubble variant="outline" className="w-full max-w-80">
          <BubbleContent className="flex w-full flex-col gap-3 rounded-2xl p-3">
            <p id="bubble-13-question" className="font-medium">
              When should we ship v2.4 to everyone?
            </p>
            <fieldset
              aria-labelledby="bubble-13-question"
              className="flex min-w-0 flex-col gap-1.5"
            >
              {options.map((option) => {
                const selected = vote === option.id;
                const count = option.votes + (selected ? 1 : 0);
                const share = hasVoted ? Math.round((count / total) * 100) : 0;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    aria-label={
                      hasVoted
                        ? `${option.label}, ${count} votes, ${share}%`
                        : option.label
                    }
                    onClick={() => setVote(option.id)}
                    className={cn(
                      "relative flex min-h-10 items-center gap-2 overflow-hidden rounded-xl border px-3 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                      selected && "border-primary",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      style={{ width: `${share}%` }}
                      className={cn(
                        "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out motion-reduce:transition-none",
                        selected ? "bg-primary/15" : "bg-muted",
                      )}
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative flex size-4 shrink-0 items-center justify-center rounded-full border",
                        selected &&
                          "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {selected ? <CheckIcon className="size-3" /> : null}
                    </span>
                    <span className="relative min-w-0 flex-1">
                      {option.label}
                    </span>
                    {hasVoted ? (
                      <span className="relative text-xs text-muted-foreground tabular-nums">
                        {share}%
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </fieldset>
          </BubbleContent>
        </Bubble>
        <MessageFooter className="gap-2">
          <span aria-live="polite" className="tabular-nums">
            {hasVoted
              ? `${total} votes · you can change your vote`
              : `${total - 1} votes · closes Friday`}
          </span>
          {hasVoted ? (
            <Button
              variant="link"
              size="xs"
              className="h-auto px-0 text-xs text-muted-foreground"
              onClick={() => setVote(null)}
            >
              Retract vote
            </Button>
          ) : null}
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}
