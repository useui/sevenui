"use client";

import { PauseIcon, PlayIcon, RotateCcwIcon, RotateCwIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Slider } from "@/registry/base/ui/slider";

const EPISODE_LENGTH = 2538;

const chapters = [
  { start: 0, title: "Cold open" },
  { start: 142, title: "Why design tokens drift" },
  { start: 811, title: "Auditing a 400-screen app" },
  { start: 1504, title: "Shipping the migration" },
  { start: 2210, title: "Listener questions" },
];

function formatTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}`
    : `${minutes}:${rest}`;
}

export default function Slider10() {
  const [position, setPosition] = useState(958);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPosition((current) => {
        if (current + 1 >= EPISODE_LENGTH) {
          setPlaying(false);
          return EPISODE_LENGTH;
        }
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  let chapterIndex = 0;
  chapters.forEach((item, index) => {
    if (item.start <= position) chapterIndex = index;
  });
  const chapter = chapters[chapterIndex];

  function seekBy(delta: number) {
    setPosition((current) =>
      Math.min(Math.max(current + delta, 0), EPISODE_LENGTH),
    );
  }

  return (
    <section
      aria-label="Podcast player"
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-center gap-3">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-14 shrink-0 rounded-lg bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate text-sm font-medium">
            Ep. 84 — Rebuilding a design system in place
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Chapter {chapterIndex + 1} of {chapters.length}: {chapter.title}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span id="slider-10-seek" className="sr-only">
          Playback position
        </span>
        <Slider
          aria-labelledby="slider-10-seek"
          value={[position]}
          min={0}
          max={EPISODE_LENGTH}
          largeStep={30}
          format={{ style: "unit", unit: "second", unitDisplay: "long" }}
          onValueChange={(value) =>
            setPosition(Array.isArray(value) ? (value[0] ?? 0) : value)
          }
        />
        <div aria-hidden="true" className="relative h-1.5">
          {chapters.slice(1).map((mark) => (
            <span
              key={mark.start}
              className="absolute top-0 h-1.5 w-px bg-border"
              style={{ left: `${(mark.start / EPISODE_LENGTH) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatTime(position)}</span>
          <span>-{formatTime(EPISODE_LENGTH - position)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Back 15 seconds"
          onClick={() => seekBy(-15)}
        >
          <RotateCcwIcon aria-hidden="true" />
        </Button>
        <Button
          size="icon-lg"
          className="size-11 rounded-full"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            if (position >= EPISODE_LENGTH) setPosition(0);
            setPlaying((current) => !current);
          }}
        >
          {playing ? (
            <PauseIcon aria-hidden="true" className="size-5" />
          ) : (
            <PlayIcon aria-hidden="true" className="size-5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Forward 30 seconds"
          onClick={() => seekBy(30)}
        >
          <RotateCwIcon aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
