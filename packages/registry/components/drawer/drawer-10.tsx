"use client";

import * as React from "react";
import {
  PauseIcon,
  PlayIcon,
  Repeat2Icon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { Slider } from "@/registry/base/ui/slider";

type Track = {
  id: string;
  title: string;
  artist: string;
  length: number;
};

const queue: Track[] = [
  { id: "t1", title: "Low Tide Radio", artist: "Marlow Bay", length: 214 },
  { id: "t2", title: "Paper Lanterns", artist: "Ines Okafor", length: 187 },
  { id: "t3", title: "Northbound", artist: "The Quiet Hours", length: 243 },
  { id: "t4", title: "Salt & Static", artist: "Marlow Bay", length: 198 },
];

// Fixed play order used while shuffle is on, so the example stays deterministic.
const shuffleOrder = [2, 0, 3, 1];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export default function Drawer10() {
  const [index, setIndex] = React.useState(0);
  const [position, setPosition] = React.useState(48);
  const [playing, setPlaying] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState(false);

  const track = queue[index];

  const playTrack = React.useCallback((next: number) => {
    setIndex((next + queue.length) % queue.length);
    setPosition(0);
  }, []);

  const nextIndex = shuffle
    ? shuffleOrder[(shuffleOrder.indexOf(index) + 1) % shuffleOrder.length]
    : (index + 1) % queue.length;

  // Remaining tracks in the order they will play.
  const upNextOrder: number[] = [];
  for (let cursor = nextIndex; upNextOrder.length < queue.length - 1; ) {
    upNextOrder.push(cursor);
    cursor = shuffle
      ? shuffleOrder[(shuffleOrder.indexOf(cursor) + 1) % shuffleOrder.length]
      : (cursor + 1) % queue.length;
  }

  // Advance the playhead once per second while playing.
  React.useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setPosition((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [playing]);

  // Move to the next track (or loop the current one) at the end.
  React.useEffect(() => {
    if (position < track.length) return;
    if (repeat) setPosition(0);
    else playTrack(nextIndex);
  }, [position, track.length, repeat, nextIndex, playTrack]);

  const playButton = (
    <Button
      size="icon"
      aria-label={playing ? "Pause" : "Play"}
      onClick={() => setPlaying((current) => !current)}
    >
      {playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
    </Button>
  );

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border bg-card text-card-foreground">
      <Drawer showSwipeHandle>
        <div className="flex items-center gap-3 p-2 pr-3">
          <DrawerTrigger
            aria-label={`Open player: ${track.title} by ${track.artist}`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <img
              src="/placeholder.svg"
              alt=""
              className="size-10 shrink-0 rounded-md bg-muted object-cover"
            />
            <span className="grid min-w-0 flex-1">
              <span className="truncate text-sm font-medium">{track.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {track.artist}
              </span>
            </span>
          </DrawerTrigger>
          {playButton}
        </div>
        <div aria-hidden="true" className="h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-1000 ease-linear"
            style={{ width: `${(position / track.length) * 100}%` }}
          />
        </div>

        <DrawerContent>
          <div className="mx-auto flex min-h-0 w-full max-w-sm flex-col gap-5 overflow-y-auto p-4 pt-2">
            <img
              src="/placeholder.svg"
              alt={`Cover art for ${track.title}`}
              className="mx-auto aspect-square w-full max-w-56 rounded-xl bg-muted object-cover"
            />
            <DrawerHeader className="p-0 text-left md:text-left">
              <DrawerTitle className="text-lg">{track.title}</DrawerTitle>
              <DrawerDescription>
                {track.artist} · Track {index + 1} of {queue.length}
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid gap-2">
              <Slider
                aria-label="Seek"
                min={0}
                max={track.length}
                value={position}
                onValueChange={(value) =>
                  setPosition(Array.isArray(value) ? value[0] : value)
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>{formatTime(position)}</span>
                <span>-{formatTime(track.length - position)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Shuffle"
                aria-pressed={shuffle}
                className="aria-pressed:text-primary"
                onClick={() => setShuffle((current) => !current)}
              >
                <ShuffleIcon aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label="Previous track"
                onClick={() =>
                  position > 3 ? setPosition(0) : playTrack(index - 1)
                }
              >
                <SkipBackIcon aria-hidden="true" />
              </Button>
              <Button
                size="icon-lg"
                className="size-12 rounded-full"
                aria-label={playing ? "Pause" : "Play"}
                onClick={() => setPlaying((current) => !current)}
              >
                {playing ? (
                  <PauseIcon aria-hidden="true" />
                ) : (
                  <PlayIcon aria-hidden="true" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label="Next track"
                onClick={() => playTrack(nextIndex)}
              >
                <SkipForwardIcon aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Repeat track"
                aria-pressed={repeat}
                className="aria-pressed:text-primary"
                onClick={() => setRepeat((current) => !current)}
              >
                <Repeat2Icon aria-hidden="true" />
              </Button>
            </div>
            <section aria-labelledby="drawer-10-next" className="grid gap-1">
              <h3
                id="drawer-10-next"
                className="text-xs font-medium text-muted-foreground"
              >
                Up next
              </h3>
              <ul className="-mx-2 flex flex-col">
                {upNextOrder.map((itemIndex) => {
                  const item = queue[itemIndex];
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          playTrack(itemIndex);
                          setPlaying(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className="grid min-w-0 flex-1">
                          <span className="truncate font-medium">
                            {item.title}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {item.artist}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatTime(item.length)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
