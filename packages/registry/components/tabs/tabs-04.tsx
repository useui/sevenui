"use client";

import { CalendarClock, Inbox, Workflow } from "lucide-react";
import type { KeyboardEvent } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const features = [
  {
    value: "inbox",
    icon: Inbox,
    title: "Shared inbox",
    summary: "Every customer email, chat, and form in one queue.",
    image: "Shared inbox with conversations assigned to teammates",
    stat: "Teams answer 38% faster in their first month.",
  },
  {
    value: "automations",
    icon: Workflow,
    title: "Automations",
    summary: "Route, tag, and close routine requests on their own.",
    image: "Automation builder with a routing rule for refund requests",
    stat: "1 in 4 conversations never needs a human touch.",
  },
  {
    value: "scheduling",
    icon: CalendarClock,
    title: "Send later",
    summary: "Queue replies for the customer's business hours.",
    image: "Reply composer with a send-later time picker open",
    stat: "Replies sent in local hours get 2x more responses.",
  },
];

// The tabs stack vertically, so ArrowUp/ArrowDown move focus between them.
// Handled here because the Tabs wrapper does not forward `orientation` to the
// Base UI root, which leaves the list's keyboard model horizontal.
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const tabs = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      '[role="tab"]:not([aria-disabled="true"])',
    ),
  );
  const index = tabs.indexOf(document.activeElement as HTMLElement);
  if (index === -1) return;
  event.preventDefault();
  const step = event.key === "ArrowDown" ? 1 : -1;
  tabs[(index + step + tabs.length) % tabs.length]?.focus();
}

export default function Tabs04() {
  return (
    <div className="@container w-full max-w-3xl">
      <Tabs
        defaultValue="inbox"
        orientation="vertical"
        className="flex-col gap-4 @xl:flex-row @xl:gap-6"
      >
        <TabsList
          aria-label="Product features"
          aria-orientation="vertical"
          onKeyDown={moveFocus}
          className="w-full gap-1 bg-transparent p-0 @xl:w-60 @xl:shrink-0"
        >
          {features.map((feature) => (
            <TabsTrigger
              key={feature.value}
              value={feature.value}
              className="h-auto items-start gap-3 rounded-lg px-3 py-2.5 text-left whitespace-normal hover:bg-muted/50 data-active:border-border data-active:bg-card data-active:shadow-xs dark:data-active:border-border dark:data-active:bg-card"
            >
              <feature.icon aria-hidden="true" className="mt-0.5" />
              <span className="flex flex-col gap-0.5">
                <span className="text-foreground">{feature.title}</span>
                <span className="text-xs font-normal leading-snug text-muted-foreground">
                  {feature.summary}
                </span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {features.map((feature) => (
          <TabsContent
            key={feature.value}
            value={feature.value}
            className="flex min-w-0 flex-col gap-3"
          >
            <div className="overflow-hidden rounded-xl border bg-muted p-2">
              <img
                src="/placeholder.svg"
                alt={feature.image}
                className="aspect-[4/3] w-full rounded-lg bg-background object-cover"
              />
            </div>
            <p className="text-muted-foreground">{feature.stat}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
