"use client";

import { CalendarClock, Undo2 } from "lucide-react";
import * as React from "react";
import { Bar, BarChart, Cell, ReferenceLine, XAxis, YAxis } from "recharts";

import { Button } from "@/registry/base/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/registry/base/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Meeting = {
  id: string;
  day: string;
  time: string;
  title: string;
  hours: number;
  movable?: boolean;
};

const WORKDAY_HOURS = 8;
const FOCUS_GOAL = 3;

const days = [
  { key: "mon", label: "Mon", date: "Monday, Sep 22" },
  { key: "tue", label: "Tue", date: "Tuesday, Sep 23" },
  { key: "wed", label: "Wed", date: "Wednesday, Sep 24" },
  { key: "thu", label: "Thu", date: "Thursday, Sep 25" },
  { key: "fri", label: "Fri", date: "Friday, Sep 26" },
];

const initialMeetings: Meeting[] = [
  { id: "m1", day: "mon", time: "09:30", title: "Weekly planning", hours: 1 },
  {
    id: "m2",
    day: "mon",
    time: "13:00",
    title: "Design review: checkout",
    hours: 1.5,
  },
  { id: "m3", day: "mon", time: "16:00", title: "1:1 with Dana", hours: 0.5 },
  {
    id: "t1",
    day: "tue",
    time: "09:00",
    title: "Customer call: Northwind",
    hours: 1,
  },
  { id: "t2", day: "tue", time: "11:00", title: "Roadmap sync", hours: 1.5 },
  { id: "t3", day: "tue", time: "14:00", title: "Hiring panel", hours: 2 },
  {
    id: "t4",
    day: "tue",
    time: "16:30",
    title: "Incident retro",
    hours: 1.5,
    movable: true,
  },
  { id: "w1", day: "wed", time: "10:00", title: "Standup + demo", hours: 1 },
  {
    id: "h1",
    day: "thu",
    time: "09:30",
    title: "Quarterly business review",
    hours: 2.5,
  },
  {
    id: "h2",
    day: "thu",
    time: "13:30",
    title: "Pricing workshop",
    hours: 2,
    movable: true,
  },
  { id: "h3", day: "thu", time: "16:00", title: "Candidate debrief", hours: 1 },
  { id: "f1", day: "fri", time: "11:00", title: "Team lunch", hours: 1 },
  {
    id: "f2",
    day: "fri",
    time: "15:00",
    title: "Release go/no-go",
    hours: 0.5,
  },
];

const chartConfig = {
  meetings: { label: "Meetings", color: "var(--chart-1)" },
  focus: { label: "Open for focus", color: "var(--chart-3)" },
} satisfies ChartConfig;

function formatHours(value: number) {
  return `${value}h`;
}

