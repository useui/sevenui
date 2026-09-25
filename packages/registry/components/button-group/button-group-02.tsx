"use client";

import { Layers, LocateFixed, Minus, Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const DEFAULT_ZOOM = 12;

const depots = [
  { name: "North pier", top: "28%", left: "22%" },
  { name: "Fish market", top: "44%", left: "58%" },
  { name: "Dry dock", top: "62%", left: "34%" },
  { name: "Ferry terminal", top: "22%", left: "64%" },
];

const pressedClass =
  "aria-pressed:bg-muted aria-pressed:text-foreground dark:aria-pressed:bg-input/60";

export default function ButtonGroup02() {
  const [zoom, setZoom] = React.useState(DEFAULT_ZOOM);
  const [located, setLocated] = React.useState(false);
  const [showDepots, setShowDepots] = React.useState(true);
  const gridSize = Math.round(32 * 1.2 ** (zoom - DEFAULT_ZOOM));

  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl border border-border bg-muted">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-center transition-[background-size] duration-200"
        style={{ backgroundSize: `${gridSize}px ${gridSize}px` }}
      />
      {showDepots
        ? depots.map((depot) => (
            <span
              key={depot.name}
              title={depot.name}
              aria-hidden="true"
              className="absolute size-3 -translate-1/2 rounded-full border-2 border-background bg-primary shadow-sm"
              style={{ top: depot.top, left: depot.left }}
            />
          ))
        : null}
      {located ? (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex size-4 -translate-1/2 items-center justify-center rounded-full bg-chart-2/30"
        >
          <span className="size-2 rounded-full bg-chart-2 ring-2 ring-background" />
        </span>
      ) : null}
      <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 px-3 py-2 shadow-sm">
        <p className="text-sm font-medium">Harbor District</p>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {located
            ? "Centered on your location"
            : showDepots
              ? `${depots.length} depots in view`
              : "Depot layer hidden"}
        </p>
      </div>
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <ButtonGroup
          orientation="vertical"
          aria-label="Zoom"
          className="shadow-sm"
        >
          <Button
            variant="outline"
            size="icon"
            aria-label="Zoom in"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
          >
            <Plus aria-hidden="true" />
          </Button>
          <ButtonGroupText
            aria-live="polite"
            className="justify-center bg-background px-0 py-1 text-xs tabular-nums dark:bg-input/30"
          >
            <span className="sr-only">Zoom level </span>
            {zoom}
          </ButtonGroupText>
          <Button
            variant="outline"
            size="icon"
            aria-label="Zoom out"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
          >
            <Minus aria-hidden="true" />
          </Button>
        </ButtonGroup>
        <ButtonGroup
          orientation="vertical"
          aria-label="Map view"
          className="shadow-sm"
        >
          <Button
            variant="outline"
            size="icon"
            aria-label="Show my location"
            aria-pressed={located}
            onClick={() => {
              setLocated((l) => !l);
              if (!located) setZoom(15);
            }}
            className={pressedClass}
          >
            <LocateFixed aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Show depot layer"
            aria-pressed={showDepots}
            onClick={() => setShowDepots((d) => !d)}
            className={pressedClass}
          >
            <Layers aria-hidden="true" />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
