"use client";

import { Check, Clock, X } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

export default function Badge03() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">
        <Check aria-hidden="true" />
        Completed
      </Badge>
      <Badge variant="outline">
        <Clock aria-hidden="true" />
        In progress
      </Badge>
      <Badge variant="outline">
        <X aria-hidden="true" />
        Cancelled
      </Badge>
    </div>
  );
}
