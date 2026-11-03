"use client";

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/registry/base/ui/bubble";
import { LabSection } from "../lab-frame";

const VARIANTS = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
] as const;

export default function BubbleMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`variant=${variant}`}>
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Bubble variant={variant}>
              <BubbleContent>Static {variant} bubble.</BubbleContent>
            </Bubble>
            <Bubble variant={variant} align="end">
              <BubbleContent render={<button type="button" />}>
                Interactive (button), align=end
              </BubbleContent>
            </Bubble>
            <Bubble variant={variant}>
              <BubbleContent render={<a href="#bubble" />}>Interactive (link)</BubbleContent>
            </Bubble>
          </div>
        </LabSection>
      ))}
      <LabSection title="group + long text">
        <BubbleGroup className="w-full max-w-sm">
          <Bubble align="end">
            <BubbleContent>Add a danger zone with a delete-workspace dialog.</BubbleContent>
          </Bubble>
          <Bubble variant="ghost">
            <BubbleContent>
              Searched the registry for alert-dialog, installed it, and composed
              settings/danger-zone.tsx with a confirm step that names the workspace.
            </BubbleContent>
          </Bubble>
        </BubbleGroup>
      </LabSection>
      <LabSection title="reactions (bottom/end, top/start, interactive)">
        <div className="flex w-full max-w-sm flex-col gap-8 py-4">
          <Bubble variant="muted">
            <BubbleContent>Shipped it.</BubbleContent>
            <BubbleReactions>+2</BubbleReactions>
          </Bubble>
          <Bubble align="end">
            <BubbleContent>Nice work.</BubbleContent>
            <BubbleReactions side="top" align="start">
              <button type="button" className="rounded-full px-1.5 py-0.5 outline-none focus-visible:focus-ring">
                +1
              </button>
            </BubbleReactions>
          </Bubble>
        </div>
      </LabSection>
    </div>
  );
}
