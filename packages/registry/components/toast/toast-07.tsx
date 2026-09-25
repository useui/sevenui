"use client";

import * as React from "react";
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Toast,
  ToastAction,
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

type MeterData = {
  duration: number;
};

const DURATION = 6000;

const toastManager = createToastManager<MeterData>();

type ToastObject = ReturnType<typeof useToastManager<MeterData>>["toasts"][number];

// The toast is added with `timeout: 0`, so the meter owns dismissal: the bar
// drains, pauses while the toast is hovered or focused, and closes the toast
// when it runs out. Bar and timer can never drift apart.
function MeterToast({ toastItem }: { toastItem: ToastObject }) {
  const barRef = React.useRef<HTMLSpanElement>(null);
  const animationRef = React.useRef<Animation | null>(null);
  const duration = toastItem.data?.duration ?? DURATION;

  React.useEffect(() => {
    const bar = barRef.current;

    if (!bar || typeof bar.animate !== "function") {
      return;
    }

    const animation = bar.animate(
      [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
      { duration, easing: "linear", fill: "forwards" },
    );
    animation.onfinish = () => toastManager.close(toastItem.id);
    animationRef.current = animation;

    return () => animation.cancel();
  }, [duration, toastItem.id]);

  const pause = () => animationRef.current?.pause();
  const resume = (event: React.FocusEvent | React.PointerEvent) => {
    const root = event.currentTarget;

    if (root.matches(":hover") || root.contains(document.activeElement)) {
      return;
    }

    animationRef.current?.play();
  };

  return (
    <Toast
      toast={toastItem}
      className="overflow-hidden"
      onPointerEnter={pause}
      onPointerLeave={resume}
      onFocus={pause}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          resume(event);
        }
      }}
    >
      <ToastContent>
        <ArchiveIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastTitle />
          <ToastDescription className="truncate" />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-0.5 bg-muted"
      >
        <span
          ref={barRef}
          className="block h-full origin-left bg-primary"
        />
      </span>
    </Toast>
  );
}

function MeterToasts() {
  const { toasts } = useToastManager<MeterData>();

  return toasts.map((toastItem) => (
    <MeterToast key={toastItem.id} toastItem={toastItem} />
  ));
}

export default function Toast07() {
  const [archived, setArchived] = React.useState(false);

  const restore = () => {
    setArchived(false);
    toastManager.close("archived-thread");
  };

  const archive = () => {
    setArchived(true);
    const id = toastManager.add({
      id: "archived-thread",
      title: "Conversation archived",
      description: "“Q3 vendor review” moved to Archive.",
      timeout: 0,
      data: { duration: DURATION },
      actionProps: {
        children: "Undo",
        onClick: () => {
          setArchived(false);
          toastManager.close(id);
        },
      },
    });
  };

  return (
    <ToastProvider toastManager={toastManager}>
      <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card p-3 text-card-foreground">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">Q3 vendor review</span>
          <span className="truncate text-sm text-muted-foreground">
            {archived ? "Archived just now" : "Elena Park · 4 messages"}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={archived ? restore : archive}
        >
          {archived ? (
            <ArchiveRestoreIcon aria-hidden="true" />
          ) : (
            <ArchiveIcon aria-hidden="true" />
          )}
          {archived ? "Restore" : "Archive"}
        </Button>
      </div>
      <ToastPortal>
        <ToastViewport>
          <MeterToasts />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
