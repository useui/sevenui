"use client";

import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const stats = [
  { label: "Requests", value: "1.2M" },
  { label: "Bandwidth", value: "84 GB" },
  { label: "Errors", value: "0.3%" },
];

export default function LayerCardHorizontal() {
  return (
    <LayerCard orientation="horizontal" stacked className="w-full max-w-lg">
      <LayerCardHeader>
        <LayerCardTitle>Usage this month</LayerCardTitle>
      </LayerCardHeader>
      {stats.map((stat) => (
        <LayerCardPanel key={stat.label} className="grid gap-1">
          <span className="text-xs text-muted-foreground">{stat.label}</span>
          <span className="text-2xl font-semibold tabular-nums">
            {stat.value}
          </span>
        </LayerCardPanel>
      ))}
    </LayerCard>
  );
}
