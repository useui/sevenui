"use client";

import { Check, Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const channels = [
  {
    value: "chat",
    label: "Chat",
    icon: MessageCircle,
    status: "3 agents online",
    online: true,
    reply: "Typical reply in 2 minutes",
    body: "Best for quick questions about your account, billing, or a setting you can't find.",
    action: "Start a chat",
    href: undefined,
    confirmation: "Chat requested. You're 2nd in line for an agent.",
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
    status: "Monitored 24/7",
    online: true,
    reply: "Typical reply within 4 hours",
    body: "Send screenshots, logs, or export files and we'll pick it up from there.",
    action: "Write to support@acme.io",
    href: "#email-support",
    confirmation: undefined,
  },
  {
    value: "phone",
    label: "Phone",
    icon: Phone,
    status: "Opens at 8:00 AM PT",
    online: false,
    reply: "Mon–Fri, 8:00 AM–6:00 PM PT",
    body: "Available on the Business plan for outages and urgent access issues.",
    action: "Request a callback",
    href: undefined,
    confirmation: "Callback requested. We'll call you after 8:00 AM PT.",
  },
];

export default function Tabs01() {
  const [requested, setRequested] = useState<string[]>([]);

  const request = (value: string) =>
    setRequested((current) => [...current, value]);
  const cancel = (value: string) =>
    setRequested((current) => current.filter((item) => item !== value));

  return (
    <section
      aria-labelledby="tabs-01-title"
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
    >
      <div className="flex flex-col gap-1">
        <h3 id="tabs-01-title" className="font-semibold">
          Contact support
        </h3>
        <p className="text-sm text-muted-foreground">
          Pick the channel that fits how urgent this is.
        </p>
      </div>

      <Tabs defaultValue="chat" className="gap-4">
        <TabsList aria-labelledby="tabs-01-title" className="w-full">
          {channels.map((channel) => (
            <TabsTrigger key={channel.value} value={channel.value}>
              <channel.icon aria-hidden="true" />
              {channel.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {channels.map((channel) => (
          <TabsContent
            key={channel.value}
            value={channel.value}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <p className="flex items-center gap-2 font-medium">
                <span
                  aria-hidden="true"
                  className={
                    channel.online
                      ? "size-2 rounded-full bg-success"
                      : "size-2 rounded-full bg-muted-foreground/40"
                  }
                />
                {channel.status}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock aria-hidden="true" className="size-3.5" />
                {channel.reply}
              </p>
            </div>
            <p className="text-muted-foreground">{channel.body}</p>
            {channel.href ? (
              <Button
                variant="outline"
                className="w-full"
                nativeButton={false}
                render={<a href={channel.href} />}
              >
                {channel.action}
              </Button>
            ) : requested.includes(channel.value) ? (
              <div className="flex flex-col gap-1">
                <p
                  role="status"
                  className="flex min-h-9 items-center gap-2 rounded-md bg-muted/60 px-3 py-2 font-medium"
                >
                  <Check
                    aria-hidden="true"
                    className="size-4 shrink-0 text-success"
                  />
                  {channel.confirmation}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-center"
                  onClick={() => cancel(channel.value)}
                >
                  Cancel request
                </Button>
              </div>
            ) : (
              <Button
                variant={channel.value === "chat" ? "default" : "outline"}
                className="w-full"
                onClick={() => request(channel.value)}
              >
                {channel.action}
              </Button>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
