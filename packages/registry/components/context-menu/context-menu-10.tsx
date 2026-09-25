"use client";

import {
  CalendarArrowUp,
  CopyPlus,
  Link2,
  Palette,
  RotateCcw,
  Trash2,
  Video,
} from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type Rsvp = "going" | "maybe" | "declined";
type Tone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

type CalendarEvent = {
  id: string;
  title: string;
  start: number;
  end: number;
  rsvp: Rsvp;
  tone: Tone;
  video: boolean;
};

const START_HOUR = 9;
const HOURS = [9, 10, 11, 12, 13];
const ROW = 48;

const tones: { value: Tone; label: string; swatch: string; block: string }[] = [
  {
    value: "chart-1",
    label: "Focus",
    swatch: "bg-chart-1",
    block: "border-chart-1/40 bg-chart-1/15",
  },
  {
    value: "chart-2",
    label: "Meetings",
    swatch: "bg-chart-2",
    block: "border-chart-2/40 bg-chart-2/15",
  },
  {
    value: "chart-3",
    label: "Customers",
    swatch: "bg-chart-3",
    block: "border-chart-3/40 bg-chart-3/15",
  },
  {
    value: "chart-4",
    label: "Hiring",
    swatch: "bg-chart-4",
    block: "border-chart-4/40 bg-chart-4/15",
  },
  {
    value: "chart-5",
    label: "Personal",
    swatch: "bg-chart-5",
    block: "border-chart-5/40 bg-chart-5/15",
  },
];

const initialEvents: CalendarEvent[] = [
  {
    id: "standup",
    title: "Design standup",
    start: 9,
    end: 9.5,
    rsvp: "going",
    tone: "chart-2",
    video: true,
  },
  {
    id: "acme",
    title: "Acme onboarding call",
    start: 10,
    end: 11,
    rsvp: "maybe",
    tone: "chart-3",
    video: true,
  },
  {
    id: "focus",
    title: "Write Q4 roadmap",
    start: 11.5,
    end: 13,
    rsvp: "going",
    tone: "chart-1",
    video: false,
  },
];

function formatHour(value: number) {
  const hour = Math.floor(value);
  const minutes = value % 1 === 0 ? "00" : "30";
  const display = hour > 12 ? hour - 12 : hour;
  return `${display}:${minutes}${hour >= 12 ? " PM" : " AM"}`;
}

