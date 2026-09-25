"use client";

import * as React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/base/ui/avatar";

const team = [
  { name: "Olivia Chen", initials: "OC" },
  { name: "Marcus Reid", initials: "MR" },
  { name: "Leila Haddad", initials: "LH" },
  { name: "Sven Karlsson", initials: "SK" },
  { name: "Nora Quinn", initials: "NQ" },
];

const rows = [
  {
    label: "Compact",
    hint: "Table cells",
    size: "sm" as const,
    group: "-space-x-2",
    count: "+9",
  },
  {
    label: "Default",
    hint: "Lists and headers",
    size: "default" as const,
    group: "-space-x-1.5",
    count: "+9",
  },
  {
    label: "Loose",
    hint: "Cards and panels",
    size: "lg" as const,
    group: "-space-x-1",
    count: "+9",
  },
];

export default function Avatar06() {
  // Hover and focus spread the stack on desktop; a tap toggles it on touch.
  const [spread, setSpread] = React.useState(false);

  return (
    <div className="flex w-full max-w-md flex-col divide-y divide-border">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 py-3 sm:gap-4"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium">{row.label}</p>
            <p className="text-xs text-muted-foreground">{row.hint}</p>
          </div>
          <AvatarGroup className={`shrink-0 ${row.group}`}>
            {team.slice(0, 4).map((person, index) => (
              <Avatar
                key={person.name}
                size={row.size}
                className={index === 3 ? "max-sm:hidden" : undefined}
              >
                <AvatarImage src="/placeholder.svg" alt={person.name} />
                <AvatarFallback>{person.initials}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount className="text-xs font-medium tabular-nums">
              {row.count}
              <span className="sr-only"> more collaborators</span>
            </AvatarGroupCount>
          </AvatarGroup>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 py-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">Fan out</p>
          <p className="text-xs text-muted-foreground">
            Spreads on hover, focus, or tap
          </p>
        </div>
        <button
          type="button"
          aria-label="View all 5 collaborators"
          aria-pressed={spread}
          onClick={() => setSpread((current) => !current)}
          className="group/fan shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span
            className={`flex ${spread ? "-space-x-0.5" : "-space-x-3"} group-hover/fan:-space-x-0.5 group-focus-visible/fan:-space-x-0.5 *:transition-[margin] *:duration-300 *:ease-out motion-reduce:*:transition-none`}
          >
            {team.map((person) => (
              <Avatar key={person.name} className="ring-2 ring-background">
                <AvatarImage src="/placeholder.svg" alt="" />
                <AvatarFallback>{person.initials}</AvatarFallback>
              </Avatar>
            ))}
          </span>
        </button>
      </div>
    </div>
  );
}
