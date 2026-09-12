"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const sections = [
  {
    value: "general",
    label: "General",
    body: "Workspace name, timezone, and default language.",
  },
  {
    value: "members",
    label: "Members",
    body: "Invite teammates and manage their roles and permissions.",
  },
  {
    value: "billing",
    label: "Billing",
    body: "View invoices, update your payment method, or change plans.",
  },
];

export default function Tabs04() {
  return (
    <Tabs
      defaultValue="general"
      orientation="vertical"
      className="w-full max-w-lg"
    >
      <TabsList className="w-40 shrink-0">
        {sections.map((section) => (
          <TabsTrigger key={section.value} value={section.value}>
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map((section) => (
        <TabsContent key={section.value} value={section.value}>
          <p className="text-sm text-muted-foreground">{section.body}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
