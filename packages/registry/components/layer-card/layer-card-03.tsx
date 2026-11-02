"use client";

import { Badge } from "@/registry/base/ui/badge";
import {
  LayerCard,
  LayerCardAction,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";
import { ScrollArea } from "@/registry/base/ui/scroll-area";

const MESSAGES = [
  "Cloning repository",
  "Restoring build cache",
  "Installing dependencies",
  "Resolved 812 packages",
  "Running type check",
  "Type check passed",
  "Running unit tests",
  "Compiling route handlers",
  "Collecting page data",
  "Generating static pages",
  "Optimizing images",
  "Uploading build output",
];

const LINES = Array.from({ length: 30 }, (_, index) => ({
  time: `12:04:${String(index * 2).padStart(2, "0")}`,
  message: MESSAGES[index % MESSAGES.length],
}));

export default function LayerCard03() {
  return (
    <LayerCard className="w-full max-w-md">
      <LayerCardHeader>
        <LayerCardTitle>Build log</LayerCardTitle>
        <LayerCardAction>
          <Badge variant="outline">Running</Badge>
        </LayerCardAction>
      </LayerCardHeader>
      <LayerCardPanel className="p-0">
        <ScrollArea className="h-56">
          <ol className="grid gap-1 p-4 font-mono text-xs">
            {LINES.map((line) => (
              <li key={line.time} className="flex gap-3">
                <span className="text-muted-foreground tabular-nums">{line.time}</span>
                <span>{line.message}</span>
              </li>
            ))}
          </ol>
        </ScrollArea>
      </LayerCardPanel>
      <LayerCardFooter>Streaming…</LayerCardFooter>
    </LayerCard>
  );
}
