"use client";

import { Search } from "lucide-react";

import { Input } from "@/registry/base/ui/input";

export default function Input01() {
  return (
    <div className="relative w-full max-w-sm">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input type="search" placeholder="Search components…" className="pl-8" />
    </div>
  );
}
