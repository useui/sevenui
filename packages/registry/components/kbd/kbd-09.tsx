"use client";

import { Check } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";
import { Progress } from "@/registry/base/ui/progress";

type LessonId = "search" | "create" | "inbox";

const lessons: { id: LessonId; label: string; detail: string }[] = [
  {
    id: "search",
    label: "Open search",
    detail: "Jump to any project, issue, or teammate.",
  },
  {
    id: "create",
    label: "Create an issue",
    detail: "Works from anywhere, no mouse needed.",
  },
  {
    id: "inbox",
    label: "Go to your inbox",
    detail: "Press G, let go, then press I.",
  },
];

// Two-key sequences ("G then I") must complete within this window.
const SEQUENCE_WINDOW_MS = 1200;

function usePrimaryModifier() {
  const [label, setLabel] = React.useState("Ctrl");
  React.useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setLabel("⌘");
  }, []);
  return label;
}

export default function Kbd09() {
  const modifier = usePrimaryModifier();
  const [done, setDone] = React.useState<LessonId[]>([]);
  const [lastPress, setLastPress] = React.useState<string | null>(null);
  const [exit, setExit] = React.useState<"skipped" | "finished" | null>(null);
  const pendingG = React.useRef(0);

  const complete = (id: LessonId) =>
    setDone((prev) => (prev.includes(id) ? prev : [...prev, id]));

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const key = event.key.toLowerCase();
    if (["shift", "control", "meta", "alt", "tab"].includes(key)) return;

    if ((event.metaKey || event.ctrlKey) && key === "k") {
      // Keep the page's own ⌘K search from opening while practicing. The
      // app may listen on the same node React does, so stop it immediately.
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();
      complete("search");
      setLastPress(`${modifier} K`);
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (key === "c") {
      complete("create");
    } else if (key === "g") {
      pendingG.current = Date.now();
    } else if (
      key === "i" &&
      Date.now() - pendingG.current < SEQUENCE_WINDOW_MS
    ) {
      complete("inbox");
      pendingG.current = 0;
      setLastPress("G then I");
      return;
    }
    setLastPress(event.key.length === 1 ? event.key.toUpperCase() : event.key);
  }

  const progress = Math.round((done.length / lessons.length) * 100);
  const finished = done.length === lessons.length;

  function restart() {
    setDone([]);
    setLastPress(null);
    setExit(null);
  }

  if (exit) {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center text-card-foreground">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check aria-hidden="true" className="size-5" />
        </span>
        <h3 className="text-base font-semibold">
          {exit === "finished" ? "Shortcuts learned" : "Skipped for now"}
        </h3>
        <p className="text-sm text-balance text-muted-foreground">
          {exit === "finished"
            ? "You practiced all three. On to step 3 of 4."
            : "You can come back to the shortcut lesson any time."}
        </p>
        <Button variant="outline" size="sm" onClick={restart}>
          Practice again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-5 text-card-foreground">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-base font-semibold">Learn three shortcuts</h3>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          Step 2 of 4
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Most of the team never touches the mouse. Try each shortcut in the
        practice area below.
      </p>

      <Progress
        value={progress}
        aria-label="Shortcuts practiced"
        className="mt-4"
      />

      <ul className="mt-4 divide-y">
        {lessons.map((lesson) => {
          const isDone = done.includes(lesson.id);
          return (
            <li key={lesson.id} className="flex items-center gap-3 py-3">
              <span
                className={
                  isDone
                    ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors"
                    : "flex size-5 shrink-0 items-center justify-center rounded-full border border-border transition-colors"
                }
              >
                {isDone && <Check aria-hidden="true" className="size-3" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {lesson.label}
                  <span className="sr-only">
                    {isDone ? " (done)" : " (not yet)"}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{lesson.detail}</p>
              </div>
              {lesson.id === "search" && (
                <KbdGroup>
                  <Kbd>{modifier}</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              )}
              {lesson.id === "create" && <Kbd>C</Kbd>}
              {lesson.id === "inbox" && (
                <KbdGroup>
                  <Kbd>G</Kbd>
                  <span className="font-sans text-xs text-muted-foreground">then</span>
                  <Kbd>I</Kbd>
                </KbdGroup>
              )}
            </li>
          );
        })}
      </ul>

      <section
        // biome-ignore lint/a11y/noNoninteractiveTabindex: focusable practice surface that captures key presses
        tabIndex={0}
        aria-label="Shortcut practice area. Focus here and press a shortcut."
        onKeyDown={handleKeyDown}
        className="mt-2 flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/40 text-center outline-none focus-visible:border-ring focus-visible:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {lastPress ? (
          <>
            <span className="text-xs text-muted-foreground">You pressed</span>
            <Kbd className="h-6 px-2 text-sm text-foreground">{lastPress}</Kbd>
          </>
        ) : (
          <span className="px-4 text-sm text-muted-foreground">
            Click here, then press a shortcut
          </span>
        )}
      </section>
      <p aria-live="polite" className="sr-only">
        {`${done.length} of ${lessons.length} shortcuts practiced`}
      </p>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={() => setExit("skipped")}>
          Skip for now
        </Button>
        <Button disabled={!finished} onClick={() => setExit("finished")}>
          Continue
        </Button>
      </div>
    </div>
  );
}
