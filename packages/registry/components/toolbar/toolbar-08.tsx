"use client";

import { ArchiveIcon, MailOpenIcon, Trash2Icon, Undo2Icon } from "lucide-react";
import { useState } from "react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

type Message = {
  id: string;
  from: string;
  subject: string;
  time: string;
  unread: boolean;
};

const initialMessages: Message[] = [
  {
    id: "msg-2041",
    from: "Stripe",
    subject: "Your payout of $4,812.40 is on its way",
    time: "9:42 AM",
    unread: true,
  },
  {
    id: "msg-2040",
    from: "Priya Raman",
    subject: "Re: Onboarding checklist for the Lisbon team",
    time: "8:15 AM",
    unread: true,
  },
  {
    id: "msg-2039",
    from: "Vercel",
    subject: "Deployment failed on main (build step)",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "msg-2038",
    from: "Marcus Holt",
    subject: "Contract redlines, second pass",
    time: "Mon",
    unread: false,
  },
];

export default function Toolbar08() {
  const [messages, setMessages] = useState(initialMessages);
  const [selected, setSelected] = useState<string[]>([]);
  const [history, setHistory] = useState<{
    snapshot: Message[];
    label: string;
  } | null>(null);

  const count = selected.length;
  const allSelected = messages.length > 0 && count === messages.length;

  function toggle(id: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );
  }

  function apply(label: string, next: Message[]) {
    setHistory({ snapshot: messages, label });
    setMessages(next);
    setSelected([]);
  }

  const noun = count === 1 ? "conversation" : "conversations";

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
      <div className="flex min-h-12 items-center gap-3 border-b px-3 py-2">
        <Checkbox
          aria-label="Select all conversations"
          checked={allSelected}
          indeterminate={count > 0 && !allSelected}
          disabled={messages.length === 0}
          onCheckedChange={(checked) =>
            setSelected(checked ? messages.map((message) => message.id) : [])
          }
        />
        <span className="min-w-0 flex-1 truncate text-sm font-medium tabular-nums">
          {count > 0 ? `${count} selected` : "Inbox"}
        </span>
        <Toolbar
          aria-label="Bulk actions"
          className="border-none p-0 shadow-none"
        >
          <ToolbarGroup aria-label="Change conversations">
            <ToolbarButton
              aria-label={`Archive ${count} ${noun}`}
              disabled={count === 0}
              onClick={() =>
                apply(
                  `${count} ${noun} archived`,
                  messages.filter((message) => !selected.includes(message.id)),
                )
              }
            >
              <ArchiveIcon aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              aria-label={`Mark ${count} ${noun} as read`}
              disabled={count === 0}
              onClick={() =>
                apply(
                  `${count} ${noun} marked as read`,
                  messages.map((message) =>
                    selected.includes(message.id)
                      ? { ...message, unread: false }
                      : message,
                  ),
                )
              }
            >
              <MailOpenIcon aria-hidden="true" />
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarButton
            aria-label={`Delete ${count} ${noun}`}
            disabled={count === 0}
            className="hover:bg-destructive/10 hover:text-destructive"
            onClick={() =>
              apply(
                `${count} ${noun} moved to trash`,
                messages.filter((message) => !selected.includes(message.id)),
              )
            }
          >
            <Trash2Icon aria-hidden="true" />
          </ToolbarButton>
        </Toolbar>
      </div>

      {messages.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Inbox zero. Nothing else needs you today.
        </p>
      ) : (
        <ul className="divide-y">
          {messages.map((message) => {
            const checked = selected.includes(message.id);
            return (
              <li
                key={message.id}
                data-selected={checked || undefined}
                className="flex items-start gap-3 px-3 py-2.5 data-selected:bg-accent/60"
              >
                <Checkbox
                  aria-label={`Select "${message.subject}" from ${message.from}`}
                  checked={checked}
                  onCheckedChange={(value) => toggle(message.id, value)}
                  className="mt-0.5"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={
                        message.unread
                          ? "truncate text-sm font-semibold"
                          : "truncate text-sm text-muted-foreground"
                      }
                    >
                      {message.from}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {message.time}
                    </span>
                  </div>
                  <span
                    className={
                      message.unread
                        ? "truncate text-sm"
                        : "truncate text-sm text-muted-foreground"
                    }
                  >
                    {message.unread ? (
                      <span className="sr-only">Unread: </span>
                    ) : null}
                    {message.subject}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div
        aria-live="polite"
        className="flex min-h-10 items-center justify-between gap-2 border-t bg-muted/40 px-3 text-xs text-muted-foreground"
      >
        {history ? (
          <>
            <span className="truncate">{history.label}</span>
            <button
              type="button"
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={() => {
                setMessages(history.snapshot);
                setHistory(null);
              }}
            >
              <Undo2Icon aria-hidden="true" className="size-3.5" />
              Undo
            </button>
          </>
        ) : (
          <span>
            {messages.filter((message) => message.unread).length} unread
          </span>
        )}
      </div>
    </div>
  );
}
