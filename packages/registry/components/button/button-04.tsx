"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";

export default function Button04() {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button variant="outline" size="icon" aria-label="Copy">
        <Copy aria-hidden="true" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Edit">
        <Pencil aria-hidden="true" />
      </Button>
      <Button variant="outline" size="icon" aria-label="Delete">
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}
