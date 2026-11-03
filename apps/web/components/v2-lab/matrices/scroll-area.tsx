"use client";

import { ScrollArea, ScrollBar } from "@/registry/base/ui/scroll-area";
import { LabSection } from "../lab-frame";

const TAGS = Array.from({ length: 30 }, (_, i) => `v1.2.0-beta.${30 - i}`);

export default function ScrollAreaMatrix() {
  return (
    <div>
      <LabSection title="vertical / horizontal / both (tab into the viewport for focus)">
        <ScrollArea className="h-48 w-48 rounded-md border border-hairline">
          <div className="p-3 text-sm">
            <h4 className="mb-3 font-medium">Tags</h4>
            {TAGS.map((tag) => (
              <div key={tag} className="border-b border-hairline py-1.5 text-muted-foreground">
                {tag}
              </div>
            ))}
          </div>
        </ScrollArea>
        <ScrollArea orientation="horizontal" className="w-64 rounded-md border border-hairline">
          <div className="flex w-max gap-3 p-3">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="size-24 shrink-0 rounded-md bg-muted" />
            ))}
          </div>
        </ScrollArea>
        <ScrollArea orientation="both" className="h-40 w-56 rounded-md border border-hairline">
          <div className="w-[480px] p-3 text-sm text-muted-foreground">
            {TAGS.map((tag) => (
              <div key={tag} className="py-1">
                {tag} — wide content that scrolls in both directions
              </div>
            ))}
          </div>
          <ScrollBar keepMounted />
        </ScrollArea>
      </LabSection>
    </div>
  );
}
