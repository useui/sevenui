"use client";

import { CalendarDaysIcon } from "lucide-react";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

const days = [
  {
    label: "Monday, September 22",
    dateTime: "2026-09-22",
    messages: [
      { author: "Priya", text: "Kickoff notes are in the shared folder." },
      { author: "Leo", text: "Thanks — I'll draft the API contract tonight." },
    ],
  },
  {
    label: "Yesterday",
    dateTime: "2026-09-24",
    messages: [
      { author: "Leo", text: "Contract draft is up for review." },
    ],
  },
  {
    label: "Today",
    dateTime: "2026-09-25",
    messages: [
      { author: "Priya", text: "Approved with two small comments." },
      { author: "Leo", text: "Addressed both, merging after lunch." },
    ],
  },
];

export default function Marker02() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {days.map((day, index) => (
        <section
          key={day.dateTime}
          aria-label={day.label}
          className="flex flex-col gap-3"
        >
          <Marker variant="separator" className="text-xs font-medium">
            {index === 0 ? (
              <MarkerIcon className="size-3.5">
                <CalendarDaysIcon className="size-3.5" />
              </MarkerIcon>
            ) : null}
            <MarkerContent>
              <time dateTime={day.dateTime}>{day.label}</time>
            </MarkerContent>
          </Marker>
          <ul className="flex flex-col gap-2">
            {day.messages.map((message) => (
              <li
                key={message.text}
                className="text-sm leading-relaxed text-foreground"
              >
                <span className="font-medium">{message.author}</span>{" "}
                <span className="text-muted-foreground">{message.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
