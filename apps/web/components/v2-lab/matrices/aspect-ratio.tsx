"use client";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { LabSection } from "../lab-frame";

const RATIOS = [
  { label: "16 / 9", ratio: 16 / 9 },
  { label: "4 / 3", ratio: 4 / 3 },
  { label: "1 / 1", ratio: 1 },
] as const;

// AspectRatio has no look of its own; the frame around it is the lab's.
export default function AspectRatioMatrix() {
  return (
    <div>
      <LabSection title="ratio">
        {RATIOS.map(({ label, ratio }) => (
          <div key={label} className="w-40">
            <AspectRatio ratio={ratio} className="overflow-hidden rounded-lg bg-surface-panel">
              <img src="/placeholder.svg" alt="" className="size-full object-cover" />
            </AspectRatio>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </LabSection>
    </div>
  );
}
