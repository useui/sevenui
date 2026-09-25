"use client";

import { CheckCheck } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Kbd } from "@/registry/base/ui/kbd";

type Notification = {
  id: string;
  initials: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  unread: boolean;
};

const initialNotifications: Notification[] = [
  {
    id: "n1",
    initials: "PR",
    actor: "Priya Raman",
    action: "requested your review on",
    target: "Checkout redesign",
    time: "4m",
    unread: true,
  },
  {
    id: "n2",
    initials: "DK",
    actor: "Daniel Kim",
    action: "mentioned you in",
    target: "Q4 pricing experiment",
    time: "22m",
    unread: true,
  },
  {
    id: "n3",
    initials: "SO",
    actor: "Sara Okafor",
    action: "assigned you",
    target: "Fix VAT rounding on invoices",
    time: "1h",
    unread: true,
  },
  {
    id: "n4",
    initials: "ML",
    actor: "Marco Lenz",
    action: "resolved your comment on",
    target: "Onboarding checklist",
    time: "3h",
    unread: false,
  },
  {
    id: "n5",
    initials: "AB",
    actor: "Ava Brooks",
    action: "invited you to",
    target: "Growth team workspace",
    time: "Yesterday",
    unread: false,
  },
];

const hints = [
  { keys: ["J", "K"], label: "Move" },
  { keys: ["E"], label: "Done" },
  { keys: ["S"], label: "Snooze" },
  { keys: ["U"], label: "Read / unread" },
];

export default function Kbd12() {
  const [items, setItems] = React.useState(initialNotifications);
  const [active, setActive] = React.useState(0);
  const [cleared, setCleared] = React.useState({ done: 0, snoozed: 0 });
  const [status, setStatus] = React.useState("");
  const rowRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const unreadCount = items.filter((n) => n.unread).length;

  function focusRow(index: number) {
    const next = Math.max(0, Math.min(items.length - 1, index));
    setActive(next);
    rowRefs.current[next]?.focus();
  }

  function clear(kind: "done" | "snoozed") {
    const item = items[active];
    if (!item) return;
    const remaining = items.filter((n) => n.id !== item.id);
    setItems(remaining);
    setCleared((c) => ({ ...c, [kind]: c[kind] + 1 }));
    setStatus(
      kind === "done"
        ? `Marked “${item.target}” as done`
        : `Snoozed “${item.target}” until tomorrow`,
    );
    const next = Math.min(active, remaining.length - 1);
    setActive(Math.max(0, next));
    requestAnimationFrame(() => rowRefs.current[Math.max(0, next)]?.focus());
  }

  function reset() {
    setItems(initialNotifications);
    setActive(0);
    setCleared({ done: 0, snoozed: 0 });
    setStatus("Notifications restored");
    requestAnimationFrame(() => rowRefs.current[0]?.focus());
  }

  function toggleRead() {
    const item = items[active];
    if (!item) return;
    setItems((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: !n.unread } : n)),
    );
    setStatus(item.unread ? "Marked as read" : "Marked as unread");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "j" || key === "arrowdown") focusRow(active + 1);
    else if (key === "k" || key === "arrowup") focusRow(active - 1);
    else if (key === "e") clear("done");
    else if (key === "s") clear("snoozed");
    else if (key === "u") toggleRead();
    else return;
    event.preventDefault();
  }

  return (
    <section
      aria-labelledby="kbd-12-title"
      className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h3 id="kbd-12-title" className="text-sm font-semibold">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[0.7rem] font-medium text-primary-foreground tabular-nums">
              {unreadCount}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </h3>
        <p className="text-xs text-muted-foreground tabular-nums">
          {cleared.done} done · {cleared.snoozed} snoozed
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <CheckCheck
            aria-hidden="true"
            className="size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">You’re all caught up</p>
          <p className="text-xs text-muted-foreground">
            New mentions and review requests will land here.
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={reset}>
            Restore notifications
          </Button>
        </div>
      ) : (
        <div
          role="listbox"
          aria-label="Notifications. Use J and K to move, E to mark done, S to snooze, U to toggle read."
          onKeyDown={handleKeyDown}
          className="flex flex-col py-1"
        >
          {items.map((item, index) => {
            const isActive = index === active;
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: the listbox handles J, K, E, S, and U
              <div
                key={item.id}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                role="option"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(index)}
                className={
                  isActive
                    ? "group relative flex cursor-default items-start gap-3 bg-accent px-4 py-3 text-accent-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                    : "group relative flex cursor-default items-start gap-3 px-4 py-3 outline-none hover:bg-muted/40"
                }
              >
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      item.unread
                        ? "text-sm leading-snug"
                        : "text-sm leading-snug text-muted-foreground"
                    }
                  >
                    <span className="font-medium text-foreground">
                      {item.actor}
                    </span>{" "}
                    {item.action}{" "}
                    <span className="font-medium text-foreground">
                      {item.target}
                    </span>
                  </p>
                  <div className="mt-1 flex h-5 items-center gap-2 text-xs text-muted-foreground">
                    <span className="tabular-nums">{item.time}</span>
                    {isActive && (
                      <span
                        className="flex items-center gap-2"
                        aria-hidden="true"
                      >
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Kbd className="bg-background">E</Kbd> Done
                        </span>
                        <span className="flex items-center gap-1">
                          <Kbd className="bg-background">S</Kbd> Snooze
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                {item.unread && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                    <span className="sr-only">Unread</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p role="status" className="sr-only">
        {status}
      </p>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
        {hints.map((hint) => (
          <span key={hint.label} className="flex items-center gap-1.5">
            <span className="flex gap-1">
              {hint.keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </span>
            {hint.label}
          </span>
        ))}
      </footer>
    </section>
  );
}
