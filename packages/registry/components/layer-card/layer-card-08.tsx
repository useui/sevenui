"use client";

import {
  LayerCard,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

const quotas = [
  { label: "Requests", value: 64 },
  { label: "Storage", value: 38 },
  { label: "Bandwidth", value: 81 },
];

export default function LayerCard08() {
  return (
    <LayerCard orientation="horizontal" stacked className="w-full max-w-2xl">
      <LayerCardHeader>
        <LayerCardTitle>Plan usage</LayerCardTitle>
      </LayerCardHeader>
      {quotas.map((quota) => (
        <LayerCardPanel key={quota.label}>
          <Meter value={quota.value} className="grid-cols-[1fr_auto]">
            <MeterLabel>{quota.label}</MeterLabel>
            <MeterValue />
          </Meter>
        </LayerCardPanel>
      ))}
      <LayerCardFooter>Resets on November 1</LayerCardFooter>
    </LayerCard>
  );
}
