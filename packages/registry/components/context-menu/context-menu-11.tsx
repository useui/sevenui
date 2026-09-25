"use client";

import {
  CheckCircle2,
  Copy,
  Eye,
  Heart,
  Pin,
  Reply,
  SendHorizontal,
  SmilePlus,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import * as React from "react";

import { cn } from "cn";

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
import { Input } from "@/registry/base/ui/input";

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

type ReactionKey = "thanks" | "love" | "seen";

type ChatMessage = {
  id: string;
  author: "agent" | "customer";
  name: string;
  text: string;
  time: string;
  pinned: boolean;
  reactions: ReactionKey[];
  replyTo?: string;
};

const reactions: { key: ReactionKey; label: string; icon: typeof Heart }[] = [
  { key: "thanks", label: "Thanks", icon: ThumbsUp },
  { key: "love", label: "Love it", icon: Heart },
  { key: "seen", label: "Seen", icon: Eye },
];

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    author: "customer",
    name: "Daniel Ortiz",
    text: "Our invoice for September shows 14 seats but we removed two people on the 12th.",
    time: "10:42",
    pinned: false,
    reactions: [],
  },
  {
    id: "m2",
    author: "agent",
    name: "You",
    text: "Thanks Daniel. Seat removals are prorated on the next invoice, so you'll see a $38.00 credit in October.",
    time: "10:44",
    pinned: false,
    reactions: [],
  },
  {
    id: "m3",
    author: "customer",
    name: "Daniel Ortiz",
    text: "Got it. Can the credit be applied to this invoice instead?",
    time: "10:46",
    pinned: false,
    reactions: [],
  },
];

