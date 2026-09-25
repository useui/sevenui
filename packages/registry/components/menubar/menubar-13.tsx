"use client";

import * as React from "react";
import { Pause, Play, RotateCcw, RotateCw } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
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
import { Slider } from "@/registry/base/ui/slider";

const duration = 2535;

const chapters = [
  { title: "Cold open", start: 0 },
  { title: "Why pricing pages fail", start: 312 },
  { title: "Interview: Maya Lin", start: 905 },
  { title: "Listener questions", start: 1960 },
];

const speeds = ["0.8", "1", "1.25", "1.5", "2"];
const outputs = ["MacBook speakers", "AirPods Pro", "Studio monitors"];

const triggerClass = "focus-visible:ring-2 focus-visible:ring-ring/50";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Menubar13() {
  const [position, setPosition] = React.useState(918);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState("1");
  const [output, setOutput] = React.useState(outputs[1]);
  const [skipSilence, setSkipSilence] = React.useState(true);
  const [autoplay, setAutoplay] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPosition((current) => Math.min(duration, current + Number(speed)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, speed]);

  React.useEffect(() => {
    if (position >= duration) setPlaying(false);
  }, [position]);

  const currentChapter = [...chapters]
    .reverse()
    .find((chapter) => position >= chapter.start);

  function seek(delta: number) {
    setPosition((current) => Math.min(duration, Math.max(0, current + delta)));
  }

  return (
    <section
      aria-labelledby="menubar-13-title"
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <div className="border-b px-3 py-2">
        <Menubar aria-label="Player">
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Playback</MenubarTrigger>
            <MenubarContent className="min-w-52">
              <MenubarItem onClick={() => setPlaying((value) => !value)}>
                {playing ? "Pause" : "Play"}
                <MenubarShortcut>Space</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => seek(-15)}>
                Back 15 seconds
                <MenubarShortcut>←</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => seek(30)}>
                Forward 30 seconds
                <MenubarShortcut>→</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Chapters</MenubarSubTrigger>
                <MenubarSubContent className="min-w-56">
                  <MenubarRadioGroup
                    value={currentChapter?.title}
                    onValueChange={(title) => {
                      const chapter = chapters.find((c) => c.title === title);
                      if (chapter) setPosition(chapter.start);
                    }}
                  >
                    {chapters.map((chapter) => (
                      <MenubarRadioItem key={chapter.title} value={chapter.title}>
                        {chapter.title}
                        <MenubarShortcut className="tracking-normal tabular-nums">
                          {formatTime(chapter.start)}
                        </MenubarShortcut>
                      </MenubarRadioItem>
                    ))}
                  </MenubarRadioGroup>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarCheckboxItem
                checked={skipSilence}
                onCheckedChange={(checked) => setSkipSilence(checked)}
              >
                Trim silences
              </MenubarCheckboxItem>
              <MenubarCheckboxItem
                checked={autoplay}
                onCheckedChange={(checked) => setAutoplay(checked)}
              >
                Play next episode
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Speed</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value={speed} onValueChange={setSpeed}>
                <MenubarLabel>Playback speed</MenubarLabel>
                {speeds.map((value) => (
                  <MenubarRadioItem key={value} value={value}>
                    {value}×{value === "1" ? " (normal)" : ""}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className={triggerClass}>Output</MenubarTrigger>
            <MenubarContent className="min-w-48">
              <MenubarRadioGroup value={output} onValueChange={setOutput}>
                <MenubarLabel>Play through</MenubarLabel>
                {outputs.map((name) => (
                  <MenubarRadioItem key={name} value={name}>
                    {name}
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div className="flex gap-4 p-4">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-20 shrink-0 rounded-lg bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-col justify-center gap-1">
          <p className="text-xs text-muted-foreground">
            Shipping Notes · Episode 48
          </p>
          <h3
            id="menubar-13-title"
            className="text-sm leading-snug font-semibold text-balance"
          >
            The pricing page is a product, not a poster
          </h3>
          <p className="truncate text-xs text-muted-foreground" aria-live="polite">
            {currentChapter?.title}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4">
        <Slider
          aria-label="Playback position"
          value={position}
          min={0}
          max={duration}
          onValueChange={(value) =>
            setPosition(Array.isArray(value) ? value[0] : value)
          }
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatTime(position)}</span>
          <span>-{formatTime(duration - position)}</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 pt-1 pb-4">
        <span className="text-xs text-muted-foreground tabular-nums">
          {speed}×
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back 15 seconds"
            onClick={() => seek(-15)}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            size="icon-lg"
            className="rounded-full"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Forward 30 seconds"
            onClick={() => seek(30)}
          >
            <RotateCw aria-hidden="true" />
          </Button>
        </div>
        <span className="min-w-0 truncate text-right text-xs text-muted-foreground">
          {output}
        </span>
      </div>
    </section>
  );
}
