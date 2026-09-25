"use client";

import * as React from "react";
import { Check, Link2, Link2Off, Loader2 } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";
import { Separator } from "@/registry/base/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const ORIGINAL = { width: 4032, height: 3024 };
const SCALES = [25, 50, 75, 100];
// Rough JPEG estimate at 85% quality, in bytes per pixel.
const BYTES_PER_PIXEL = 0.35;

function formatBytes(bytes: number) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function DimensionField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <NumberField
      id={id}
      value={value}
      onValueChange={(next) => onChange(next ?? 1)}
      min={1}
      max={8192}
      largeStep={100}
      allowWheelScrub
      className="min-w-0 flex-1 gap-1.5"
    >
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <NumberFieldGroup className="w-full">
        <NumberFieldInput className="w-0 min-w-0 flex-1 pl-3 text-left" />
        <span
          aria-hidden="true"
          className="flex items-center pr-3 text-xs text-muted-foreground"
        >
          px
        </span>
      </NumberFieldGroup>
    </NumberField>
  );
}

export default function NumberField14() {
  const [width, setWidth] = React.useState(2016);
  const [height, setHeight] = React.useState(1512);
  const [locked, setLocked] = React.useState(true);
  const [exportStatus, setExportStatus] = React.useState<
    "idle" | "exporting" | "done"
  >("idle");
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) clearTimeout(timer);
    };
  }, []);

  function exportImage() {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current.length = 0;
    setExportStatus("exporting");
    timers.current.push(
      setTimeout(() => setExportStatus("done"), 900),
      setTimeout(() => setExportStatus("idle"), 2900),
    );
  }

  const ratio = ORIGINAL.width / ORIGINAL.height;
  const estimate = width * height * BYTES_PER_PIXEL;
  const activeScale = SCALES.find(
    (scale) =>
      width === Math.round((ORIGINAL.width * scale) / 100) &&
      height === Math.round((ORIGINAL.height * scale) / 100),
  );

  function updateWidth(next: number) {
    setWidth(next);
    if (locked) setHeight(Math.max(1, Math.round(next / ratio)));
  }

  function updateHeight(next: number) {
    setHeight(next);
    if (locked) setWidth(Math.max(1, Math.round(next * ratio)));
  }

  function applyScale(scale: number) {
    setWidth(Math.round((ORIGINAL.width * scale) / 100));
    setHeight(Math.round((ORIGINAL.height * scale) / 100));
  }

  function toggleLock() {
    if (!locked) setHeight(Math.max(1, Math.round(width / ratio)));
    setLocked(!locked);
  }

  return (
    <section
      aria-labelledby="number-field-14-title"
      className="w-full max-w-sm overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-center gap-3 p-4">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-12 shrink-0 rounded-md border bg-muted object-cover"
        />
        <div className="min-w-0">
          <h3
            id="number-field-14-title"
            className="truncate text-sm font-medium"
          >
            Export harbor-sunrise.heic
          </h3>
          <p className="text-xs text-muted-foreground tabular-nums">
            Original {ORIGINAL.width} × {ORIGINAL.height} px · 6.2 MB
          </p>
        </div>
      </div>
      <Separator />
      <div className="grid gap-4 p-4">
        <div className="grid gap-2">
          <span id="number-field-14-scale" className="text-sm font-medium">
            Scale
          </span>
          <ToggleGroup
            aria-labelledby="number-field-14-scale"
            variant="outline"
            size="sm"
            spacing={0}
            value={activeScale ? [String(activeScale)] : []}
            onValueChange={(next) => {
              if (next.length > 0) applyScale(Number(next[0]));
            }}
            className="w-full"
          >
            {SCALES.map((scale) => (
              <ToggleGroupItem
                key={scale}
                value={String(scale)}
                className="flex-1 tabular-nums"
              >
                {scale}%
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex items-end gap-2">
          <DimensionField
            id="number-field-14-width"
            label="Width"
            value={width}
            onChange={updateWidth}
          />
          <Button
            variant={locked ? "secondary" : "ghost"}
            size="icon"
            className="mb-0.5"
            aria-pressed={locked}
            aria-label="Keep aspect ratio"
            onClick={toggleLock}
          >
            {locked ? (
              <Link2 aria-hidden="true" />
            ) : (
              <Link2Off aria-hidden="true" />
            )}
          </Button>
          <DimensionField
            id="number-field-14-height"
            label="Height"
            value={height}
            onChange={updateHeight}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Arrow keys step by 1, Shift + arrow by 100. Scroll over a focused
          field to adjust it.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          JPEG · about{" "}
          <span className="font-medium text-foreground tabular-nums">
            {formatBytes(estimate)}
          </span>
        </p>
        <Button
          size="sm"
          disabled={exportStatus === "exporting"}
          onClick={exportImage}
        >
          {exportStatus === "exporting" ? (
            <Loader2
              aria-hidden="true"
              data-icon="inline-start"
              className="animate-spin"
            />
          ) : exportStatus === "done" ? (
            <Check aria-hidden="true" data-icon="inline-start" />
          ) : null}
          {exportStatus === "exporting"
            ? "Exporting…"
            : exportStatus === "done"
              ? "Exported"
              : "Export"}
        </Button>
      </div>
    </section>
  );
}
