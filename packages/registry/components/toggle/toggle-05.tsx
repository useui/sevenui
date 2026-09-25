"use client";

import * as React from "react";
import {
  BluetoothIcon,
  MoonIcon,
  PlaneIcon,
  RadioTowerIcon,
  SunriseIcon,
  WifiIcon,
} from "lucide-react";

import { Toggle } from "@/registry/base/ui/toggle";

// `detail` is what the tile says while it is on; every tile reads "Off" otherwise.
const tiles = [
  { value: "wifi", label: "Wi-Fi", detail: "Studio 5G", icon: WifiIcon, on: true },
  { value: "bluetooth", label: "Bluetooth", detail: "2 devices", icon: BluetoothIcon, on: true },
  { value: "airplane", label: "Airplane", detail: "On", icon: PlaneIcon, on: false },
  { value: "hotspot", label: "Hotspot", detail: "Sharing", icon: RadioTowerIcon, on: false },
  { value: "focus", label: "Focus", detail: "Until 18:00", icon: MoonIcon, on: true },
  { value: "night", label: "Night shift", detail: "Until sunrise", icon: SunriseIcon, on: false },
];

export default function Toggle05() {
  const [on, setOn] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(tiles.map((tile) => [tile.value, tile.on])),
  );
  const titleId = React.useId();

  return (
    <section
      aria-labelledby={titleId}
      className="w-full max-w-sm rounded-2xl border bg-card p-3 text-card-foreground shadow-sm"
    >
      <h3 id={titleId} className="px-1 pb-3 text-sm font-medium">
        Quick settings
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Toggle
            key={tile.value}
            pressed={on[tile.value]}
            onPressedChange={(pressed) =>
              setOn((current) => ({ ...current, [tile.value]: pressed }))
            }
            aria-label={tile.label}
            className="group h-auto flex-col items-start gap-3 rounded-xl bg-muted/50 p-3 text-left whitespace-normal hover:bg-muted aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-background text-foreground transition-colors group-aria-pressed:bg-primary-foreground/15 group-aria-pressed:text-primary-foreground">
              <tile.icon aria-hidden="true" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{tile.label}</span>
              <span className="text-xs font-normal text-muted-foreground group-aria-pressed:text-primary-foreground/70">
                {on[tile.value] ? tile.detail : "Off"}
              </span>
            </span>
          </Toggle>
        ))}
      </div>
    </section>
  );
}
