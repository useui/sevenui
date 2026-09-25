"use client";

import * as React from "react";
import {
  Bell,
  Check,
  CreditCard,
  KeyRound,
  Lock,
  Plug,
  Sparkles,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

type Tag =
  | { kind: "new" }
  | { kind: "beta" }
  | { kind: "pro" }
  | { kind: "issue"; label: string }
  | { kind: "count"; value: number; label: string };

type Section = {
  id: string;
  label: string;
  icon: LucideIcon;
  tag?: Tag;
  title: string;
  body: string;
  action: string;
  // What the section looks like once its action has been taken.
  done: { action: string; body: string; tag?: Tag };
};

const sections: Section[] = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    title: "Profile",
    body: "Your name, avatar, and the email address teammates see on comments.",
    action: "Send verification email",
    done: {
      action: "Verification email sent",
      body: "We sent a link to nadia@northwind.io. Your address is verified once you open it.",
    },
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    tag: { kind: "new" },
    title: "Notifications",
    body: "New: route mentions to Slack and mute threads you have already resolved.",
    action: "Set up Slack",
    done: {
      action: "Slack connected",
      body: "Mentions now route to #product in Slack.",
    },
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    tag: { kind: "count", value: 3, label: "3 connected" },
    title: "Integrations",
    body: "GitHub, Linear, and Figma are connected to this workspace.",
    action: "Connect Notion",
    done: {
      action: "Notion connected",
      body: "GitHub, Linear, Figma, and Notion are connected to this workspace.",
      tag: { kind: "count", value: 4, label: "4 connected" },
    },
  },
  {
    id: "assistant",
    label: "AI assistant",
    icon: Sparkles,
    tag: { kind: "beta" },
    title: "AI assistant",
    body: "Draft replies and summarize long threads. Beta features may change before general release.",
    action: "Join the beta",
    done: {
      action: "Joined the beta",
      body: "You are in. Look for the sparkle button in any thread to draft a reply.",
      tag: { kind: "beta" },
    },
  },
  {
    id: "sso",
    label: "Single sign-on",
    icon: KeyRound,
    tag: { kind: "pro" },
    title: "Single sign-on",
    body: "Require SAML sign-in through Okta, Entra ID, or Google Workspace. Available on the Business plan.",
    action: "Upgrade to Business",
    done: {
      action: "Upgrade requested",
      body: "Your workspace owner has been asked to approve the Business plan.",
      tag: { kind: "pro" },
    },
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    tag: { kind: "issue", label: "Payment failed" },
    title: "Billing",
    body: "Your Visa ending in 4242 was declined on Sep 22. Update it before Oct 2 to keep your seats.",
    action: "Update payment method",
    done: {
      action: "Payment method updated",
      body: "Your Mastercard ending in 8210 will be charged on Oct 2. Your seats are safe.",
    },
  },
];

function SectionTag({ tag, full = false }: { tag: Tag; full?: boolean }) {
  switch (tag.kind) {
    case "new":
      return <Badge className="h-4 px-1.5 text-[10px]">New</Badge>;
    case "beta":
      return (
        <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
          Beta
        </Badge>
      );
    case "pro":
      return (
        <Badge
          variant="secondary"
          className="h-4 gap-0.5 px-1.5 text-[10px] [&>svg]:size-2.5!"
        >
          <Lock aria-hidden="true" />
          Business
        </Badge>
      );
    case "issue":
      if (full) {
        return <Badge variant="destructive">{tag.label}</Badge>;
      }
      return (
        <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
          <span className="sr-only">{tag.label}</span>
          <span aria-hidden="true">1 issue</span>
        </Badge>
      );
    case "count":
      return (
        <Badge
          variant="secondary"
          className="h-4 min-w-4 px-1 text-[10px] tabular-nums"
        >
          <span className="sr-only">{tag.label}</span>
          <span aria-hidden="true">{tag.value}</span>
        </Badge>
      );
  }
}

export default function Badge12() {
  const [activeId, setActiveId] = React.useState("billing");
  const [done, setDone] = React.useState<string[]>([]);
  const active = sections.find((section) => section.id === activeId) ?? sections[0];
  const isDone = done.includes(active.id);
  const actionRef = React.useRef<HTMLButtonElement>(null);

  // A finished section swaps in its follow-up copy and tag, so resolving the
  // billing issue also clears its badge from the navigation.
  const view = (section: Section) =>
    done.includes(section.id)
      ? { tag: section.done.tag, body: section.done.body }
      : { tag: section.tag, body: section.body };

  const activeView = view(active);

  return (
    <div className="@container w-full max-w-2xl">
      <div className="grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground @lg:grid-cols-[15rem_1fr]">
        <nav
          aria-label="Workspace settings"
          className="border-b border-border bg-muted/40 p-2 @lg:border-r @lg:border-b-0"
        >
          <ul className="flex flex-col gap-0.5">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeId;
              const { tag } = view(section);
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActiveId(section.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-[current=page]:bg-background aria-[current=page]:font-medium aria-[current=page]:text-foreground aria-[current=page]:shadow-xs"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      {section.label}
                    </span>
                    {tag ? <SectionTag tag={tag} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{active.title}</h3>
            {activeView.tag && activeView.tag.kind !== "count" ? (
              <SectionTag tag={activeView.tag} full />
            ) : null}
          </div>
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {activeView.body}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              ref={actionRef}
              size="sm"
              variant={
                activeView.tag?.kind === "issue" ? "destructive" : "outline"
              }
              aria-disabled={isDone || undefined}
              className="aria-disabled:pointer-events-none"
              onClick={() => {
                if (!isDone) setDone((prev) => [...prev, active.id]);
              }}
            >
              {isDone ? (
                <Check aria-hidden="true" data-icon="inline-start" />
              ) : null}
              {isDone ? active.done.action : active.action}
            </Button>
            {isDone ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  setDone((prev) => prev.filter((id) => id !== active.id));
                  actionRef.current?.focus();
                }}
              >
                Undo
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
