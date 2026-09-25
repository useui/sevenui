"use client";

import * as React from "react";
import {
  AtSignIcon,
  CheckCheckIcon,
  InboxIcon,
  SettingsIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/base/ui/empty";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const initialNotifications = [
  {
    id: "n-1",
    initials: "PR",
    name: "Priya Raman",
    action: "approved your pull request",
    target: "Add usage-based pricing table",
    time: "4m ago",
  },
  {
    id: "n-2",
    initials: "DK",
    name: "Daniel Kim",
    action: "assigned you to",
    target: "Fix flaky checkout test",
    time: "1h ago",
  },
];

export default function Empty11() {
  const [notifications, setNotifications] = React.useState(initialNotifications);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between gap-2 border-b px-4 pt-3">
          <h2 className="pb-3 text-sm font-medium">Notifications</h2>
          <Button
            size="xs"
            variant="ghost"
            className="mb-3"
            disabled={notifications.length === 0}
            onClick={() => setNotifications([])}
          >
            <CheckCheckIcon data-icon="inline-start" aria-hidden="true" />
            Mark all read
          </Button>
        </div>
        <TabsList variant="line" className="w-full justify-start gap-2 border-b px-3">
          <TabsTrigger value="all" className="flex-none">
            All
            {notifications.length > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[0.7rem] leading-4 text-primary-foreground tabular-nums">
                {notifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mentions" className="flex-none">
            Mentions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="min-h-56">
          {notifications.length > 0 ? (
            <ul className="divide-y">
              {notifications.map((item) => (
                <li key={item.id} className="flex gap-3 px-4 py-3">
                  <Avatar size="sm">
                    <AvatarFallback>{item.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>{" "}
                      {item.action}{" "}
                      <span className="font-medium text-foreground">
                        {item.target}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty className="min-h-56 rounded-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>You&apos;re all caught up</EmptyTitle>
                <EmptyDescription>
                  New reviews, assignments, and replies will land here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </TabsContent>
        <TabsContent value="mentions" className="min-h-56">
          <Empty className="min-h-56 rounded-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AtSignIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No mentions yet</EmptyTitle>
              <EmptyDescription>
                When a teammate tags you with @ in a comment or doc, it shows up
                here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TabsContent>
      </Tabs>
      <div className="border-t bg-muted/40 px-2 py-1.5">
        <Button size="sm" variant="ghost" className="text-muted-foreground">
          <SettingsIcon data-icon="inline-start" aria-hidden="true" />
          Notification settings
        </Button>
      </div>
    </div>
  );
}
