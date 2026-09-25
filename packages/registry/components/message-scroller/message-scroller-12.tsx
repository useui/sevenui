"use client";

import * as React from "react";
import {
  CalendarCheckIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  MapPinIcon,
  RotateCcwIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/registry/base/ui/message-scroller";

type Step = "service" | "day" | "time" | "done";

type Entry =
  | { id: string; kind: "bot"; text: string }
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "confirmation" };

const services = ["Cleaning & checkup", "Tooth pain", "Whitening consult"];
const days = ["Mon, Sep 29", "Tue, Sep 30", "Thu, Oct 2"];
const times: Record<string, string[]> = {
  "Mon, Sep 29": ["8:30 AM", "11:15 AM", "4:00 PM"],
  "Tue, Sep 30": ["9:00 AM", "1:45 PM"],
  "Thu, Oct 2": ["10:30 AM", "2:00 PM", "3:30 PM", "5:15 PM"],
};

const greeting: Entry[] = [
  {
    id: "b0",
    kind: "bot",
    text: "Hi Alex! I can book your next visit at Harbor Dental in under a minute.",
  },
  { id: "b1", kind: "bot", text: "What would you like to come in for?" },
];

export default function MessageScroller12() {
  const [entries, setEntries] = React.useState<Entry[]>(greeting);
  const [step, setStep] = React.useState<Step>("service");
  const [booking, setBooking] = React.useState({
    service: "",
    day: "",
    time: "",
  });
  const [addedToCalendar, setAddedToCalendar] = React.useState(false);
  const [view, setView] = React.useState<"thread" | "inbox">("thread");
  const threadButtonRef = React.useRef<HTMLButtonElement>(null);
  const backButtonRef = React.useRef<HTMLButtonElement>(null);
  const restoreFocus = React.useRef(false);

  React.useEffect(() => {
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    (view === "inbox" ? threadButtonRef : backButtonRef).current?.focus();
  }, [view]);

  function navigate(next: "thread" | "inbox") {
    restoreFocus.current = true;
    setView(next);
  }

  const lastEntry = entries[entries.length - 1];
  const preview =
    lastEntry.kind === "confirmation"
      ? `Appointment confirmed · ${booking.day}, ${booking.time}`
      : lastEntry.text;

  function answer(text: string, next: Step, botText?: string) {
    setEntries((prev) => {
      const added: Entry[] = [{ id: `u${prev.length}`, kind: "user", text }];
      if (botText) {
        added.push({ id: `b${prev.length + 1}`, kind: "bot", text: botText });
      }
      if (next === "done") {
        added.push({ id: `c${prev.length + 1}`, kind: "confirmation" });
      }
      return [...prev, ...added];
    });
    setStep(next);
  }

  function reset() {
    setEntries(greeting);
    setStep("service");
    setBooking({ service: "", day: "", time: "" });
    setAddedToCalendar(false);
  }

  const options =
    step === "service"
      ? services
      : step === "day"
        ? days
        : step === "time"
          ? times[booking.day]
          : [];

  function choose(option: string) {
    if (step === "service") {
      setBooking((prev) => ({ ...prev, service: option }));
      answer(option, "day", "Got it. Dr. Reyes has openings on these days:");
    } else if (step === "day") {
      setBooking((prev) => ({ ...prev, day: option }));
      answer(option, "time", `Here are the free times on ${option}:`);
    } else if (step === "time") {
      setBooking((prev) => ({ ...prev, time: option }));
      answer(option, "done", "You're all set. See you soon!");
    }
  }

  return (
    <div className="w-full max-w-[22rem] rounded-[2.25rem] border bg-muted p-2 shadow-xl">
      {view === "inbox" ? (
        <section
          aria-labelledby="inbox-title"
          className="flex h-[34rem] flex-col overflow-hidden rounded-[1.75rem] bg-background"
        >
          <header className="border-b px-4 pt-4 pb-3">
            <h2 id="inbox-title" className="text-base font-semibold">
              Messages
            </h2>
          </header>
          <ul className="flex-1 overflow-y-auto">
            <li>
              <button
                ref={threadButtonRef}
                type="button"
                onClick={() => navigate("thread")}
                className="flex w-full items-center gap-3 px-4 py-3 text-start outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <Avatar>
                  <AvatarFallback className="text-xs">HD</AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium">Harbor Dental</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {preview}
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </section>
      ) : (
        <section
          aria-labelledby="booking-title"
          className="flex h-[34rem] flex-col overflow-hidden rounded-[1.75rem] bg-background"
        >
          <header className="flex items-center gap-2 border-b px-3 pt-4 pb-3">
            <Button
              ref={backButtonRef}
              variant="ghost"
              size="icon-sm"
              aria-label="Back to messages"
              onClick={() => navigate("inbox")}
            >
              <ChevronLeftIcon aria-hidden="true" />
            </Button>
            <Avatar size="sm">
              <AvatarFallback className="text-[0.625rem]">HD</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 leading-tight">
              <h2 id="booking-title" className="text-sm font-medium">
                Harbor Dental
              </h2>
              <p className="text-xs text-muted-foreground">Booking assistant</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={reset}
              aria-label="Start over"
            >
              <RotateCcwIcon aria-hidden="true" />
            </Button>
          </header>
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="flex-1">
              <MessageScrollerViewport
                className="px-3 py-4"
                aria-label="Booking conversation"
              >
                <MessageScrollerContent className="gap-2">
                  {entries.map((entry) => (
                    <MessageScrollerItem
                      key={entry.id}
                      messageId={entry.id}
                      scrollAnchor={entry.kind === "user"}
                      className="flex flex-col"
                    >
                      {entry.kind === "confirmation" ? (
                        <div className="mt-1 w-full max-w-[85%] overflow-hidden rounded-2xl border bg-card">
                          <div className="flex items-center gap-2 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                            <CalendarCheckIcon aria-hidden="true" className="size-4" />
                            Appointment confirmed
                          </div>
                          <dl className="space-y-1.5 px-3 py-2.5 text-sm">
                            <div>
                              <dt className="sr-only">Service</dt>
                              <dd className="font-medium">{booking.service}</dd>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <dt>
                                <ClockIcon aria-hidden="true" className="size-3.5" />
                                <span className="sr-only">When</span>
                              </dt>
                              <dd>
                                {booking.day} · {booking.time}
                              </dd>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <dt>
                                <MapPinIcon aria-hidden="true" className="size-3.5" />
                                <span className="sr-only">Where</span>
                              </dt>
                              <dd>418 Harbor Blvd, Suite 2</dd>
                            </div>
                          </dl>
                          <div className="border-t p-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full"
                              disabled={addedToCalendar}
                              onClick={() => setAddedToCalendar(true)}
                            >
                              {addedToCalendar ? (
                                <>
                                  <CheckIcon
                                    aria-hidden="true"
                                    data-icon="inline-start"
                                  />
                                  Added to calendar
                                </>
                              ) : (
                                "Add to calendar"
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Bubble
                          variant={entry.kind === "bot" ? "muted" : "default"}
                          align={entry.kind === "user" ? "end" : "start"}
                        >
                          <BubbleContent>{entry.text}</BubbleContent>
                        </Bubble>
                      )}
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
          <div className="border-t px-3 pt-3 pb-5">
            {options.length > 0 ? (
              <fieldset className="flex flex-wrap gap-2">
                <legend className="sr-only">Quick replies</legend>
                {options.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => choose(option)}
                  >
                    {option}
                  </Button>
                ))}
              </fieldset>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                A reminder will be sent the day before.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
