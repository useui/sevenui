"use client";

import { Badge } from "@/registry/base/ui/badge";

const statuses = [
  { label: "Active", dot: "bg-success" },
  { label: "Pending", dot: "bg-warning" },
  { label: "Failed", dot: "bg-destructive" },
  { label: "Paused", dot: "bg-muted-foreground" },
];

export default function Badge01() {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <Badge key={status.label} variant="outline">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${status.dot}`}
          />
          {status.label}
        </Badge>
      ))}
    </div>
  );
}
