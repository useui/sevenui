"use client";

import { Badge } from "@/registry/base/ui/badge";
import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const deployments = [
  { name: "Production", branch: "main", time: "2 minutes ago", status: "Ready" },
  { name: "Preview", branch: "feat/search", time: "1 hour ago", status: "Building" },
];

export default function LayerCardPanels() {
  return (
    <LayerCard className="w-full max-w-sm">
      <LayerCardHeader>
        <LayerCardTitle>Deployments</LayerCardTitle>
      </LayerCardHeader>
      {deployments.map((deployment) => (
        <LayerCardPanel
          key={deployment.name}
          className="flex items-center justify-between gap-4"
        >
          <div className="grid gap-0.5">
            <span className="font-medium">{deployment.name}</span>
            <span className="text-xs text-muted-foreground">
              {deployment.branch} · {deployment.time}
            </span>
          </div>
          <Badge variant={deployment.status === "Ready" ? "secondary" : "outline"}>
            {deployment.status}
          </Badge>
        </LayerCardPanel>
      ))}
    </LayerCard>
  );
}
