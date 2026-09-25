"use client";

import {
  CalendarCheckIcon,
  CalendarIcon,
  ClockIcon,
  GlobeIcon,
  VideoIcon,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

const days = [
  { value: "2026-09-29", weekday: "Tue", date: "Sep 29" },
  { value: "2026-09-30", weekday: "Wed", date: "Sep 30" },
  { value: "2026-10-01", weekday: "Thu", date: "Oct 1" },
  { value: "2026-10-02", weekday: "Fri", date: "Oct 2" },
];

const slotsByDay: Record<string, string[]> = {
  "2026-09-29": ["9:30 AM", "11:00 AM", "2:00 PM", "4:30 PM"],
  "2026-09-30": ["10:00 AM", "1:30 PM", "3:00 PM"],
  "2026-10-01": ["9:00 AM", "9:30 AM", "12:00 PM", "2:30 PM", "5:00 PM"],
  "2026-10-02": ["11:30 AM", "3:30 PM"],
};

const teamSizes = [
  { value: "1-10", label: "1–10 people" },
  { value: "11-50", label: "11–50 people" },
  { value: "51-200", label: "51–200 people" },
  { value: "200+", label: "More than 200" },
];

// The questionnaire skips native constraint validation, so check the format here.
function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const chipClassName =
  "min-h-11 items-center justify-center px-2 py-2 text-center data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary [&>[data-slot=questionnaire-choice-indicator]]:hidden [&_[data-slot=questionnaire-choice-label]]:items-center";

export default function Questionnaire13() {
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [inCalendar, setInCalendar] = useState(false);
  const [email, setEmail] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const malformed = email.trim() !== "" && !isEmailAddress(email);

  const selectedDay = days.find((item) => item.value === day);
  const slots = day ? (slotsByDay[day] ?? []) : [];
  const when = selectedDay
    ? `${selectedDay.weekday}, ${selectedDay.date}${time ? ` · ${time}` : ""}`
    : "Pick a day";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (malformed) {
      setEmailChecked(true);
      return;
    }
    setBooked(true);
  }

  function reset() {
    setDay(null);
    setTime(null);
    setBooked(false);
    setInCalendar(false);
    setEmail("");
    setEmailChecked(false);
  }

  return (
    <div className="grid w-full max-w-2xl overflow-hidden rounded-xl border bg-card text-card-foreground sm:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4 border-b bg-muted/40 p-5 sm:border-e sm:border-b-0">
        <Avatar size="lg">
          <AvatarFallback>DK</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Daniel Kim · Solutions</p>
          <h3 className="cn-font-heading font-semibold text-balance">
            Product demo for your team
          </h3>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <ClockIcon aria-hidden="true" className="size-4 shrink-0" />
            30 minutes
          </li>
          <li className="flex items-center gap-2">
            <VideoIcon aria-hidden="true" className="size-4 shrink-0" />
            Video call, link by email
          </li>
          <li className="flex items-center gap-2">
            <GlobeIcon aria-hidden="true" className="size-4 shrink-0" />
            Central European Time
          </li>
          <li className="flex items-center gap-2 font-medium text-foreground">
            <CalendarIcon aria-hidden="true" className="size-4 shrink-0" />
            <span aria-live="polite">{when}</span>
          </li>
        </ul>
      </aside>
      <div className="p-5">
        {booked ? (
          <div className="flex h-full flex-col justify-center gap-3">
            <CalendarCheckIcon
              aria-hidden="true"
              className="size-6 text-success"
            />
            <h3 className="font-medium">You're booked for {when}</h3>
            <p className="text-sm text-pretty text-muted-foreground">
              A calendar invite with the video link is on its way. Daniel will
              tailor the demo to your answers.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={inCalendar}
                onClick={() => setInCalendar(true)}
              >
                {inCalendar ? "Added to calendar" : "Add to calendar"}
              </Button>
              <Button size="sm" variant="outline" onClick={reset}>
                Reschedule
              </Button>
            </div>
          </div>
        ) : (
          <Questionnaire onSubmit={handleSubmit}>
            <QuestionnaireProgress />
            <QuestionnaireItem name="day" required>
              <QuestionnaireTitle>Which day works for you?</QuestionnaireTitle>
              <QuestionnaireChoices className="grid-cols-2 sm:grid-cols-4">
                {days.map((item) => (
                  <QuestionnaireChoice
                    key={item.value}
                    value={item.value}
                    className={chipClassName}
                    onChange={(event) => {
                      setDay(event.target.value);
                      setTime(null);
                    }}
                  >
                    <span className="text-xs opacity-80">{item.weekday}</span>
                    <span className="font-medium">{item.date}</span>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError>Choose a day to see open times.</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="time" required>
              <QuestionnaireTitle>Pick a time</QuestionnaireTitle>
              <QuestionnaireDescription>
                {selectedDay
                  ? `${slots.length} open slots on ${selectedDay.weekday}, ${selectedDay.date}.`
                  : "Choose a day first."}
              </QuestionnaireDescription>
              <QuestionnaireChoices
                key={day ?? "none"}
                className="grid-cols-2 sm:grid-cols-3"
              >
                {slots.map((slot) => (
                  <QuestionnaireChoice
                    key={slot}
                    value={slot}
                    className={`${chipClassName} tabular-nums`}
                    onChange={(event) => setTime(event.target.value)}
                  >
                    {slot}
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError>Choose a time slot.</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="team-size" required>
              <QuestionnaireTitle>How big is your team?</QuestionnaireTitle>
              <QuestionnaireDescription>
                Helps Daniel pick the right plan to walk through.
              </QuestionnaireDescription>
              <QuestionnaireChoices className="sm:grid-cols-2">
                {teamSizes.map((size) => (
                  <QuestionnaireChoice key={size.value} value={size.value}>
                    {size.label}
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError />
            </QuestionnaireItem>
            <QuestionnaireItem
              name="email"
              required
              invalid={emailChecked && malformed}
            >
              <QuestionnaireTitle>Where should we send the invite?</QuestionnaireTitle>
              <QuestionnaireInput
                type="email"
                aria-label="Work email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setEmailChecked(true)}
              />
              <QuestionnaireError>
                {emailChecked && malformed
                  ? "Enter a full email address, like you@company.com."
                  : "Enter your work email."}
              </QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireActions>
              <QuestionnairePrevious />
              <QuestionnaireNext />
              <QuestionnaireSubmit>Confirm booking</QuestionnaireSubmit>
            </QuestionnaireActions>
          </Questionnaire>
        )}
      </div>
    </div>
  );
}
