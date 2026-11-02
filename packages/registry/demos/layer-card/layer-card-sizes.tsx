"use client";

import {
  LayerCard,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const sizes = ["xs", "sm", "default", "lg"] as const;

export default function LayerCardSizes() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      {sizes.map((size) => (
        <LayerCard key={size} size={size}>
          <LayerCardHeader>
            <LayerCardTitle>{size}</LayerCardTitle>
          </LayerCardHeader>
          <LayerCardPanel className="text-muted-foreground">
            Panel content
          </LayerCardPanel>
          <LayerCardFooter>Footer</LayerCardFooter>
        </LayerCard>
      ))}
    </div>
  );
}
