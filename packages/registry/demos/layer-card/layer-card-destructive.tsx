"use client";

import { Button } from "@/registry/base/ui/button";
import {
  LayerCard,
  LayerCardDescription,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

export default function LayerCardDestructive() {
  return (
    <LayerCard tone="destructive" stacked className="w-full max-w-md">
      <LayerCardHeader>
        <LayerCardTitle>Danger zone</LayerCardTitle>
        <LayerCardDescription>These actions cannot be undone.</LayerCardDescription>
      </LayerCardHeader>
      <LayerCardPanel className="flex items-center justify-between gap-4">
        <div className="grid gap-0.5">
          <span className="font-medium">Transfer ownership</span>
          <span className="text-xs text-muted-foreground">
            Move this project to another team.
          </span>
        </div>
        <Button variant="outline" size="sm">
          Transfer
        </Button>
      </LayerCardPanel>
      <LayerCardPanel className="flex items-center justify-between gap-4">
        <div className="grid gap-0.5">
          <span className="font-medium">Delete project</span>
          <span className="text-xs text-muted-foreground">
            Remove the project and all of its data.
          </span>
        </div>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </LayerCardPanel>
    </LayerCard>
  );
}
