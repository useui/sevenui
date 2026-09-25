"use client";

import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

type Session = {
  id: string;
  time: string;
  title: string;
  speaker: string;
  room: string;
  track: string;
};

const days: {
  value: string;
  weekday: string;
  date: string;
  sessions: Session[];
}[] = [
  {
    value: "day-1",
    weekday: "Tue",
    date: "14",
    sessions: [
      {
        id: "keynote",
        time: "09:00",
        title: "Opening keynote: shipping in smaller slices",
        speaker: "Ana Ribeiro",
        room: "Main hall",
        track: "Keynote",
      },
      {
        id: "design-tokens",
        time: "10:30",
        title: "Design tokens that survive a rebrand",
        speaker: "Jonas Weber",
        room: "Room B",
        track: "Design",
      },
      {
        id: "edge-caching",
        time: "13:00",
        title: "Edge caching without the stale surprises",
        speaker: "Priya Nair",
        room: "Room A",
        track: "Engineering",
      },
    ],
  },
  {
    value: "day-2",
    weekday: "Wed",
    date: "15",
    sessions: [
      {
        id: "pricing",
        time: "09:30",
        title: "What we learned from four pricing changes",
        speaker: "Marcus Lee",
        room: "Main hall",
        track: "Product",
      },
      {
        id: "a11y-audits",
        time: "11:00",
        title: "Running accessibility audits every sprint",
        speaker: "Sofia Martins",
        room: "Room B",
        track: "Design",
      },
    ],
  },
  {
    value: "day-3",
    weekday: "Thu",
    date: "16",
    sessions: [
      {
        id: "postgres",
        time: "10:00",
        title: "Postgres at 40,000 writes per second",
        speaker: "Daniel Ortiz",
        room: "Room A",
        track: "Engineering",
      },
      {
        id: "closing",
        time: "16:00",
        title: "Closing panel: the next five years of tooling",
        speaker: "Hosted by Ana Ribeiro",
        room: "Main hall",
        track: "Keynote",
      },
    ],
  },
];

export default function Tabs12() {
  const [saved, setSaved] = useState<string[]>(["keynote"]);

  const toggle = (id: string) =>
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

  return (
    <section
      aria-labelledby="tabs-12-title"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 id="tabs-12-title" className="font-semibold">
            Buildweek 2026 schedule
          </h3>
          <p className="text-sm text-muted-foreground">Lisbon · Oct 14–16</p>
        </div>
        <p
          aria-live="polite"
          className="shrink-0 pt-0.5 text-sm text-muted-foreground tabular-nums"
        >
          {saved.length} saved
        </p>
      </div>

      <Tabs defaultValue="day-1" className="gap-4">
        <TabsList
          aria-label="Conference day"
          className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-auto"
        >
          {days.map((day) => (
            <TabsTrigger
              key={day.value}
              value={day.value}
              className="h-auto flex-col gap-0 rounded-lg border-border py-2 hover:bg-muted/60 data-active:border-primary data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none dark:data-active:border-primary dark:data-active:bg-primary dark:data-active:text-primary-foreground"
            >
              <span className="text-xs font-normal opacity-80">
                {day.weekday}
              </span>{" "}
              <span className="text-lg font-semibold tabular-nums">
                <span className="sr-only">October </span>
                {day.date}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {days.map((day) => (
          <TabsContent key={day.value} value={day.value}>
            <ol className="flex flex-col">
              {day.sessions.map((session) => {
                const isSaved = saved.includes(session.id);
                return (
                  <li
                    key={session.id}
                    className="grid grid-cols-[3rem_1fr_auto] items-start gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <time className="pt-0.5 font-medium tabular-nums">
                      {session.time}
                    </time>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium leading-snug">
                        {session.title}
                      </span>
                      <span className="text-muted-foreground">
                        {session.speaker}
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin aria-hidden="true" className="size-3" />
                          {session.room}
                        </span>
                        <Badge variant="secondary">{session.track}</Badge>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-pressed={isSaved}
                      aria-label={`Save "${session.title}" to my schedule`}
                      onClick={() => toggle(session.id)}
                      className={
                        isSaved ? "text-primary" : "text-muted-foreground"
                      }
                    >
                      {isSaved ? (
                        <BookmarkCheck aria-hidden="true" />
                      ) : (
                        <Bookmark aria-hidden="true" />
                      )}
                    </Button>
                  </li>
                );
              })}
            </ol>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
