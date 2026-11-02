"use client";

import { ArrowUpRightIcon } from "lucide-react";

import {
  LayerCard,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";

const destinations = [
  { title: "Docs", description: "Install, theme, and compose primitives." },
  { title: "Components", description: "Copy-and-go compositions, free." },
  { title: "Blocks", description: "Full sections and pages for your product." },
  { title: "Changelog", description: "Everything that shipped, by release." },
];

export default function LayerCard09() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      {destinations.map((destination) => (
        <LayerCard key={destination.title}>
          <LayerCardHeader>
            <LayerCardTitle>{destination.title}</LayerCardTitle>
          </LayerCardHeader>
          <LayerCardPanel render={<a href="#" />} className="flex items-start gap-3">
            {/* The visible title sits in the header, outside the link; repeat
                it first inside so the link's name starts with the destination. */}
            <span className="sr-only">{destination.title}: </span>
            <span className="flex-1 text-muted-foreground">{destination.description}</span>
            <ArrowUpRightIcon aria-hidden="true" className="size-4 text-muted-foreground" />
          </LayerCardPanel>
        </LayerCard>
      ))}
    </div>
  );
}
