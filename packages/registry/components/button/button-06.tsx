"use client";

import { Download, Laptop, Monitor, Terminal } from "lucide-react";

import { Button } from "@/registry/base/ui/button";

const otherPlatforms = [
  {
    id: "windows",
    label: "Windows",
    meta: "x64 installer · 102 MB",
    icon: Monitor,
  },
  {
    id: "linux",
    label: "Linux",
    meta: "x64 AppImage · 88 MB",
    icon: Terminal,
  },
];

export default function Button06() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Button
        size="lg"
        className="h-auto w-full justify-start gap-3 py-2.5 pr-3 pl-3 text-left whitespace-normal"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-foreground/10">
          <Laptop aria-hidden="true" className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span>Download for macOS</span>
          <span className="text-xs font-normal text-primary-foreground/70">
            Apple silicon · v4.2.1 · 94 MB
          </span>
        </span>
        <Download aria-hidden="true" />
      </Button>
      <div className="grid gap-2 sm:grid-cols-2">
        {otherPlatforms.map((platform) => (
          <Button
            key={platform.id}
            variant="outline"
            className="h-auto justify-start gap-2.5 py-2 text-left whitespace-normal"
          >
            <platform.icon aria-hidden="true" className="text-muted-foreground" />
            <span className="flex min-w-0 flex-col">
              <span>{platform.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {platform.meta}
              </span>
            </span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Requires macOS 13, Windows 10, or Ubuntu 22.04 and later.
      </p>
    </div>
  );
}
