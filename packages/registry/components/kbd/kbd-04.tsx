"use client";

import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

const bindings = [
  {
    action: "Open command menu",
    kind: "Chord",
    steps: [["⌘", "K"]],
  },
  {
    action: "Go to inbox",
    kind: "Sequence",
    steps: [["G"], ["I"]],
  },
  {
    action: "Reopen closed tab",
    kind: "Chord",
    steps: [["⌘", "⇧", "T"]],
  },
  {
    action: "Clear formatting",
    kind: "Sequence",
    steps: [["⌘", "K"], ["⌘", "\\"]],
  },
];

function Chord({ keys }: { keys: string[] }) {
  return (
    <KbdGroup className="gap-0.5">
      {keys.map((key, index) => (
        <span key={key} className="inline-flex items-center gap-0.5">
          {index > 0 ? (
            <span aria-hidden="true" className="text-xs text-muted-foreground">
              +
            </span>
          ) : null}
          <Kbd>{key}</Kbd>
        </span>
      ))}
    </KbdGroup>
  );
}

export default function Kbd04() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Kbd className="bg-background">A</Kbd>+
          <Kbd className="bg-background">B</Kbd>
          together
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd className="bg-background">A</Kbd>
          then
          <Kbd className="bg-background">B</Kbd>
          in order
        </span>
      </div>
      <ul className="divide-y divide-border">
        {bindings.map((binding) => (
          <li
            key={binding.action}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-sm">{binding.action}</span>
              <span className="text-xs text-muted-foreground">
                {binding.kind}
              </span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5">
              {binding.steps.map((step, index) => (
                <span
                  key={step.join("+")}
                  className="inline-flex items-center gap-1.5"
                >
                  {index > 0 ? (
                    <span className="text-xs text-muted-foreground">then</span>
                  ) : null}
                  <Chord keys={step} />
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