export default function ContextMenu11() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [replyTo, setReplyTo] = React.useState<ChatMessage | null>(null);
  const [draft, setDraft] = React.useState("");
  const [resolvedId, setResolvedId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Set by "Reply" so the closing menu hands focus to the composer instead
  // of returning it to the message bubble.
  const focusComposer = React.useRef(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(copyTimer.current), []);

  function copy(message: ChatMessage) {
    void navigator.clipboard?.writeText(message.text).catch(() => {});
    setCopiedId(message.id);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedId(null), 1500);
  }

  function patch(id: string, next: Partial<ChatMessage>) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, ...next } : message,
      ),
    );
  }

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      {
        id: `m${current.length + 1}-${Date.now()}`,
        author: "agent",
        name: "You",
        text,
        time: "10:48",
        pinned: false,
        reactions: [],
        replyTo: replyTo?.text,
      },
    ]);
    setDraft("");
    setReplyTo(null);
  }

  const pinned = messages.find((message) => message.pinned);

  return (
    <section
      aria-labelledby="context-menu-11-title"
      className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="border-b px-4 py-3">
        <h3 id="context-menu-11-title" className="text-sm font-semibold">
          Billing question · Daniel Ortiz
        </h3>
        <p className="text-xs text-muted-foreground">
          Right-click a message to reply, react, or pin it.
        </p>
      </header>
      {pinned ? (
        <div className="flex items-start gap-2 border-b bg-muted/50 px-4 py-2 text-xs">
          <Pin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <p className="line-clamp-1 text-muted-foreground">
            <span className="font-medium text-foreground">Pinned: </span>
            {pinned.text}
          </p>
        </div>
      ) : null}
      <ol className="flex flex-col gap-3 p-4" aria-label="Conversation">
        {messages.map((message) => {
          const own = message.author === "agent";
          const resolved = resolvedId === message.id;
          return (
            <li
              key={message.id}
              className={cn(
                "flex flex-col gap-1",
                own ? "items-end" : "items-start",
              )}
            >
              <ContextMenu>
                <ContextMenuTrigger
                  onKeyDown={openMenuWithShiftF10}
                  tabIndex={0}
                  aria-label={`${message.name} at ${message.time}: ${message.text}`}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:ring-2 data-popup-open:ring-ring/40",
                    own
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted",
                    resolved && "ring-1 ring-success",
                  )}
                >
                  {message.replyTo ? (
                    <span
                      className={cn(
                        "mb-1 block truncate border-b pb-1 text-xs",
                        own
                          ? "border-primary-foreground/20 text-primary-foreground/75"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      Replying to “{message.replyTo}”
                    </span>
                  ) : null}
                  {message.text}
                </ContextMenuTrigger>
                <ContextMenuContent
                  className="w-52"
                  finalFocus={() => {
                    if (!focusComposer.current) return true;
                    focusComposer.current = false;
                    return inputRef.current;
                  }}
                >
                  <ContextMenuItem
                    onClick={() => {
                      setReplyTo(message);
                      focusComposer.current = true;
                    }}
                  >
                    <Reply aria-hidden="true" />
                    Reply
                    <ContextMenuShortcut>R</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>
                      <SmilePlus aria-hidden="true" />
                      React
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-40">
                      {reactions.map((reaction) => {
                        const Icon = reaction.icon;
                        return (
                          <ContextMenuCheckboxItem
                            key={reaction.key}
                            checked={message.reactions.includes(reaction.key)}
                            onCheckedChange={(checked) =>
                              patch(message.id, {
                                reactions: checked
                                  ? [...message.reactions, reaction.key]
                                  : message.reactions.filter(
                                      (key) => key !== reaction.key,
                                    ),
                              })
                            }
                          >
                            <Icon aria-hidden="true" />
                            {reaction.label}
                          </ContextMenuCheckboxItem>
                        );
                      })}
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuItem onClick={() => copy(message)}>
                    <Copy aria-hidden="true" />
                    Copy text
                    <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuCheckboxItem
                    checked={message.pinned}
                    onCheckedChange={(checked) =>
                      setMessages((current) =>
                        current.map((item) => ({
                          ...item,
                          pinned: item.id === message.id ? checked : false,
                        })),
                      )
                    }
                  >
                    <Pin aria-hidden="true" />
                    Pin to conversation
                  </ContextMenuCheckboxItem>
                  {own ? (
                    <ContextMenuCheckboxItem
                      checked={resolved}
                      onCheckedChange={(checked) =>
                        setResolvedId(checked ? message.id : null)
                      }
                    >
                      <CheckCircle2 aria-hidden="true" />
                      Mark as solution
                    </ContextMenuCheckboxItem>
                  ) : null}
                  {own ? (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        variant="destructive"
                        onClick={() =>
                          setMessages((current) =>
                            current.filter((item) => item.id !== message.id),
                          )
                        }
                      >
                        <Trash2 aria-hidden="true" />
                        Delete message
                      </ContextMenuItem>
                    </>
                  ) : null}
                </ContextMenuContent>
              </ContextMenu>
              <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                <span>
                  {message.name} · {message.time}
                </span>
                {copiedId === message.id ? (
                  <span role="status" className="font-medium text-foreground">
                    Copied
                  </span>
                ) : null}
                {resolved ? (
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-3 text-success"
                    />
                    Solution
                  </span>
                ) : null}
                {message.reactions.map((key) => {
                  const reaction = reactions.find((item) => item.key === key);
                  if (!reaction) return null;
                  const Icon = reaction.icon;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center rounded-full border bg-background px-1.5 py-0.5"
                    >
                      <Icon aria-label={reaction.label} className="size-3" />
                    </span>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
      <form onSubmit={send} className="mt-auto border-t p-3">
        {replyTo ? (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-xs">
            <Reply aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              Replying to {replyTo.name}: {replyTo.text}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Cancel reply"
              onClick={() => setReplyTo(null)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        ) : null}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            aria-label="Message"
            placeholder="Write a reply…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button type="submit" size="icon" aria-label="Send message">
            <SendHorizontal aria-hidden="true" />
          </Button>
        </div>
      </form>
    </section>
  );
}
