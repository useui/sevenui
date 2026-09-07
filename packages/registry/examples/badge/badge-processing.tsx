"use client";

import { LoaderCircleIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

export default function BadgeProcessing() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary">
        <LoaderCircleIcon className="animate-spin" />
        Deploying
      </Badge>
      <Badge variant="outline">
        <LoaderCircleIcon className="animate-spin" />
        Indexing
      </Badge>
    </div>
  );
}
