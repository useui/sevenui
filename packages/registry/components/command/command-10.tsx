"use client";

import * as React from "react";
import { MessageSquareTextIcon, SendIcon, SlashIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";
import { Kbd } from "@/registry/base/ui/kbd";
import { Textarea } from "@/registry/base/ui/textarea";

type Reply = { value: string; label: string; body: string };
type Topic = { value: string; items: Reply[] };

const customer = { name: "Rosa", order: "40318" };

const topics: Topic[] = [
  {
    value: "Billing",
    items: [
      {
        value: "refund",
        label: "Refund issued",
        body: `Hi ${customer.name}, I've issued a full refund for order no. ${customer.order}. It usually reaches your card within 5–10 business days.`,
      },
      {
        value: "invoice",
        label: "Resend invoice",
        body: `Hi ${customer.name}, I've resent the invoice for order no. ${customer.order} to the email on file. Let me know if it doesn't arrive in the next few minutes.`,
      },
    ],
  },
  {
    value: "Shipping",
    items: [
      {
        value: "tracking",
        label: "Share tracking link",
        body: `Your parcel for order no. ${customer.order} is on its way. You can follow it here: track.example.com/${customer.order}`,
      },
      {
        value: "delay",
        label: "Carrier delay apology",
        body: "Sorry for the wait. The carrier has flagged a regional delay, and we'll cover express shipping on your next order.",
      },
    ],
  },
  {
    value: "Account",
    items: [
      {
        value: "password",
        label: "Password reset steps",
        body: "You can reset your password from Settings → Security → Reset password. The link in the email stays valid for 30 minutes.",
      },
    ],
  },
];

export default function Command10() {
  const [draft, setDraft] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [sent, setSent] = React.useState<{ id: number; text: string }[]>([]);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const caretRef = React.useRef(0);

  React.useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function focusComposer(position: number) {
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(position, position);
    });
  }

  function openReplies() {
    caretRef.current = textareaRef.current?.selectionStart ?? draft.length;
    setQuery("");
    setOpen(true);
  }

  function closeReplies() {
    setOpen(false);
    focusComposer(caretRef.current);
  }

  function insert(reply: Reply) {
    const at = caretRef.current;
    const next = draft.slice(0, at) + reply.body + draft.slice(at);
    setDraft(next);
    setOpen(false);
    focusComposer(at + reply.body.length);
  }

  function send() {
    if (!draft.trim()) return;
    setSent((current) => [
      ...current,
      { id: current.length + 1, text: draft.trim() },
    ]);
    setDraft("");
  }

  return (
    <div className="flex w-full max-w-md flex-col rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <Avatar>
          <AvatarFallback>RG</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Rosa Gallo</p>
          <p className="truncate text-xs text-muted-foreground">
            Order no. {customer.order} · Double charge on checkout
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <p className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
          I was charged twice for my last order. Can you help?
        </p>
        {sent.map((message) => (
          <p
            key={message.id}
            className="ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
          >
            {message.text}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        {open && (
          <Command
            items={topics}
            value={query}
            onValueChange={(next, details) => {
              if (details.reason === "item-press") return;
              setQuery(next);
            }}
            className="rounded-lg! border border-border shadow-sm"
          >
            <CommandInput
              ref={searchRef}
              placeholder="Search saved replies"
              aria-label="Search saved replies"
              onKeyDown={(event) => {
                if (
                  event.key === "Escape" ||
                  (event.key === "Backspace" && query === "")
                ) {
                  event.preventDefault();
                  closeReplies();
                }
              }}
            />
            <CommandList className="max-h-48">
              {(topic: Topic) => (
                <CommandGroup
                  key={topic.value}
                  heading={topic.value}
                  items={topic.items}
                >
                  {(reply: Reply) => (
                    <CommandItem
                      key={reply.value}
                      value={reply}
                      onClick={() => insert(reply)}
                      className="items-start"
                    >
                      <MessageSquareTextIcon
                        className="mt-0.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="flex min-w-0 flex-col">
                        <span>{reply.label}</span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {reply.body}
                        </span>
                      </span>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
            <CommandEmpty>No saved reply matches. Write it by hand.</CommandEmpty>
          </Command>
        )}

        <label htmlFor="command-10-reply" className="sr-only">
          Reply to Rosa
        </label>
        <Textarea
          id="command-10-reply"
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            const at = event.currentTarget.selectionStart;
            const before = draft.slice(0, at);
            if (event.key === "/" && (before === "" || /\s$/.test(before))) {
              event.preventDefault();
              openReplies();
            }
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              send();
            }
          }}
          placeholder="Write a reply. Type / for saved replies"
          className="min-h-20 resize-none"
        />
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={open}
            onClick={() => (open ? closeReplies() : openReplies())}
          >
            <SlashIcon aria-hidden="true" />
            Saved replies
          </Button>
          <div className="flex items-center gap-2">
            <Kbd className="hidden sm:inline-flex">⌘ Enter</Kbd>
            <Button size="sm" onClick={send} disabled={!draft.trim()}>
              <SendIcon aria-hidden="true" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
