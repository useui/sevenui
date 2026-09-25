"use client";

import { SendIcon, ZapIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const macros = [
  {
    label: "Refund issued",
    text: "Hi Jordan, I've issued a full refund of $29.00 to your Visa ending in 4242. It usually shows up within 5 to 7 business days.",
  },
  {
    label: "Need order number",
    text: "Hi Jordan, thanks for reaching out. Could you share the order number from your confirmation email so I can look into this?",
  },
  {
    label: "Escalated",
    text: "Hi Jordan, I've passed this to our billing team and marked it urgent. You'll hear back from us within one business day.",
  },
];

type Message = { id: number; from: "customer" | "agent"; body: string };

const initialThread: Message[] = [
  {
    id: 1,
    from: "customer",
    body: "I was charged twice for my March subscription. Can you refund the duplicate payment?",
  },
];

export default function Textarea11() {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [thread, setThread] = useState(initialThread);
  const [reply, setReply] = useState("");

  const canSend = reply.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    setThread((current) => [
      ...current,
      { id: current.length + 1, from: "agent", body: reply.trim() },
    ]);
    setReply("");
  };

  const applyMacro = (text: string) => {
    setReply(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Duplicate charge on March invoice</p>
          <p className="text-xs text-muted-foreground">Ticket 4821 · Jordan Ellis</p>
        </div>
        <Badge variant="secondary">Open</Badge>
      </div>

      <ol aria-label="Conversation" className="flex flex-col gap-3 px-4 py-4">
        {thread.map((message) => (
          <li
            key={message.id}
            className={
              message.from === "agent"
                ? "flex flex-row-reverse items-end gap-2"
                : "flex items-end gap-2"
            }
          >
            <Avatar size="sm">
              <AvatarFallback>
                {message.from === "agent" ? "You" : "JE"}
              </AvatarFallback>
            </Avatar>
            <p
              className={
                message.from === "agent"
                  ? "max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm"
              }
            >
              {message.body}
            </p>
          </li>
        ))}
      </ol>

      <form
        className="flex flex-col gap-2 border-t border-border bg-muted/30 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <fieldset className="flex min-w-0 gap-1.5 overflow-x-auto pb-1">
          <legend className="sr-only">Saved replies</legend>
          {macros.map((macro) => (
            <Button
              key={macro.label}
              type="button"
              variant="outline"
              size="xs"
              className="shrink-0"
              onClick={() => applyMacro(macro.text)}
            >
              <ZapIcon aria-hidden="true" />
              {macro.label}
            </Button>
          ))}
        </fieldset>
        <Label htmlFor={`${id}-reply`} className="sr-only">
          Reply to Jordan
        </Label>
        <Textarea
          ref={textareaRef}
          id={`${id}-reply`}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              send();
            }
          }}
          placeholder="Reply to Jordan…"
          aria-describedby={`${id}-hint`}
          className="max-h-40 min-h-20 bg-background dark:bg-input/30"
        />
        <div className="flex items-center justify-between gap-2">
          <p
            id={`${id}-hint`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>Enter</Kbd>
            </KbdGroup>
            to send
          </p>
          <Button type="submit" size="sm" disabled={!canSend}>
            Send reply
            <SendIcon aria-hidden="true" data-icon="inline-end" />
          </Button>
        </div>
      </form>
    </div>
  );
}
