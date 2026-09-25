"use client";

import { BuildingIcon, MessageCircleIcon, StarIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

type Customer = {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  plan: "Enterprise" | "Growth" | "Starter";
  mrr: string;
  customerSince: string;
  openTickets: number;
  csat: number;
  tags: string[];
  note?: string;
};

type Conversation = {
  id: string;
  customer: Customer;
  subject: string;
  preview: string;
  waiting: string;
  unread: boolean;
};

const conversations: Conversation[] = [
  {
    id: "c-1",
    customer: {
      id: "cus-lindqvist",
      name: "Ingrid Lindqvist",
      initials: "IL",
      role: "VP Operations",
      company: "Fjord Freight",
      plan: "Enterprise",
      mrr: "$4,800",
      customerSince: "Mar 2023",
      openTickets: 3,
      csat: 4.9,
      tags: ["Renewal in 21 days", "SSO"],
      note: "Escalate billing issues to Maya, their account manager.",
    },
    subject: "SSO login loops after IdP certificate rotation",
    preview: "Since this morning nobody on our warehouse team can sign in…",
    waiting: "12m",
    unread: true,
  },
  {
    id: "c-2",
    customer: {
      id: "cus-mensah",
      name: "Kwame Mensah",
      initials: "KM",
      role: "Founder",
      company: "Bolt Bakery",
      plan: "Starter",
      mrr: "$29",
      customerSince: "Aug 2026",
      openTickets: 1,
      csat: 4.5,
      tags: ["Trial converted"],
    },
    subject: "Can I print receipts from the iPad app?",
    preview: "We just got a Bluetooth printer and wondered if it works with…",
    waiting: "38m",
    unread: true,
  },
  {
    id: "c-3",
    customer: {
      id: "cus-arora",
      name: "Neha Arora",
      initials: "NA",
      role: "Finance Lead",
      company: "Lumen Clinics",
      plan: "Growth",
      mrr: "$640",
      customerSince: "Nov 2024",
      openTickets: 2,
      csat: 3.8,
      tags: ["At risk", "Invoice dispute"],
      note: "Two late-refund complaints this quarter.",
    },
    subject: "Refund still not showing on September invoice",
    preview: "Following up again on the refund you confirmed on the 12th…",
    waiting: "2h",
    unread: false,
  },
];

function CustomerCard({ customer }: { customer: Customer }) {
  const atRisk = customer.tags.includes("At risk");

  return (
    <HoverCard>
      <HoverCardTrigger
        href={`#customer-${customer.id}`}
        delay={300}
        className="truncate rounded-sm text-sm font-medium outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {customer.name}
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-start gap-3 p-3">
          <Avatar size="lg">
            <AvatarImage src="/placeholder.svg" alt="" />
            <AvatarFallback>{customer.initials}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 gap-0.5">
            <p className="truncate text-sm font-medium">{customer.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {customer.role}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <BuildingIcon aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate">{customer.company}</span>
            </p>
          </div>
          <Badge
            variant={customer.plan === "Enterprise" ? "default" : "secondary"}
          >
            {customer.plan}
          </Badge>
        </div>
        <dl className="grid grid-cols-3 border-y text-xs">
          <div className="grid gap-0.5 px-3 py-2">
            <dt className="text-muted-foreground">MRR</dt>
            <dd className="font-medium tabular-nums">{customer.mrr}</dd>
          </div>
          <div className="grid gap-0.5 border-x px-3 py-2">
            <dt className="text-muted-foreground">Open</dt>
            <dd className="font-medium tabular-nums">
              {customer.openTickets}{" "}
              {customer.openTickets === 1 ? "ticket" : "tickets"}
            </dd>
          </div>
          <div className="grid gap-0.5 px-3 py-2">
            <dt className="text-muted-foreground">CSAT</dt>
            <dd
              className={`flex items-center gap-1 font-medium tabular-nums ${atRisk ? "text-destructive" : ""}`}
            >
              <StarIcon aria-hidden="true" className="size-3 fill-current" />
              {customer.csat.toFixed(1)}
            </dd>
          </div>
        </dl>
        <div className="grid gap-2 p-3">
          <div className="flex flex-wrap gap-1">
            {customer.tags.map((tag) => (
              <Badge
                key={tag}
                variant={tag === "At risk" ? "destructive" : "outline"}
              >
                {tag}
              </Badge>
            ))}
          </div>
          {customer.note && (
            <p className="rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
              {customer.note}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Customer since {customer.customerSince}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCard14() {
  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <section
      aria-labelledby="hover-card-14-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <h3
          id="hover-card-14-title"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <MessageCircleIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          Unassigned
        </h3>
        <Badge variant="secondary">{unreadCount} new</Badge>
      </header>
      <ul className="divide-y">
        {conversations.map((conversation) => (
          <li key={conversation.id} className="flex gap-3 px-4 py-3">
            <span className="mt-1.5 flex size-2 shrink-0">
              {conversation.unread && (
                <span className="size-2 rounded-full bg-primary">
                  <span className="sr-only">Unread</span>
                </span>
              )}
            </span>
            <div className="grid min-w-0 flex-1 gap-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-1.5">
                  <CustomerCard customer={conversation.customer} />
                  <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                    {conversation.customer.company}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  <span className="sr-only">Waiting </span>
                  {conversation.waiting}
                </span>
              </div>
              <p
                className={`truncate text-sm ${conversation.unread ? "font-medium" : "text-muted-foreground"}`}
              >
                {conversation.subject}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {conversation.preview}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
