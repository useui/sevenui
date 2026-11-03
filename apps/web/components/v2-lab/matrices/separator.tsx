"use client";

import { Separator } from "@/registry/base/ui/separator";
import { LabSection } from "../lab-frame";

export default function SeparatorMatrix() {
  return (
    <div>
      <LabSection title="orientation=horizontal">
        <div className="w-72 text-sm">
          <p className="font-medium">SevenUI</p>
          <p className="text-muted-foreground">Primitives built on Base UI.</p>
          <Separator className="my-3" />
          <p className="text-muted-foreground">Below the line.</p>
        </div>
      </LabSection>
      <LabSection title="orientation=vertical">
        <div className="flex h-5 items-center gap-3 text-sm">
          <span>Docs</span>
          <Separator orientation="vertical" />
          <span>Primitives</span>
          <Separator orientation="vertical" />
          <span>Components</span>
        </div>
      </LabSection>
    </div>
  );
}
