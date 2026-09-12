"use client";

import { BadgeCheckIcon, StarIcon, TriangleAlertIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

export default function BadgeIcon() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">
        <BadgeCheckIcon />
        Verified
      </Badge>
      <Badge variant="outline">
        <StarIcon />
        4.9
      </Badge>
      <Badge variant="destructive">
        <TriangleAlertIcon />
        Build failed
      </Badge>
    </div>
  );
}
