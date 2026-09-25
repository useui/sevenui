"use client";

import * as React from "react";
import {
  CheckIcon,
  ClockIcon,
  HelpCircleIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

type Rsvp = "yes" | "maybe" | "no";

type Attendee = {
  name: string;
  initials: string;
  image?: string;
  rsvp: Rsvp;
};

const statusStyle: Record<
  Rsvp,
  { icon: typeof CheckIcon; label: string; tone: string }
> = {
  yes: {
    icon: CheckIcon,
    label: "Going",
    tone: "bg-success text-success-foreground",
  },
  maybe: {
    icon: HelpCircleIcon,
    label: "Maybe",
    tone: "bg-warning text-warning-foreground",
  },
  no: {
    icon: XIcon,
    label: "Declined",
    tone: "bg-muted-foreground text-background",
  },
};

const attendees: Attendee[] = [
  { name: "Aisha Bello", initials: "AB", image: "/placeholder.svg", rsvp: "yes" },
  { name: "Lukas Brandt", initials: "LB", rsvp: "yes" },
  { name: "Yuki Sato", initials: "YS", image: "/placeholder.svg", rsvp: "maybe" },
  { name: "Omar Farouk", initials: "OF", rsvp: "no" },
  { name: "Clara Jensen", initials: "CJ", rsvp: "yes" },
  { name: "Mateo Rossi", initials: "MR", rsvp: "maybe" },
  { name: "Freya Olsen", initials: "FO", rsvp: "yes" },
];

const visible = 5;

export default function Avatar13() {
  const [myRsvp, setMyRsvp] = React.useState<Rsvp | null>(null);
  const [joined, setJoined] = React.useState(false);
  const everyone: Attendee[] = myRsvp
    ? [{ name: "You", initials: "ME", rsvp: myRsvp }, ...attendees]
    : attendees;
  const going = everyone.filter((person) => person.rsvp === "yes").length;
  const hidden = everyone.slice(visible);

  return (
    <article className="flex w-full max-w-sm flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <div className="flex gap-3">
        <div className="flex w-12 shrink-0 flex-col items-center overflow-hidden rounded-lg border text-center">
          <span className="w-full bg-primary py-0.5 text-[0.65rem] font-medium tracking-wide text-primary-foreground uppercase">
            Oct
          </span>
          <span className="py-1 text-lg font-semibold tabular-nums">14</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-sm font-medium">Mobile app launch retro</h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" aria-hidden="true" />
            Wed, 15:00 – 15:45 CEST
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <VideoIcon className="size-3.5" aria-hidden="true" />
            Video call
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <TooltipProvider delay={200}>
          <AvatarGroup role="group" aria-label={`${everyone.length} invited`} className="shrink-0">
            {everyone.slice(0, visible).map((person) => {
              const status = statusStyle[person.rsvp];
              const Icon = status.icon;
              return (
                <Tooltip key={person.name}>
                  <TooltipTrigger
                    render={<Avatar size="lg" tabIndex={0} />}
                    aria-label={`${person.name}, ${status.label}`}
                    className="outline-none focus-visible:ring-ring/60!"
                  >
                    {person.image && (
                      <AvatarImage src={person.image} alt="" />
                    )}
                    <AvatarFallback>{person.initials}</AvatarFallback>
                    <AvatarBadge className={`size-4! ${status.tone} [&>svg]:size-2.5!`}>
                      <Icon aria-hidden="true" strokeWidth={3} />
                    </AvatarBadge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {person.name} · {status.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {hidden.length > 0 && (
              <Tooltip>
                <TooltipTrigger
                  render={<AvatarGroupCount tabIndex={0} />}
                  aria-label={`${hidden.length} more: ${hidden.map((p) => p.name).join(", ")}`}
                  className="size-10 text-xs outline-none"
                >
                  +{hidden.length}
                </TooltipTrigger>
                <TooltipContent>
                  {hidden.map((person) => person.name).join(", ")}
                </TooltipContent>
              </Tooltip>
            )}
          </AvatarGroup>
        </TooltipProvider>
        <p className="shrink-0 text-right text-xs whitespace-nowrap text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{going}</span>{" "}
          going
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <span className="text-xs text-muted-foreground">Will you attend?</span>
        <ToggleGroup
          variant="outline"
          size="sm"
          value={myRsvp ? [myRsvp] : []}
          onValueChange={(value) => {
            const next = (value[0] as Rsvp | undefined) ?? null;
            setMyRsvp(next);
            if (next === "no") setJoined(false);
          }}
          aria-label="Your RSVP"
        >
          <ToggleGroupItem value="yes">Yes</ToggleGroupItem>
          <ToggleGroupItem value="maybe">Maybe</ToggleGroupItem>
          <ToggleGroupItem value="no">No</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Button
        className="w-full"
        variant={joined ? "outline" : "default"}
        disabled={myRsvp === "no"}
        aria-pressed={joined}
        onClick={() => setJoined((current) => !current)}
      >
        <VideoIcon data-icon="inline-start" aria-hidden="true" />
        {joined ? "Leave call" : "Join call"}
      </Button>
    </article>
  );
}
