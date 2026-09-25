"use client";

import * as React from "react";
import { BellOffIcon, MessageSquarePlusIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Kbd } from "@/registry/base/ui/kbd";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";

type MessageData = {
  conversationId: string;
  initials: string;
  channel: string;
};

const toastManager = createToastManager<MessageData>();

type Conversation = {
  id: string;
  customer: string;
  initials: string;
  company: string;
  channel: string;
  preview: string;
  time: string;
  unread: boolean;
};

const initialConversations: Conversation[] = [
  {
    id: "c-2041",
    customer: "Lena Hoffmann",
    initials: "LH",
    company: "Brightline Labs",
    channel: "Live chat",
    preview: "Thanks, the export works again!",
    time: "9:12 AM",
    unread: false,
  },
  {
    id: "c-2043",
    customer: "Marcus Bell",
    initials: "MB",
    company: "Fieldnote",
    channel: "Email",
    preview: "Can we move our renewal call to Friday?",
    time: "8:47 AM",
    unread: false,
  },
];

// Messages that arrive while the demo runs, oldest first.
const incoming = [
  {
    id: "c-2044",
    customer: "Aiko Tanaka",
    initials: "AT",
    company: "Parcel & Co",
    channel: "Live chat",
    preview: "Our checkout is returning a 502 since the last deploy.",
  },
  {
    id: "c-2045",
    customer: "Rafael Souza",
    initials: "RS",
    company: "Tidewater",
    channel: "Email",
    preview: "Is SSO included in the Growth plan or only Enterprise?",
  },
  {
    id: "c-2046",
    customer: "Grace Liu",
    initials: "GL",
    company: "Northwind",
    channel: "Live chat",
    preview: "Could you resend the invoice for September?",
  },
];

function MessageToasts({ onOpen }: { onOpen: (id: string) => void }) {
  const { toasts } = useToastManager<MessageData>();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent className="items-start">
        <Avatar>
          <AvatarFallback className="text-xs">
            {toastItem.data?.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <ToastTitle className="truncate" />
            <ToastDescription className="line-clamp-2" />
          </div>
          <div className="flex items-center gap-2">
            <ToastAction
              render={<Button size="sm" />}
              onClick={() => {
                if (toastItem.data) onOpen(toastItem.data.conversationId);
                toastManager.close(toastItem.id);
              }}
            >
              Reply
            </ToastAction>
            <span className="text-xs text-muted-foreground">
              {toastItem.data?.channel}
            </span>
          </div>
        </div>
        <ToastClose className="-mt-1 -mr-1" />
      </ToastContent>
    </Toast>
  ));
}

export default function Toast15() {
  const [conversations, setConversations] =
    React.useState<Conversation[]>(initialConversations);
  const [nextIndex, setNextIndex] = React.useState(0);
  const [activeId, setActiveId] = React.useState(initialConversations[0].id);
  const [quiet, setQuiet] = React.useState(false);

  const unreadCount = conversations.filter((item) => item.unread).length;
  const active = conversations.find((item) => item.id === activeId);
  const nextMessage = incoming[nextIndex];

  const open = React.useCallback((id: string) => {
    setActiveId(id);
    setConversations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );
  }, []);

  function receive() {
    if (!nextMessage) return;
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    setConversations((current) => [
      { ...nextMessage, time, unread: true },
      ...current,
    ]);
    setNextIndex((index) => index + 1);

    // Focus mode still records the message, it just skips the interruption.
    if (quiet) return;

    toastManager.add({
      id: nextMessage.id,
      title: `${nextMessage.customer} · ${nextMessage.company}`,
      description: nextMessage.preview,
      timeout: 7000,
      data: {
        conversationId: nextMessage.id,
        initials: nextMessage.initials,
        channel: nextMessage.channel,
      },
    });
  }

  return (
    <ToastProvider toastManager={toastManager}>
      <ToastPortal>
        <ToastViewport>
          <MessageToasts onOpen={open} />
        </ToastViewport>
      </ToastPortal>
      <section
        aria-labelledby="toast-15-heading"
        className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 id="toast-15-heading" className="text-sm font-medium">
              Support inbox
            </h3>
            {unreadCount > 0 ? (
              <Badge className="tabular-nums">{unreadCount} unread</Badge>
            ) : null}
          </div>
          <Label className="gap-2 text-xs font-normal text-muted-foreground">
            <BellOffIcon className="size-3.5" aria-hidden="true" />
            Focus mode
            <Switch
              size="sm"
              checked={quiet}
              onCheckedChange={(checked) => setQuiet(checked)}
            />
          </Label>
        </header>

        <ul aria-label="Conversations" className="divide-y divide-border">
          {conversations.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => open(item.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset aria-[current=true]:bg-muted"
                >
                  <Avatar size="sm" className="mt-0.5">
                    <AvatarFallback className="text-[0.625rem]">
                      {item.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={
                          item.unread
                            ? "truncate text-sm font-semibold"
                            : "truncate text-sm font-medium"
                        }
                      >
                        {item.customer}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {item.time}
                      </span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {item.preview}
                    </span>
                  </span>
                  {item.unread ? (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                      <span className="sr-only">Unread</span>
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        <footer className="flex flex-col gap-3 border-t bg-muted/50 px-4 py-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {active
              ? `Viewing ${active.customer} (${active.company}) via ${active.channel.toLowerCase()}.`
              : "Select a conversation."}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!nextMessage}
              onClick={receive}
            >
              <MessageSquarePlusIcon aria-hidden="true" />
              {nextMessage ? "Simulate new message" : "Queue is empty"}
            </Button>
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <Kbd>F6</Kbd> jumps to notifications
            </span>
          </div>
        </footer>
      </section>
    </ToastProvider>
  );
}
