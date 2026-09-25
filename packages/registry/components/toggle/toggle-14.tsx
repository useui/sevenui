"use client";

import {
  CaptionsIcon,
  HandIcon,
  type LucideIcon,
  MicIcon,
  MicOffIcon,
  MonitorUpIcon,
  PhoneOffIcon,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Toggle } from "@/registry/base/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

type Control = "mic" | "camera" | "share" | "captions" | "hand";

const controls: {
  key: Control;
  label: string;
  on: LucideIcon;
  off: LucideIcon;
  // Mic and camera flag the "off" state; the rest highlight "on".
  alertWhenOff?: boolean;
}[] = [
  { key: "mic", label: "Microphone", on: MicIcon, off: MicOffIcon, alertWhenOff: true },
  { key: "camera", label: "Camera", on: VideoIcon, off: VideoOffIcon, alertWhenOff: true },
  { key: "share", label: "Present screen", on: MonitorUpIcon, off: MonitorUpIcon },
  { key: "captions", label: "Captions", on: CaptionsIcon, off: CaptionsIcon },
  { key: "hand", label: "Raise hand", on: HandIcon, off: HandIcon },
];

export default function Toggle14() {
  const [state, setState] = React.useState<Record<Control, boolean>>({
    mic: true,
    camera: false,
    share: false,
    captions: true,
    hand: false,
  });

  function set(key: Control, pressed: boolean) {
    setState((current) => ({ ...current, [key]: pressed }));
  }

  const [left, setLeft] = React.useState(false);

  const status = [
    !state.mic && "muted",
    state.share && "presenting",
    state.hand && "hand raised",
  ].filter(Boolean);

  if (left) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center text-card-foreground shadow-sm">
        <PhoneOffIcon aria-hidden="true" className="size-5 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <p role="status" className="font-medium">
            You left the call
          </p>
          <p className="text-sm text-muted-foreground">Q4 roadmap review</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setLeft(false)}>
          Rejoin
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-sm">
        <div className={cn(
            "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-muted sm:aspect-video",
            // Keep the avatar clear of the caption on narrow screens.
            state.captions && !state.camera && "pb-14 sm:pb-0",
          )}>
          {state.camera ? (
            <img
              src="/placeholder.svg"
              alt="Your camera preview"
              className="size-full object-cover"
            />
          ) : (
            <Avatar className="size-12 sm:size-16">
              <AvatarFallback className="text-lg">JR</AvatarFallback>
            </Avatar>
          )}
          {state.hand && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground">
              <HandIcon aria-hidden="true" className="size-3" />
              Hand raised
            </span>
          )}
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-background/85 px-2 py-1 text-xs font-medium backdrop-blur-sm">
            {!state.mic && (
              <MicOffIcon aria-hidden="true" className="size-3 text-destructive" />
            )}
            Jordan Reyes (you)
          </span>
          {state.captions && (
            <p className="absolute inset-x-6 bottom-10 rounded-md bg-foreground/80 px-2 py-1 text-center text-xs text-background">
              Priya: Let's review the Q4 roadmap before we wrap up.
            </p>
          )}
        </div>
        <p aria-live="polite" className="sr-only">
          {status.length ? `You are ${status.join(", ")}.` : "All set."}
        </p>
        <div
          role="toolbar"
          aria-label="Call controls"
          className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
        >
          {controls.map((control) => {
            const pressed = state[control.key];
            const Icon = pressed ? control.on : control.off;
            return (
              <Tooltip key={control.key}>
                <TooltipTrigger
                  render={
                    <Toggle
                      size="lg"
                      pressed={pressed}
                      onPressedChange={(next) => set(control.key, next)}
                      aria-label={control.label}
                      className={cn(
                        "size-9 rounded-full bg-muted hover:bg-accent sm:size-10",
                        control.alertWhenOff
                          ? "aria-[pressed=false]:bg-destructive aria-[pressed=false]:text-destructive-foreground aria-[pressed=false]:hover:bg-destructive/90"
                          : "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90",
                      )}
                    />
                  }
                >
                  <Icon aria-hidden={true} className="size-4.5" />
                </TooltipTrigger>
                <TooltipContent>
                  {control.alertWhenOff
                    ? `Turn ${control.label.toLowerCase()} ${pressed ? "off" : "on"}`
                    : control.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
          <Button
            variant="destructive"
            aria-label="Leave call"
            className="ml-1 size-9 rounded-full px-0 sm:h-10 sm:w-auto sm:px-4"
            onClick={() => setLeft(true)}
          >
            <PhoneOffIcon aria-hidden="true" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
