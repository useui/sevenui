"use client";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";

const presets = [
  { label: "1:1", ratio: 1, use: "Avatars, product tiles" },
  { label: "4:3", ratio: 4 / 3, use: "Photos, slides" },
  { label: "16:9", ratio: 16 / 9, use: "Video, hero banners" },
  { label: "21:9", ratio: 21 / 9, use: "Cinematic headers" },
];

export default function AspectRatio01() {
  return (
    <ul className="grid w-full max-w-md grid-cols-2 items-end gap-x-4 gap-y-5">
      {presets.map((preset) => (
        <li key={preset.label} className="flex flex-col gap-2">
          <AspectRatio
            ratio={preset.ratio}
            className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/50"
          >
            <span className="text-sm font-medium tabular-nums text-foreground">
              {preset.label}
            </span>
          </AspectRatio>
          <span className="text-xs text-muted-foreground">{preset.use}</span>
        </li>
      ))}
    </ul>
  );
}
