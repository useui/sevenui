"use client";

import * as React from "react";
import { MessageCircle, Package, SendHorizontal } from "lucide-react";

import { Avatar, AvatarBadge, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/registry/base/ui/message";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";

type ChatMessage = {
  id: number;
  from: "agent" | "customer";
  text: string;
  time: string;
};

const quickReplies = [
  "Where is my package?",
  "Change delivery address",
  "Cancel this order",
];

const agentReplies: Record<string, string> = {
  "Where is my package?":
    "It left our Rotterdam hub this morning. The carrier now expects to deliver it Friday before 6 PM.",
  "Change delivery address":
    "I can still reroute it. Reply with the new address and I'll update the carrier within the hour.",
  "Cancel this order":
    "Since it has shipped, I can start a free return instead. Want me to email you a prepaid label?",
};

const fallbackReply =
  "Thanks, I've added that to your case. I'll follow up here and by email within 15 minutes.";

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    from: "agent",
    text: "Hi Sam, I'm Rita from Northfold support. I can see order #NF-20418 is running a day late. How can I help?",
    time: "10:42",
  },
];

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function Sheet13() {
  const [messages, setMessages] = React.useState(initialMessages);
  const [draft, setDraft] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const replyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the thread grows
  React.useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages.length, typing]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setMessages((list) => [
      ...list,
      {
        id: list.length + 1,
        from: "customer",
        text: trimmed,
        time: nowLabel(),
      },
    ]);
    setDraft("");
    setTyping(true);
    replyTimer.current = setTimeout(() => {
      setMessages((list) => [
        ...list,
        {
          id: list.length + 1,
          from: "agent",
          text: agentReplies[trimmed] ?? fallbackReply,
          time: nowLabel(),
        },
      ]);
      setTyping(false);
    }, 1200);
  };

  const showQuickReplies = messages.length === 1;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Package
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Order #NF-20418</p>
            <Badge variant="outline">Delayed</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Wool overcoat, Charcoal · Expected Thursday
          </p>
        </div>
      </div>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" className="w-full" />}>
          <MessageCircle aria-hidden="true" data-icon="inline-start" />
          Chat with support
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="mx-auto h-[min(36rem,85svh)] w-full max-w-lg gap-0 rounded-t-2xl sm:border-x"
        >
          <SheetHeader className="flex-row items-center gap-3 border-b pr-12">
            <Avatar>
              <AvatarFallback>RP</AvatarFallback>
              <AvatarBadge className="bg-success" />
            </Avatar>
            <div className="grid min-w-0 gap-0.5">
              <SheetTitle>Rita Patel</SheetTitle>
              <SheetDescription className="text-xs">
                Northfold support · Typically replies in 2 min
              </SheetDescription>
            </div>
          </SheetHeader>
          <div
            role="log"
            aria-label="Conversation"
            aria-live="polite"
            className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
          >
            {messages.map((message) =>
              message.from === "agent" ? (
                <Message key={message.id}>
                  <MessageAvatar>
                    <Avatar size="sm">
                      <AvatarFallback>RP</AvatarFallback>
                    </Avatar>
                  </MessageAvatar>
                  <MessageContent>
                    <MessageHeader>Rita · {message.time}</MessageHeader>
                    <Bubble variant="muted">
                      <BubbleContent>{message.text}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              ) : (
                <Message key={message.id} align="end">
                  <MessageContent>
                    <Bubble align="end">
                      <BubbleContent>{message.text}</BubbleContent>
                    </Bubble>
                    <MessageFooter>Sent {message.time}</MessageFooter>
                  </MessageContent>
                </Message>
              ),
            )}
            {typing ? (
              <p className="text-xs text-muted-foreground">Rita is typing…</p>
            ) : null}
            {showQuickReplies ? (
              <div className="flex flex-wrap gap-2 pl-8">
                {quickReplies.map((reply) => (
                  <Button
                    key={reply}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => send(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            ) : null}
            <div ref={endRef} />
          </div>
          <form
            className="flex items-center gap-2 border-t p-3"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <Input
              aria-label="Message Rita"
              placeholder="Write a message…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              disabled={!draft.trim() || typing}
            >
              <SendHorizontal aria-hidden="true" />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