export default function Chart15() {
  const [meetings, setMeetings] = React.useState(initialMeetings);
  const [selected, setSelected] = React.useState("tue");
  const [moved, setMoved] = React.useState<{ id: string; from: string } | null>(
    null,
  );

  const data = days.map((day) => {
    const booked = meetings
      .filter((meeting) => meeting.day === day.key)
      .reduce((sum, meeting) => sum + meeting.hours, 0);
    return { ...day, meetings: booked, focus: WORKDAY_HOURS - booked };
  });

  const day = data.find((item) => item.key === selected) ?? data[0];
  const agenda = meetings
    .filter((meeting) => meeting.day === day.key)
    .sort((a, b) => a.time.localeCompare(b.time));
  const lightest = data.reduce((min, item) =>
    item.meetings < min.meetings ? item : min,
  );
  const candidate = agenda.find((meeting) => meeting.movable);
  const belowGoal = day.focus < FOCUS_GOAL;
  const daysBelowGoal = data.filter((item) => item.focus < FOCUS_GOAL).length;

  function reschedule(meeting: Meeting) {
    setMeetings((current) =>
      current.map((item) =>
        item.id === meeting.id
          ? { ...item, day: lightest.key, time: "14:00" }
          : item,
      ),
    );
    setMoved({ id: meeting.id, from: meeting.day });
  }

  function undo() {
    if (!moved) return;
    const original = initialMeetings.find((item) => item.id === moved.id);
    setMeetings((current) =>
      current.map((item) =>
        item.id === moved.id && original ? { ...original } : item,
      ),
    );
    setMoved(null);
  }

  const movedMeeting = moved
    ? meetings.find((meeting) => meeting.id === moved.id)
    : undefined;

  return (
    <section
      aria-labelledby="chart-15-title"
      className="flex w-full max-w-xs flex-col gap-4 rounded-2xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="chart-15-title" className="font-semibold">
          This week
        </h3>
        <p className="text-xs text-muted-foreground">
          {daysBelowGoal === 0
            ? "Focus goal met every day"
            : `${daysBelowGoal} ${daysBelowGoal === 1 ? "day" : "days"} under ${FOCUS_GOAL}h focus`}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-36 w-full"
          role="img"
          aria-label={`Booked meeting hours per day. ${data
            .map(
              (item) =>
                `${item.label}: ${formatHours(item.meetings)} of meetings`,
            )
            .join("; ")}`}
        >
          <BarChart
            data={data}
            margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
          >
            <XAxis dataKey="label" hide />
            <YAxis hide domain={[0, WORKDAY_HOURS]} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date}
                  formatter={(value, name, item) => (
                    <div className="flex w-full items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-2.5 rounded-[2px]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label}
                      </span>
                      <span className="ml-auto font-mono font-medium tabular-nums">
                        {formatHours(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="meetings" stackId="day" fill="var(--color-meetings)">
              {data.map((item) => (
                <Cell
                  key={item.key}
                  fillOpacity={item.key === selected ? 1 : 0.4}
                />
              ))}
            </Bar>
            <Bar
              dataKey="focus"
              stackId="day"
              fill="var(--color-focus)"
              radius={[4, 4, 0, 0]}
            >
              {data.map((item) => (
                <Cell
                  key={item.key}
                  fillOpacity={item.key === selected ? 1 : 0.4}
                />
              ))}
            </Bar>
            <ReferenceLine
              y={WORKDAY_HOURS - FOCUS_GOAL}
              stroke="var(--foreground)"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
            />
          </BarChart>
        </ChartContainer>

        <ToggleGroup
          aria-label="Day"
          spacing={0}
          size="sm"
          className="grid w-full grid-cols-5"
          value={[selected]}
          onValueChange={(value) => {
            const next = value[0] as string | undefined;
            if (next) setSelected(next);
          }}
        >
          {data.map((item) => (
            <ToggleGroupItem
              key={item.key}
              value={item.key}
              aria-label={item.date}
              className="w-full"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-[2px] bg-chart-1"
            />
            Meetings
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-[2px] bg-chart-3"
            />
            Open
          </span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="w-3 border-t border-dashed border-foreground/60"
            />
            {FOCUS_GOAL}h focus line
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-medium text-sm">{day.date}</h4>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatHours(day.focus)} open
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {agenda.map((meeting) => (
            <li key={meeting.id} className="flex items-center gap-3 text-sm">
              <span className="w-11 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                {meeting.time}
              </span>
              <span className="min-w-0 flex-1 truncate">{meeting.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatHours(meeting.hours)}
              </span>
            </li>
          ))}
        </ul>
        <div aria-live="polite" className="flex flex-col gap-2">
          {movedMeeting && moved ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                {movedMeeting.title} moved to{" "}
                {days.find((item) => item.key === movedMeeting.day)?.label}.
              </span>
              <Button size="xs" variant="ghost" onClick={undo}>
                <Undo2 aria-hidden="true" data-icon="inline-start" />
                Undo
              </Button>
            </div>
          ) : null}
          {belowGoal && candidate && lightest.key !== day.key && !moved ? (
            <Button
              size="sm"
              variant="secondary"
              className="h-auto min-h-8 w-full py-1.5 whitespace-normal"
              onClick={() => reschedule(candidate)}
            >
              <CalendarClock aria-hidden="true" data-icon="inline-start" />
              Move {candidate.title} to {lightest.label}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
