"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyboardIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Progress } from "@/registry/base/ui/progress";

const SLIDES = [
  {
    id: "assistant",
    icon: SparklesIcon,
    title: "Draft replies with Assist",
    body: "Assist reads the whole thread and suggests a reply in your saved tone. Press Tab to accept it.",
  },
  {
    id: "shortcuts",
    icon: KeyboardIcon,
    title: "Shortcuts for everything",
    body: "Press ? anywhere to see every shortcut, including new ones for snooze and assign.",
  },
  {
    id: "sla",
    icon: TimerIcon,
    title: "SLA timers on every ticket",
    body: "Tickets close to their first-response deadline now show a countdown in the inbox.",
  },
  {
    id: "sharing",
    icon: UsersIcon,
    title: "Shared drafts",
    body: "Mention a teammate in a draft to get a review before the customer sees it.",
  },
];

const SLIDE_MS = 5000;
const TICK_MS = 100;

export default function Progress06() {
  const [index, setIndex] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);

  const last = index === SLIDES.length - 1;
  const finished = last && elapsed >= SLIDE_MS;

  // The timer only runs while playing and stops itself on the last slide.
  React.useEffect(() => {
    if (!playing || finished) return;
    const timer = setInterval(() => {
      setElapsed((current) => current + TICK_MS);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, finished]);

  React.useEffect(() => {
    if (elapsed < SLIDE_MS || last) return;
    setIndex((current) => current + 1);
    setElapsed(0);
  }, [elapsed, last]);

  function goTo(next: number) {
    setIndex(Math.min(Math.max(next, 0), SLIDES.length - 1));
    setElapsed(0);
  }

  function replay() {
    goTo(0);
    setPlaying(true);
  }

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <section
      aria-label="What's new in Helpdesk 4.2"
      className="flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground"
    >
      {/* One segment per slide: finished slides are full, the current one fills over time. */}
      <div className="flex gap-1.5">
        {SLIDES.map((item, itemIndex) => {
          const value =
            itemIndex < index
              ? 100
              : itemIndex === index
                ? Math.min((elapsed / SLIDE_MS) * 100, 100)
                : 0;
          return (
            <Progress
              key={item.id}
              value={value}
              aria-label={`Slide ${itemIndex + 1}: ${item.title}`}
              className="flex-1 [&_[data-slot=progress-indicator]]:duration-100 [&_[data-slot=progress-indicator]]:ease-linear"
            />
          );
        })}
      </div>

      {/* Announce slide changes only when the user drives them, not on autoplay. */}
      <div
        aria-live={playing && !finished ? "off" : "polite"}
        className="flex min-h-36 flex-col gap-3"
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-medium">{slide.title}</h3>
          <p className="text-sm text-pretty text-muted-foreground">
            {slide.body}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground tabular-nums">
          {index + 1} / {SLIDES.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous slide"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          {finished ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Replay"
              onClick={replay}
            >
              <RotateCcwIcon aria-hidden="true" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((current) => !current)}
            >
              {playing ? (
                <PauseIcon aria-hidden="true" />
              ) : (
                <PlayIcon aria-hidden="true" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next slide"
            disabled={last}
            onClick={() => goTo(index + 1)}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
