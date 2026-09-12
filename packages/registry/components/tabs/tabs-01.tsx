"use client";

import { Bell, Lock, User } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const tabs = [
  {
    value: "profile",
    icon: User,
    label: "Profile",
    body: "Update your name, photo, and public bio.",
  },
  {
    value: "security",
    icon: Lock,
    label: "Security",
    body: "Manage your password, two-factor authentication, and active sessions.",
  },
  {
    value: "notifications",
    icon: Bell,
    label: "Notifications",
    body: "Choose which updates you want delivered by email or push.",
  },
];

export default function Tabs01() {
  return (
    <Tabs defaultValue="profile" className="w-full max-w-md">
      <TabsList className="w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
            <tab.icon className="size-4" aria-hidden="true" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <p className="text-sm text-muted-foreground">{tab.body}</p>
        </TabsContent>
      ))}
    </Tabs>
  );
}
