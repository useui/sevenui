"use client";

import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const services = [
  { name: "Auth service", status: "Healthy · 12 ms p95" },
  { name: "Database", status: "Healthy · 4 ms p95" },
  { name: "Storage", status: "Degraded · 380 ms p95" },
];

export default function LayerCardStacked() {
  return (
    <LayerCard stacked className="w-full max-w-sm">
      <LayerCardHeader>
        <LayerCardTitle>Server logs</LayerCardTitle>
      </LayerCardHeader>
      {services.map((service) => (
        <LayerCardPanel key={service.name} className="grid gap-0.5">
          <span className="font-medium">{service.name}</span>
          <span className="text-xs text-muted-foreground">{service.status}</span>
        </LayerCardPanel>
      ))}
    </LayerCard>
  );
}
