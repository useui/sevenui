"use client";

import {
  CheckIcon,
  CircleHelpIcon,
  MapPinIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/registry/base/ui/hover-card";

type Rsvp = "yes" | "no" | "maybe";

type CalendarEvent = {
  id: string;
  title: string;
  start: number;
  end: number;
  location: { kind: "room" | "video"; label: string };
  tone: string;
  description: string;
  attendees: { name: string; initials: string; rsvp: Rsvp }[];
};

const dayStart = 9;
const dayEnd = 14;
const hourHeight = 3.5; // rem

const events: CalendarEvent[] = [
  {
    id: "standup",
    title: "Checkout squad standup",
    start: 9.5,
    end: 9.75,
    location: { kind: "video", label: "meet.northwind.io/checkout" },
    tone: "border-chart-1/40 bg-chart-1/10",
    description: "Blockers first, then yesterday's deploy notes.",
    attendees: [
      { name: "Amara Diallo", initials: "AD", rsvp: "yes" },
      { name: "Tomás Rivera", initials: "TR", rsvp: "yes" },
      { name: "Grace Kim", initials: "GK", rsvp: "maybe" },
    ],
  },
  {
    id: "review",
    title: "Payment flow design review",
    start: 10.5,
    end: 12,
    location: { kind: "room", label: "Harbor room, 4th floor" },
    tone: "border-chart-2/40 bg-chart-2/10",
    description:
      "Walk through the new 3-D Secure fallback and the saved-card picker.",
    attendees: [
      { name: "Grace Kim", initials: "GK", rsvp: "yes" },
      { name: "Noah Fischer", initials: "NF", rsvp: "yes" },
      { name: "Amara Diallo", initials: "AD", rsvp: "no" },
      { name: "Leila Karimi", initials: "LK", rsvp: "maybe" },
    ],
  },
  {
    id: "interview",
    title: "Interview: Senior Frontend",
    start: 12.5,
    end: 13.5,
    location: { kind: "video", label: "meet.northwind.io/hiring-fe" },
    tone: "border-chart-4/40 bg-chart-4/10",
    description: "System design round. Scorecard due by end of day.",
    attendees: [
      { name: "Tomás Rivera", initials: "TR", rsvp: "yes" },
      { name: "Leila Karimi", initials: "LK", rsvp: "yes" },
    ],
  },
];

const rsvpMeta: Record<
  Rsvp,
  { label: string; icon: typeof CheckIcon; className: string }
> = {
  yes: {
    label: "Going",
    icon: CheckIcon,
    className: "bg-success text-background",
  },
  no: {
    label: "Declined",
    icon: XIcon,
    className: "bg-destructive text-background",
  },
  maybe: {
    label: "Maybe",
    icon: CircleHelpIcon,
    className: "bg-muted-foreground text-background",
  },
};

function formatTime(value: number) {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  const suffix = hours >= 12 ? "PM" : "AM";
  const display = hours > 12 ? hours - 12 : hours;
  return `${display}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

function formatDuration(event: CalendarEvent) {
  const minutes = Math.round((event.end - event.start) * 60);
  return minutes >= 60
    ? `${minutes / 60} hr${minutes > 60 ? "s" : ""}`
    : `${minutes} min`;
}

const hours = Array.from(
  { length: dayEnd - dayStart },
  (_, index) => dayStart + index,
);

export default function HoverCard12() {
  return (
    <section
      aria-labelledby="hover-card-12-title"
      className="w-full max-w-sm rounded-xl border bg-card p-4 text-card-foreground"
    >
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h3 id="hover-card-12-title" className="text-sm font-medium">
          Friday, Sep 25
        </h3>
        <span className="text-xs text-muted-foreground">3 events</span>
      </header>
      <div
        className="relative mt-2"
        style={{ height: `${(dayEnd - dayStart) * hourHeight}rem` }}
      >
        <ol aria-hidden="true">
          {hours.map((hour) => (
            <li
              key={hour}
              className="absolute left-0 w-10 -translate-y-1/2 text-right text-xs text-muted-foreground tabular-nums"
              style={{ top: `${(hour - dayStart) * hourHeight}rem` }}
            >
              {formatTime(hour).replace(":00", "")}
            </li>
          ))}
        </ol>
        <ul aria-label="Events" className="absolute inset-y-0 right-0 left-12">
          {hours.map((hour) => (
            <li
              key={hour}
              aria-hidden="true"
              className="absolute inset-x-0 border-t border-dashed"
              style={{ top: `${(hour - dayStart) * hourHeight}rem` }}
            />
          ))}
          {events.map((event) => {
            const going = event.attendees.filter((a) => a.rsvp === "yes");
            const LocationIcon =
              event.location.kind === "video" ? VideoIcon : MapPinIcon;
            const short = event.end - event.start < 0.5;

            return (
              <li
                key={event.id}
                className="absolute inset-x-1 rounded-md bg-card"
                style={{
                  top: `${(event.start - dayStart) * hourHeight}rem`,
                  height: `${(event.end - event.start) * hourHeight}rem`,
                }}
              >
                <HoverCard>
                  <HoverCardTrigger
                    delay={300}
                    render={
                      <button
                        type="button"
                        className={`flex size-full min-h-0 flex-col overflow-hidden rounded-md border px-2 text-left outline-none hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring dark:hover:brightness-125 ${event.tone} ${short ? "justify-center" : "py-1"}`}
                      />
                    }
                  >
                    <span
                      className={`truncate font-medium ${short ? "text-[0.7rem] leading-none" : "text-xs"}`}
                    >
                      {event.title}
                    </span>
                    {!short && (
                      <span className="truncate text-[0.7rem] text-muted-foreground tabular-nums">
                        {formatTime(event.start)} – {formatTime(event.end)}
                      </span>
                    )}
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="right"
                    align="start"
                    className="w-72 max-w-[calc(100vw-2rem)] p-3"
                  >
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatTime(event.start)} – {formatTime(event.end)} ·{" "}
                      {formatDuration(event)}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs">
                      <LocationIcon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-muted-foreground"
                      />
                      <span className="truncate">{event.location.label}</span>
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="mt-3 border-t pt-2.5">
                      <p className="mb-2 text-xs text-muted-foreground">
                        {going.length} of {event.attendees.length} going
                      </p>
                      <ul className="grid gap-1.5">
                        {event.attendees.map((person) => {
                          const rsvp = rsvpMeta[person.rsvp];
                          const RsvpIcon = rsvp.icon;
                          return (
                            <li
                              key={person.name}
                              className="flex items-center gap-2 text-xs"
                            >
                              <Avatar size="sm" className="relative">
                                <AvatarImage src="/placeholder.svg" alt="" />
                                <AvatarFallback>
                                  {person.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="min-w-0 flex-1 truncate">
                                {person.name}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <span
                                  className={`flex size-3.5 items-center justify-center rounded-full ${rsvp.className}`}
                                >
                                  <RsvpIcon
                                    aria-hidden="true"
                                    className="size-2.5"
                                    strokeWidth={3}
                                  />
                                </span>
                                {rsvp.label}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
