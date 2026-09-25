"use client";

import * as React from "react";
import { EyeIcon, MousePointer2Icon, XIcon } from "lucide-react";
import { cn } from "cn";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

type Collaborator = {
  id: string;
  name: string;
  initials: string;
  image?: string;
  section: string;
  activity: string;
  ring: string;
  fill: string;
};

const sections = [
  { id: "summary", title: "Summary", words: 180 },
  { id: "goals", title: "Goals and non-goals", words: 420 },
  { id: "pricing", title: "Pricing changes", words: 610 },
  { id: "rollout", title: "Rollout plan", words: 350 },
  { id: "risks", title: "Open risks", words: 140 },
];

const collaborators: Collaborator[] = [
  {
    id: "mira",
    name: "Mira Castellanos",
    initials: "MC",
    image: "/placeholder.svg",
    section: "pricing",
    activity: "Editing",
    ring: "ring-chart-1",
    fill: "bg-chart-1",
  },
  {
    id: "dev",
    name: "Dev Patel",
    initials: "DP",
    section: "pricing",
    activity: "Commenting",
    ring: "ring-chart-2",
    fill: "bg-chart-2",
  },
  {
    id: "hana",
    name: "Hana Kim",
    initials: "HK",
    image: "/placeholder.svg",
    section: "rollout",
    activity: "Viewing",
    ring: "ring-chart-4",
    fill: "bg-chart-4",
  },
  {
    id: "ollie",
    name: "Ollie Brennan",
    initials: "OB",
    section: "summary",
    activity: "Viewing",
    ring: "ring-chart-5",
    fill: "bg-chart-5",
  },
];

function CollaboratorAvatar({
  person,
  className,
  size,
}: {
  person: Collaborator;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <Avatar size={size} className={className}>
      {person.image && <AvatarImage src={person.image} alt="" />}
      <AvatarFallback className="text-xs font-medium">
        {person.initials}
      </AvatarFallback>
    </Avatar>
  );
}

export default function Avatar16() {
  const [followingId, setFollowingId] = React.useState<string | null>(null);
  const following = collaborators.find((person) => person.id === followingId);

  // Escape anywhere in the widget stops following, like in Figma or Docs.
  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && followingId) setFollowingId(null);
  }

  return (
    <section
      aria-labelledby="avatar-16-title"
      onKeyDown={handleKeyDown}
      className={cn(
        "flex w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-card text-card-foreground ring-2 ring-transparent transition-shadow",
        following?.ring,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 flex-col">
          <h3 id="avatar-16-title" className="truncate text-sm font-medium">
            RFC: Usage-based billing
          </h3>
          <p className="text-xs text-muted-foreground">
            {collaborators.length} others in this doc
          </p>
        </div>
        <TooltipProvider delay={150}>
          <AvatarGroup
            role="group"
            aria-label="Collaborators. Select one to follow their view"
            className="-space-x-1.5"
          >
            {collaborators.map((person) => {
              const active = person.id === followingId;
              return (
                <Tooltip key={person.id}>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-label={`Follow ${person.name}, ${person.activity.toLowerCase()}`}
                        onClick={() =>
                          setFollowingId(active ? null : person.id)
                        }
                        className={cn(
                          "relative rounded-full outline-none transition-transform hover:z-10 hover:-translate-y-0.5 focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/60",
                          active && "z-10",
                        )}
                      />
                    }
                  >
                    <CollaboratorAvatar
                      person={person}
                      className={cn(
                        "ring-2 ring-background",
                        active && ["ring-offset-2 ring-offset-card", person.ring],
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {active ? "Stop following" : `Follow ${person.name}`}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </AvatarGroup>
        </TooltipProvider>
      </header>

      <div aria-live="polite">
        {following && (
          <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2 text-xs">
            <span
              className={cn("size-2 shrink-0 rounded-full", following.fill)}
              aria-hidden="true"
            />
            <EyeIcon
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate">
              Following {following.name.split(" ")[0]}
              <span className="hidden sm:inline">
                {" "}
                · press Esc to stop
              </span>
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setFollowingId(null)}
              aria-label={`Stop following ${following.name}`}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      <nav aria-label="Document outline" className="p-2">
        <ol className="flex flex-col">
          {sections.map((section) => {
            const here = collaborators.filter(
              (person) => person.section === section.id,
            );
            const isFollowed = following?.section === section.id;
            const dimmed = following && !isFollowed;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) => event.preventDefault()}
                  aria-current={isFollowed ? "location" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition-[background-color,opacity] hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50",
                    isFollowed && "bg-muted",
                    dimmed && "opacity-45",
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">
                      {section.title}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {section.words} words
                    </span>
                  </span>
                  {here.length > 0 && (
                    <span className="flex items-center gap-2">
                      {isFollowed && following && (
                        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                          <MousePointer2Icon
                            className="size-3"
                            aria-hidden="true"
                          />
                          {following.activity}
                        </span>
                      )}
                      <AvatarGroup
                        className="-space-x-1"
                        aria-label={`Here now: ${here.map((person) => person.name).join(", ")}`}
                      >
                        {here.map((person) => (
                          <CollaboratorAvatar
                            key={person.id}
                            person={person}
                            size="sm"
                            className={cn(
                              person.id === followingId &&
                                ["z-10 ring-2!", person.ring],
                            )}
                          />
                        ))}
                      </AvatarGroup>
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </section>
  );
}
