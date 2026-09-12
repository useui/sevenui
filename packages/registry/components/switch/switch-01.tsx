"use client";

import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

export default function Switch01() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor="switch-01-marketing">Marketing emails</Label>
        <span className="text-xs text-muted-foreground">
          Get occasional updates about new features and offers.
        </span>
      </div>
      <Switch id="switch-01-marketing" />
    </div>
  );
}
