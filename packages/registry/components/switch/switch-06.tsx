"use client";

import * as React from "react";

import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

type LayerId = "traffic" | "transit" | "bikes" | "places";

const layers: {
  id: LayerId;
  label: string;
  detail: string;
  swatch: string;
}[] = [
  { id: "traffic", label: "Live traffic", detail: "Updated 2 min ago", swatch: "bg-chart-1" },
  { id: "transit", label: "Transit lines", detail: "Metro and tram", swatch: "bg-chart-2" },
  { id: "bikes", label: "Bike lanes", detail: "Protected lanes only", swatch: "bg-chart-3" },
  { id: "places", label: "Saved places", detail: "4 pins in view", swatch: "bg-chart-4" },
];

// Street grid of the preview, drawn in the background color on a muted surface.
const streets = [
  "M0 40 H320",
  "M0 100 H320",
  "M0 150 H320",
  "M60 0 V180",
  "M150 0 V180",
  "M250 0 V180",
  "M0 170 L320 20",
];

const places = [
  { cx: 96, cy: 70 },
  { cx: 200, cy: 124 },
  { cx: 268, cy: 60 },
  { cx: 40, cy: 128 },
];

function layerClass(visible: boolean) {
  return visible
    ? "opacity-100 transition-opacity duration-200 ease-out"
    : "opacity-0 transition-opacity duration-200 ease-out";
}

export default function Switch06() {
  const [visible, setVisible] = React.useState<Record<LayerId, boolean>>({
    traffic: true,
    transit: true,
    bikes: false,
    places: true,
  });

  const onCount = layers.filter((layer) => visible[layer.id]).length;

  return (
    <section
      aria-labelledby="switch-06-title"
      className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
    >
      <svg
        viewBox="0 0 320 180"
        role="img"
        aria-label={`Map preview with ${onCount} of ${layers.length} layers shown`}
        className="block aspect-video w-full bg-muted"
      >
        <rect x="160" y="48" width="80" height="44" rx="6" className="fill-chart-3/15" />
        <g fill="none" strokeLinecap="round" className="stroke-background">
          {streets.map((d) => (
            <path key={d} d={d} strokeWidth={d.includes("L") ? 10 : 6} />
          ))}
        </g>
        <g fill="none" strokeLinecap="round" strokeWidth={4} className={layerClass(visible.traffic)}>
          <path d="M60 100 H150" className="stroke-chart-1" />
          <path d="M150 40 V100" className="stroke-chart-1" />
          <path d="M0 170 L100 123" strokeWidth={6} className="stroke-chart-1" />
        </g>
        <g className={layerClass(visible.transit)}>
          <path
            d="M20 20 L110 70 L210 70 L300 150"
            fill="none"
            strokeWidth={3}
            strokeDasharray="10 5"
            className="stroke-chart-2"
          />
          {[
            [110, 70],
            [210, 70],
            [300, 150],
          ].map(([cx, cy]) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={5}
              strokeWidth={2}
              className="fill-background stroke-chart-2"
            />
          ))}
        </g>
        <g
          fill="none"
          strokeWidth={2.5}
          strokeDasharray="2 5"
          strokeLinecap="round"
          className={layerClass(visible.bikes)}
        >
          <path d="M250 0 V180" className="stroke-chart-3" />
          <path d="M0 150 H250" className="stroke-chart-3" />
        </g>
        <g className={layerClass(visible.places)}>
          {places.map((place) => (
            <circle
              key={`${place.cx}-${place.cy}`}
              cx={place.cx}
              cy={place.cy}
              r={6}
              strokeWidth={2.5}
              className="fill-chart-4 stroke-background"
            />
          ))}
        </g>
      </svg>

      <div className="flex items-baseline justify-between gap-2 border-t border-border px-4 pt-3 pb-1">
        <h3 id="switch-06-title" className="text-sm font-medium">
          Map layers
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {onCount} of {layers.length} shown
        </span>
      </div>

      <ul className="flex flex-col px-2 pb-2">
        {layers.map((layer) => {
          const id = `switch-06-${layer.id}`;
          return (
            <li key={layer.id}>
              <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60">
                <span
                  aria-hidden="true"
                  className={`h-3 w-1.5 shrink-0 rounded-full ${layer.swatch}`}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <Label htmlFor={id}>{layer.label}</Label>
                  <span className="truncate text-xs text-muted-foreground">{layer.detail}</span>
                </div>
                <Switch
                  id={id}
                  checked={visible[layer.id]}
                  onCheckedChange={(checked) =>
                    setVisible((current) => ({ ...current, [layer.id]: checked }))
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
