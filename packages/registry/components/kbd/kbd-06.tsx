"use client";

import * as React from "react";
import { cn } from "cn";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react";

import { Kbd } from "@/registry/base/ui/kbd";

const arrows = {
  ArrowUp: { label: "Up", icon: ArrowUpIcon },
  ArrowLeft: { label: "Left", icon: ArrowLeftIcon },
  ArrowDown: { label: "Down", icon: ArrowDownIcon },
  ArrowRight: { label: "Right", icon: ArrowRightIcon },
} as const;

type ArrowKey = keyof typeof arrows;

function isArrowKey(key: string): key is ArrowKey {
  return key in arrows;
}

function Keycap({ code, pressed }: { code: ArrowKey; pressed: boolean }) {
  const { icon: Icon } = arrows[code];
  return (
    <Kbd
      data-pressed={pressed ? "" : undefined}
      className={cn(
        "size-11 rounded-lg border border-b-4 border-border bg-background text-foreground shadow-xs transition-[translate,border-width,background-color,box-shadow] duration-100 ease-out motion-reduce:transition-none",
        "data-pressed:translate-y-[3px] data-pressed:border-b data-pressed:border-primary/40 data-pressed:bg-accent data-pressed:shadow-none",
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
    </Kbd>
  );
}

export default function Kbd06() {
  const [pressed, setPressed] = React.useState<Set<ArrowKey>>(new Set());
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isArrowKey(event.key)) return;
    event.preventDefault();
    const key = event.key;
    setPressed((current) => new Set(current).add(key));
    const dx = key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0;
    const dy = key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0;
    // Keep the dot inside the 5 x 5 grid.
    setPosition((current) => ({
      x: Math.max(-2, Math.min(2, current.x + dx)),
      y: Math.max(-2, Math.min(2, current.y + dy)),
    }));
  };

  const onKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isArrowKey(event.key)) return;
    const key = event.key;
    setPressed((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  };

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <div
        role="application"
        aria-label="Arrow key playground"
        aria-describedby="kbd-arrows-hint"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the region captures arrow keys to animate the keycaps.
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => setPressed(new Set())}
        className="flex w-full flex-col items-center gap-5 rounded-xl border bg-muted/40 p-6 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div
          aria-hidden="true"
          className="relative grid size-24 grid-cols-5 grid-rows-5 rounded-lg border border-dashed border-border bg-background"
        >
          <span
            className="size-3 place-self-center rounded-full bg-primary"
            style={{
              gridColumn: position.x + 3,
              gridRow: position.y + 3,
            }}
          />
        </div>
        <div aria-hidden="true" className="grid grid-cols-3 gap-1.5">
          <span />
          <Keycap code="ArrowUp" pressed={pressed.has("ArrowUp")} />
          <span />
          <Keycap code="ArrowLeft" pressed={pressed.has("ArrowLeft")} />
          <Keycap code="ArrowDown" pressed={pressed.has("ArrowDown")} />
          <Keycap code="ArrowRight" pressed={pressed.has("ArrowRight")} />
        </div>
        <p aria-live="polite" className="sr-only">
          {`Column ${position.x + 3} of 5, row ${position.y + 3} of 5`}
        </p>
      </div>
      <p
        id="kbd-arrows-hint"
        className="text-center text-xs text-balance text-muted-foreground"
      >
        Focus the panel, then hold the arrow keys to see each keycap press
        down.
      </p>
    </div>
  );
}
