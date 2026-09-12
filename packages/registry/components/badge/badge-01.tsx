"use client";

import { Badge } from "@/registry/base/ui/badge";

export default function Badge01() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
        Active
      </Badge>
      <Badge variant="outline">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-500" />
        Pending
      </Badge>
      <Badge variant="outline">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-red-500" />
        Failed
      </Badge>
    </div>
  );
}
