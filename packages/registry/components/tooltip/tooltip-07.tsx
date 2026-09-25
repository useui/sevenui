"use client";

import * as React from "react";
import {
  CalendarDays,
  FolderKanban,
  House,
  Inbox,
  Settings,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const presets = {
  instant: { label: "Instant", delay: 0, timeout: 0 },
  standard: { label: "Standard", delay: 600, timeout: 400 },
  patient: { label: "Patient", delay: 1200, timeout: 800 },
} as const;

type Preset = keyof typeof presets;

const nav = [
  { icon: House, label: "Home" },
  { icon: Inbox, label: "Inbox", count: 12 },
  { icon: FolderKanban, label: "Projects" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: Settings, label: "Settings" },
];

export default function Tooltip07() {
  const [preset, setPreset] = React.useState<Preset>("standard");
  const [active, setActive] = React.useState("Home");
  const config = presets[preset];

  return (
    <div className="flex w-full max-w-sm items-start gap-4">
      {/* One provider groups the rail: after the first tooltip opens, moving
          to a neighbor within `timeout` ms opens it without the delay. */}
      <TooltipProvider delay={config.delay} timeout={config.timeout}>
        <nav
          aria-label="Workspace"
          className="flex shrink-0 flex-col gap-1 rounded-xl border border-border bg-sidebar p-1.5"
        >
          {nav.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger
                aria-label={item.label}
                aria-current={active === item.label ? "page" : undefined}
                onClick={() => setActive(item.label)}
                className="relative flex size-9 items-center justify-center rounded-lg text-sidebar-foreground/70 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring aria-[current=page]:bg-sidebar-primary aria-[current=page]:text-sidebar-primary-foreground"
              >
                <item.icon aria-hidden="true" className="size-4" />
                {item.count ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive"
                  />
                ) : null}
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                {item.label}
                {item.count ? (
                  <Badge className="h-4 bg-primary-foreground/15 px-1.5 text-[10px] text-primary-foreground tabular-nums">
                    {item.count} new
                  </Badge>
                ) : null}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>

      <div className="grid min-w-0 flex-1 gap-3">
        <div className="grid min-w-0 gap-2">
          <span id="tooltip-07-delay" className="text-sm font-medium">
            Open delay
          </span>
          <ToggleGroup
            aria-labelledby="tooltip-07-delay"
            variant="outline"
            size="sm"
            spacing={0}
            value={[preset]}
            onValueChange={(value) => {
              if (value[0]) setPreset(value[0] as Preset);
            }}
            className="w-full"
          >
            {(Object.keys(presets) as Preset[]).map((key) => (
              <ToggleGroupItem key={key} value={key} className="flex-1">
                {presets[key].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <dl className="grid gap-2 text-xs min-[360px]:grid-cols-2">
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <dt className="text-muted-foreground">First tooltip</dt>
            <dd className="font-medium tabular-nums">{config.delay} ms</dd>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <dt className="text-muted-foreground">Neighbor window</dt>
            <dd className="font-medium tabular-nums">{config.timeout} ms</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
