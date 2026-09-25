"use client";

import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";

type RingState = "unseen" | "seen" | "live";

const updates: {
  id: string;
  name: string;
  initials: string;
  state: RingState;
}[] = [
  { id: "ines", name: "Inès Moreau", initials: "IM", state: "live" },
  { id: "kofi", name: "Kofi Mensah", initials: "KM", state: "unseen" },
  { id: "yuki", name: "Yuki Tanaka", initials: "YT", state: "unseen" },
  { id: "arjun", name: "Arjun Mehta", initials: "AM", state: "unseen" },
  { id: "freya", name: "Freya Lund", initials: "FL", state: "seen" },
];

const ringClass: Record<RingState, string> = {
  unseen: "bg-linear-to-tr from-chart-1 via-chart-4 to-chart-2",
  seen: "bg-border",
  live: "bg-destructive",
};

const stateLabel: Record<RingState, string> = {
  unseen: "new update",
  seen: "viewed",
  live: "live now",
};

export default function Avatar08() {
  const [viewed, setViewed] = React.useState<string[]>([]);

  function markViewed(id: string) {
    setViewed((current) => (current.includes(id) ? current : [...current, id]));
  }

  const remaining = updates.filter(
    (item) => item.state === "unseen" && !viewed.includes(item.id),
  ).length;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium">Team updates</h3>
        <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
          {remaining === 0 ? "All caught up" : `${remaining} new`}
        </p>
      </div>
      <ul className="-mx-1 flex gap-3 overflow-x-auto px-1 pt-1 pb-2">
        {updates.map((item) => {
          const state: RingState =
            item.state === "unseen" && viewed.includes(item.id)
              ? "seen"
              : item.state;
          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => markViewed(item.id)}
                aria-label={`${item.name}, ${stateLabel[state]}`}
                className="group/ring flex w-16 flex-col items-center gap-1.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="relative">
                  <span
                    className={`block rounded-full p-0.5 transition-colors duration-300 ${ringClass[state]} ${state === "live" ? "motion-safe:animate-pulse" : ""}`}
                  >
                    <span className="block rounded-full bg-background p-0.5">
                      <Avatar className="size-12 transition-transform duration-200 ease-out after:hidden group-hover/ring:scale-95 motion-reduce:transition-none">
                        <AvatarImage src="/placeholder.svg" alt="" />
                        <AvatarFallback className="font-medium">
                          {item.initials}
                        </AvatarFallback>
                      </Avatar>
                    </span>
                  </span>
                  {state === "live" ? (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-sm bg-destructive px-1 text-[10px] leading-4 font-semibold tracking-wide text-background uppercase ring-2 ring-background"
                    >
                      Live
                    </span>
                  ) : null}
                </span>
                <span
                  className={`w-full truncate text-center text-xs ${state === "seen" ? "text-muted-foreground" : "font-medium"}`}
                >
                  {item.name.split(" ")[0]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Select an update to mark it as viewed. The gradient ring fades to a
        hairline.
      </p>
    </div>
  );
}
