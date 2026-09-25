"use client";

import { useId, useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/registry/base/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" });

// Accepts "Oct 12, 2026", "10/12/2026", or "2026-10-12".
function parseDate(value: string): Date | null {
  const text = value.trim();
  if (!text) return null;
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const us = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const date = iso
    ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    : us
      ? new Date(Number(us[3]), Number(us[1]) - 1, Number(us[2]))
      : new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

const earliest = new Date(2026, 8, 28);

export default function InputGroup07() {
  const id = useId();
  const [text, setText] = useState("Oct 12, 2026");
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 12));
  const [open, setOpen] = useState(false);

  const parsed = parseDate(text);
  const tooEarly = parsed !== null && parsed < earliest;
  const invalid = text.trim() !== "" && (parsed === null || tooEarly);

  function commit() {
    if (parsed && !tooEarly) {
      setDate(parsed);
      setText(formatter.format(parsed));
    }
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor={`${id}-date`}>Contract start date</Label>
      <InputGroup>
        <InputGroupInput
          id={`${id}-date`}
          value={text}
          placeholder="Oct 12, 2026"
          autoComplete="off"
          aria-invalid={invalid}
          aria-describedby={`${id}-date-hint`}
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "ArrowDown" && event.altKey) {
              event.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  size="icon-xs"
                  aria-label={
                    date
                      ? `Choose date, selected ${formatter.format(date)}`
                      : "Choose date"
                  }
                />
              }
            >
              <CalendarIcon aria-hidden="true" />
            </PopoverTrigger>
            <PopoverContent align="end" alignOffset={-8} className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                defaultMonth={date}
                disabled={{ before: earliest }}
                onSelect={(next) => {
                  setDate(next);
                  if (next) setText(formatter.format(next));
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      <p
        id={`${id}-date-hint`}
        aria-live="polite"
        className={
          invalid ? "text-sm text-destructive" : "text-sm text-muted-foreground"
        }
      >
        {tooEarly
          ? `Pick ${formatter.format(earliest)} or later. Earlier dates are already invoiced.`
          : invalid
            ? "Type a date like Oct 12, 2026 or 10/12/2026."
            : parsed
              ? `Starts on a ${weekday.format(parsed)}. Type a date or open the calendar.`
              : "Type a date or open the calendar."}
      </p>
    </div>
  );
}
