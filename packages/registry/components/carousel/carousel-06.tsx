"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/registry/base/ui/carousel";

const SLIDE_DURATION = 5000;
const TICK = 100;

const stories = [
  {
    label: "Workflows",
    title: "Automate the handoff between design and code",
    body: "Trigger a review the moment a Figma frame is marked ready.",
  },
  {
    label: "Insights",
    title: "See where every sprint actually went",
    body: "Cycle time, scope creep, and carry-over in one weekly digest.",
  },
  {
    label: "Security",
    title: "SSO and SCIM on every paid plan",
    body: "Provision seats from Okta or Entra ID without a support ticket.",
  },
  {
    label: "Mobile",
    title: "Triage your inbox from anywhere",
    body: "Swipe to assign, snooze, or close issues on iOS and Android.",
  },
];

export default function Carousel06() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  // Hovering or focusing the slides pauses the timer so text can be read.
  const [hovered, setHovered] = React.useState(false);

  // Respect reduced motion: start paused, the viewer can still press play.
  React.useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
    }
  }, []);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      setElapsed(0);
    };
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const running = playing && !hovered;

  React.useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setElapsed((value) => Math.min(value + TICK, SLIDE_DURATION));
    }, TICK);
    return () => window.clearInterval(interval);
  }, [running]);

  React.useEffect(() => {
    if (elapsed >= SLIDE_DURATION) api?.scrollNext();
  }, [elapsed, api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      aria-label="Product updates"
      className="w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <CarouselContent
        aria-live={running ? "off" : "polite"}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setHovered(false);
          }
        }}
      >
        {stories.map((story, index) => (
          <CarouselItem
            key={story.title}
            aria-label={`${index + 1} of ${stories.length}`}
          >
            <div className="flex min-h-44 flex-col justify-between gap-6 p-6">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg leading-snug font-semibold text-balance">
                  {story.title}
                </h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {story.body}
                </p>
              </div>
              <a
                href={`#${story.label.toLowerCase()}`}
                className="self-start text-sm font-medium text-primary decoration-2 underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:decoration-ring"
              >
                Explore {story.label.toLowerCase()}
              </a>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex items-center gap-3 border-t px-6 py-3">
        <div className="flex flex-1 items-center gap-1.5">
          {stories.map((story, index) => {
            const fill =
              index === current
                ? (elapsed / SLIDE_DURATION) * 100
                : index < current
                  ? 100
                  : 0;
            return (
              <button
                key={story.title}
                type="button"
                aria-label={`Go to slide ${index + 1}: ${story.label}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => api?.scrollTo(index)}
                className="group/segment flex h-6 flex-1 items-center rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="relative h-1 w-full overflow-hidden rounded-full bg-muted group-hover/segment:bg-muted-foreground/25">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-100 ease-linear"
                    style={{ width: `${fill}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={playing ? "Pause autoplay" : "Start autoplay"}
          onClick={() => setPlaying((value) => !value)}
        >
          {playing ? (
            <PauseIcon aria-hidden="true" />
          ) : (
            <PlayIcon aria-hidden="true" />
          )}
        </Button>
      </div>
    </Carousel>
  );
}
