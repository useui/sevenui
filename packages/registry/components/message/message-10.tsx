"use client";

import * as React from "react";
import {
  ChevronLeft,
  Heart,
  Phone,
  PhoneOff,
  SendHorizontal,
} from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/registry/base/ui/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
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
  MessageFooter,
  MessageGroup,
} from "@/registry/base/ui/message";

type Line = { id: string; from: "leo" | "you"; text: string };

const seed: Line[] = [
  { id: "l1", from: "leo", text: "Landed! Grabbing my bag now." },
  { id: "l2", from: "leo", text: "Which exit are you parked at?" },
  { id: "l3", from: "you", text: "Arrivals, door 4. Grey hatchback." },
  { id: "l4", from: "leo", text: "Perfect, see you in 10 minutes" },
];

export default function Message10() {
  const [lines, setLines] = React.useState(seed);
  const [draft, setDraft] = React.useState("");
  const [liked, setLiked] = React.useState(false);
  const [calling, setCalling] = React.useState(false);
  const [inbox, setInbox] = React.useState(false);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const log = logRef.current;
    if (log && lines.length > seed.length) log.scrollTop = log.scrollHeight;
  }, [lines.length]);

  const send = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setLines((prev) => [
      ...prev,
      { id: `l${prev.length + 1}`, from: "you", text },
    ]);
    setDraft("");
  };

  // Consecutive lines from the same sender share one row.
  const groups = lines.reduce<Line[][]>((acc, line) => {
    const last = acc[acc.length - 1];
    if (last && last[0].from === line.from) last.push(line);
    else acc.push([line]);
    return acc;
  }, []);
  const lastLeoId = [...lines].reverse().find((l) => l.from === "leo")?.id;

  const lastLine = lines[lines.length - 1];

  if (inbox) {
    return (
      <div className="flex h-[30rem] w-full max-w-xs flex-col overflow-hidden rounded-[2rem] border-4 border-muted bg-background shadow-lg">
        <header className="border-b px-4 py-3">
          <p className="text-sm font-medium">Chats</p>
        </header>
        <div className="p-2">
          <button
            type="button"
            onClick={() => setInbox(false)}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Avatar size="sm">
              <AvatarFallback>LB</AvatarFallback>
              <AvatarBadge className="bg-success" />
            </Avatar>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium">
                Leo Brandt
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {lastLine.from === "you" ? "You: " : ""}
                {lastLine.text}
              </span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[30rem] w-full max-w-xs flex-col overflow-hidden rounded-[2rem] border-4 border-muted bg-background shadow-lg">
      <header className="flex items-center gap-2 border-b px-2 py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back to chats"
          onClick={() => {
            setCalling(false);
            setInbox(true);
          }}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Avatar size="sm">
          <AvatarFallback>LB</AvatarFallback>
          <AvatarBadge className="bg-success" />
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">Leo Brandt</p>
          <p
            aria-live="polite"
            className={
              calling ? "text-xs text-success" : "text-xs text-muted-foreground"
            }
          >
            {calling ? "Calling…" : "Online"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={calling ? "End call" : "Call Leo"}
          aria-pressed={calling}
          className={
            calling ? "text-destructive hover:text-destructive" : undefined
          }
          onClick={() => setCalling(!calling)}
        >
          {calling ? (
            <PhoneOff aria-hidden="true" />
          ) : (
            <Phone aria-hidden="true" />
          )}
        </Button>
      </header>

      <div
        ref={logRef}
        role="log"
        aria-label="Conversation with Leo Brandt"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4"
      >
        <p className="text-center text-xs text-muted-foreground">Today 18:47</p>
        {groups.map((group) => {
          const mine = group[0].from === "you";
          return (
            <Message key={group[0].id} align={mine ? "end" : "start"}>
              {mine ? null : (
                <MessageAvatar>
                  <Avatar size="sm">
                    <AvatarFallback>LB</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
              )}
              <MessageContent>
                <MessageGroup className="gap-1">
                  {group.map((line) => {
                    const reactable = line.id === lastLeoId;
                    return (
                      <Bubble
                        key={line.id}
                        variant={mine ? "default" : "muted"}
                        align={mine ? "end" : "start"}
                        className={reactable && liked ? "mb-3" : undefined}
                      >
                        <BubbleContent
                          render={
                            reactable ? (
                              <button
                                type="button"
                                aria-pressed={liked}
                                onDoubleClick={() => setLiked(true)}
                                onClick={(event) => {
                                  if (event.detail === 0) setLiked(!liked);
                                }}
                                aria-label={`${line.text}. Press Enter to ${
                                  liked ? "remove" : "add"
                                } a heart.`}
                              />
                            ) : undefined
                          }
                        >
                          {line.text}
                        </BubbleContent>
                        {reactable && liked ? (
                          <BubbleReactions align="start">
                            <button
                              type="button"
                              onClick={() => setLiked(false)}
                              aria-label="Remove heart reaction"
                              className="flex items-center rounded-full px-1.5 py-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                            >
                              <Heart
                                aria-hidden="true"
                                className="size-3.5 fill-destructive text-destructive"
                              />
                            </button>
                          </BubbleReactions>
                        ) : null}
                      </Bubble>
                    );
                  })}
                </MessageGroup>
                {mine &&
                group[group.length - 1].id === lines[lines.length - 1].id ? (
                  <MessageFooter>
                    {lines.length > seed.length ? "Delivered" : "Read 18:49"}
                  </MessageFooter>
                ) : null}
              </MessageContent>
            </Message>
          );
        })}
        {!liked ? (
          <p className="text-center text-xs text-muted-foreground">
            Double-tap Leo's last message to react
          </p>
        ) : null}
      </div>

      <form onSubmit={send} className="border-t p-2">
        <InputGroup className="h-9 rounded-full">
          <InputGroupInput
            aria-label="Message Leo"
            placeholder="Message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              size="icon-xs"
              variant="default"
              className="rounded-full"
              disabled={!draft.trim()}
              aria-label="Send message"
            >
              <SendHorizontal aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
