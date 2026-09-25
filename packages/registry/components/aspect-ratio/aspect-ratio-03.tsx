"use client";

import { ImageOff, RotateCw } from "lucide-react";
import * as React from "react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Button } from "@/registry/base/ui/button";
import { Skeleton } from "@/registry/base/ui/skeleton";
import { Spinner } from "@/registry/base/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type MediaState = "loading" | "error" | "ready";

const states: { value: MediaState; label: string }[] = [
  { value: "loading", label: "Loading" },
  { value: "error", label: "Error" },
  { value: "ready", label: "Ready" },
];

const statusText: Record<MediaState, string> = {
  loading: "Loading cover image.",
  error: "The cover image failed to load.",
  ready: "Cover image loaded.",
};

export default function AspectRatio03() {
  const [state, setState] = React.useState<MediaState>("loading");
  const [retrying, setRetrying] = React.useState(false);

  React.useEffect(() => {
    if (!retrying) return;
    const timer = window.setTimeout(() => {
      setRetrying(false);
      setState("ready");
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [retrying]);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span id="aspect-ratio-03-label" className="text-sm font-medium">
          Preview state
        </span>
        <ToggleGroup
          aria-labelledby="aspect-ratio-03-label"
          variant="outline"
          size="sm"
          spacing={0}
          value={[state]}
          onValueChange={(next) => {
            if (next.length === 0) return;
            setRetrying(false);
            setState(next[0] as MediaState);
          }}
        >
          {states.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <AspectRatio
        ratio={3 / 2}
        aria-busy={state === "loading"}
        className="overflow-hidden rounded-xl border border-border bg-muted"
      >
        {state === "loading" && (
          <>
            <Skeleton className="absolute inset-0 rounded-none" />
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <Spinner className="size-5" />
            </div>
          </>
        )}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center sm:gap-3 sm:p-6">
            <ImageOff
              aria-hidden="true"
              className="size-6 text-muted-foreground"
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Couldn't load the cover</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                The file may have moved. Try again or upload a new one.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={retrying}
              onClick={() => {
                setRetrying(true);
                setState("loading");
              }}
            >
              <RotateCw aria-hidden="true" data-icon="inline-start" />
              Retry
            </Button>
          </div>
        )}
        {state === "ready" && (
          <img
            src="/placeholder.svg"
            alt="Harbor at dusk with fishing boats moored along the pier"
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </AspectRatio>
      <p className="sr-only" aria-live="polite">
        {statusText[state]}
      </p>
    </div>
  );
}
