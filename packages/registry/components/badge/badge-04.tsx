"use client";

import { Badge } from "@/registry/base/ui/badge";

export default function Badge04() {
  return (
    <div className="flex max-w-sm flex-wrap gap-2">
      <Badge variant="secondary">Design</Badge>
      <Badge variant="secondary">Engineering</Badge>
      <Badge variant="secondary">Marketing</Badge>
      <Badge variant="secondary">Sales</Badge>
      <Badge variant="secondary">Support</Badge>
      <Badge variant="secondary">Finance</Badge>
    </div>
  );
}
