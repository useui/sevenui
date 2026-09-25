"use client";

import { CircleCheckIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

const tasks = [
  "Importing 1,204 contacts from contacts.csv",
  "Matching contacts to 186 companies",
  "Creating the Sales and Renewals pipelines",
  "Inviting 4 teammates",
];

export default function Spinner08() {
  const [task, setTask] = useState(0);
  const [opening, setOpening] = useState(false);
  const done = task >= tasks.length;

  useEffect(() => {
    if (task >= tasks.length) return;
    const timer = window.setTimeout(() => setTask((step) => step + 1), 1600);
    return () => window.clearTimeout(timer);
  }, [task]);

  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(() => setOpening(false), 1800);
    return () => window.clearTimeout(timer);
  }, [opening]);

  return (
    <section
      aria-labelledby="spinner-08-title"
      aria-busy={!done}
      className="flex w-full max-w-sm flex-col items-center gap-5 px-4 py-8 text-center"
    >
      <div className="relative flex size-14 items-center justify-center">
        {done ? (
          <CircleCheckIcon aria-hidden="true" className="size-10 text-success" />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-[5px] rounded-full border-[3px] border-muted"
            />
            <Spinner
              aria-hidden="true"
              strokeWidth={1.75}
              className="relative size-14 text-primary"
            />
          </>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3
          id="spinner-08-title"
          className="text-lg font-semibold text-balance"
        >
          {done ? "Northwind CRM is ready" : "Setting up Northwind CRM"}
        </h3>
        <p
          aria-live="polite"
          className="min-h-10 text-sm text-muted-foreground text-balance"
        >
          {done
            ? "Your contacts, companies and pipelines are waiting for you."
            : `${tasks[task]}…`}
        </p>
      </div>
      {done ? (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            disabled={opening}
            aria-busy={opening || undefined}
            onClick={() => setOpening(true)}
          >
            {opening ? (
              <Spinner aria-hidden="true" data-icon="inline-start" />
            ) : null}
            {opening ? "Opening workspace…" : "Open workspace"}
          </Button>
          <Button
            variant="ghost"
            disabled={opening}
            onClick={() => setTask(0)}
          >
            Run setup again
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground tabular-nums">
          Step {task + 1} of {tasks.length} · usually under a minute. You can
          close this tab.
        </p>
      )}
    </section>
  );
}
