"use client";

import { Trash2, Undo2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";

const holdDuration = 1500;

export default function Button11() {
  const [progress, setProgress] = React.useState(0);
  const [holding, setHolding] = React.useState(false);
  const [deleted, setDeleted] = React.useState(false);
  const frame = React.useRef<number | null>(null);
  const startedAt = React.useRef(0);
  const holdRef = React.useRef<HTMLButtonElement>(null);
  const undoRef = React.useRef<HTMLButtonElement>(null);
  const moveFocus = React.useRef(false);

  const cancelFrame = React.useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  React.useEffect(() => cancelFrame, [cancelFrame]);

  // The focused control unmounts when the state flips, so hand focus to its replacement.
  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (deleted ? undoRef : holdRef).current?.focus();
  }, [deleted]);

  function startHold() {
    if (holding || deleted) return;
    setHolding(true);
    startedAt.current = performance.now();
    const tick = (now: number) => {
      const next = Math.min(1, (now - startedAt.current) / holdDuration);
      setProgress(next);
      if (next >= 1) {
        frame.current = null;
        moveFocus.current = true;
        setHolding(false);
        setDeleted(true);
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }

  function endHold() {
    if (!holding) return;
    cancelFrame();
    setHolding(false);
    setProgress(0);
  }

  function undo() {
    moveFocus.current = true;
    setDeleted(false);
    setProgress(0);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div>
        <p className="text-sm font-semibold">Delete staging workspace</p>
        <p id="button-11-hint" className="mt-1 text-sm text-muted-foreground">
          Removes 14 environments and 3,210 build logs. Press and hold for 1.5
          seconds to confirm.
        </p>
      </div>
      {deleted ? (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2">
          <p role="status" className="text-sm">
            Workspace scheduled for deletion.
          </p>
          <Button ref={undoRef} variant="outline" size="sm" onClick={undo}>
            <Undo2 aria-hidden="true" />
            Undo
          </Button>
        </div>
      ) : (
        <Button
          ref={holdRef}
          variant="destructive"
          size="lg"
          aria-describedby="button-11-hint"
          className="relative w-full touch-none overflow-hidden"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if ((event.key === " " || event.key === "Enter") && !event.repeat) {
              event.preventDefault();
              startHold();
            }
          }}
          onKeyUp={(event) => {
            if (event.key === " " || event.key === "Enter") endHold();
          }}
          onBlur={endHold}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-left bg-destructive/20 dark:bg-destructive/30"
            style={{
              transform: `scaleX(${progress})`,
              transition: holding ? "none" : "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
          <span className="relative flex items-center gap-1.5">
            <Trash2 aria-hidden="true" />
            {holding ? "Keep holding…" : "Hold to delete"}
          </span>
        </Button>
      )}
    </div>
  );
}
