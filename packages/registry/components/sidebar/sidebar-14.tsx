"use client";

import * as React from "react";
import { CheckCircle2Icon, SendHorizontalIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/registry/base/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Status = "open" | "resolved";

type Message = { id: number; from: "customer" | "agent"; text: string; time: string };

type Conversation = {
  id: string;
  customer: string;
  initials: string;
  plan: string;
  subject: string;
  status: Status;
  unread: number;
  messages: Message[];
};

const initialConversations: Conversation[] = [
  {
    id: "c1",
    customer: "Hannah Morris",
    initials: "HM",
    plan: "Pro · since 2024",
    subject: "Charged twice for September",
    status: "open",
    unread: 2,
    messages: [
      { id: 1, from: "customer", text: "Hi! I see two charges of $29 on Sep 1 for the same workspace.", time: "9:41" },
      { id: 2, from: "customer", text: "Card ending 7710, workspace is “Morris Studio”.", time: "9:42" },
    ],
  },
  {
    id: "c2",
    customer: "Kwame Asante",
    initials: "KA",
    plan: "Team · 12 seats",
    subject: "SSO login loops back to sign-in",
    status: "open",
    unread: 1,
    messages: [
      { id: 1, from: "customer", text: "After enabling Okta SSO everyone lands back on the sign-in page.", time: "8:15" },
      { id: 2, from: "agent", text: "Thanks Kwame, can you confirm the ACS URL ends in /sso/callback?", time: "8:22" },
      { id: 3, from: "customer", text: "It ended in /callback only. Fixing now.", time: "8:30" },
    ],
  },
  {
    id: "c3",
    customer: "Lucía Fernández",
    initials: "LF",
    plan: "Free",
    subject: "Export to CSV missing columns",
    status: "open",
    unread: 0,
    messages: [
      { id: 1, from: "customer", text: "The CSV export skips the custom fields I added last week.", time: "Yesterday" },
    ],
  },
  {
    id: "c4",
    customer: "Arjun Mehta",
    initials: "AM",
    plan: "Pro · since 2025",
    subject: "Change billing email",
    status: "resolved",
    unread: 0,
    messages: [
      { id: 1, from: "customer", text: "Please send invoices to finance@mehta.co instead.", time: "Mon" },
      { id: 2, from: "agent", text: "Done! Future invoices go to finance@mehta.co.", time: "Mon" },
    ],
  },
];

export default function Sidebar14() {
  const [conversations, setConversations] = React.useState(initialConversations);
  const [filter, setFilter] = React.useState<Status>("open");
  const [activeId, setActiveId] = React.useState("c1");
  const [draft, setDraft] = React.useState("");

  const listed = conversations.filter((conversation) => conversation.status === filter);
  const active = conversations.find((conversation) => conversation.id === activeId);

  function update(id: string, change: (conversation: Conversation) => Conversation) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? change(conversation) : conversation,
      ),
    );
  }

  function open(id: string) {
    setActiveId(id);
    update(id, (conversation) => ({ ...conversation, unread: 0 }));
  }

  function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!active || !text) return;
    update(active.id, (conversation) => ({
      ...conversation,
      messages: [
        ...conversation.messages,
        { id: conversation.messages.length + 1, from: "agent", text, time: "Now" },
      ],
    }));
    setDraft("");
  }

  function resolve() {
    if (!active) return;
    update(active.id, (conversation) => ({ ...conversation, status: "resolved" }));
    const next = listed.find((conversation) => conversation.id !== active.id);
    if (next) open(next.id);
  }

  return (
    <div className="@container w-full max-w-3xl overflow-hidden rounded-xl border bg-background">
      <SidebarProvider className="min-h-0 flex-col @xl:h-[480px] @xl:flex-row">
        <Sidebar
          collapsible="none"
          role="navigation"
          aria-label="Conversations"
          className="max-h-64 w-full border-b @xl:max-h-none @xl:w-72 @xl:border-r @xl:border-b-0"
        >
          <SidebarHeader className="p-3">
            <ToggleGroup
              aria-label="Conversation status"
              variant="outline"
              size="sm"
              spacing={0}
              value={[filter]}
              onValueChange={(next) => {
                if (next[0]) setFilter(next[0] as Status);
              }}
              className="w-full"
            >
              <ToggleGroupItem value="open" className="flex-1">
                Open
              </ToggleGroupItem>
              <ToggleGroupItem value="resolved" className="flex-1">
                Resolved
              </ToggleGroupItem>
            </ToggleGroup>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup className="pt-0">
              <SidebarGroupContent>
                {listed.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-sidebar-foreground/70">
                    Inbox zero. New conversations will show up here.
                  </p>
                ) : (
                  <SidebarMenu aria-label={`${filter} conversations`} className="gap-0.5">
                    {listed.map((conversation) => {
                      const last = conversation.messages[conversation.messages.length - 1];
                      const isActive = conversation.id === activeId;
                      return (
                        <SidebarMenuItem key={conversation.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            aria-current={isActive ? "page" : undefined}
                            onClick={() => open(conversation.id)}
                            className="h-auto items-start gap-3 py-2.5"
                          >
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs">
                                {conversation.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="grid min-w-0 flex-1 gap-0.5">
                              <span className="flex items-center gap-2">
                                <span
                                  className={
                                    conversation.unread > 0
                                      ? "truncate font-semibold"
                                      : "truncate font-medium"
                                  }
                                >
                                  {conversation.customer}
                                </span>
                                <span className="ml-auto shrink-0 text-xs text-sidebar-foreground/60">
                                  {last.time}
                                </span>
                              </span>
                              <span className="truncate text-xs">{conversation.subject}</span>
                              <span className="flex items-center gap-2">
                                <span className="truncate text-xs text-sidebar-foreground/60">
                                  {last.from === "agent" ? "You: " : ""}
                                  {last.text}
                                </span>
                                {conversation.unread > 0 && (
                                  <span className="ml-auto flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-sidebar-primary px-1 text-[0.625rem] font-medium text-sidebar-primary-foreground tabular-nums">
                                    {conversation.unread}
                                    <span className="sr-only"> unread</span>
                                  </span>
                                )}
                              </span>
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        {active ? (
          <section
            aria-labelledby="sidebar-14-title"
            className="flex min-h-80 min-w-0 flex-1 flex-col"
          >
            <header className="flex items-center gap-3 border-b px-4 py-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 id="sidebar-14-title" className="truncate text-sm font-semibold">
                  {active.subject}
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  {active.customer} · {active.plan}
                </p>
              </div>
              {active.status === "open" ? (
                <Button variant="outline" size="sm" onClick={resolve}>
                  <CheckCircle2Icon aria-hidden="true" />
                  Resolve
                </Button>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">Resolved</span>
              )}
            </header>
            <ol className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite">
              {active.messages.map((message) => (
                <li
                  key={message.id}
                  className={
                    message.from === "agent"
                      ? "ml-auto max-w-[80%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[80%] rounded-lg rounded-bl-sm bg-muted px-3 py-2 text-sm"
                  }
                >
                  <span className="sr-only">
                    {message.from === "agent" ? "You" : active.customer}:{" "}
                  </span>
                  {message.text}
                </li>
              ))}
            </ol>
            <form onSubmit={send} className="flex gap-2 border-t p-3">
              <Input
                aria-label={`Reply to ${active.customer}`}
                placeholder={
                  active.status === "open" ? "Write a reply…" : "Add a follow-up note…"
                }
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="min-w-0"
              />
              <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Send reply">
                <SendHorizontalIcon aria-hidden="true" />
              </Button>
            </form>
          </section>
        ) : null}
      </SidebarProvider>
    </div>
  );
}
