"use client";

import * as React from "react";
import { cn } from "cn";
import {
  CheckIcon,
  GitPullRequestIcon,
  InboxIcon,
  KeyboardIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/registry/base/ui/carousel";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

const steps = [
  {
    id: "triage",
    icon: InboxIcon,
    title: "Triage in one inbox",
    body: "New issues from GitHub, Slack, and support tickets land in a single queue sorted by urgency.",
  },
  {
    id: "review",
    icon: GitPullRequestIcon,
    title: "Link pull requests",
    body: "Mention an issue ID in a branch name and its status moves to In review the moment the PR opens.",
  },
  {
    id: "shortcuts",
    icon: KeyboardIcon,
    title: "Stay on the keyboard",
    body: "Press C to create an issue from anywhere, or open the command menu to jump between projects.",
    shortcut: ["⌘", "K"],
  },
];

export default function Carousel09() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const isLast = current === steps.length - 1;

  if (finished) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center text-card-foreground">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon aria-hidden="true" />
        </span>
        <h3 className="font-medium">You&apos;re all set</h3>
        <p className="text-sm text-muted-foreground">
          Your workspace is ready. You can replay this tour from Help at any
          time.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setFinished(false);
            setCurrent(0);
          }}
        >
          Replay tour
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card text-card-foreground">
      <Carousel setApi={setApi} aria-label="Getting started tour">
        <CarouselContent>
          {steps.map((step, index) => (
            <CarouselItem
              key={step.id}
              aria-label={`Step ${index + 1} of ${steps.length}`}
            >
              <div className="flex aspect-[16/9] items-center justify-center bg-muted">
                <step.icon
                  aria-hidden="true"
                  className="size-10 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex flex-col gap-2 p-6 pb-2">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
                {step.shortcut && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    Try it now:
                    <KbdGroup>
                      {step.shortcut.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </KbdGroup>
                  </p>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center justify-between gap-4 p-6 pt-4">
        <div className="flex items-center gap-1.5">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              aria-label={`Go to step ${index + 1}`}
              aria-current={index === current ? "step" : undefined}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full outline-none transition-all focus-visible:ring-3 focus-visible:ring-ring/50",
                index === current
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60",
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!isLast && (
            <Button variant="ghost" onClick={() => setFinished(true)}>
              Skip
            </Button>
          )}
          <Button
            onClick={() => (isLast ? setFinished(true) : api?.scrollNext())}
          >
            {isLast ? "Open workspace" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
