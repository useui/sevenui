"use client";

import { Pause, Play } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";

// Share of the episode already watched, in percent.
const WATCHED = 38;

export default function AspectRatio05() {
  const [playing, setPlaying] = React.useState(false);

  return (
    <figure className="flex w-full max-w-md flex-col gap-3">
      <AspectRatio
        ratio={16 / 9}
        className="group overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10"
      >
        <img
          src="/placeholder.svg"
          alt="Speaker on stage in front of a slide about incremental rendering"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
        <Badge className="absolute top-3 left-3">
          {playing ? "Playing" : "Replay"}
        </Badge>
        <span className="absolute top-3 right-3 rounded-md bg-background/85 px-1.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
          42:17
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="icon-lg"
            aria-label={
              playing
                ? "Pause Streaming server components"
                : "Resume Streaming server components at 16:04"
            }
            onClick={() => setPlaying((value) => !value)}
            className="size-12 rounded-full shadow-lg transition-transform group-hover:scale-110 motion-reduce:transition-none"
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-5 fill-current" />
            ) : (
              <Play aria-hidden="true" className="size-5 fill-current" />
            )}
          </Button>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1 bg-background/60"
        >
          <div className="h-full bg-primary" style={{ width: `${WATCHED}%` }} />
        </div>
      </AspectRatio>
      <figcaption className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">Streaming server components</span>
        <span className="text-xs text-muted-foreground">
          Frontend Summit 2026 ·{" "}
          {playing ? "Now playing from 16:04" : `${WATCHED}% watched, resumes at 16:04`}
        </span>
      </figcaption>
    </figure>
  );
}
