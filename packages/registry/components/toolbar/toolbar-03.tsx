"use client";

import * as React from "react";
import { Crop, FlipHorizontal2, RotateCw, SlidersHorizontal } from "lucide-react";

import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

const actions = [
  { label: "Crop", icon: Crop },
  { label: "Rotate", icon: RotateCw },
  { label: "Flip", icon: FlipHorizontal2 },
  { label: "Adjust", icon: SlidersHorizontal },
];

const surfaces = [
  {
    name: "Outline",
    note: "Border and hairline shadow",
    root: "",
    button: "",
    separator: "",
  },
  {
    name: "Ghost",
    note: "No chrome until hover",
    root: "border-transparent bg-transparent shadow-none",
    button: "",
    separator: "",
  },
  {
    name: "Filled",
    note: "Muted well, raised hover",
    root: "border-transparent bg-muted shadow-none",
    button:
      "text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-xs",
    separator: "bg-foreground/10",
  },
  {
    name: "Floating",
    note: "Elevated pill over content",
    root: "rounded-full px-1.5 shadow-lg",
    button: "rounded-full",
    separator: "",
  },
  {
    name: "Inverted",
    note: "High-contrast primary surface",
    root: "border-transparent bg-primary text-primary-foreground shadow-md",
    button:
      "hover:bg-primary-foreground/15 hover:text-primary-foreground focus-visible:ring-primary-foreground/60",
    separator: "bg-primary-foreground/20",
  },
];

export default function Toolbar03() {
  return (
    <div className="grid w-full max-w-md gap-3">
      {surfaces.map((surface) => (
        <div
          key={surface.name}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-dashed p-3"
        >
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">{surface.name}</span>
            <span className="text-xs text-muted-foreground">
              {surface.note}
            </span>
          </div>
          <Toolbar
            aria-label={`Image actions, ${surface.name.toLowerCase()} style`}
            className={surface.root}
          >
            {actions.map((action, index) => (
              <React.Fragment key={action.label}>
                {index === 3 ? (
                  <ToolbarSeparator className={surface.separator} />
                ) : null}
                <ToolbarButton
                  aria-label={action.label}
                  className={surface.button}
                >
                  <action.icon aria-hidden="true" />
                </ToolbarButton>
              </React.Fragment>
            ))}
          </Toolbar>
        </div>
      ))}
    </div>
  );
}
