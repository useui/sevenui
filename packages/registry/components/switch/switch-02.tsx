"use client";

import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const settings = [
  {
    id: "switch-02-wifi",
    label: "Wi-Fi",
    description: "Connect to available wireless networks automatically.",
    defaultChecked: true,
  },
  {
    id: "switch-02-bluetooth",
    label: "Bluetooth",
    description: "Allow this device to pair with nearby accessories.",
    defaultChecked: false,
  },
  {
    id: "switch-02-location",
    label: "Location services",
    description: "Share your location with apps that request it.",
    defaultChecked: false,
  },
];

export default function Switch02() {
  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border rounded-lg border border-border">
      {settings.map((setting) => (
        <div key={setting.id} className="flex items-start justify-between gap-4 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor={setting.id}>{setting.label}</Label>
            <span className="text-xs text-muted-foreground">{setting.description}</span>
          </div>
          <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
        </div>
      ))}
    </div>
  );
}
