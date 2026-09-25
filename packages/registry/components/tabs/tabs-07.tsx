"use client";

import { useState } from "react";

import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const sections = [
  {
    value: "account",
    label: "Account",
    body: "Your name, email address, and the language used across the workspace.",
  },
  {
    value: "notifications",
    label: "Notifications",
    body: "Pick which mentions, reviews, and deploys send you an email.",
  },
  {
    value: "billing",
    label: "Billing",
    body: "Team plan · 12 seats · next invoice of $144 on October 1.",
  },
  {
    value: "integrations",
    label: "Integrations",
    body: "GitHub and Slack are connected. Linear is waiting for approval.",
  },
];

export default function Tabs07() {
  const [section, setSection] = useState("account");

  return (
    <div className="@container w-full max-w-xl">
      <Tabs
        value={section}
        onValueChange={(value) => setSection(String(value))}
        className="gap-3"
      >
        <label htmlFor="tabs-07-section" className="sr-only">
          Settings section
        </label>
        <NativeSelect
          id="tabs-07-section"
          value={section}
          onChange={(event) => setSection(event.target.value)}
          className="w-full @md:hidden"
        >
          {sections.map((item) => (
            <NativeSelectOption key={item.value} value={item.value}>
              {item.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <TabsList className="hidden w-full @md:inline-flex">
          {sections.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="flex-1">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((item) => (
          <TabsContent
            key={item.value}
            value={item.value}
            className="rounded-lg border border-border p-4"
          >
            <h3 className="font-medium">{item.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
