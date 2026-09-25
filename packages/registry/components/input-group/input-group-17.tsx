"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpIcon, FileTextIcon, PaperclipIcon, XIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/base/ui/input-group";

type Message = {
  id: number;
  from: "agent" | "customer";
  text: string;
  attachment?: string;
};

const MAX_LENGTH = 500;

const initialMessages: Message[] = [
  {
    id: 1,
    from: "agent",
    text: "Hi Maya, I'm Daniel from billing. I can see the duplicate charge on September 14. Could you share the invoice so I can start the refund?",
  },
];

export default function InputGroup17() {
  const inputId = useId();
  const counterId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);

  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the thread grows
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length, agentTyping]);

  const remaining = MAX_LENGTH - draft.length;
  const canSend = draft.trim().length > 0 || attachment !== null;

  function send() {
    if (!canSend) return;
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        from: "customer",
        text: draft.trim(),
        attachment: attachment ?? undefined,
      },
    ]);
    setDraft("");
    setAttachment(null);
    setAgentTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setAgentTyping(false);
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          from: "agent",
          text: "Thanks, got it. The $49.00 refund is on its way and should reach your card in 3–5 business days.",
        },
      ]);
    }, 1400);
  }

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Avatar className="size-8">
          <AvatarImage src="/placeholder.svg" alt="" />
          <AvatarFallback className="text-xs">DO</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Daniel Ortiz</h3>
          <p className="text-xs text-muted-foreground">
            Billing support · replies in about 2 min
          </p>
        </div>
      </div>

      <ol
        ref={listRef}
        aria-label="Conversation"
        className="flex max-h-72 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.from === "customer"
                ? "ml-auto flex max-w-[85%] flex-col items-end gap-1.5"
                : "mr-auto flex max-w-[85%] flex-col items-start gap-1.5"
            }
          >
            <span className="sr-only">
              {message.from === "customer" ? "You said:" : "Daniel said:"}
            </span>
            {message.text ? (
              <p
                className={
                  message.from === "customer"
                    ? "rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm"
                }
              >
                {message.text}
              </p>
            ) : null}
            {message.attachment ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs">
                <FileTextIcon aria-hidden="true" className="size-3.5 text-muted-foreground" />
                {message.attachment}
              </span>
            ) : null}
          </li>
        ))}
        {agentTyping ? (
          <li className="mr-auto rounded-2xl rounded-bl-md bg-muted px-3 py-2.5">
            <span className="sr-only">Daniel is typing</span>
            <span aria-hidden="true" className="flex gap-1">
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground" />
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
            </span>
          </li>
        ) : null}
      </ol>

      <form
        className="border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Message Daniel
        </label>
        <InputGroup>
          <InputGroupTextarea
            id={inputId}
            value={draft}
            rows={2}
            maxLength={MAX_LENGTH}
            placeholder="Write a reply…"
            aria-describedby={counterId}
            className="max-h-32 min-h-14"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <InputGroupAddon align="block-end" className="gap-1">
            {attachment ? (
              <span className="inline-flex h-6 min-w-0 items-center gap-1 rounded-md bg-muted pr-0.5 pl-2 text-xs text-foreground">
                <FileTextIcon aria-hidden="true" className="size-3 shrink-0" />
                <span className="truncate">{attachment}</span>
                <InputGroupButton
                  size="icon-xs"
                  className="size-5"
                  aria-label={`Remove ${attachment}`}
                  onClick={() => setAttachment(null)}
                >
                  <XIcon aria-hidden="true" />
                </InputGroupButton>
              </span>
            ) : (
              <InputGroupButton
                size="icon-xs"
                aria-label="Attach invoice"
                onClick={() => setAttachment("invoice-NW-2291.pdf")}
              >
                <PaperclipIcon aria-hidden="true" />
              </InputGroupButton>
            )}
            <InputGroupText
              id={counterId}
              className={
                remaining < 50
                  ? "ml-auto text-xs text-destructive tabular-nums"
                  : "ml-auto text-xs tabular-nums"
              }
            >
              <span className="sr-only">Characters left: </span>
              {remaining}
            </InputGroupText>
            <InputGroupButton
              type="submit"
              size="icon-xs"
              variant="default"
              className="rounded-full"
              disabled={!canSend}
              aria-label="Send message"
            >
              <ArrowUpIcon aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Enter to send, Shift + Enter for a new line.
        </p>
      </form>
    </div>
  );
}
