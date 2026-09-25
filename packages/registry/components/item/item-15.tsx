"use client";

import * as React from "react";
import { CheckIcon, MapPinIcon, VideoIcon, XIcon } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/registry/base/ui/item";

type Status = "past" | "live" | "invite" | "upcoming";
type Response = "accepted" | "declined";

const EVENTS: {
  id: string;
  start: string;
  end: string;
  title: string;
  where: string;
  remote: boolean;
  status: Status;
  guests: string[];
}[] = [
  {
    id: "standup",
    start: "9:30",
    end: "9:45",
    title: "Checkout squad standup",
    where: "Video call",
    remote: true,
    status: "past",
    guests: ["MK", "JP", "SL"],
  },
  {
    id: "review",
    start: "11:00",
    end: "11:45",
    title: "Pricing page design review",
    where: "Video call",
    remote: true,
    status: "live",
    guests: ["AO", "TL", "RM", "DS", "EW"],
  },
  {
    id: "interview",
    start: "14:00",
    end: "15:00",
    title: "Interview: Senior iOS engineer",
    where: "Room 4B · Harbor floor",
    remote: false,
    status: "invite",
    guests: ["NB", "OH"],
  },
  {
    id: "one-on-one",
    start: "16:30",
    end: "17:00",
    title: "1:1 with Priya",
    where: "Cafe corner",
    remote: false,
    status: "upcoming",
    guests: ["PR"],
  },
];

export default function Item15() {
  const headingId = React.useId();
  const [joined, setJoined] = React.useState(false);
  const [responses, setResponses] = React.useState<Record<string, Response>>(
    {},
  );

  function respond(id: string, response: Response | null) {
    setResponses((prev) => {
      const next = { ...prev };
      if (response) next[id] = response;
      else delete next[id];
      return next;
    });
  }

  return (
    <section
      aria-labelledby={headingId}
      className="w-full max-w-md rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between gap-2 border-b px-4 py-3">
        <h3 id={headingId} className="text-sm font-semibold">
          Today
        </h3>
        <p className="text-sm text-muted-foreground">Thursday, Sep 25</p>
      </header>

      <ItemGroup aria-labelledby={headingId} className="gap-1 p-1.5">
        {EVENTS.map((event) => {
          const response = responses[event.id];
          const visibleGuests = event.guests.slice(0, 3);
          const extraGuests = event.guests.length - visibleGuests.length;
          const PlaceIcon = event.remote ? VideoIcon : MapPinIcon;

          return (
            <Item
              key={event.id}
              role="listitem"
              data-status={event.status}
              data-response={response}
              className="items-start gap-3 data-[response=declined]:opacity-60 data-[status=live]:bg-muted/60 data-[status=past]:opacity-60"
            >
              <ItemMedia className="w-11 flex-col items-end gap-0 text-right tabular-nums">
                <span className="text-sm font-medium">{event.start}</span>
                <span className="text-xs text-muted-foreground">
                  {event.end}
                </span>
              </ItemMedia>

              <div
                aria-hidden="true"
                className="w-0.5 self-stretch rounded-full bg-border in-data-[status=invite]:bg-chart-4 in-data-[status=live]:bg-primary"
              />

              <ItemContent className="min-w-0">
                <ItemTitle className="w-full flex-wrap gap-y-1">
                  <span className="min-w-0 in-data-[response=declined]:line-through sm:truncate">
                    {event.title}
                  </span>
                  {event.status === "live" && (
                    <Badge className="gap-1.5">
                      <span
                        aria-hidden="true"
                        className="size-1.5 animate-pulse rounded-full bg-primary-foreground motion-reduce:animate-none"
                      />
                      Now
                    </Badge>
                  )}
                </ItemTitle>
                <ItemDescription className="flex items-center gap-1.5 text-xs">
                  <PlaceIcon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="truncate">{event.where}</span>
                </ItemDescription>

                {event.status === "invite" && !response && (
                  <fieldset className="mt-1.5 flex min-w-0 flex-wrap gap-1.5">
                    <legend className="sr-only">
                      Respond to {event.title}
                    </legend>
                    <Button
                      size="xs"
                      onClick={() => respond(event.id, "accepted")}
                    >
                      <CheckIcon aria-hidden="true" data-icon="inline-start" />
                      Accept
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => respond(event.id, "declined")}
                    >
                      <XIcon aria-hidden="true" data-icon="inline-start" />
                      Decline
                    </Button>
                  </fieldset>
                )}

                {response && (
                  <p
                    aria-live="polite"
                    className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    {response === "accepted" ? "You're going" : "You declined"}
                    <Button
                      size="xs"
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => respond(event.id, null)}
                    >
                      Change
                    </Button>
                  </p>
                )}
              </ItemContent>

              <ItemActions className="flex-col items-end gap-2">
                <AvatarGroup
                  role="group"
                  className="-space-x-0.5 max-sm:hidden"
                  aria-label={`${event.guests.length} ${event.guests.length === 1 ? "guest" : "guests"}`}
                >
                  {visibleGuests.map((initials) => (
                    <Avatar key={initials} size="sm">
                      <AvatarFallback className="text-[0.625rem]!">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {extraGuests > 0 && (
                    <AvatarGroupCount className="size-6 text-xs">
                      +{extraGuests}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
                {event.status === "live" && (
                  <Button
                    size="sm"
                    variant={joined ? "outline" : "default"}
                    aria-pressed={joined}
                    onClick={() => setJoined((current) => !current)}
                  >
                    <VideoIcon aria-hidden="true" data-icon="inline-start" />
                    {joined ? "Joined" : "Join"}
                  </Button>
                )}
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>
    </section>
  );
}
