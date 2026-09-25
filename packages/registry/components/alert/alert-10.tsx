"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  KeyRoundIcon,
  ServerCrashIcon,
  UsersIcon,
} from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";

const notices = [
  {
    id: "incident",
    icon: ServerCrashIcon,
    title: "Elevated API latency in eu-west",
    description: "Requests are slower than usual. Engineers are investigating.",
  },
  {
    id: "keys",
    icon: KeyRoundIcon,
    title: "2 API keys expire in 7 days",
    description: "Rotate the production and staging keys before September 30.",
  },
  {
    id: "seats",
    icon: UsersIcon,
    title: "All 25 seats are in use",
    description: "New invites will wait for approval until you add seats.",
  },
];

export default function Alert10() {
  const [index, setIndex] = React.useState(0);
  const notice = notices[index];
  const Icon = notice.icon;
  const remaining = notices.length - 1 - index;

  return (
    <section
      aria-label="Account notices"
      className="relative w-full max-w-md pb-3"
    >
      {remaining > 0 && (
        <div
          aria-hidden="true"
          className="absolute inset-x-3 bottom-1.5 h-4 rounded-lg border bg-card"
        />
      )}
      {remaining > 1 && (
        <div
          aria-hidden="true"
          className="absolute inset-x-6 bottom-0 h-4 rounded-lg border bg-card"
        />
      )}
      <Alert
        key={notice.id}
        role="status"
        className="relative z-10 pr-24! shadow-sm"
      >
        <Icon aria-hidden="true" />
        <AlertTitle>{notice.title}</AlertTitle>
        <AlertDescription>{notice.description}</AlertDescription>
        <AlertAction className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Previous notice"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          <span className="min-w-8 text-center text-xs text-muted-foreground tabular-nums">
            {index + 1}/{notices.length}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Next notice"
            disabled={index === notices.length - 1}
            onClick={() => setIndex((i) => i + 1)}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </AlertAction>
      </Alert>
    </section>
  );
}
