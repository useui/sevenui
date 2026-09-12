"use client";

import { Bell, Inbox } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

export default function Badge02() {
  return (
    <div className="flex flex-wrap gap-6">
      <div className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border">
        <Bell aria-hidden="true" className="size-4" />
        <Badge className="absolute -top-2 -right-2 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]">
          3
        </Badge>
      </div>
      <div className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border">
        <Inbox aria-hidden="true" className="size-4" />
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
        >
          12
        </Badge>
      </div>
    </div>
  );
}
