"use client";

import * as React from "react";
import { cn } from "cn";
import {
  ArrowUpIcon,
  CreditCardIcon,
  KeyRoundIcon,
  MessageCircleIcon,
  PackageIcon,
  XIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

type Message = { id: number; from: "agent" | "user"; text: string };

const agents = [
  { name: "Ines", initials: "IG", image: "/placeholder.svg" },
  { name: "Theo", initials: "TW" },
  { name: "Ravi", initials: "RK", image: "/placeholder.svg" },
];

const topics = [
  {
    icon: PackageIcon,
    label: "Where is my order?",
    reply:
      "Order 40821 shipped yesterday with DHL and is due Thursday. I have sent the tracking link to your inbox.",
  },
  {
    icon: CreditCardIcon,
    label: "Update payment method",
    reply:
      "You can swap cards under Settings → Billing. Your next charge of $24.00 is on October 3.",
  },
  {
    icon: KeyRoundIcon,
    label: "I can't sign in",
    reply:
      "I have sent a one-time sign-in link to j•••@hey.com. It stays valid for 15 minutes.",
  },
];

const orders = [
  { id: "Order 40821", detail: "Trail runner · Size 10", status: "Shipped" },
  { id: "Order 40377", detail: "Rain shell · Slate", status: "Delivered" },
];

const greeting: Message = {
  id: 0,
  from: "agent",
  text: "Hi Jordan! What can we help you with today?",
};

export default function Popover14() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([greeting]);
  const [draft, setDraft] = React.useState("");
  const listRef = React.useRef<HTMLOListElement>(null);
  const nextId = React.useRef(1);

  const started = messages.length > 1;

  React.useEffect(() => {
    const list = listRef.current;
    if (list && messages.length > 1) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function send(text: string, reply?: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMessage: Message = {
      id: nextId.current++,
      from: "user",
      text: trimmed,
    };
    const agentMessage: Message = {
      id: nextId.current++,
      from: "agent",
      text:
        reply ??
        "Thanks, that is with our team now. Ines will reply here, usually within 5 minutes.",
    };
    setMessages((current) => [...current, userMessage, agentMessage]);
    setDraft("");
  }

  return (
    <div className="relative flex h-[30rem] w-full max-w-sm flex-col justify-between rounded-xl border bg-muted/30 p-4">
      <div>
        <h3 className="font-medium text-sm">Your orders</h3>
        <ul className="mt-3 divide-y rounded-lg border bg-background text-sm">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{order.id}</span>
                <span className="block truncate text-muted-foreground text-xs">
                  {order.detail}
                </span>
              </span>
              <span className="shrink-0 text-muted-foreground text-xs">
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                size="icon-lg"
                className="size-11 rounded-full shadow-md"
                aria-label={open ? "Close support chat" : "Open support chat"}
              >
                {open ? (
                  <XIcon aria-hidden="true" />
                ) : (
                  <MessageCircleIcon aria-hidden="true" />
                )}
              </Button>
            }
          />
          <PopoverContent
            side="top"
            align="end"
            sideOffset={10}
            className="w-[min(20rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
          >
            <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
              <AvatarGroup>
                {agents.map((agent) => (
                  <Avatar key={agent.name} size="sm">
                    {agent.image ? (
                      <AvatarImage src={agent.image} alt="" />
                    ) : null}
                    <AvatarFallback>{agent.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <div className="min-w-0">
                <PopoverTitle>Trailhead Support</PopoverTitle>
                <PopoverDescription className="flex items-center gap-1.5 text-xs">
                  <span
                    className="size-1.5 rounded-full bg-success"
                    aria-hidden="true"
                  />
                  Online · replies in about 5 min
                </PopoverDescription>
              </div>
            </div>
            <ol
              ref={listRef}
              aria-label="Conversation"
              aria-live="polite"
              className="flex max-h-64 min-h-40 flex-col gap-2 overflow-y-auto px-4 py-3"
            >
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={cn(
                    "flex items-end gap-2",
                    message.from === "user" && "justify-end",
                  )}
                >
                  {message.from === "agent" ? (
                    <Avatar size="sm" className="shrink-0">
                      <AvatarImage src="/placeholder.svg" alt="" />
                      <AvatarFallback>IG</AvatarFallback>
                      <AvatarBadge className="bg-success" />
                    </Avatar>
                  ) : null}
                  <p
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug",
                      message.from === "agent"
                        ? "rounded-bl-sm bg-muted"
                        : "rounded-br-sm bg-primary text-primary-foreground",
                    )}
                  >
                    <span className="sr-only">
                      {message.from === "agent" ? "Ines: " : "You: "}
                    </span>
                    {message.text}
                  </p>
                </li>
              ))}
            </ol>
            {started ? null : (
              <div className="grid gap-1.5 px-4 pb-3">
                {topics.map((topic) => (
                  <Button
                    key={topic.label}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => send(topic.label, topic.reply)}
                  >
                    <topic.icon aria-hidden="true" />
                    {topic.label}
                  </Button>
                ))}
              </div>
            )}
            <form
              className="border-t p-3"
              onSubmit={(event) => {
                event.preventDefault();
                send(draft);
              }}
            >
              <InputGroup>
                <InputGroupInput
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                  aria-label="Message"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    size="icon-xs"
                    variant="default"
                    aria-label="Send message"
                    disabled={!draft.trim()}
                  >
                    <ArrowUpIcon aria-hidden="true" />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
