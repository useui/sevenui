"use client";

import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

export default function LayerCardRadius() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <LayerCard className="[--layer-card-radius:var(--radius-sm)]">
        <LayerCardHeader>
          <LayerCardTitle>Small radius</LayerCardTitle>
        </LayerCardHeader>
        <LayerCardPanel className="text-muted-foreground">
          The panel radius follows the tray.
        </LayerCardPanel>
      </LayerCard>
      <LayerCard>
        <LayerCardHeader>
          <LayerCardTitle>Media panel</LayerCardTitle>
        </LayerCardHeader>
        <LayerCardPanel className="overflow-hidden p-0">
          <img
            src="/placeholder.svg"
            alt=""
            className="aspect-video w-full rounded-(--layer-card-panel-radius) object-cover"
          />
        </LayerCardPanel>
      </LayerCard>
    </div>
  );
}
