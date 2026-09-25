"use client";

import * as React from "react";
import { FlipHorizontal2, RotateCcw, RotateCw, Undo2 } from "lucide-react";

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/registry/base/ui/menubar";

type Crop = "original" | "square" | "wide" | "portrait";
type Filter = "none" | "mono" | "warm" | "faded";

const crops: Record<Crop, { label: string; ratio: number; frame: string }> = {
  original: { label: "Original 3:2", ratio: 3 / 2, frame: "aspect-[3/2]" },
  square: { label: "Square 1:1", ratio: 1, frame: "aspect-square" },
  wide: { label: "Widescreen 16:9", ratio: 16 / 9, frame: "aspect-video" },
  portrait: { label: "Portrait 4:5", ratio: 4 / 5, frame: "aspect-[4/5]" },
};

const filters: Record<Filter, { label: string; className: string }> = {
  none: { label: "No filter", className: "" },
  mono: { label: "Mono", className: "grayscale" },
  warm: { label: "Warm", className: "sepia-[.35] saturate-150" },
  faded: { label: "Faded", className: "contrast-75 brightness-110" },
};

const triggerClass = "focus-visible:ring-2 focus-visible:ring-ring/50";

export default function Menubar05() {
  const [crop, setCrop] = React.useState<Crop>("original");
  const [filter, setFilter] = React.useState<Filter>("none");
  const [rotation, setRotation] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [showGrid, setShowGrid] = React.useState(true);
  const [showOriginal, setShowOriginal] = React.useState(false);

  const edited =
    crop !== "original" || filter !== "none" || rotation !== 0 || flipped;
  const quarterTurn = rotation % 180 !== 0;
  const ratio = crops[crop].ratio;
  const scale = quarterTurn ? Math.max(ratio, 1 / ratio) : 1;

  function rotate(delta: number) {
    setRotation((current) => (current + delta + 360) % 360);
  }

  function revert() {
    setCrop("original");
    setFilter("none");
    setRotation(0);
    setFlipped(false);
  }

  const summary = showOriginal
    ? "Showing the original photo"
    : edited
      ? [
          crops[crop].label,
          filter === "none" ? null : filters[filter].label,
          rotation ? `${rotation}°` : null,
          flipped ? "Flipped" : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "No edits yet";

  return (
    <section
      aria-labelledby="menubar-05-title"
      className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <Menubar aria-label="Photo editor">
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Image</MenubarTrigger>
            <MenubarContent className="min-w-56">
              <MenubarItem closeOnClick={false} onClick={() => rotate(90)}>
                <RotateCw aria-hidden="true" />
                Rotate clockwise
                <MenubarShortcut>⌘R</MenubarShortcut>
              </MenubarItem>
              <MenubarItem closeOnClick={false} onClick={() => rotate(-90)}>
                <RotateCcw aria-hidden="true" />
                Rotate counterclockwise
                <MenubarShortcut>⇧⌘R</MenubarShortcut>
              </MenubarItem>
              <MenubarCheckboxItem
                checked={flipped}
                onCheckedChange={(checked) => setFlipped(checked)}
              >
                Flip horizontal
                <FlipHorizontal2
                  aria-hidden="true"
                  className="ml-auto size-4 text-muted-foreground"
                />
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Crop to</MenubarSubTrigger>
                <MenubarSubContent className="min-w-44">
                  <MenubarRadioGroup
                    value={crop}
                    onValueChange={(value) => setCrop(value as Crop)}
                  >
                    {(Object.keys(crops) as Crop[]).map((key) => (
                      <MenubarRadioItem key={key} value={key}>
                        {crops[key].label}
                      </MenubarRadioItem>
                    ))}
                  </MenubarRadioGroup>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem disabled={!edited} onClick={revert}>
                <Undo2 aria-hidden="true" />
                Revert all edits
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Filter</MenubarTrigger>
            <MenubarContent className="min-w-40">
              <MenubarRadioGroup
                value={filter}
                onValueChange={(value) => setFilter(value as Filter)}
              >
                <MenubarLabel className="text-xs text-muted-foreground">
                  Look
                </MenubarLabel>
                {(Object.keys(filters) as Filter[]).map((key) => (
                  <MenubarRadioItem key={key} value={key}>
                    {filters[key].label}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>View</MenubarTrigger>
            <MenubarContent className="min-w-48">
              <MenubarCheckboxItem
                checked={showGrid}
                onCheckedChange={(checked) => setShowGrid(checked)}
              >
                Rule-of-thirds grid
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={showOriginal}
                onCheckedChange={(checked) => setShowOriginal(checked)}
              >
                Compare with original
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        <h3
          id="menubar-05-title"
          className="truncate text-xs text-muted-foreground"
        >
          harbor-dawn.jpg
        </h3>
      </div>

      <div className="flex justify-center bg-muted/40 p-4">
        <div
          className={`relative w-full max-w-72 overflow-hidden rounded-md bg-muted transition-[aspect-ratio] duration-200 ${
            showOriginal ? crops.original.frame : crops[crop].frame
          }`}
        >
          <img
            src="/placeholder.svg"
            alt="Harbor at dawn with moored fishing boats"
            className={`size-full object-cover transition-transform duration-200 ease-out ${
              showOriginal ? "" : filters[filter].className
            }`}
            style={
              showOriginal
                ? undefined
                : {
                    transform: `rotate(${rotation}deg) scale(${
                      flipped ? -scale : scale
                    }, ${scale})`,
                  }
            }
          />
          {showGrid ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 *:absolute *:bg-background/70"
            >
              <span className="inset-y-0 left-1/3 w-px" />
              <span className="inset-y-0 left-2/3 w-px" />
              <span className="inset-x-0 top-1/3 h-px" />
              <span className="inset-x-0 top-2/3 h-px" />
            </div>
          ) : null}
        </div>
      </div>

      <p
        aria-live="polite"
        className="truncate border-t px-3 py-2 text-xs text-muted-foreground"
      >
        {summary}
      </p>
    </section>
  );
}
