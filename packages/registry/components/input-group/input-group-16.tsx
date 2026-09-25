"use client";

import { useId, useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  CornerDownLeftIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

type Parsed = {
  title: string;
  day: string | null;
  time: string | null;
  duration: string | null;
  guests: string[];
};

type EventEntry = {
  id: number;
  title: string;
  day: string;
  time: string;
  duration: string;
  guests: string[];
};

const DAY_PATTERN =
  /\b(today|tomorrow|mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/i;
const TIME_PATTERN = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
const DURATION_PATTERN = /\bfor\s+(\d+)\s*(m|min|mins|minutes|h|hr|hrs|hours?)\b/i;
const GUEST_PATTERN = /@([a-z]+)/gi;

const fullDays: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function parse(input: string): Parsed {
  let rest = input;
  const dayMatch = rest.match(DAY_PATTERN);
  const timeMatch = rest.match(TIME_PATTERN);
  const durationMatch = rest.match(DURATION_PATTERN);
  const guests = [...rest.matchAll(GUEST_PATTERN)].map((m) => capitalize(m[1]));

  for (const match of [dayMatch, timeMatch, durationMatch]) {
    if (match) rest = rest.replace(match[0], " ");
  }
  rest = rest
    .replace(GUEST_PATTERN, " ")
    .replace(/\b(with|on)\s*(?=\s|$)/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  let day: string | null = null;
  if (dayMatch) {
    const word = dayMatch[1].toLowerCase();
    day =
      word === "today" || word === "tomorrow"
        ? capitalize(word)
        : fullDays[word.slice(0, 3)];
  }

  let time: string | null = null;
  if (timeMatch) {
    const hour = Number(timeMatch[1]);
    if (hour >= 1 && hour <= 12) {
      time = `${hour}:${timeMatch[2] ?? "00"} ${timeMatch[3].toUpperCase()}`;
    }
  }

  let duration: string | null = null;
  if (durationMatch) {
    const amount = Number(durationMatch[1]);
    duration = durationMatch[2].toLowerCase().startsWith("h")
      ? `${amount} h`
      : `${amount} min`;
  }

  return { title: rest, day, time, duration, guests };
}

const initialEvents: EventEntry[] = [
  {
    id: 1,
    title: "Design review",
    day: "Today",
    time: "11:00 AM",
    duration: "45 min",
    guests: ["Priya", "Marcus"],
  },
];

export default function InputGroup16() {
  const inputId = useId();
  const previewId = useId();
  const [value, setValue] = useState("");
  const [events, setEvents] = useState(initialEvents);

  const parsed = parse(value);
  const canAdd = parsed.title.length > 0;

  const tokens = [
    { key: "day", icon: CalendarDaysIcon, label: parsed.day ?? "Today", found: !!parsed.day },
    { key: "time", icon: ClockIcon, label: parsed.time ?? "Next free slot", found: !!parsed.time },
    { key: "duration", icon: TimerIcon, label: parsed.duration ?? "30 min", found: !!parsed.duration },
    {
      key: "guests",
      icon: UsersIcon,
      label: parsed.guests.length ? parsed.guests.join(", ") : "Just you",
      found: parsed.guests.length > 0,
    },
  ];

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!canAdd) return;
          setEvents((current) => [
            ...current,
            {
              id: Date.now(),
              title: capitalize(parsed.title),
              day: parsed.day ?? "Today",
              time: parsed.time ?? "3:30 PM",
              duration: parsed.duration ?? "30 min",
              guests: parsed.guests,
            },
          ]);
          setValue("");
        }}
      >
        <label htmlFor={inputId} className="text-sm font-medium">
          Quick add
        </label>
        <InputGroup className="mt-2">
          <InputGroupInput
            id={inputId}
            value={value}
            autoComplete="off"
            placeholder="Lunch with @sam tomorrow 1pm for 1h"
            className="h-10"
            aria-describedby={previewId}
            onChange={(event) => setValue(event.target.value)}
          />
          <InputGroupAddon
            align="block-end"
            className="items-end gap-2 border-t border-border"
          >
            <div
              id={previewId}
              aria-live="polite"
              className="flex min-w-0 flex-1 flex-wrap gap-1"
            >
              <span className="sr-only">Detected details:</span>
              {tokens.map((token) => (
                <span
                  key={token.key}
                  className={
                    token.found
                      ? "inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-foreground"
                      : "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-normal text-muted-foreground"
                  }
                >
                  <token.icon aria-hidden="true" className="size-3" />
                  {token.label}
                </span>
              ))}
            </div>
            <InputGroupButton
              type="submit"
              size="icon-xs"
              variant="default"
              disabled={!canAdd}
              aria-label="Add event"
            >
              <CornerDownLeftIcon aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>

      <h4 className="mt-5 text-xs font-medium text-muted-foreground">
        Upcoming
      </h4>
      <ol className="mt-2 flex flex-col gap-1">
        {events.map((event) => (
          <li
            key={event.id}
            className="grid grid-cols-[4.5rem_1fr] items-baseline gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
          >
            <span className="text-xs text-muted-foreground tabular-nums">
              {event.time}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {event.day} · {event.duration}
                {event.guests.length ? ` · with ${event.guests.join(", ")}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
