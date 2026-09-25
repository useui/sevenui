"use client";

import { Bell, Inbox, MessageSquare } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

const counts = [
  { label: "Notifications", icon: Bell, count: 3 },
  { label: "Inbox", icon: Inbox, count: 128 },
  { label: "Messages", icon: MessageSquare, count: 0 },
];

function formatCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export default function Badge02() {
  return (
    <div className="flex flex-wrap gap-5">
      {counts.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="relative inline-flex">
            <Button
              variant="outline"
              size="icon"
              aria-label={
                item.count > 0
                  ? `${item.label}, ${item.count} unread`
                  : `${item.label}, none unread`
              }
            >
              <Icon aria-hidden="true" />
            </Button>
            {item.count > 0 ? (
              <Badge
                aria-hidden="true"
                className="pointer-events-none absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full px-1 text-[10px] tabular-nums ring-2 ring-background"
              >
                {formatCount(item.count)}
              </Badge>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
