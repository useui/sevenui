"use client";

import * as React from "react";
import { Eye, EyeOff, Moon, Sun, Volume2, VolumeX } from "lucide-react";

import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const toggles = [
  {
    id: "switch-05-theme",
    label: "Dark theme",
    OffIcon: Sun,
    OnIcon: Moon,
    defaultChecked: false,
  },
  {
    id: "switch-05-sound",
    label: "Sound effects",
    OffIcon: VolumeX,
    OnIcon: Volume2,
    defaultChecked: true,
  },
  {
    id: "switch-05-preview",
    label: "Link previews",
    OffIcon: EyeOff,
    OnIcon: Eye,
    defaultChecked: true,
  },
];

function IconSwitch({
  id,
  label,
  OffIcon,
  OnIcon,
  defaultChecked,
}: (typeof toggles)[number]) {
  const [checked, setChecked] = React.useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <OffIcon
          aria-hidden="true"
          className={
            checked
              ? "size-4 text-muted-foreground/60 transition-colors"
              : "size-4 text-foreground transition-colors"
          }
        />
        <Switch id={id} checked={checked} onCheckedChange={setChecked} />
        <OnIcon
          aria-hidden="true"
          className={
            checked
              ? "size-4 text-foreground transition-colors"
              : "size-4 text-muted-foreground/60 transition-colors"
          }
        />
      </div>
    </div>
  );
}

export default function Switch05() {
  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border rounded-lg border border-border bg-card text-card-foreground shadow-xs">
      {toggles.map((toggle) => (
        <IconSwitch key={toggle.id} {...toggle} />
      ))}
    </div>
  );
}
