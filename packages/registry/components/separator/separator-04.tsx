"use client";

import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Separator } from "@/registry/base/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Inset = "full" | "inset" | "middle";

const insets: { value: Inset; label: string }[] = [
  { value: "full", label: "Full bleed" },
  { value: "inset", label: "Inset" },
  { value: "middle", label: "Middle" },
];

const members = [
  { name: "Maya Patel", role: "Engineering lead", initials: "MP" },
  { name: "Jonas Weber", role: "Product designer", initials: "JW" },
  { name: "Ava Thompson", role: "Support engineer", initials: "AT" },
  { name: "Leo Martins", role: "Data analyst", initials: "LM" },
];

// Each inset lines the separator up with a different edge of the row.
const insetClass: Record<Inset, string> = {
  full: "",
  // 16px row padding + 32px avatar + 12px gap = starts under the name.
  inset: "ml-15 data-[orientation=horizontal]:w-auto",
  middle: "mx-4 data-[orientation=horizontal]:w-auto",
};

export default function Separator04() {
  const [inset, setInset] = React.useState<Inset>("inset");

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <ToggleGroup
        aria-label="Separator inset"
        variant="outline"
        size="sm"
        spacing={0}
        value={[inset]}
        onValueChange={(next) => {
          // Keep one option selected at all times.
          if (next.length > 0) setInset(next[0] as Inset);
        }}
        className="w-full"
      >
        {insets.map((item) => (
          <ToggleGroupItem
            key={item.value}
            value={item.value}
            className="flex-1 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ul
        aria-label="Workspace members"
        className="overflow-hidden rounded-xl border bg-card text-card-foreground"
      >
        {members.map((member, index) => (
          <li key={member.name}>
            {index > 0 && (
              <Separator
                className={`transition-[margin] duration-200 ease-out motion-reduce:transition-none ${insetClass[inset]}`}
              />
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar>
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {member.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {member.role}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
