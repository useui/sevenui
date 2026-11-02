"use client";

import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const variants = ["default", "inverse", "ghost"] as const;

export default function LayerCardVariants() {
  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-3">
      {variants.map((variant) => (
        <LayerCard key={variant} variant={variant}>
          <LayerCardHeader>
            <LayerCardTitle className="capitalize">{variant}</LayerCardTitle>
          </LayerCardHeader>
          <LayerCardPanel className="text-muted-foreground">
            Panel content
          </LayerCardPanel>
        </LayerCard>
      ))}
    </div>
  );
}