export default function ContextMenu10() {
  const [events, setEvents] = React.useState(initialEvents);
  const [status, setStatus] = React.useState("");

  function patch(id: string, next: Partial<CalendarEvent>) {
    setEvents((current) =>
      current.map((event) => (event.id === id ? { ...event, ...next } : event)),
    );
  }

  return (
    <section
      aria-labelledby="context-menu-10-title"
      className="w-full max-w-sm rounded-xl border bg-card text-card-foreground"
    >
      <header className="flex items-baseline justify-between border-b px-4 py-3">
        <h3 id="context-menu-10-title" className="text-sm font-semibold">
          Thursday, Oct 8
        </h3>
        <span className="text-xs text-muted-foreground">
          Right-click an event
        </span>
      </header>
      <div className="relative px-4 py-3">
        <ol aria-hidden="true">
          {HOURS.map((hour) => (
            <li
              key={hour}
              style={{ height: ROW }}
              className="flex gap-3 border-t border-dashed first:border-t-0"
            >
              <span className="-mt-2 w-14 shrink-0 bg-card text-[11px] whitespace-nowrap text-muted-foreground tabular-nums">
                {formatHour(hour)}
              </span>
            </li>
          ))}
        </ol>
        <ul className="absolute inset-y-3 right-4 left-21">
          {events.map((event) => {
            const tone = tones.find((item) => item.value === event.tone);
            return (
              <li
                key={event.id}
                className="absolute inset-x-0 px-0.5 py-px"
                style={{
                  top: (event.start - START_HOUR) * ROW,
                  height: (event.end - event.start) * ROW,
                }}
              >
                <ContextMenu>
                  <ContextMenuTrigger
                    onKeyDown={openMenuWithShiftF10}
                    tabIndex={0}
                    aria-label={`${event.title}, ${formatHour(event.start)} to ${formatHour(event.end)}, RSVP ${event.rsvp}`}
                    className={cn(
                      "flex h-full flex-col overflow-hidden rounded-md border px-2 py-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:ring-2 data-popup-open:ring-ring/40",
                      tone?.block,
                      event.rsvp === "declined" && "opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex min-w-0 shrink-0 items-center gap-1 font-medium",
                        event.rsvp === "declined" && "line-through",
                      )}
                    >
                      {event.video ? (
                        <Video aria-hidden="true" className="size-3 shrink-0" />
                      ) : null}
                      <span className="truncate">{event.title}</span>
                    </span>
                    {event.end - event.start >= 1 ? (
                      <span className="truncate text-muted-foreground tabular-nums">
                        {formatHour(event.start)} – {formatHour(event.end)}
                        {event.rsvp === "maybe" ? " · Maybe" : ""}
                      </span>
                    ) : null}
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-56">
                    <ContextMenuGroup>
                      <ContextMenuLabel>Going?</ContextMenuLabel>
                      <ContextMenuRadioGroup
                        value={event.rsvp}
                        onValueChange={(value) =>
                          patch(event.id, { rsvp: value as Rsvp })
                        }
                      >
                        <ContextMenuRadioItem value="going">
                          Yes
                        </ContextMenuRadioItem>
                        <ContextMenuRadioItem value="maybe">
                          Maybe
                        </ContextMenuRadioItem>
                        <ContextMenuRadioItem value="declined">
                          No
                        </ContextMenuRadioItem>
                      </ContextMenuRadioGroup>
                    </ContextMenuGroup>
                    <ContextMenuSeparator />
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <Palette aria-hidden="true" />
                        Calendar color
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-44">
                        <ContextMenuRadioGroup
                          value={event.tone}
                          onValueChange={(value) =>
                            patch(event.id, { tone: value as Tone })
                          }
                        >
                          {tones.map((item) => (
                            <ContextMenuRadioItem
                              key={item.value}
                              value={item.value}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "size-2.5 rounded-full",
                                  item.swatch,
                                )}
                              />
                              {item.label}
                            </ContextMenuRadioItem>
                          ))}
                        </ContextMenuRadioGroup>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    {event.video ? (
                      <ContextMenuItem
                        onClick={() =>
                          setStatus(`Meeting link for ${event.title} copied.`)
                        }
                      >
                        <Link2 aria-hidden="true" />
                        Copy meeting link
                      </ContextMenuItem>
                    ) : null}
                    <ContextMenuItem
                      onClick={() =>
                        setStatus(`${event.title} duplicated to Friday.`)
                      }
                    >
                      <CopyPlus aria-hidden="true" />
                      Duplicate
                      <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setEvents((current) =>
                          current.filter((item) => item.id !== event.id),
                        );
                        setStatus(`${event.title} moved to Friday, Oct 9.`);
                      }}
                    >
                      <CalendarArrowUp aria-hidden="true" />
                      Move to tomorrow
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => {
                        setEvents((current) =>
                          current.filter((item) => item.id !== event.id),
                        );
                        setStatus(
                          `${event.title} deleted. Guests were notified.`,
                        );
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                      Delete event
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex min-h-10 items-center justify-between gap-2 border-t px-4 py-1.5">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {status || `${events.length} events today`}
        </p>
        {events.length === 0 ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setEvents(initialEvents);
              setStatus("Thursday's events restored.");
            }}
          >
            <RotateCcw aria-hidden="true" />
            Restore
          </Button>
        ) : null}
      </div>
    </section>
  );
}
