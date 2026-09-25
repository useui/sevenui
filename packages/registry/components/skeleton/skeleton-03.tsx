"use client";

import { FileTextIcon, ImageIcon, PlayIcon } from "lucide-react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Skeleton } from "@/registry/base/ui/skeleton";

// Relative bar heights for the voice-memo waveform placeholder.
const waveform = [
  40, 65, 30, 80, 55, 90, 45, 70, 35, 60, 85, 50, 25, 75, 40, 65, 30, 55,
];

export default function Skeleton03() {
  return (
    <div
      role="status"
      aria-label="Loading shared media"
      className="grid w-full max-w-md grid-cols-2 gap-3"
    >
      <AspectRatio ratio={16 / 9} className="col-span-2">
        <Skeleton
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center rounded-xl"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-background/70">
            <PlayIcon className="size-4 translate-x-px text-muted-foreground" />
          </span>
        </Skeleton>
      </AspectRatio>

      <AspectRatio ratio={1}>
        <Skeleton
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center rounded-xl"
        >
          <ImageIcon className="size-6 text-muted-foreground/60" />
        </Skeleton>
      </AspectRatio>

      <div aria-hidden="true" className="flex flex-col gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border p-3">
          <Skeleton className="flex size-9 shrink-0 items-center justify-center">
            <FileTextIcon className="size-4 text-muted-foreground/60" />
          </Skeleton>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2 w-2/3" />
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <div className="flex h-8 min-w-0 flex-1 items-center gap-px overflow-hidden">
            {waveform.map((height, index) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars
                key={index}
                className="w-1 shrink-0 rounded-full"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading shared media…</span>
    </div>
  );
}
