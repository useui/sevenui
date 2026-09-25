"use client";

import { CheckIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Spinner } from "@/registry/base/ui/spinner";
import { Switch } from "@/registry/base/ui/switch";

type Status = "idle" | "saving" | "saved";

const preferences = [
  {
    id: "mentions",
    title: "Mentions and replies",
    description: "When someone @mentions you or replies to your comment.",
    enabled: true,
  },
  {
    id: "assigned",
    title: "Assigned issues",
    description: "When an issue is assigned to you or its priority changes.",
    enabled: true,
  },
  {
    id: "digest",
    title: "Weekly digest",
    description: "A Monday summary of activity across your projects.",
    enabled: false,
  },
  {
    id: "product",
    title: "Product updates",
    description: "New features and changelog highlights, about twice a month.",
    enabled: false,
  },
];

export default function Spinner09() {
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(preferences.map((p) => [p.id, p.enabled])),
  );
  const [status, setStatus] = useState<Record<string, Status>>({});
  const timers = useRef<Record<string, number[]>>({});

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const ids of Object.values(pending)) {
        for (const id of ids) window.clearTimeout(id);
      }
    };
  }, []);

  function toggle(id: string, checked: boolean) {
    // A new change restarts this row's save cycle, so an older "idle" timer
    // can't cut the new save short.
    for (const timerId of timers.current[id] ?? []) {
      window.clearTimeout(timerId);
    }
    setValues((prev) => ({ ...prev, [id]: checked }));
    setStatus((prev) => ({ ...prev, [id]: "saving" }));
    timers.current[id] = [
      window.setTimeout(
        () => setStatus((prev) => ({ ...prev, [id]: "saved" })),
        900,
      ),
      window.setTimeout(
        () => setStatus((prev) => ({ ...prev, [id]: "idle" })),
        2600,
      ),
    ];
  }

  const savingCount = Object.values(status).filter(
    (s) => s === "saving",
  ).length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Email notifications</CardTitle>
        <CardDescription>
          Changes save automatically to maya@acme.co.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-0 divide-y divide-border">
        {preferences.map((pref) => {
          const state = status[pref.id] ?? "idle";
          const labelId = `spinner-09-${pref.id}-label`;
          const descriptionId = `spinner-09-${pref.id}-description`;
          return (
            <div
              key={pref.id}
              className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="grid min-w-0 gap-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span id={labelId} className="text-sm font-medium">
                    {pref.title}
                  </span>
                  {state === "saving" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Spinner
                        className="size-3"
                        aria-label={`Saving ${pref.title}`}
                      />
                      Saving
                    </span>
                  ) : null}
                  {state === "saved" ? (
                    <span
                      role="status"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                    >
                      <CheckIcon
                        aria-hidden="true"
                        className="size-3 text-success"
                      />
                      Saved
                    </span>
                  ) : null}
                </div>
                <p
                  id={descriptionId}
                  className="text-sm text-muted-foreground text-pretty"
                >
                  {pref.description}
                </p>
              </div>
              <Switch
                aria-labelledby={labelId}
                aria-describedby={descriptionId}
                checked={values[pref.id]}
                disabled={state === "saving"}
                onCheckedChange={(checked) => toggle(pref.id, checked)}
                className="mt-0.5"
              />
            </div>
          );
        })}
      </CardContent>
      <p className="sr-only" aria-live="polite">
        {savingCount > 0 ? "Saving changes" : ""}
      </p>
    </Card>
  );
}
