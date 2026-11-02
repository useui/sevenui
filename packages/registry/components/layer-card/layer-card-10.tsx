"use client";

import { Button } from "@/registry/base/ui/button";
import {
  LayerCard,
  LayerCardDescription,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const actions = [
  {
    title: "Archive project",
    description: "Hide the project and pause its deployments. You can restore it later.",
    label: "Archive",
    variant: "outline" as const,
  },
  {
    title: "Delete project",
    description: "Permanently remove the project, its domains, and its build history.",
    label: "Delete",
    variant: "destructive" as const,
  },
];

export default function LayerCard10() {
  return (
    <LayerCard tone="destructive" stacked className="w-full max-w-lg">
      <LayerCardHeader>
        <LayerCardTitle>Danger zone</LayerCardTitle>
        <LayerCardDescription>
          These actions affect everyone on the team.
        </LayerCardDescription>
      </LayerCardHeader>
      {actions.map((action) => (
        <LayerCardPanel
          key={action.title}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="grid min-w-48 flex-1 gap-0.5">
            <span className="font-medium">{action.title}</span>
            <span className="text-xs text-muted-foreground">{action.description}</span>
          </div>
          <Button variant={action.variant} size="sm">
            {action.label}
          </Button>
        </LayerCardPanel>
      ))}
    </LayerCard>
  );
}
