"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const tabs = [
  {
    value: "conversation",
    label: "Conversation",
    count: 8,
    body: "Maya approved the migration plan and asked for a follow-up on index rebuild times.",
  },
  {
    value: "commits",
    label: "Commits",
    count: 6,
    body: "Latest: “Backfill customer_region before dropping the legacy column.”",
  },
  {
    value: "checks",
    label: "Checks",
    count: 3,
    body: "Build, lint, and integration tests passed on the latest push.",
  },
  {
    value: "files",
    label: "Files",
    count: 12,
    body: "12 files changed across the billing service and its migrations.",
  },
];

export default function Tabs05() {
  return (
    <Tabs defaultValue="conversation" className="w-full max-w-md gap-4">
      <TabsList
        variant="line"
        aria-label="Pull request sections"
        className="relative w-full justify-start gap-0 overflow-x-auto p-0 shadow-[inset_0_-1px_0_var(--border)] group-data-[orientation=horizontal]/tabs:h-10"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-full flex-none rounded-none px-3 after:hidden"
          >
            {tab.label}
            <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
              {tab.count}
            </span>
          </TabsTrigger>
        ))}
        <TabsPrimitive.Indicator className="absolute bottom-0 left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-full bg-foreground transition-[translate,width] duration-300 ease-out motion-reduce:transition-none" />
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
