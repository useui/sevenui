"use client";

import * as React from "react";
import { BellIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  Toast,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Placement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type SwipeDirection = "up" | "down" | "left" | "right";

const placements: { value: Placement; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

const viewportClasses: Record<Placement, string> = {
  "top-left": "top-4 bottom-auto sm:left-4 sm:right-auto",
  "top-center": "top-4 bottom-auto sm:inset-x-0 sm:mx-auto",
  "top-right": "top-4 bottom-auto",
  "bottom-left": "sm:left-4 sm:right-auto",
  "bottom-center": "sm:inset-x-0 sm:mx-auto",
  "bottom-right": "",
};

// Mirrors the primitive's bottom-anchored stacking so toasts grow downward
// from the top edge and enter from above.
const topToastClasses = cn(
  "top-0 bottom-auto origin-top after:top-auto after:bottom-full",
  "[--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
  "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]",
  "data-starting-style:[transform:translateY(-150%)]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]",
);

function getSwipeDirection(placement: Placement): SwipeDirection[] {
  const vertical = placement.startsWith("top") ? "up" : "down";

  if (placement.endsWith("left")) {
    return [vertical, "left"];
  }

  if (placement.endsWith("right")) {
    return [vertical, "right"];
  }

  return [vertical];
}

const toastManager = createToastManager();

function PlacedToasts({ placement }: { placement: Placement }) {
  const { toasts } = useToastManager();
  const isTop = placement.startsWith("top");

  return toasts.map((toastItem) => (
    <Toast
      key={toastItem.id}
      toast={toastItem}
      swipeDirection={getSwipeDirection(placement)}
      className={cn(isTop && topToastClasses)}
    >
      <ToastContent>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

export default function Toast05() {
  const [placement, setPlacement] = React.useState<Placement>("bottom-right");
  const active = placements.find((item) => item.value === placement);

  return (
    <ToastProvider toastManager={toastManager}>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span id="toast-placement-label" className="text-sm font-medium">
            Placement
          </span>
          <ToggleGroup
            aria-labelledby="toast-placement-label"
            value={[placement]}
            onValueChange={(next) => {
              if (next[0]) {
                toastManager.close();
                setPlacement(next[0] as Placement);
              }
            }}
            className="grid aspect-video w-full grid-cols-3 grid-rows-2 gap-1.5 rounded-xl border border-border bg-muted/50 p-1.5"
          >
            {placements.map((item) => (
              <ToggleGroupItem
                key={item.value}
                value={item.value}
                aria-label={item.label}
                className={cn(
                  "group/placement flex h-full w-full rounded-md p-2 hover:bg-background data-pressed:bg-background data-pressed:shadow-xs",
                  item.value.startsWith("top") ? "items-start" : "items-end",
                  item.value.endsWith("left") && "justify-start",
                  item.value.endsWith("center") && "justify-center",
                  item.value.endsWith("right") && "justify-end",
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-8 rounded-full bg-muted-foreground/30 group-data-pressed/placement:bg-primary"
                />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            toastManager.add({
              title: "Weekly report is ready",
              description: `Showing at ${active?.label.toLowerCase()} of the screen.`,
            })
          }
        >
          <BellIcon aria-hidden="true" />
          Show toast
        </Button>
      </div>
      <ToastPortal>
        <ToastViewport className={viewportClasses[placement]}>
          <PlacedToasts placement={placement} />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
