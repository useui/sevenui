"use client";

import { Spinner } from "@/registry/base/ui/spinner";

const tones = [
  {
    name: "Neutral",
    label: "Loading messages",
    className: "text-foreground",
  },
  {
    name: "Muted",
    label: "Fetching older activity",
    className: "text-muted-foreground",
  },
  {
    name: "Primary",
    label: "Publishing changes",
    className: "text-primary",
  },
  {
    name: "Success",
    label: "Verifying payment",
    className: "text-success",
  },
  {
    name: "Warning",
    label: "Retrying connection",
    className: "text-warning",
  },
  {
    name: "Destructive",
    label: "Deleting workspace",
    className: "text-destructive",
  },
];

export default function Spinner02() {
  return (
    <ul className="grid w-full max-w-sm grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {tones.map((tone) => (
        <li key={tone.name} className="flex items-center gap-3">
          <Spinner aria-label={tone.label} className={tone.className} />
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">{tone.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {tone.label}…
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
