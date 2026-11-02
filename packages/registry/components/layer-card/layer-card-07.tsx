"use client";

import { Badge } from "@/registry/base/ui/badge";
import {
  LayerCard,
  LayerCardDescription,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const variables = [
  { key: "DATABASE_URL", scope: "Production" },
  { key: "STRIPE_SECRET_KEY", scope: "Production" },
  { key: "NEXT_PUBLIC_SITE_URL", scope: "All" },
];

export default function LayerCard07() {
  return (
    <LayerCard className="w-full max-w-md">
      <LayerCardHeader>
        <LayerCardTitle>Project</LayerCardTitle>
        <LayerCardDescription>acme-storefront</LayerCardDescription>
      </LayerCardHeader>
      <LayerCardPanel className="grid gap-4">
        <p className="text-muted-foreground">
          Variables are encrypted at rest and exposed to builds and functions.
        </p>
        <LayerCard variant="inverse" size="sm" stacked>
          <LayerCardHeader>
            <LayerCardTitle>Environment variables</LayerCardTitle>
          </LayerCardHeader>
          {variables.map((variable) => (
            <LayerCardPanel
              key={variable.key}
              className="flex items-center justify-between gap-4"
            >
              <span className="truncate font-mono text-xs">{variable.key}</span>
              <Badge variant="outline">{variable.scope}</Badge>
            </LayerCardPanel>
          ))}
        </LayerCard>
      </LayerCardPanel>
    </LayerCard>
  );
}
