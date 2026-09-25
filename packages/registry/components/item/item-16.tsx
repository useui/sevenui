"use client";

import * as React from "react";
import {
  InboxIcon,
  MailIcon,
  MessageCircleIcon,
  SearchIcon,
  SmartphoneIcon,
} from "lucide-react";

import { Avatar, AvatarBadge, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Queue = "open" | "snoozed" | "resolved";

const CHANNEL_ICONS = {
  email: MailIcon,
  chat: MessageCircleIcon,
  app: SmartphoneIcon,
};

const CHANNEL_LABELS = {
  email: "Email",
  chat: "Live chat",
  app: "In-app",
};

const CONVERSATIONS: {
  id: string;
  customer: string;
  initials: string;
  channel: keyof typeof CHANNEL_ICONS;
  subject: string;
  preview: string;
  time: string;
  queue: Queue;
  unread: boolean;
  sla?: { label: string; overdue: boolean };
  online?: boolean;
}[] = [
  {
    id: "c-2841",
    customer: "Hannah Weber",
    initials: "HW",
    channel: "chat",
    subject: "Charged twice for the annual plan",
    preview: "I see two $480 charges on my card from this morning.",
    time: "2m",
    queue: "open",
    unread: true,
    sla: { label: "Overdue 4m", overdue: true },
    online: true,
  },
  {
    id: "c-2839",
    customer: "Diego Alvarez",
    initials: "DA",
    channel: "email",
    subject: "SSO login loops back to the sign-in page",
    preview: "Our Okta users get redirected endlessly since yesterday.",
    time: "18m",
    queue: "open",
    unread: true,
    sla: { label: "Due in 12m", overdue: false },
  },
  {
    id: "c-2833",
    customer: "Mei Tanaka",
    initials: "MT",
    channel: "app",
    subject: "How do I export invoices as CSV?",
    preview: "You: Go to Billing, then Invoices, and pick Export.",
    time: "1h",
    queue: "open",
    unread: false,
  },
  {
    id: "c-2820",
    customer: "Samuel Okoro",
    initials: "SO",
    channel: "email",
    subject: "Waiting on legal review of the DPA",
    preview: "We'll get back to you once our counsel signs off.",
    time: "Mon",
    queue: "snoozed",
    unread: false,
  },
  {
    id: "c-2807",
    customer: "Lucia Romano",
    initials: "LR",
    channel: "chat",
    subject: "Seat count after downgrade",
    preview: "Perfect, that answers it. Thanks for the quick help!",
    time: "Sep 22",
    queue: "resolved",
    unread: false,
  },
];

const QUEUES: { value: Queue; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "snoozed", label: "Snoozed" },
  { value: "resolved", label: "Resolved" },
];

export default function Item16() {
  const [queue, setQueue] = React.useState<Queue>("open");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState("c-2839");
  const [read, setRead] = React.useState<string[]>([]);

  const needle = query.trim().toLowerCase();

  function open(id: string) {
    setSelected(id);
    setRead((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="space-y-3 border-b p-3">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Search conversations"
            placeholder="Search by customer or subject"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
      </div>

      <Tabs
        value={queue}
        onValueChange={(value) => setQueue(value as Queue)}
        className="gap-0"
      >
        <TabsList variant="line" className="w-full justify-start border-b px-3">
          {QUEUES.map(({ value, label }) => {
            const count = CONVERSATIONS.filter((c) => c.queue === value).length;
            return (
              <TabsTrigger key={value} value={value} className="flex-none">
                {label}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {QUEUES.map(({ value, label }) => {
          const results = CONVERSATIONS.filter(
            (c) =>
              c.queue === value &&
              (needle === "" ||
                c.customer.toLowerCase().includes(needle) ||
                c.subject.toLowerCase().includes(needle)),
          );

          return (
            <TabsContent key={value} value={value}>
              {results.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <InboxIcon
                    aria-hidden="true"
                    className="size-6 text-muted-foreground"
                  />
                  <p className="text-sm font-medium">No conversations found</p>
                  <p className="text-sm text-muted-foreground">
                    {needle
                      ? `Nothing in ${label.toLowerCase()} matches “${query.trim()}”.`
                      : `Your ${label.toLowerCase()} queue is empty.`}
                  </p>
                </div>
              ) : (
                <ul
                  aria-label={`${label} conversations`}
                  className="flex flex-col gap-0.5 p-1.5"
                >
                  {results.map((conversation) => {
                    const ChannelIcon = CHANNEL_ICONS[conversation.channel];
                    const isUnread =
                      conversation.unread && !read.includes(conversation.id);
                    const isSelected = selected === conversation.id;

                    return (
                      <li key={conversation.id}>
                        <Item
                          size="sm"
                          data-unread={isUnread || undefined}
                          render={
                            <a
                              href={`#${conversation.id}`}
                              aria-current={isSelected ? "true" : undefined}
                              onClick={(event) => {
                                event.preventDefault();
                                open(conversation.id);
                              }}
                            />
                          }
                          className="items-start aria-[current=true]:bg-muted"
                        >
                          <ItemMedia>
                            <Avatar>
                              <AvatarFallback>
                                {conversation.initials}
                              </AvatarFallback>
                              {conversation.online && (
                                <AvatarBadge className="bg-success" />
                              )}
                            </Avatar>
                          </ItemMedia>
                          <ItemContent className="min-w-0 gap-0.5">
                            <ItemHeader className="gap-3">
                              <ItemTitle className="min-w-0 font-normal in-data-unread:font-semibold">
                                <span className="truncate">
                                  {conversation.customer}
                                </span>
                                <ChannelIcon
                                  role="img"
                                  aria-label={
                                    CHANNEL_LABELS[conversation.channel]
                                  }
                                  className="size-3.5 shrink-0 text-muted-foreground"
                                />
                              </ItemTitle>
                              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                                {conversation.time}
                                {isUnread && (
                                  <span
                                    aria-hidden="true"
                                    className="size-2 rounded-full bg-primary"
                                  />
                                )}
                                {isUnread && (
                                  <span className="sr-only">Unread</span>
                                )}
                              </span>
                            </ItemHeader>
                            <p className="truncate text-sm in-data-unread:font-medium">
                              {conversation.subject}
                            </p>
                            <ItemDescription className="line-clamp-1 text-xs">
                              {conversation.preview}
                            </ItemDescription>
                            {conversation.sla && (
                              <Badge
                                variant="outline"
                                data-overdue={
                                  conversation.sla.overdue || undefined
                                }
                                className="mt-1 gap-1.5 data-overdue:border-destructive/40 data-overdue:text-destructive"
                              >
                                <span
                                  aria-hidden="true"
                                  className="size-1.5 rounded-full bg-warning in-data-overdue:bg-destructive"
                                />
                                First reply{" "}
                                {conversation.sla.label.toLowerCase()}
                              </Badge>
                            )}
                          </ItemContent>
                        </Item>
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
