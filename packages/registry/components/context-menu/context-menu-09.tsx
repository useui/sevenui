"use client";

import {
  Archive,
  AtSign,
  BellOff,
  Clock,
  GitPullRequest,
  MailCheck,
  MailOpen,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type Notice = {
  id: string;
  icon: typeof AtSign;
  title: string;
  detail: string;
  time: string;
  thread: string;
  unread: boolean;
  snoozedUntil?: string;
};

const snoozeOptions = [
  "In 1 hour",
  "This evening",
  "Tomorrow morning",
  "Next week",
];

const initialNotices: Notice[] = [
  {
    id: "n1",
    icon: AtSign,
    title: "Amara mentioned you in Pricing page copy",
    detail: "“Can you confirm the annual discount is still 20%?”",
    time: "4m",
    thread: "Pricing page copy",
    unread: true,
  },
  {
    id: "n2",
    icon: GitPullRequest,
    title: "Review requested on PR 482",
    detail: "fix(billing): prorate seat changes mid-cycle",
    time: "32m",
    thread: "PR 482",
    unread: true,
  },
  {
    id: "n3",
    icon: MessageSquare,
    title: "Theo replied in Onboarding checklist",
    detail: "“Shipped the empty state, screenshots in thread.”",
    time: "2h",
    thread: "Onboarding checklist",
    unread: false,
  },
];

export default function ContextMenu09() {
  const [notices, setNotices] = React.useState(initialNotices);
  const [muted, setMuted] = React.useState<string[]>([]);
  const unreadCount = notices.filter(
    (notice) => notice.unread && !notice.snoozedUntil,
  ).length;

  function patch(id: string, next: Partial<Notice>) {
    setNotices((current) =>
      current.map((notice) =>
        notice.id === id ? { ...notice, ...next } : notice,
      ),
    );
  }

  return (
    <section
      aria-labelledby="context-menu-09-title"
      className="w-full max-w-sm overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-sm"
    >
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h3 id="context-menu-09-title" className="text-sm font-semibold">
          Notifications
          <span className="ml-2 text-xs font-normal whitespace-nowrap text-muted-foreground tabular-nums">
            {unreadCount} unread
          </span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          disabled={unreadCount === 0}
          onClick={() =>
            setNotices((current) =>
              current.map((notice) => ({ ...notice, unread: false })),
            )
          }
        >
          <MailCheck aria-hidden="true" />
          Mark all read
        </Button>
      </header>
      {notices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">You're all caught up.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNotices(initialNotices);
              setMuted([]);
            }}
          >
            <RotateCcw aria-hidden="true" />
            Restore archived
          </Button>
        </div>
      ) : (
        <ul className="divide-y">
          {notices.map((notice) => {
            const Icon = notice.icon;
            const isMuted = muted.includes(notice.thread);
            return (
              <li key={notice.id}>
                <ContextMenu>
                  <ContextMenuTrigger
                    onKeyDown={openMenuWithShiftF10}
                    tabIndex={0}
                    aria-label={`${notice.unread ? "Unread: " : ""}${notice.title}, ${notice.time} ago`}
                    className="flex gap-3 px-4 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset data-popup-open:bg-muted/60"
                  >
                    <span className="relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                      {notice.unread && !notice.snoozedUntil ? (
                        <span
                          aria-hidden="true"
                          className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-popover"
                        />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          notice.unread
                            ? "text-sm font-medium"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {notice.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {notice.detail}
                      </p>
                      {notice.snoozedUntil || isMuted ? (
                        <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                          {notice.snoozedUntil ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock aria-hidden="true" className="size-3" />
                              Snoozed · {notice.snoozedUntil}
                            </span>
                          ) : null}
                          {isMuted ? (
                            <span className="inline-flex items-center gap-1">
                              <BellOff aria-hidden="true" className="size-3" />
                              Thread muted
                            </span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {notice.time}
                    </span>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-56">
                    <ContextMenuItem
                      onClick={() =>
                        patch(notice.id, { unread: !notice.unread })
                      }
                    >
                      {notice.unread ? (
                        <MailCheck aria-hidden="true" />
                      ) : (
                        <MailOpen aria-hidden="true" />
                      )}
                      {notice.unread ? "Mark as read" : "Mark as unread"}
                      <ContextMenuShortcut>U</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <Clock aria-hidden="true" />
                        Snooze
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-44">
                        {snoozeOptions.map((option) => (
                          <ContextMenuItem
                            key={option}
                            onClick={() =>
                              patch(notice.id, { snoozedUntil: option })
                            }
                          >
                            {option}
                          </ContextMenuItem>
                        ))}
                        {notice.snoozedUntil ? (
                          <>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              onClick={() =>
                                patch(notice.id, { snoozedUntil: undefined })
                              }
                            >
                              Unsnooze
                            </ContextMenuItem>
                          </>
                        ) : null}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuCheckboxItem
                      checked={isMuted}
                      onCheckedChange={(checked) =>
                        setMuted((current) =>
                          checked
                            ? [...current, notice.thread]
                            : current.filter((t) => t !== notice.thread),
                        )
                      }
                    >
                      <BellOff aria-hidden="true" />
                      Mute this thread
                    </ContextMenuCheckboxItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() =>
                        setNotices((current) =>
                          current.filter((item) => item.id !== notice.id),
                        )
                      }
                    >
                      <Archive aria-hidden="true" />
                      Archive
                      <ContextMenuShortcut>E</ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
