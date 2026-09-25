"use client";

import * as React from "react";
import { LanguagesIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";
import { Switch } from "@/registry/base/ui/switch";

type Line = {
  id: string;
  from: "customer" | "agent";
  time: string;
  original: string;
  translated: string;
};

const lines: Line[] = [
  {
    id: "l1",
    from: "customer",
    time: "09:31",
    original:
      "Hallo, mein Paket wurde als zugestellt markiert, aber es ist nicht angekommen.",
    translated: "Hi, my parcel was marked as delivered, but it never arrived.",
  },
  {
    id: "l2",
    from: "agent",
    time: "09:33",
    original:
      "Das tut mir leid. Ich habe beim Kurier einen Nachforschungsauftrag eröffnet.",
    translated: "I'm sorry about that. I've opened a trace with the courier.",
  },
  {
    id: "l3",
    from: "customer",
    time: "09:34",
    original: "Danke! Kann ich stattdessen eine Rückerstattung bekommen?",
    translated: "Thanks! Can I get a refund instead?",
  },
];

export default function Message07() {
  const [autoTranslate, setAutoTranslate] = React.useState(true);
  const [flipped, setFlipped] = React.useState<string[]>([]);

  function toggleLine(id: string) {
    setFlipped((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <section
      aria-label="Conversation with Lukas Becker"
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <LanguagesIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="truncate">Customer writes in German</span>
        </div>
        <Label className="shrink-0 gap-2 text-xs font-normal text-muted-foreground">
          Auto-translate
          <Switch
            size="sm"
            checked={autoTranslate}
            onCheckedChange={(checked) => {
              setAutoTranslate(checked);
              setFlipped([]);
            }}
          />
        </Label>
      </div>

      {lines.map((line) => {
        const agent = line.from === "agent";
        // Each line can be flipped away from the global setting.
        const showTranslation = autoTranslate !== flipped.includes(line.id);
        return (
          <Message key={line.id} align={agent ? "end" : "start"}>
            {!agent && (
              <MessageAvatar>
                <Avatar className="size-8">
                  <AvatarFallback>LB</AvatarFallback>
                </Avatar>
              </MessageAvatar>
            )}
            <MessageContent className="gap-1.5">
              {!agent && (
                <MessageHeader className="gap-1.5">
                  <span>Lukas Becker</span>
                  <span aria-hidden="true">·</span>
                  <time>{line.time}</time>
                </MessageHeader>
              )}
              <Bubble
                align={agent ? "end" : "start"}
                variant={agent ? "default" : "muted"}
              >
                <BubbleContent lang={showTranslation ? "en" : "de"}>
                  {showTranslation ? line.translated : line.original}
                </BubbleContent>
              </Bubble>
              <MessageFooter className="gap-1 max-sm:flex-col max-sm:items-start max-sm:gap-0 max-sm:group-data-[align=end]/message:items-end">
                <span>
                  {agent
                    ? showTranslation
                      ? `${line.time} · Sent in German`
                      : `${line.time} · What Lukas sees`
                    : showTranslation
                      ? "Translated from German"
                      : "Original"}
                </span>
                <span aria-hidden="true" className="max-sm:hidden">
                  ·
                </span>
                <Button
                  variant="link"
                  size="xs"
                  className="h-auto px-0 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => toggleLine(line.id)}
                >
                  {showTranslation ? "Show original" : "Show translation"}
                </Button>
              </MessageFooter>
            </MessageContent>
          </Message>
        );
      })}
    </section>
  );
}
