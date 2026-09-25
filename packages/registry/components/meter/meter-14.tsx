"use client";

import { CheckCircle2, Clock } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";

type Ticket = {
  id: string;
  customer: string;
  company: string;
  subject: string;
  priority: "Urgent" | "High" | "Normal";
  targetMinutes: number;
  waitedSeconds: number;
  repliedAt: number | null;
};

const initialTickets: Ticket[] = [
  {
    id: "4821",
    customer: "Lena Hoffmann",
    company: "Brightpath",
    subject: "Checkout returns 502 for EU customers",
    priority: "Urgent",
    targetMinutes: 15,
    waitedSeconds: 14 * 60 + 38,
    repliedAt: null,
  },
  {
    id: "4817",
    customer: "Marcus Webb",
    company: "Fieldnote",
    subject: "SSO login loops back to the sign-in page",
    priority: "High",
    targetMinutes: 60,
    waitedSeconds: 49 * 60 + 12,
    repliedAt: null,
  },
  {
    id: "4809",
    customer: "Aiko Tanaka",
    company: "Parcelly",
    subject: "How do I export invoices as CSV?",
    priority: "Normal",
    targetMinutes: 240,
    waitedSeconds: 72 * 60,
    repliedAt: null,
  },
];

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function toneFor(ratio: number, replied: boolean) {
  if (replied) {
    return "[&>div:last-of-type]:bg-success/20 [&>div:last-of-type>div]:bg-success";
  }
  if (ratio >= 1) {
    return "[&>div:last-of-type]:bg-destructive/15 [&>div:last-of-type>div]:bg-destructive";
  }
  if (ratio >= 0.75) {
    return "[&>div:last-of-type]:bg-warning/20 [&>div:last-of-type>div]:bg-warning";
  }
  return "";
}

export default function Meter14() {
  const [tickets, setTickets] = React.useState(initialTickets);
  const [elapsed, setElapsed] = React.useState(0);

  const open = tickets.filter((ticket) => ticket.repliedAt === null).length;

  React.useEffect(() => {
    if (open === 0) return;
    const id = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const rows = tickets
    .map((ticket) => {
      const waited = ticket.waitedSeconds + (ticket.repliedAt ?? elapsed);
      const target = ticket.targetMinutes * 60;
      const replied = ticket.repliedAt !== null;
      return {
        ...ticket,
        waited,
        target,
        replied,
        ratio: waited / target,
        breached: waited >= target,
      };
    })
    .sort((a, b) => {
      if (a.replied !== b.replied) return a.replied ? 1 : -1;
      return b.ratio - a.ratio;
    });

  const breached = rows.filter((row) => row.breached && !row.replied).length;

  function reply(id: string) {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id ? { ...ticket, repliedAt: elapsed } : ticket,
      ),
    );
  }

  return (
    <section
      aria-labelledby="meter-14-title"
      className="w-full max-w-lg rounded-xl border bg-card text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <div>
          <h3 id="meter-14-title" className="font-medium">
            First response queue
          </h3>
          <p className="text-sm text-muted-foreground">
            Sorted by time left before the SLA is breached.
          </p>
        </div>
        <div aria-live="polite" className="flex gap-1.5">
          <Badge variant="secondary">{open} waiting</Badge>
          {breached > 0 ? (
            <Badge variant="destructive">{breached} breached</Badge>
          ) : null}
        </div>
      </div>

      <ul className="divide-y">
        {rows.map((row) => {
          const status = row.replied
            ? `Replied in ${formatDuration(row.waited)}`
            : row.breached
              ? `Breached by ${formatDuration(row.waited - row.target)}`
              : `${formatDuration(row.target - row.waited)} left`;
          return (
            <li key={row.id} className="grid gap-3 p-4">
              <div className="flex items-start gap-3">
                <Avatar size="sm" className="mt-0.5">
                  <AvatarFallback>{initials(row.customer)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      row.replied
                        ? "truncate text-sm text-muted-foreground"
                        : "truncate text-sm font-medium"
                    }
                  >
                    {row.subject}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    #{row.id} · {row.customer}, {row.company} · {row.priority}
                  </p>
                </div>
                {row.replied ? (
                  <CheckCircle2
                    role="img"
                    aria-label="Replied"
                    className="size-4 shrink-0 text-success"
                  />
                ) : (
                  <Button
                    size="xs"
                    variant={row.breached ? "default" : "outline"}
                    onClick={() => reply(row.id)}
                  >
                    Reply
                    <span className="sr-only"> to ticket {row.id}</span>
                  </Button>
                )}
              </div>
              <Meter
                value={Math.min(row.waited, row.target)}
                max={row.target}
                getAriaValueText={() =>
                  `${formatDuration(row.waited)} waited of a ${row.targetMinutes} minute target, ${status}`
                }
                className={`grid-cols-[1fr_auto] gap-1.5 ${toneFor(row.ratio, row.replied)}`}
              >
                <MeterLabel className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                  <Clock aria-hidden="true" className="size-3.5" />
                  First response · {row.targetMinutes} min target
                </MeterLabel>
                <MeterValue
                  className={
                    row.breached && !row.replied
                      ? "text-xs font-medium text-destructive tabular-nums"
                      : "text-xs tabular-nums"
                  }
                >
                  {() => status}
                </MeterValue>
              </Meter>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
