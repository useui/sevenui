"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const WORKDAY = 8;
const HEAVY = 6;

type Day = {
  day: string;
  date: string;
  booked: number;
  optional: number;
};

const weeks: Record<string, Day[]> = {
  current: [
    { day: "Mon", date: "Sep 22", booked: 5.5, optional: 1 },
    { day: "Tue", date: "Sep 23", booked: 7, optional: 2 },
    { day: "Wed", date: "Sep 24", booked: 3, optional: 0.5 },
    { day: "Thu", date: "Sep 25", booked: 6.5, optional: 1.5 },
    { day: "Fri", date: "Sep 26", booked: 2, optional: 0 },
  ],
  next: [
    { day: "Mon", date: "Sep 29", booked: 4, optional: 1 },
    { day: "Tue", date: "Sep 30", booked: 8, optional: 2.5 },
    { day: "Wed", date: "Oct 1", booked: 6, optional: 1 },
    { day: "Thu", date: "Oct 2", booked: 2.5, optional: 0 },
    { day: "Fri", date: "Oct 3", booked: 1.5, optional: 0.5 },
  ],
};

function hours(value: number) {
  return `${value % 1 === 0 ? value : value.toFixed(1)}h`;
}

export default function Meter13() {
  const [week, setWeek] = React.useState("current");
  const [declined, setDeclined] = React.useState<string[]>([]);

  const days = weeks[week].map((day) => {
    const key = `${week}-${day.day}`;
    const isDeclined = declined.includes(key);
    return {
      ...day,
      key,
      isDeclined,
      load: isDeclined ? day.booked - day.optional : day.booked,
    };
  });
  const total = days.reduce((sum, day) => sum + day.load, 0);
  const focus = days.reduce((sum, day) => sum + (WORKDAY - day.load), 0);

  return (
    <section
      aria-labelledby="meter-13-title"
      className="w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="meter-13-title" className="font-medium">
            Meeting load
          </h3>
          <p className="text-sm text-muted-foreground tabular-nums">
            {hours(total)} in meetings · {hours(focus)} left for focus
          </p>
        </div>
        <ToggleGroup
          aria-label="Week"
          variant="outline"
          size="sm"
          value={[week]}
          onValueChange={(value) => {
            if (value[0]) setWeek(value[0] as string);
          }}
        >
          <ToggleGroupItem value="current">This week</ToggleGroupItem>
          <ToggleGroupItem value="next">Next week</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ul className="mt-4 grid gap-3">
        {days.map((day) => {
          const heavy = day.load >= HEAVY;
          const canDecline = day.optional > 0 && !day.isDeclined;
          return (
            <li
              key={day.key}
              className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-3"
            >
              <div className="text-sm leading-tight">
                <p className="font-medium">{day.day}</p>
                <p className="text-xs text-muted-foreground">{day.date}</p>
              </div>
              <div className="grid gap-1">
                <Meter
                  value={day.load}
                  max={WORKDAY}
                  getAriaValueText={() =>
                    `${hours(day.load)} of ${WORKDAY} working hours booked`
                  }
                  className={
                    heavy
                      ? "grid-cols-[1fr_auto] gap-1.5 [&>div:last-of-type]:bg-warning/20 [&>div:last-of-type>div]:bg-warning"
                      : "grid-cols-[1fr_auto] gap-1.5"
                  }
                >
                  <MeterLabel className="sr-only">
                    {day.day} {day.date} meetings
                  </MeterLabel>
                  <MeterValue className="col-start-2 text-xs tabular-nums">
                    {() => `${hours(day.load)} / ${WORKDAY}h`}
                  </MeterValue>
                </Meter>
                {heavy && canDecline ? (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {hours(day.optional)}{" "}
                      <span className="max-sm:hidden">of </span>optional
                      <span className="max-sm:hidden"> meetings</span>
                    </p>
                    <Button
                      variant="link"
                      size="xs"
                      className="h-auto px-0"
                      onClick={() =>
                        setDeclined((current) => [...current, day.key])
                      }
                    >
                      Decline optional
                      <span className="sr-only">
                        {" "}
                        on {day.day} {day.date}
                      </span>
                    </Button>
                  </div>
                ) : null}
                {day.isDeclined ? (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Optional meetings declined
                    </p>
                    <Button
                      variant="link"
                      size="xs"
                      className="h-auto px-0"
                      onClick={() =>
                        setDeclined((current) =>
                          current.filter((item) => item !== day.key),
                        )
                      }
                    >
                      Undo
                      <span className="sr-only">
                        {" "}
                        for {day.day} {day.date}
                      </span>
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
