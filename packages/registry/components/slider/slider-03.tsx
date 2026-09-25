"use client";

import { Volume1Icon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Slider } from "@/registry/base/ui/slider";

const STEP = 10;

export default function Slider03() {
  const [volume, setVolume] = useState(60);
  const [muted, setMuted] = useState(false);

  const level = muted ? 0 : volume;
  const LevelIcon =
    level === 0 ? VolumeXIcon : level < 50 ? Volume1Icon : Volume2Icon;

  function update(next: number) {
    setVolume(Math.min(100, Math.max(0, next)));
    setMuted(false);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <span id="slider-03-label" className="text-sm font-medium">
        Speaker volume
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={muted}
          onClick={() => setMuted((current) => !current)}
        >
          <LevelIcon aria-hidden="true" />
        </Button>
        <Slider
          aria-labelledby="slider-03-label"
          className="flex-1"
          step={1}
          value={[level]}
          onValueChange={(value) =>
            update(typeof value === "number" ? value : value[0])
          }
        />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Increase volume by ${STEP}%`}
          disabled={!muted && volume >= 100}
          // While muted, step up from the remembered volume, not from zero.
          onClick={() => update(volume + STEP)}
        >
          <Volume2Icon aria-hidden="true" />
        </Button>
        <span
          aria-hidden="true"
          className="w-9 text-right text-sm tabular-nums text-muted-foreground"
        >
          {level}%
        </span>
      </div>
    </div>
  );
}
