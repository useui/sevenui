"use client";

import * as React from "react";

import { Checkbox } from "@/registry/base/ui/checkbox";
import { Spinner } from "@/registry/base/ui/spinner";

const initialTasks = [
  { id: "domain", label: "Connect your custom domain", done: true },
  { id: "invite", label: "Invite two teammates", done: true },
  { id: "import", label: "Import your first contacts", done: false },
  { id: "billing", label: "Add a billing contact", done: false },
  { id: "branding", label: "Upload a logo for invoices", done: false },
];

// Simulated server round-trip before a change is confirmed.
const SAVE_DELAY_MS = 700;

export default function Checkbox07() {
  const id = React.useId();
  const [tasks, setTasks] = React.useState(initialTasks);
  const [saving, setSaving] = React.useState<string[]>([]);
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
    };
  }, []);

  function toggle(taskId: string, done: boolean) {
    // Ignore repeat toggles until the pending save settles.
    if (timers.current.has(taskId)) return;
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, done } : task)),
    );
    setSaving((current) => [...current, taskId]);
    const timer = setTimeout(() => {
      timers.current.delete(taskId);
      setSaving((current) => current.filter((item) => item !== taskId));
    }, SAVE_DELAY_MS);
    timers.current.set(taskId, timer);
  }

  const doneCount = tasks.filter((task) => task.done).length;
  const percent = Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p id={`${id}-title`} className="text-sm font-medium">
          Finish setting up Acme
        </p>
        <span
          aria-live="polite"
          className="text-xs text-muted-foreground tabular-nums"
        >
          {doneCount} of {tasks.length} done
        </span>
      </div>
      <div
        aria-hidden="true"
        className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul aria-labelledby={`${id}-title`} className="mt-3 flex flex-col">
        {tasks.map((task) => {
          const checkboxId = `${id}-${task.id}`;
          const isSaving = saving.includes(task.id);
          return (
            <li key={task.id} className="flex items-center gap-3 py-2">
              <span className="relative grid size-5 shrink-0 place-items-center">
                <Checkbox
                  id={checkboxId}
                  checked={task.done}
                  aria-busy={isSaving || undefined}
                  onCheckedChange={(checked) => toggle(task.id, checked)}
                  className="size-5 rounded-full transition-[background-color,border-color,transform] duration-200 ease-out active:scale-90 data-checked:[&_svg]:animate-in data-checked:[&_svg]:zoom-in-50 [&_svg]:size-3.5! motion-reduce:transition-none"
                />
                {isSaving ? (
                  <span className="absolute inset-0 grid place-items-center rounded-full bg-card">
                    <Spinner
                      aria-label="Saving"
                      className="size-4 text-muted-foreground"
                    />
                  </span>
                ) : null}
              </span>
              <label
                htmlFor={checkboxId}
                className="group relative cursor-pointer text-sm"
                data-done={task.done || undefined}
              >
                <span className="transition-colors duration-300 group-data-done:text-muted-foreground">
                  {task.label}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-1/2 h-px origin-left scale-x-0 bg-muted-foreground transition-transform duration-300 ease-out group-data-done:scale-x-100 motion-reduce:transition-none"
                />
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
