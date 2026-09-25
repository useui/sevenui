"use client";

import * as React from "react";
import {
  CheckIcon,
  CopyIcon,
  RotateCcwIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";

import {
  Bubble,
  BubbleContent,
  BubbleReactions,
} from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";

const initialMessages = [
  {
    id: "s1",
    mine: false,
    text: "Wi-Fi password for the studio is on the fridge.",
  },
  { id: "s2", mine: false, text: "Door code is 4471, it changes Friday." },
  { id: "s3", mine: true, text: "Got it. Parking is behind the bakery?" },
  { id: "s4", mine: false, text: "Yes, spots 12 and 14 are ours." },
];

export default function Bubble05() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [selected, setSelected] = React.useState<string[]>(["s2"]);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  function clearSelection() {
    setCopied(false);
    setSelected([]);
  }

  function toggle(id: string) {
    setCopied(false);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function copySelected() {
    const text = messages
      .filter((message) => selected.includes(message.id))
      .map((message) => message.text)
      .join("\n");
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
  }

  function deleteSelected() {
    setMessages((current) =>
      current.filter((message) => !selected.includes(message.id)),
    );
    clearSelection();
  }

  function restoreMessages() {
    setMessages(initialMessages);
    clearSelection();
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div
        role="toolbar"
        aria-label="Selected messages"
        className="flex h-10 items-center gap-1 rounded-xl border bg-card px-2"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Clear selection"
          disabled={selected.length === 0}
          onClick={clearSelection}
        >
          <XIcon aria-hidden="true" />
        </Button>
        <span aria-live="polite" className="mr-auto text-sm tabular-nums">
          {copied
            ? "Copied to clipboard"
            : selected.length === 0
              ? "Tap messages to select"
              : `${selected.length} selected`}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Copy selected messages"
          disabled={selected.length === 0}
          onClick={copySelected}
        >
          <CopyIcon aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete selected messages"
          disabled={selected.length === 0}
          onClick={deleteSelected}
          className="text-destructive hover:text-destructive"
        >
          <Trash2Icon aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <p>No messages left in this thread.</p>
            <Button variant="outline" size="xs" onClick={restoreMessages}>
              <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
              Restore messages
            </Button>
          </div>
        ) : (
          messages.map((message) => {
            const isSelected = selected.includes(message.id);
            return (
              <Bubble
                key={message.id}
                variant={message.mine ? "default" : "muted"}
                align={message.mine ? "end" : "start"}
              >
                <BubbleContent
                  render={<button type="button" />}
                  aria-pressed={isSelected}
                  onClick={() => toggle(message.id)}
                  className={cn(
                    "ring-offset-2 ring-offset-background",
                    isSelected && "ring-2 ring-primary",
                  )}
                >
                  {message.text}
                </BubbleContent>
                {isSelected ? (
                  <BubbleReactions
                    side="top"
                    align={message.mine ? "start" : "end"}
                    className="size-5 bg-primary p-0 text-primary-foreground ring-background"
                  >
                    <CheckIcon aria-hidden="true" className="size-3" />
                  </BubbleReactions>
                ) : null}
              </Bubble>
            );
          })
        )}
      </div>
    </div>
  );
}
