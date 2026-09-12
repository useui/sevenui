"use client";

import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

export default function Switch04() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch id="switch-04-off" disabled />
        <Label htmlFor="switch-04-off">Disabled, off</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-04-on" disabled defaultChecked />
        <Label htmlFor="switch-04-on">Disabled, on</Label>
      </div>
    </div>
  );
}
