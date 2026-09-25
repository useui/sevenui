"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Calendar } from "@/registry/base/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const anchor = new Date(2026, 8, 25);

export default function Calendar02() {
  const [month, setMonth] = React.useState(new Date(1994, 2, 1));
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(1994, 2, 14),
  );

  return (
    <Card className="w-full max-w-xs gap-4">
      <CardHeader>
        <CardTitle>Date of birth</CardTitle>
        <CardDescription aria-live="polite">
          {date
            ? date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "Use the month and year menus to jump."}
        </CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            disabled={!date}
            onClick={() => setDate(undefined)}
          >
            Clear
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          buttonVariant="outline"
          startMonth={new Date(1930, 0)}
          endMonth={anchor}
          disabled={{ after: anchor }}
          month={month}
          onMonthChange={setMonth}
          selected={date}
          onSelect={setDate}
          className="p-0 [--cell-size:--spacing(8)]"
        />
      </CardContent>
    </Card>
  );
}
