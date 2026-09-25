"use client";

import * as React from "react";
import {
  CheckIcon,
  MapPinIcon,
  PackageIcon,
  RefreshCwIcon,
  TruckIcon,
  WarehouseIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Marker, MarkerContent } from "@/registry/base/ui/marker";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";

type TrackingEvent = {
  id: string;
  day: string;
  time: string;
  title: string;
  place: string;
  icon: LucideIcon;
};

const initialEvents: TrackingEvent[] = [
  {
    id: "e1",
    day: "Mon, Sep 22",
    time: "4:18 PM",
    title: "Order confirmed",
    place: "Payment received for order #SO-48213",
    icon: CheckIcon,
  },
  {
    id: "e2",
    day: "Tue, Sep 23",
    time: "9:02 AM",
    title: "Packed and labeled",
    place: "Fulfillment center · Reno, NV",
    icon: PackageIcon,
  },
  {
    id: "e3",
    day: "Tue, Sep 23",
    time: "6:40 PM",
    title: "Picked up by carrier",
    place: "Reno, NV",
    icon: TruckIcon,
  },
  {
    id: "e4",
    day: "Wed, Sep 24",
    time: "3:15 AM",
    title: "Arrived at sorting hub",
    place: "Sacramento, CA",
    icon: WarehouseIcon,
  },
  {
    id: "e5",
    day: "Wed, Sep 24",
    time: "11:47 AM",
    title: "Departed sorting hub",
    place: "Sacramento, CA",
    icon: TruckIcon,
  },
];

const upcomingEvents: TrackingEvent[] = [
  {
    id: "e6",
    day: "Thu, Sep 25",
    time: "7:05 AM",
    title: "Arrived at local facility",
    place: "Oakland, CA",
    icon: WarehouseIcon,
  },
  {
    id: "e7",
    day: "Thu, Sep 25",
    time: "8:32 AM",
    title: "Out for delivery",
    place: "Driver is 6 stops away",
    icon: TruckIcon,
  },
  {
    id: "e8",
    day: "Thu, Sep 25",
    time: "1:14 PM",
    title: "Delivered",
    place: "Left at front door · 2140 Grand Ave",
    icon: MapPinIcon,
  },
];

export default function MessageScroller08() {
  const [events, setEvents] = React.useState(initialEvents);
  const next = upcomingEvents[events.length - initialEvents.length];
  const delivered = !next;

  function refresh() {
    if (next) setEvents((prev) => [...prev, next]);
  }

  return (
    <section
      aria-labelledby="tracking-title"
      className="flex h-[26rem] w-full max-w-sm flex-col overflow-hidden rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-start gap-3 border-b p-4">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-12 shrink-0 rounded-md border bg-muted object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 id="tracking-title" className="truncate text-sm font-medium">
            Aeron Desk Lamp, Matte Graphite
          </h2>
          <p className="text-xs text-muted-foreground">
            UPS · 1Z 999 AA1 0123 4567 84
          </p>
          <Badge
            variant={delivered ? "default" : "secondary"}
            className="mt-1.5"
          >
            {delivered ? "Delivered" : "In transit · Arrives today"}
          </Badge>
        </div>
      </header>
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport
            className="px-4 py-3"
            aria-label="Shipment history"
          >
            <MessageScrollerContent className="gap-0">
              {events.map((event, index) => {
                const Icon = event.icon;
                const isLatest = index === events.length - 1;
                const newDay = index === 0 || events[index - 1].day !== event.day;
                return (
                  <MessageScrollerItem
                    key={event.id}
                    messageId={event.id}
                    className="flex flex-col"
                  >
                    {newDay ? (
                      <Marker variant="separator" className="py-2 text-xs">
                        <MarkerContent>{event.day}</MarkerContent>
                      </Marker>
                    ) : null}
                    <div className="grid grid-cols-[2rem_1fr] gap-3 py-2">
                      <span
                        className={
                          isLatest
                            ? "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                            : "flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                        }
                      >
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-baseline justify-between gap-2 text-sm">
                          <span
                            className={
                              isLatest ? "font-medium" : "text-foreground/80"
                            }
                          >
                            {event.title}
                          </span>
                          <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {event.time}
                          </time>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.place}
                        </p>
                      </div>
                    </div>
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      <footer className="flex items-center justify-between gap-3 border-t p-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {delivered ? "Tracking complete" : `Last update ${events.at(-1)?.time}`}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={delivered}
        >
          <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
          Check for updates
        </Button>
      </footer>
    </section>
  );
}
