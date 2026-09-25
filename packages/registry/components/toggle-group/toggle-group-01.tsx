"use client";

import * as React from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const themes = [
  {
    value: "light",
    label: "Light",
    icon: SunIcon,
    hint: "Always use the light interface, even at night.",
  },
  {
    value: "dark",
    label: "Dark",
    icon: MoonIcon,
    hint: "Always use the dark interface, easier on the eyes in low light.",
  },
  {
    value: "system",
    label: "System",
    icon: MonitorIcon,
    hint: "Follows your operating system and switches automatically at sunset.",
  },
];

export default function ToggleGroup01() {
  const [theme, setTheme] = React.useState("system");
  const active = themes.find((item) => item.value === theme) ?? themes[2];

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <span id="interface-theme-label" className="text-sm font-medium">
        Interface theme
      </span>
      <ToggleGroup
        aria-labelledby="interface-theme-label"
        variant="outline"
        spacing={0}
        value={[theme]}
        onValueChange={(next) => {
          // Keep exactly one segment selected: ignore attempts to clear it.
          if (next.length > 0) setTheme(next[0]);
        }}
        className="w-full"
      >
        {themes.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className="flex-1 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            <item.icon aria-hidden="true" />
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {active.hint}
      </p>
    </div>
  );
}
