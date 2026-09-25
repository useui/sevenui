"use client";

import * as React from "react";
import { Bookmark, Pause, Play, RotateCcw, RotateCw } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Progress } from "@/registry/base/ui/progress";
import { Toggle } from "@/registry/base/ui/toggle";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from "@/registry/base/ui/toolbar";

const DURATION = 2538;
const speeds = ["0.75", "1", "1.25", "1.5", "2"];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export default function Toolbar04() {
  const [position, setPosition] = React.useState(754);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState("1");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setPosition((value) => Math.min(DURATION, value + Number(speed)));
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, speed]);

  React.useEffect(() => {
    if (position >= DURATION) setPlaying(false);
  }, [position]);

  function skip(seconds: number) {
    setPosition((value) => Math.min(DURATION, Math.max(0, value + seconds)));
  }

  return (
    <section
      aria-label="Now playing"
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-xs"
    >
      <div className="flex items-center gap-3">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-14 shrink-0 rounded-lg border bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">
            Pricing pages that convert
          </span>
          <span className="truncate text-xs text-muted-foreground">
            Shipping Notes · Episode 112
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Progress
          value={position}
          max={DURATION}
          aria-label="Playback position"
          getAriaValueText={() =>
            `${formatTime(position)} of ${formatTime(DURATION)}`
          }
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatTime(position)}</span>
          <span>-{formatTime(DURATION - position)}</span>
        </div>
      </div>

      <Toolbar
        aria-label="Playback controls"
        className="w-full justify-between border-0 bg-transparent p-0 shadow-none"
      >
        <DropdownMenu>
          <ToolbarButton
            render={<DropdownMenuTrigger />}
            aria-label={`Playback speed, ${speed}x`}
            className="w-12 text-xs tabular-nums"
          >
            {speed}x
          </ToolbarButton>
          <DropdownMenuContent align="start" className="w-36">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Playback speed</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={speed}
                onValueChange={(value) => setSpeed(value as string)}
              >
                {speeds.map((value) => (
                  <DropdownMenuRadioItem
                    key={value}
                    value={value}
                    closeOnClick
                  >
                    {value}x
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarGroup aria-label="Transport" className="gap-2">
          <ToolbarButton
            aria-label="Back 15 seconds"
            onClick={() => skip(-15)}
            className="size-10 rounded-full"
          >
            <RotateCcw aria-hidden="true" className="size-5" />
          </ToolbarButton>
          <ToolbarButton
            aria-label={playing ? "Pause" : "Play"}
            disabled={position >= DURATION}
            onClick={() => setPlaying((value) => !value)}
            className="size-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-5 fill-current" />
            ) : (
              <Play aria-hidden="true" className="size-5 fill-current" />
            )}
          </ToolbarButton>
          <ToolbarButton
            aria-label="Forward 30 seconds"
            onClick={() => skip(30)}
            className="size-10 rounded-full"
          >
            <RotateCw aria-hidden="true" className="size-5" />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarButton
          render={<Toggle pressed={saved} onPressedChange={setSaved} />}
          aria-label="Save episode"
          className="w-12"
        >
          <Bookmark
            aria-hidden="true"
            className={saved ? "fill-current" : undefined}
          />
        </ToolbarButton>
      </Toolbar>
    </section>
  );
}
