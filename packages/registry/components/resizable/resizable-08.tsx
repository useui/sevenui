"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import type { GroupImperativeHandle } from "react-resizable-panels";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/registry/base/ui/resizable";

const defaults = {
  columns: { left: 58, right: 42 },
  left: { hero: 64, detail: 36 },
  right: { palette: 45, texture: 55 },
};

type Tile = { id: string; caption: string; alt: string };

const tiles: Record<string, Tile> = {
  hero: {
    id: "hero",
    caption: "Hero · coastline at dusk",
    alt: "Wide shot of a rocky coastline at dusk",
  },
  detail: {
    id: "detail",
    caption: "Detail · knit texture",
    alt: "Close-up of a wool knit sweater",
  },
  palette: {
    id: "palette",
    caption: "Palette",
    alt: "",
  },
  texture: {
    id: "texture",
    caption: "Product · ceramic mug",
    alt: "Hand-thrown ceramic mug on a linen cloth",
  },
};

const swatches = [
  { role: "Lead", className: "bg-chart-1" },
  { role: "Accent", className: "bg-chart-2" },
  { role: "Support", className: "bg-chart-3" },
  { role: "Neutral", className: "bg-chart-4" },
];

export default function Resizable08() {
  const columnsRef = React.useRef<GroupImperativeHandle | null>(null);
  const leftRef = React.useRef<GroupImperativeHandle | null>(null);
  const rightRef = React.useRef<GroupImperativeHandle | null>(null);
  const [columns, setColumns] = React.useState<Record<string, number>>(
    defaults.columns,
  );
  const [left, setLeft] = React.useState<Record<string, number>>(defaults.left);
  const [right, setRight] = React.useState<Record<string, number>>(
    defaults.right,
  );

  const isDefault =
    Math.round(columns.left) === defaults.columns.left &&
    Math.round(left.hero) === defaults.left.hero &&
    Math.round(right.palette) === defaults.right.palette;

  function resetLayout() {
    columnsRef.current?.setLayout(defaults.columns);
    leftRef.current?.setLayout(defaults.left);
    rightRef.current?.setLayout(defaults.right);
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Autumn campaign moodboard</CardTitle>
        <CardDescription>
          Resize tiles to weigh each reference before the shoot.
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            disabled={isDefault}
            onClick={resetLayout}
          >
            <RotateCcw aria-hidden="true" data-icon="inline-start" />
            Reset
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResizablePanelGroup
            groupRef={columnsRef}
            onLayoutChange={setColumns}
            className="overflow-hidden rounded-lg border"
          >
            <ResizablePanel id="left" defaultSize="58%" minSize="30%">
              <ResizablePanelGroup
                orientation="vertical"
                groupRef={leftRef}
                onLayoutChange={setLeft}
              >
                <ResizablePanel id="hero" defaultSize="64%" minSize="25%">
                  <PhotoTile tile={tiles.hero} />
                </ResizablePanel>
                <ResizableHandle aria-label="Resize hero and detail images" />
                <ResizablePanel id="detail" defaultSize="36%" minSize="20%">
                  <PhotoTile tile={tiles.detail} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize moodboard columns" />
            <ResizablePanel id="right" defaultSize="42%" minSize="25%">
              <ResizablePanelGroup
                orientation="vertical"
                groupRef={rightRef}
                onLayoutChange={setRight}
              >
                <ResizablePanel id="palette" defaultSize="45%" minSize="20%">
                  <div className="flex h-full flex-col gap-2 overflow-hidden p-3">
                    <span className="text-xs font-medium">
                      {tiles.palette.caption}
                    </span>
                    <ul
                      aria-label="Campaign colors"
                      className="grid flex-1 grid-cols-4 gap-1.5"
                    >
                      {swatches.map((swatch) => (
                        <li
                          key={swatch.role}
                          className={`min-h-4 rounded-md ${swatch.className}`}
                        >
                          <span className="sr-only">{swatch.role} color</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ResizablePanel>
                <ResizableHandle aria-label="Resize palette and product image" />
                <ResizablePanel id="texture" defaultSize="55%" minSize="20%">
                  <PhotoTile tile={tiles.texture} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">
          {Math.round(columns.left)} / {Math.round(columns.right)} ·{" "}
          {Math.round(left.hero)} / {Math.round(left.detail)} ·{" "}
          {Math.round(right.palette)} / {Math.round(right.texture)}
        </span>
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          Focus a divider, then
          <KbdGroup>
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
          </KbdGroup>
          or double-click to reset it
        </span>
      </CardFooter>
    </Card>
  );
}

function PhotoTile({ tile }: { tile: Tile }) {
  return (
    <figure className="relative h-full overflow-hidden bg-muted">
      <img
        src="/placeholder.svg"
        alt={tile.alt}
        className="size-full object-cover"
      />
      <figcaption className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-background/90 px-1.5 py-0.5 text-xs font-medium">
        {tile.caption}
      </figcaption>
    </figure>
  );
}
