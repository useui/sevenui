"use client";

import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";

const episode = {
  show: "Shipping Notes",
  title: "Ep. 42: Pricing pages that convert",
  duration: 38 * 60 + 12,
};

const speeds = [1, 1.25, 1.5, 2];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export default function ButtonGroup01() {
  const [position, setPosition] = React.useState(754);
  const [playing, setPlaying] = React.useState(false);
  const [speedIndex, setSpeedIndex] = React.useState(0);
  const speed = speeds[speedIndex];

  React.useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setPosition((p) => Math.min(episode.duration, p + speed));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [playing, speed]);

  React.useEffect(() => {
    if (position >= episode.duration) setPlaying(false);
  }, [position]);

  function seek(delta: number) {
    setPosition((p) => Math.min(episode.duration, Math.max(0, p + delta)));
  }

  const progress = (position / episode.duration) * 100;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-xs text-muted-foreground">{episode.show}</p>
        <p className="truncate text-sm font-medium">{episode.title}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <div
          aria-hidden="true"
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>
            <span className="sr-only">Elapsed </span>
            {formatTime(position)}
          </span>
          <span>
            <span className="sr-only">Remaining </span>-
            {formatTime(episode.duration - position)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ButtonGroup aria-label="Playback">
          <Button
            variant="outline"
            size="icon"
            aria-label="Back 15 seconds"
            onClick={() => seek(-15)}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            className="w-24"
            onClick={() => {
              if (position >= episode.duration) setPosition(0);
              setPlaying((p) => !p);
            }}
          >
            {playing ? (
              <Pause aria-hidden="true" data-icon="inline-start" />
            ) : (
              <Play aria-hidden="true" data-icon="inline-start" />
            )}
            {playing ? "Pause" : "Play"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Forward 30 seconds"
            onClick={() => seek(30)}
          >
            <RotateCw aria-hidden="true" />
          </Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Playback speed">
          <ButtonGroupText
            render={<span />}
            className="bg-background font-normal text-muted-foreground max-sm:hidden dark:bg-input/30"
          >
            Speed
          </ButtonGroupText>
          <Button
            variant="outline"
            className="w-14 tabular-nums"
            aria-label={`Playback speed ${speed}x. Change speed`}
            onClick={() => setSpeedIndex((i) => (i + 1) % speeds.length)}
          >
            {speed}x
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
