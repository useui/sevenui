"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

type Binding = string[];
type Action = { id: string; label: string; defaultBinding: Binding };

const actions: Action[] = [
  { id: "compose", label: "New message", defaultBinding: ["Alt", "N"] },
  { id: "reply", label: "Reply", defaultBinding: ["R"] },
  { id: "archive", label: "Archive conversation", defaultBinding: ["E"] },
  { id: "snooze", label: "Snooze until tomorrow", defaultBinding: ["H"] },
  { id: "search", label: "Search mail", defaultBinding: ["/"] },
];

const MODIFIER_KEYS = ["Shift", "Control", "Alt", "Meta"];

const keyLabels: Record<string, string> = {
  " ": "Space",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Backspace: "Backspace",
  Enter: "Enter",
};

function bindingFromEvent(event: React.KeyboardEvent): Binding {
  const keys: Binding = [];
  if (event.ctrlKey) keys.push("Ctrl");
  if (event.metaKey) keys.push("⌘");
  if (event.altKey) keys.push("Alt");
  if (event.shiftKey) keys.push("Shift");
  // On macOS, Option composes characters (Option+N types "˜"), so read the
  // physical key for letters and digits whenever Alt is held.
  const physical = /^(?:Key([A-Z])|Digit(\d))$/.exec(event.code);
  const main =
    event.altKey && physical
      ? (physical[1] ?? physical[2])
      : (keyLabels[event.key] ??
        (event.key.length === 1 ? event.key.toUpperCase() : event.key));
  keys.push(main);
  return keys;
}

const sameBinding = (a: Binding, b: Binding) => a.join("+") === b.join("+");

const defaults = () =>
  Object.fromEntries(actions.map((a) => [a.id, a.defaultBinding]));

function Shortcut({ keys }: { keys: Binding }) {
  return (
    <KbdGroup>
      {keys.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </KbdGroup>
  );
}

export default function Kbd10() {
  const [bindings, setBindings] =
    React.useState<Record<string, Binding>>(defaults);
  const [recording, setRecording] = React.useState<string | null>(null);
  const [conflict, setConflict] = React.useState<{
    actionId: string;
    binding: Binding;
    usedBy: string;
  } | null>(null);

  const isCustomized = actions.some(
    (a) => !sameBinding(bindings[a.id], a.defaultBinding),
  );

  function stopRecording() {
    setRecording(null);
    setConflict(null);
  }

  function handleRecordKey(
    event: React.KeyboardEvent<HTMLButtonElement>,
    actionId: string,
  ) {
    if (recording !== actionId) return;
    if (event.key === "Tab") {
      stopRecording();
      return;
    }
    event.preventDefault();
    // While recording, the keys belong to this field, not to page-level
    // shortcuts such as "/" or ⌘K search.
    event.nativeEvent.stopImmediatePropagation();
    if (event.key === "Escape") {
      stopRecording();
      return;
    }
    if (MODIFIER_KEYS.includes(event.key)) return;

    const next = bindingFromEvent(event);
    const owner = actions.find(
      (a) => a.id !== actionId && sameBinding(bindings[a.id], next),
    );
    if (owner) {
      setConflict({ actionId, binding: next, usedBy: owner.label });
      return;
    }
    setBindings((prev) => ({ ...prev, [actionId]: next }));
    stopRecording();
  }

  return (
    <section
      aria-labelledby="kbd-10-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-start justify-between gap-4 border-b p-5">
        <div>
          <h3 id="kbd-10-title" className="text-base font-semibold">
            Keyboard shortcuts
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a shortcut and press the keys you want to use instead.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!isCustomized}
          onClick={() => {
            setBindings(defaults());
            stopRecording();
          }}
        >
          <RotateCcw aria-hidden="true" data-icon="inline-start" />
          Reset
        </Button>
      </header>

      <ul className="divide-y">
        {actions.map((action) => {
          const isRecording = recording === action.id;
          const rowConflict =
            conflict?.actionId === action.id ? conflict : null;
          const changed = !sameBinding(
            bindings[action.id],
            action.defaultBinding,
          );

          return (
            <li key={action.id} className="px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 text-sm">
                  {action.label}
                  {changed && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Edited
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  aria-label={
                    isRecording
                      ? `Recording shortcut for ${action.label}. Press keys, or Escape to cancel.`
                      : `${action.label}: ${bindings[action.id].join(" ")}. Press to change.`
                  }
                  aria-pressed={isRecording}
                  onClick={() => {
                    setConflict(null);
                    setRecording(isRecording ? null : action.id);
                  }}
                  onKeyDown={(event) => handleRecordKey(event, action.id)}
                  onBlur={() => isRecording && stopRecording()}
                  className={
                    isRecording
                      ? "flex h-8 min-w-28 shrink-0 items-center justify-center rounded-md border border-ring bg-background px-2 text-xs text-foreground ring-3 ring-ring/50 outline-none"
                      : "flex h-8 min-w-28 shrink-0 items-center justify-end rounded-md border border-transparent px-2 outline-none transition-colors hover:border-border hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  }
                >
                  {isRecording ? (
                    rowConflict ? (
                      <Shortcut keys={rowConflict.binding} />
                    ) : (
                      <span className="motion-safe:animate-pulse">Press keys…</span>
                    )
                  ) : (
                    <Shortcut keys={bindings[action.id]} />
                  )}
                </button>
              </div>
              {isRecording && (
                <p
                  aria-live="polite"
                  className={
                    rowConflict
                      ? "mt-2 flex items-center justify-end gap-1.5 text-xs text-destructive"
                      : "mt-2 flex items-center justify-end gap-1.5 text-xs text-muted-foreground"
                  }
                >
                  {rowConflict ? (
                    <>
                      <TriangleAlert aria-hidden="true" className="size-3.5" />
                      Already used by “{rowConflict.usedBy}”. Try another.
                    </>
                  ) : (
                    <>
                      Press <Kbd>Esc</Kbd> to cancel
                    </>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
