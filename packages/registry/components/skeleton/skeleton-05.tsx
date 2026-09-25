"use client";

import * as React from "react";
import { cn } from "cn";

import { Skeleton } from "@/registry/base/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Mode = "pulse" | "wave" | "static";

const modes: { value: Mode; label: string; hint: string }[] = [
  {
    value: "pulse",
    label: "Pulse",
    hint: "Every bone breathes together. The default.",
  },
  {
    value: "wave",
    label: "Wave",
    hint: "Delays ripple down the list so the eye reads top to bottom.",
  },
  {
    value: "static",
    label: "Static",
    hint: "No motion, for dense screens or reduced-motion preferences.",
  },
];

// Widths of the comment body lines, one entry per comment.
const comments = [
  { name: "w-24", lines: ["w-full", "w-4/5"] },
  { name: "w-20", lines: ["w-11/12"] },
  { name: "w-28", lines: ["w-full", "w-3/4", "w-1/2"] },
];

export default function Skeleton05() {
  const [mode, setMode] = React.useState<Mode>("pulse");
  const active = modes.find((item) => item.value === mode) ?? modes[0];
  let bone = 0;

  // Each call returns props for the next bone in reading order.
  const boneProps = (className: string) => {
    const index = bone++;
    return {
      "aria-hidden": true as const,
      className: cn(
        className,
        "motion-reduce:animate-none",
        mode === "static" && "animate-none",
      ),
      style:
        mode === "wave" ? { animationDelay: `${index * 120}ms` } : undefined,
    };
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span id="skeleton-motion-label" className="text-sm font-medium">
          Loading motion
        </span>
        <ToggleGroup
          aria-labelledby="skeleton-motion-label"
          variant="outline"
          spacing={0}
          value={[mode]}
          onValueChange={(next) => {
            if (next.length > 0) setMode(next[0] as Mode);
          }}
          className="w-full"
        >
          {modes.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="flex-1"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">{active.hint}</p>
      </div>

      <div
        role="status"
        aria-label="Loading comments"
        className="flex flex-col gap-4 rounded-xl border border-border p-4"
      >
        {comments.map((comment, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
          <div key={index} className="flex gap-3">
            <Skeleton {...boneProps("size-8 shrink-0 rounded-full")} />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <Skeleton {...boneProps(`h-3 ${comment.name}`)} />
                <Skeleton {...boneProps("h-2.5 w-10")} />
              </div>
              {comment.lines.map((width, line) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder lines
                  key={line}
                  {...boneProps(`h-2.5 ${width}`)}
                />
              ))}
            </div>
          </div>
        ))}
        <span className="sr-only">Loading comments…</span>
      </div>
    </div>
  );
}
