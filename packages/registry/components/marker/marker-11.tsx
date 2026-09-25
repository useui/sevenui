"use client";

import * as React from "react";
import { ChevronsUpDownIcon, TriangleAlertIcon } from "lucide-react";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

type Slot =
  | {
      kind: "event";
      id: string;
      start: string;
      end: string;
      title: string;
      room: string;
      conflict?: boolean;
    }
  | { kind: "now"; id: string; time: string }
  | { kind: "gap"; id: string; text: string };

const slots: Slot[] = [
  {
    kind: "event",
    id: "s1",
    start: "09:00",
    end: "09:30",
    title: "Platform standup",
    room: "Huddle room 2",
  },
  {
    kind: "event",
    id: "s2",
    start: "10:00",
    end: "11:00",
    title: "Checkout redesign review",
    room: "Video call",
  },
  { kind: "now", id: "now", time: "11:24" },
  {
    kind: "event",
    id: "s3",
    start: "12:00",
    end: "13:00",
    title: "Lunch with Amara",
    room: "Café Lumen",
  },
  {
    kind: "event",
    id: "s4",
    start: "12:30",
    end: "13:00",
    title: "Vendor call — Parcelly",
    room: "Video call",
    conflict: true,
  },
  { kind: "gap", id: "gap", text: "2h 30m free · good for focus time" },
  {
    kind: "event",
    id: "s5",
    start: "15:30",
    end: "16:15",
    title: "1:1 with Devon",
    room: "Room 4B",
  },
];

export default function Marker11() {
  const [showPast, setShowPast] = React.useState(false);
  const nowIndex = slots.findIndex((slot) => slot.kind === "now");
  const pastCount = nowIndex;
  const visible = showPast ? slots : slots.slice(nowIndex);
  const listId = React.useId();

  return (
    <section
      aria-labelledby="marker-11-title"
      className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="marker-11-title" className="text-sm font-medium">
          Thursday agenda
        </h3>
        <span className="text-xs text-muted-foreground">Sep 25</span>
      </div>

      <Marker
        render={<button type="button" />}
        aria-expanded={showPast}
        aria-controls={listId}
        onClick={() => setShowPast((value) => !value)}
        className="cursor-pointer rounded-md py-1 text-xs outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <MarkerIcon>
          <ChevronsUpDownIcon />
        </MarkerIcon>
        <MarkerContent>
          {showPast ? "Hide" : "Show"} {pastCount} earlier meetings
        </MarkerContent>
      </Marker>

      <ol id={listId} aria-label="Meetings" className="flex flex-col gap-2">
        {visible.map((slot) => {
          if (slot.kind === "now") {
            return (
              <li key={slot.id} aria-label={`Current time ${slot.time}`}>
                <Marker
                  variant="separator"
                  className="text-xs font-medium text-primary before:bg-primary after:bg-primary"
                >
                  <MarkerContent>Now · {slot.time}</MarkerContent>
                </Marker>
              </li>
            );
          }
          if (slot.kind === "gap") {
            return (
              <li key={slot.id}>
                <Marker className="justify-center py-1 text-xs">
                  <MarkerContent>{slot.text}</MarkerContent>
                </Marker>
              </li>
            );
          }
          const past = slots.indexOf(slot) < nowIndex;
          return (
            <li key={slot.id} className="flex flex-col gap-1">
              <div
                className={
                  past
                    ? "flex gap-3 rounded-lg bg-muted/50 p-2.5 text-muted-foreground"
                    : "flex gap-3 rounded-lg border border-border bg-background p-2.5"
                }
              >
                <div className="flex w-11 shrink-0 flex-col text-xs tabular-nums">
                  <time className="font-medium">{slot.start}</time>
                  <time className="text-muted-foreground">{slot.end}</time>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {slot.title}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {slot.room}
                  </span>
                </div>
              </div>
              {slot.conflict && (
                <Marker className="pl-1 text-xs text-destructive">
                  <MarkerIcon>
                    <TriangleAlertIcon />
                  </MarkerIcon>
                  <MarkerContent>
                    Overlaps with Lunch with Amara ·{" "}
                    <a href="#reschedule-parcelly">Suggest a new time</a>
                  </MarkerContent>
                </Marker>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
