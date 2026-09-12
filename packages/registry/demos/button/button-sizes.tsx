"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";

export default function ButtonSizes() {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="xs">
          Extra small
        </Button>
        <Button variant="outline" size="sm">
          Small
        </Button>
        <Button variant="outline">Default</Button>
        <Button variant="outline" size="lg">
          Large
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon-xs" aria-label="Add (extra small)">
          <PlusIcon />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Add (small)">
          <PlusIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button variant="outline" size="icon-lg" aria-label="Add (large)">
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}
