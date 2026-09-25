"use client";

import {
  CircleCheckIcon,
  MapPinIcon,
  PackageCheckIcon,
  TruckIcon,
  WarehouseIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

const days = [
  {
    label: "Thursday, Sep 25",
    events: [
      {
        id: "e5",
        icon: TruckIcon,
        time: "07:48",
        text: "Out for delivery from Portland, OR",
        current: true,
      },
      {
        id: "e4",
        icon: WarehouseIcon,
        time: "03:12",
        text: "Arrived at Portland distribution center",
      },
    ],
  },
  {
    label: "Wednesday, Sep 24",
    events: [
      {
        id: "e3",
        icon: MapPinIcon,
        time: "18:30",
        text: "Departed Sacramento, CA",
      },
      {
        id: "e2",
        icon: PackageCheckIcon,
        time: "11:05",
        text: "Picked up by carrier",
      },
      {
        id: "e1",
        icon: CircleCheckIcon,
        time: "09:40",
        text: "Order packed and labeled",
      },
    ],
  },
];

export default function Marker09() {
  return (
    <section
      aria-labelledby="marker-09-title"
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-start gap-3">
        <img
          src="/placeholder.svg"
          alt=""
          className="size-14 shrink-0 rounded-lg border border-border bg-muted object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <h3 id="marker-09-title" className="text-sm font-medium">
              Order #SV-30418
            </h3>
            <Badge variant="secondary">In transit</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Merino crew sweater · Charcoal · M
          </p>
          <p className="text-xs">
            Arrives <span className="font-medium">today by 8 PM</span>
          </p>
        </div>
      </div>

      <ol aria-label="Shipment history" className="flex flex-col gap-3">
        {days.map((day) => (
          <li key={day.label} className="flex flex-col gap-2.5">
            <Marker variant="separator" className="text-xs">
              <MarkerContent>{day.label}</MarkerContent>
            </Marker>
            <ol className="flex flex-col gap-2.5">
              {day.events.map((event) => {
                const Icon = event.icon;
                return (
                  <li key={event.id}>
                    <Marker
                      aria-current={event.current ? "step" : undefined}
                      className="items-start aria-[current=step]:text-foreground"
                    >
                      <MarkerIcon className="mt-0.5">
                        <Icon />
                      </MarkerIcon>
                      <MarkerContent className="flex-1">
                        {event.text}
                        {event.current && (
                          <span className="sr-only"> (latest update)</span>
                        )}
                      </MarkerContent>
                      <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {event.time}
                      </time>
                    </Marker>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  );
}
