"use client";

import {
  MicVocalIcon,
  MoonIcon,
  RepeatIcon,
  ShuffleIcon,
} from "lucide-react";

import { Toggle } from "@/registry/base/ui/toggle";

const modes = [
  { value: "shuffle", label: "Shuffle", icon: ShuffleIcon, pressed: true },
  { value: "repeat", label: "Repeat", icon: RepeatIcon, pressed: false },
  { value: "lyrics", label: "Lyrics", icon: MicVocalIcon, pressed: false },
  { value: "sleep", label: "Sleep timer", icon: MoonIcon, pressed: false },
];

export default function Toggle06() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border bg-card p-3 text-card-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="/placeholder.svg"
          alt="Album cover for Low Tide Letters"
          className="size-12 shrink-0 rounded-md bg-muted object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Harbor Lights</p>
          <p className="truncate text-xs text-muted-foreground">
            Maren Holt · Low Tide Letters
          </p>
        </div>
      </div>
      <div
        role="toolbar"
        aria-label="Playback modes"
        className="flex flex-wrap items-center gap-1"
      >
        {modes.map((mode) => (
          <Toggle
            key={mode.value}
            size="sm"
            defaultPressed={mode.pressed}
            aria-label={mode.label}
            className="gap-0 px-1.5 text-muted-foreground transition-[background-color,color,padding] duration-200 ease-out aria-pressed:bg-accent aria-pressed:px-2 aria-pressed:text-accent-foreground motion-reduce:transition-none"
          >
            <mode.icon aria-hidden="true" />
            {/* The label slides open only while pressed. */}
            <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-200 ease-out group-aria-pressed/toggle:grid-cols-[1fr] motion-reduce:transition-none">
              <span className="overflow-hidden">
                <span className="block pl-1.5 text-xs">{mode.label}</span>
              </span>
            </span>
          </Toggle>
        ))}
      </div>
    </div>
  );
}
