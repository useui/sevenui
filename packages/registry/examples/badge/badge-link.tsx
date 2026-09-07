"use client";

import { ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

export default function BadgeLink() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge render={<a href="#changelog" />}>v0.7.0</Badge>
      <Badge variant="secondary" render={<a href="#docs" />}>
        Documentation
        <ArrowUpRightIcon />
      </Badge>
      <Badge variant="outline" render={<a href="#releases" />}>
        All releases
      </Badge>
    </div>
  );
}
