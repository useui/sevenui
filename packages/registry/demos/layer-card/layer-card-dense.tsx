"use client";

import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const warehouses = [
  { name: "Warehouse A", units: "1,240 units" },
  { name: "Warehouse B", units: "860 units" },
];

function Inventory({ stacked }: { stacked?: boolean }) {
  return (
    <LayerCard dense stacked={stacked}>
      <LayerCardHeader>
        <LayerCardTitle>{stacked ? "Dense, stacked" : "Dense"}</LayerCardTitle>
      </LayerCardHeader>
      {warehouses.map((warehouse) => (
        <LayerCardPanel
          key={warehouse.name}
          className="flex items-center justify-between"
        >
          <span>{warehouse.name}</span>
          <span className="tabular-nums text-muted-foreground">
            {warehouse.units}
          </span>
        </LayerCardPanel>
      ))}
    </LayerCard>
  );
}

export default function LayerCardDense() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <Inventory />
      <Inventory stacked />
    </div>
  );
}
