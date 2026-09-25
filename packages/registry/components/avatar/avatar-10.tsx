"use client";

import * as React from "react";
import { cn } from "cn";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Period = "week" | "month";

type Contributor = {
  name: string;
  initials: string;
  image?: string;
  team: string;
  merged: number;
};

const boards: Record<Period, Contributor[]> = {
  week: [
    {
      name: "Adaeze Okonkwo",
      initials: "AO",
      image: "/placeholder.svg",
      team: "Payments",
      merged: 14,
    },
    { name: "Rafael Souza", initials: "RS", team: "Platform", merged: 11 },
    {
      name: "Mei Lin",
      initials: "ML",
      image: "/placeholder.svg",
      team: "Mobile",
      merged: 9,
    },
    { name: "Tobias Klein", initials: "TK", team: "Platform", merged: 7 },
    { name: "Farah Siddiqui", initials: "FS", team: "Growth", merged: 6 },
    {
      name: "Liam O'Connor",
      initials: "LO",
      image: "/placeholder.svg",
      team: "Payments",
      merged: 5,
    },
  ],
  month: [
    { name: "Rafael Souza", initials: "RS", team: "Platform", merged: 46 },
    {
      name: "Adaeze Okonkwo",
      initials: "AO",
      image: "/placeholder.svg",
      team: "Payments",
      merged: 41,
    },
    { name: "Farah Siddiqui", initials: "FS", team: "Growth", merged: 33 },
    {
      name: "Mei Lin",
      initials: "ML",
      image: "/placeholder.svg",
      team: "Mobile",
      merged: 29,
    },
    {
      name: "Liam O'Connor",
      initials: "LO",
      image: "/placeholder.svg",
      team: "Payments",
      merged: 24,
    },
    { name: "Tobias Klein", initials: "TK", team: "Platform", merged: 22 },
  ],
};

const you: Record<Period, { rank: number; merged: number }> = {
  week: { rank: 12, merged: 3 },
  month: { rank: 9, merged: 17 },
};

// DOM order stays 1-2-3 for screen readers; CSS order lifts first place
// into the middle of the podium.
const podium = [
  {
    place: 1,
    avatar: "data-[size=lg]:size-18 ring-2 ring-primary ring-offset-2 ring-offset-card",
    step: "h-16",
    badge: "bg-primary text-primary-foreground",
  },
  {
    place: 2,
    avatar: "data-[size=lg]:size-14",
    step: "h-10",
    badge: "bg-secondary text-secondary-foreground",
  },
  {
    place: 3,
    avatar: "data-[size=lg]:size-14",
    step: "h-6",
    badge: "bg-muted text-foreground",
  },
];

export default function Avatar10() {
  const [period, setPeriod] = React.useState<Period>("week");
  const ranked = boards[period];
  const me = you[period];

  return (
    <section
      aria-labelledby="avatar-10-title"
      className="flex w-full max-w-sm flex-col gap-5 rounded-xl border bg-card p-4 text-card-foreground"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h3 id="avatar-10-title" className="text-sm font-medium">
            Top reviewers
          </h3>
          <p className="text-xs text-muted-foreground">
            Pull requests reviewed and merged
          </p>
        </div>
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          value={[period]}
          onValueChange={(value) => {
            if (value[0]) setPeriod(value[0] as Period);
          }}
          aria-label="Time period"
        >
          <ToggleGroupItem value="week">Week</ToggleGroupItem>
          <ToggleGroupItem value="month">Month</ToggleGroupItem>
        </ToggleGroup>
      </header>

      <ol aria-label="Podium" className="grid grid-cols-3 items-end gap-2">
        {podium.map((slot) => {
          const person = ranked[slot.place - 1];
          return (
            <li
              key={slot.place}
              className={cn(
                "flex min-w-0 flex-col items-center gap-2",
                slot.place === 1 && "order-2",
                slot.place === 2 && "order-1",
                slot.place === 3 && "order-3",
              )}
            >
              <Avatar size="lg" className={slot.avatar}>
                {person.image && <AvatarImage src={person.image} alt="" />}
                <AvatarFallback className="text-base font-medium">
                  {person.initials}
                </AvatarFallback>
                <AvatarBadge
                  aria-hidden="true"
                  className={cn(
                    "-right-0.5 -bottom-0.5 size-5! text-[0.7rem] font-semibold tabular-nums",
                    slot.badge,
                  )}
                >
                  {slot.place}
                </AvatarBadge>
              </Avatar>
              <div className="flex w-full min-w-0 flex-col items-center text-center">
                <span className="w-full truncate text-xs font-medium">
                  <span className="sr-only">Rank {slot.place}: </span>
                  {person.name.split(" ")[0]}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {person.merged} merged
                </span>
              </div>
              <div
                aria-hidden="true"
                className={cn(
                  "w-full rounded-t-md bg-muted transition-[height] duration-300 ease-out motion-reduce:transition-none",
                  slot.step,
                )}
              />
            </li>
          );
        })}
      </ol>

      <ol
        aria-label="Runners-up"
        className="-mt-3 flex flex-col divide-y border-t"
      >
        {ranked.slice(3).map((person, index) => (
          <li key={person.name} className="flex items-center gap-3 py-2.5">
            <span className="w-5 text-right text-xs text-muted-foreground tabular-nums">
              {index + 4}
            </span>
            <Avatar>
              {person.image && <AvatarImage src={person.image} alt="" />}
              <AvatarFallback className="text-xs">
                {person.initials}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm">{person.name}</span>
              <span className="text-xs text-muted-foreground">
                {person.team}
              </span>
            </span>
            <span className="text-sm tabular-nums">{person.merged}</span>
          </li>
        ))}
      </ol>

      <p className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2.5">
        <span className="w-5 text-right text-xs text-muted-foreground tabular-nums">
          {me.rank}
        </span>
        <Avatar>
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            NK
          </AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">You</span>
          <span className="text-xs text-muted-foreground">
            {ranked[5].merged - me.merged + 1} more merges to reach the top 6
          </span>
        </span>
        <span className="text-sm font-medium tabular-nums">{me.merged}</span>
      </p>
    </section>
  );
}
