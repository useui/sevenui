"use client";

import * as React from "react";
import {
  BellPlusIcon,
  GitPullRequestIcon,
  MessageSquareIcon,
  RocketIcon,
  ShieldAlertIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
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

type Source = "deploy" | "review" | "comment" | "security";

type EventData = {
  source: Source;
  time: string;
};

const LIMIT = 3;

const sourceIcons: Record<Source, typeof RocketIcon> = {
  deploy: RocketIcon,
  review: GitPullRequestIcon,
  comment: MessageSquareIcon,
  security: ShieldAlertIcon,
};

const events: { title: string; description: string; data: EventData }[] = [
  {
    title: "Production deploy finished",
    description: "web@4f2c9a1 is live in us-east and eu-west.",
    data: { source: "deploy", time: "09:41" },
  },
  {
    title: "Review requested",
    description: "Sam Rivera asked you to review PR 1287: Billing webhooks.",
    data: { source: "review", time: "09:42" },
  },
  {
    title: "New comment on Pricing v3",
    description: "“Let’s keep the annual toggle on by default.”",
    data: { source: "comment", time: "09:44" },
  },
  {
    title: "Dependency advisory",
    description: "A moderate issue was reported in image-resize 2.1.",
    data: { source: "security", time: "09:47" },
  },
  {
    title: "Preview deploy ready",
    description: "feat/checkout-redesign is available for QA.",
    data: { source: "deploy", time: "09:52" },
  },
];

const toastManager = createToastManager<EventData>();

function EventToasts() {
  const { toasts } = useToastManager<EventData>();

  return toasts.map((toastItem) => {
    const Icon = sourceIcons[toastItem.data?.source ?? "deploy"];

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent className="items-start gap-3 p-3.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-2">
              <ToastTitle className="truncate" />
              <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {toastItem.data?.time}
              </time>
            </div>
            <ToastDescription className="line-clamp-2 text-pretty" />
          </div>
          <ToastClose className="-mt-1 -mr-1" />
        </ToastContent>
      </Toast>
    );
  });
}

function StackControls() {
  const { toasts } = useToastManager<EventData>();
  const [next, setNext] = React.useState(0);

  const open = toasts.filter((item) => item.transitionStatus !== "ending");
  const hidden = Math.max(0, open.length - LIMIT);

  const push = () => {
    const event = events[next];
    toastManager.add({ ...event, timeout: 0 });
    setNext((current) => (current + 1) % events.length);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium">Notification stack</span>
          <span className="text-sm text-muted-foreground">
            Shows the newest {LIMIT}; older ones stay tucked away.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5" aria-live="polite">
          <Badge variant="secondary" className="tabular-nums">
            {open.length} open
          </Badge>
          {hidden > 0 && (
            <Badge variant="outline" className="tabular-nums">
              +{hidden} hidden
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="grow" onClick={push}>
          <BellPlusIcon aria-hidden="true" />
          Push notification
        </Button>
        <Button
          variant="outline"
          className="grow"
          onClick={() => toastManager.close()}
          disabled={open.length === 0}
        >
          Dismiss all
        </Button>
      </div>
    </div>
  );
}

export default function Toast08() {
  return (
    <ToastProvider toastManager={toastManager} limit={LIMIT}>
      <StackControls />
      <ToastPortal>
        <ToastViewport>
          <EventToasts />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
