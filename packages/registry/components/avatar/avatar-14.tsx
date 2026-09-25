"use client";

import * as React from "react";
import {
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  PresentationIcon,
} from "lucide-react";
import { cn } from "cn";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/base/ui/avatar";

type Person = { id: string; name: string; initials: string; image?: string };

const people: Person[] = [
  { id: "ib", name: "Isabel Brooks", initials: "IB", image: "/placeholder.svg" },
  { id: "kw", name: "Kenji Watanabe", initials: "KW" },
  { id: "ad", name: "Amara Diallo", initials: "AD", image: "/placeholder.svg" },
  { id: "pv", name: "Pieter de Vries", initials: "PV" },
  { id: "sl", name: "Selin Kaya", initials: "SK" },
];

const byId = Object.fromEntries(people.map((person) => [person.id, person]));

const files = [
  {
    name: "FY26 budget model.xlsx",
    icon: FileSpreadsheetIcon,
    owner: "ib",
    shared: ["kw", "ad", "pv", "sl"],
    edited: "12 min ago",
  },
  {
    name: "Brand refresh pitch.key",
    icon: PresentationIcon,
    owner: "ad",
    shared: ["ib", "sl"],
    edited: "2 hours ago",
  },
  {
    name: "Onboarding walkthrough.mp4",
    icon: FileVideoIcon,
    owner: "kw",
    shared: ["pv"],
    edited: "Yesterday",
  },
  {
    name: "Vendor contract — Lumen.pdf",
    icon: FileTextIcon,
    owner: "pv",
    shared: [],
    edited: "Sep 18",
  },
];

function PersonAvatar({
  person,
  size,
  className,
}: {
  person: Person;
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      {person.image && <AvatarImage src={person.image} alt="" />}
      <AvatarFallback>{person.initials}</AvatarFallback>
    </Avatar>
  );
}

export default function Avatar14() {
  const [ownerFilter, setOwnerFilter] = React.useState<string | null>(null);
  const visibleFiles = ownerFilter
    ? files.filter((file) => file.owner === ownerFilter)
    : files;

  return (
    <section
      aria-labelledby="avatar-14-title"
      className="flex w-full max-w-xl flex-col gap-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="avatar-14-title" className="text-sm font-medium">
          Shared with me
        </h3>
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Filter by owner</legend>
          <span className="text-xs text-muted-foreground" aria-hidden="true">
            Owner
          </span>
          <div className="flex -space-x-1.5">
            {people.slice(0, 4).map((person) => {
              const active = ownerFilter === person.id;
              return (
                <button
                  key={person.id}
                  type="button"
                  aria-pressed={active}
                  aria-label={`Only files owned by ${person.name}`}
                  onClick={() => setOwnerFilter(active ? null : person.id)}
                  className={cn(
                    "rounded-full outline-none transition-[opacity,transform] hover:z-10 hover:-translate-y-0.5 focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50",
                    ownerFilter && !active && "opacity-40",
                    active && "z-10",
                  )}
                >
                  <PersonAvatar
                    person={person}
                    className={cn(
                      "ring-2 ring-background",
                      active && "ring-primary",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
      <ul className="divide-y rounded-xl border bg-card text-card-foreground">
        {visibleFiles.map((file) => {
          const Icon = file.icon;
          const owner = byId[file.owner];
          const shared = file.shared.map((id) => byId[id]);
          return (
            <li key={file.name} className="flex items-center gap-3 px-3 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{file.name}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <PersonAvatar person={owner} size="sm" className="size-4" />
                  <span className="truncate">
                    {owner.name} · {file.edited}
                  </span>
                </span>
              </div>
              {shared.length > 0 ? (
                <AvatarGroup
                  role="group"
                  className="hidden shrink-0 -space-x-1.5 sm:flex"
                  aria-label={`Shared with ${shared.map((p) => p.name).join(", ")}`}
                >
                  {shared.slice(0, 2).map((person) => (
                    <PersonAvatar key={person.id} person={person} size="sm" />
                  ))}
                  {shared.length > 2 && (
                    <AvatarGroupCount className="size-6 text-[0.65rem]">
                      +{shared.length - 2}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              ) : (
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                  Only owner
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {ownerFilter
          ? `${visibleFiles.length} of ${files.length} files owned by ${byId[ownerFilter].name}`
          : `${files.length} files`}
      </p>
    </section>
  );
}
