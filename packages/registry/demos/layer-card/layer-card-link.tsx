"use client";

import { ChevronRightIcon } from "lucide-react";

import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const steps = [
  { title: "Install the CLI", description: "Set up shadcn in your project." },
  { title: "Add your first primitive", description: "Copy the source you own." },
  { title: "Customize the theme", description: "Pick colors and radius." },
];

export default function LayerCardLink() {
  return (
    <LayerCard className="w-full max-w-sm">
      <LayerCardHeader>
        <LayerCardTitle>Next steps</LayerCardTitle>
      </LayerCardHeader>
      {steps.map((step) => (
        <LayerCardPanel
          key={step.title}
          render={<a href="#" />}
          className="flex items-center gap-3"
        >
          <div className="grid flex-1 gap-0.5">
            <span className="font-medium">{step.title}</span>
            <span className="text-xs text-muted-foreground">
              {step.description}
            </span>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        </LayerCardPanel>
      ))}
    </LayerCard>
  );
}
