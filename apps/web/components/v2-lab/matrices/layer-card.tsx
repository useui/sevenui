"use client";

import { Button } from "@/registry/base/ui/button";
import {
  LayerCard,
  LayerCardAction,
  LayerCardDescription,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";
import { LabSection } from "../lab-frame";

const VARIANTS = ["default", "inverse", "ghost"] as const;
const SIZES = ["xs", "sm", "default", "lg"] as const;

function Sample(props: React.ComponentProps<typeof LayerCard>) {
  return (
    <LayerCard className="w-64" {...props}>
      <LayerCardHeader>
        <LayerCardTitle>Subrequests</LayerCardTitle>
        <LayerCardDescription>Origins called.</LayerCardDescription>
        <LayerCardAction>
          <Button variant="ghost" size="xs">
            Edit
          </Button>
        </LayerCardAction>
      </LayerCardHeader>
      <LayerCardPanel>Body</LayerCardPanel>
      <LayerCardFooter>Updated 2 minutes ago</LayerCardFooter>
    </LayerCard>
  );
}

export default function LayerCardMatrix() {
  return (
    <div>
      <LabSection title="variant">
        {VARIANTS.map((variant) => (
          <Sample key={variant} variant={variant} />
        ))}
      </LabSection>
      <LabSection title="size">
        {SIZES.map((size) => (
          <Sample key={size} size={size} />
        ))}
      </LabSection>
      <LabSection title="tone=destructive">
        {VARIANTS.map((variant) => (
          <Sample key={variant} variant={variant} tone="destructive" />
        ))}
      </LabSection>
      <LabSection title="stacked / dense (link panels: tab to see the ring)">
        {[
          { stacked: true, dense: false },
          { stacked: false, dense: true },
          { stacked: true, dense: true },
        ].map((flags) => (
          <LayerCard key={`${flags.stacked}-${flags.dense}`} className="w-64" {...flags}>
            <LayerCardHeader>
              <LayerCardTitle>
                stacked={String(flags.stacked)} dense={String(flags.dense)}
              </LayerCardTitle>
            </LayerCardHeader>
            <LayerCardPanel render={<a href="#a" />}>First link panel</LayerCardPanel>
            <LayerCardPanel render={<a href="#b" />}>Second link panel</LayerCardPanel>
          </LayerCard>
        ))}
      </LabSection>
      <LabSection title="orientation=horizontal">
        <LayerCard orientation="horizontal" stacked className="w-full max-w-xl">
          <LayerCardPanel>Requests 48,210</LayerCardPanel>
          <LayerCardPanel>Errors 12</LayerCardPanel>
          <LayerCardPanel fit>fit</LayerCardPanel>
        </LayerCard>
      </LabSection>
      <LabSection title="surface mode (no panel) / scoped radius">
        <LayerCard className="w-64">
          <LayerCardHeader>
            <LayerCardTitle>Surface</LayerCardTitle>
            <LayerCardDescription>The root is the panel.</LayerCardDescription>
          </LayerCardHeader>
        </LayerCard>
        <div className="[--radius:0.25rem]">
          <Sample />
        </div>
        <div className="[--radius:1rem]">
          <Sample />
        </div>
      </LabSection>
    </div>
  );
}
