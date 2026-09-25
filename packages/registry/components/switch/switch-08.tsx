"use client";

import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const options = [
  { id: "videos", label: "Include videos" },
  { id: "screenshots", label: "Include screenshots" },
  { id: "cellular", label: "Use cellular data" },
  { id: "charging", label: "Only while charging" },
];

export default function Switch08() {
  const [enabled, setEnabled] = React.useState(true);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({
    videos: true,
    screenshots: false,
    cellular: false,
    charging: true,
  });

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Label htmlFor="switch-08-master">Back up photos</Label>
            <Badge variant={enabled ? "secondary" : "outline"}>
              {enabled ? "13 left" : "Paused"}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {enabled
              ? "2,418 of 2,431 photos and videos are backed up."
              : "Backup is paused. Your options below are kept for when you resume."}
          </span>
        </div>
        <Switch
          id="switch-08-master"
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-controls="switch-08-options"
        />
      </div>
      <ul
        id="switch-08-options"
        aria-label="Backup options"
        className={
          enabled
            ? "flex flex-col gap-3 px-4 py-3 transition-opacity"
            : "flex flex-col gap-3 px-4 py-3 opacity-60 transition-opacity"
        }
      >
        {options.map((option) => {
          const id = `switch-08-${option.id}`;
          return (
            <li key={option.id} className="flex items-center justify-between gap-4 pl-3">
              <Label
                htmlFor={id}
                className="font-normal"
                aria-disabled={!enabled || undefined}
              >
                {option.label}
              </Label>
              <Switch
                id={id}
                size="sm"
                disabled={!enabled}
                checked={selected[option.id]}
                onCheckedChange={(checked) =>
                  setSelected((current) => ({ ...current, [option.id]: checked }))
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
