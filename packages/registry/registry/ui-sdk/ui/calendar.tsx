"use client";

import * as React from "react";
import {
  Calendar as CalendarPrimitive,
  CalendarDay as CalendarDayPrimitive,
  CalendarGrid as CalendarGridPrimitive,
  CalendarNext as CalendarNextPrimitive,
  CalendarPrevious as CalendarPreviousPrimitive,
  CalendarWeekday as CalendarWeekdayPrimitive,
  type CalendarDayState,
  type CalendarGridState,
  type CalendarValue,
  createCalendarController,
} from "@ui-sdk/react/calendar";
import { cn } from "cn";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import type { Button } from "@/registry/ui-sdk/ui/button";
import { buttonVariants } from "@/registry/ui-sdk/ui/button";

// The base flavour's API is react-day-picker's: Date values, matchers and
// its selection rules. UI SDK works in ISO date strings, so this wrapper
// converts both ways and keeps react-day-picker's selection behaviour (a
// range press extends the range; there is no half-picked anchor).

type DateRange = { from: Date | undefined; to?: Date | undefined };
type DateBefore = { before: Date };
type DateAfter = { after: Date };
type DateInterval = { before: Date; after: Date };
type DayOfWeek = { dayOfWeek: number | number[] };
type Matcher =
  | boolean
  | ((date: Date) => boolean)
  | Date
  | Date[]
  | DateRange
  | DateBefore
  | DateAfter
  | DateInterval
  | DayOfWeek;
type Modifiers = Record<string, boolean>;
type CalendarLocale = { code?: string; options?: { weekStartsOn?: number } };

type SelectHandler<T> = (
  selected: T,
  triggerDate: Date,
  modifiers: Modifiers,
  event: Event | undefined,
) => void;

type SelectionProps =
  | {
      mode?: undefined;
      required?: undefined;
      selected?: undefined;
      onSelect?: undefined;
    }
  | {
      mode: "single";
      required: true;
      selected: Date | undefined;
      onSelect?: SelectHandler<Date>;
    }
  | {
      mode: "single";
      required?: false;
      selected?: Date | undefined;
      onSelect?: SelectHandler<Date | undefined>;
    }
  | {
      mode: "multiple";
      required: true;
      selected: Date[] | undefined;
      onSelect?: SelectHandler<Date[]>;
      min?: number;
      max?: number;
    }
  | {
      mode: "multiple";
      required?: false;
      selected?: Date[] | undefined;
      onSelect?: SelectHandler<Date[] | undefined>;
      min?: number;
      max?: number;
    }
  | {
      mode: "range";
      required: true;
      selected: DateRange | undefined;
      onSelect?: SelectHandler<DateRange>;
      min?: number;
      max?: number;
      excludeDisabled?: boolean;
      resetOnSelect?: boolean;
    }
  | {
      mode: "range";
      required?: false;
      selected?: DateRange | undefined;
      onSelect?: SelectHandler<DateRange | undefined>;
      min?: number;
      max?: number;
      excludeDisabled?: boolean;
      resetOnSelect?: boolean;
    };

type ClassNameKey =
  | "root"
  | "months"
  | "month"
  | "nav"
  | "button_previous"
  | "button_next"
  | "chevron"
  | "month_caption"
  | "caption_label"
  | "dropdowns"
  | "dropdown_root"
  | "dropdown"
  | "months_dropdown"
  | "years_dropdown"
  | "month_grid"
  | "weekdays"
  | "weekday"
  | "weeks"
  | "week"
  | "week_number_header"
  | "week_number"
  | "day"
  | "day_button"
  | "footer"
  | DayFlag;

type DayFlag =
  | "today"
  | "outside"
  | "disabled"
  | "hidden"
  | "focused"
  | "selected"
  | "range_start"
  | "range_middle"
  | "range_end";

const DAY_FLAGS: DayFlag[] = [
  "today",
  "outside",
  "disabled",
  "hidden",
  "focused",
  "selected",
  "range_start",
  "range_middle",
  "range_end",
];

type CalendarDay = { date: Date; displayMonth: Date; outside: boolean };

type CalendarDayButtonProps = React.ComponentProps<"span"> & {
  day: CalendarDay;
  modifiers: Modifiers;
  locale?: CalendarLocale;
};

type CalendarProps = SelectionProps & {
  className?: string;
  classNames?: Partial<Record<ClassNameKey, string>>;
  style?: React.CSSProperties;
  id?: string;
  title?: string;
  lang?: string;
  dir?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  startMonth?: Date;
  endMonth?: Date;
  numberOfMonths?: number;
  pagedNavigation?: boolean;
  showOutsideDays?: boolean;
  fixedWeeks?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  ISOWeek?: boolean;
  showWeekNumber?: boolean;
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  hideNavigation?: boolean;
  disableNavigation?: boolean;
  disabled?: Matcher | Matcher[];
  modifiers?: Record<string, Matcher | Matcher[] | undefined>;
  modifiersClassNames?: Record<string, string>;
  today?: Date;
  locale?: CalendarLocale;
  autoFocus?: boolean;
  footer?: React.ReactNode;
  formatters?: {
    formatCaption?: (month: Date) => string;
    formatDay?: (date: Date) => string;
    formatMonthDropdown?: (month: Date) => string;
    formatYearDropdown?: (year: Date) => string;
    formatWeekdayName?: (weekday: Date) => string;
    formatWeekNumber?: (weekNumber: number) => string;
  };
  labels?: {
    labelDayButton?: (date: Date, modifiers: Modifiers) => string;
    labelPrevious?: (month: Date | undefined) => string;
    labelNext?: (month: Date | undefined) => string;
    labelNav?: () => string;
    labelMonthDropdown?: () => string;
    labelYearDropdown?: () => string;
    labelWeekNumber?: (weekNumber: number) => string;
    labelWeekNumberHeader?: () => string;
  };
  components?: { DayButton?: React.ComponentType<CalendarDayButtonProps> };
  // Accepted and ignored: UI SDK changes months without an animation.
  animate?: boolean;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
};

// Every selection mode's fields, to read a union of them in one place.
type AnyMode = {
  mode?: "single" | "multiple" | "range";
  required?: boolean;
  selected?: Date | Date[] | DateRange;
  onSelect?: SelectHandler<Date | Date[] | DateRange | undefined>;
  min?: number;
  max?: number;
  excludeDisabled?: boolean;
  resetOnSelect?: boolean;
};

const pad = (value: number, length = 2) => String(value).padStart(length, "0");
const toISO = (date: Date) =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toMonth = (date: Date) =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}`;
function fromISO(iso: string) {
  const [year, month, day = 1] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setFullYear(year);
  return date;
}
const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);
const sameDay = (a: Date | undefined, b: Date | undefined) =>
  !!a && !!b && toISO(a) === toISO(b);
function dayDiff(a: Date, b: Date) {
  const utc = (date: Date) =>
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((utc(a) - utc(b)) / 86_400_000);
}

function rangeIncludes(range: DateRange, date: Date, excludeEnds = false) {
  let { from, to } = range;
  if (from && to) {
    if (dayDiff(to, from) < 0) [from, to] = [to, from];
    const edge = excludeEnds ? 1 : 0;
    return dayDiff(date, from) >= edge && dayDiff(to, date) >= edge;
  }
  if (!excludeEnds && to) return sameDay(to, date);
  if (!excludeEnds && from) return sameDay(from, date);
  return false;
}

// react-day-picker's matcher rules (dateMatchModifiers).
function matches(date: Date, matcher: Matcher | Matcher[] | undefined): boolean {
  if (matcher === undefined) return false;
  if (Array.isArray(matcher)) return matcher.some((item) => matches(date, item));
  if (typeof matcher === "boolean") return matcher;
  if (typeof matcher === "function") return matcher(date);
  if (matcher instanceof Date) return sameDay(date, matcher);
  if ("from" in matcher) return rangeIncludes(matcher, date);
  if ("dayOfWeek" in matcher) {
    return Array.isArray(matcher.dayOfWeek)
      ? matcher.dayOfWeek.includes(date.getDay())
      : matcher.dayOfWeek === date.getDay();
  }
  if ("before" in matcher && "after" in matcher) {
    const isBefore = dayDiff(matcher.before, date) > 0;
    const isAfter = dayDiff(matcher.after, date) < 0;
    return dayDiff(matcher.before, matcher.after) > 0
      ? isBefore && isAfter
      : isBefore || isAfter;
  }
  if ("after" in matcher) return dayDiff(date, matcher.after) > 0;
  if ("before" in matcher) return dayDiff(matcher.before, date) > 0;
  return false;
}

// react-day-picker's addToRange.
function addToRange(
  date: Date,
  range: DateRange | undefined,
  min = 0,
  max = 0,
  required = false,
): DateRange | undefined {
  const { from, to } = range ?? {};
  let next: DateRange | undefined;
  if (!from && !to) {
    next = { from: date, to: min > 0 ? undefined : date };
  } else if (from && !to) {
    if (sameDay(from, date)) {
      if (min === 0) next = { from, to: date };
      else if (required) next = { from, to: undefined };
      else next = undefined;
    } else if (dayDiff(date, from) < 0) {
      next = { from: date, to: from };
    } else {
      next = { from, to: date };
    }
  } else if (from && to) {
    if (sameDay(from, date) && sameDay(to, date)) {
      next = required ? { from, to } : undefined;
    } else if (sameDay(from, date)) {
      next = { from, to: min > 0 ? undefined : date };
    } else if (sameDay(to, date)) {
      next = { from: date, to: min > 0 ? undefined : date };
    } else if (dayDiff(date, from) < 0) {
      next = { from: date, to };
    } else {
      next = { from, to: date };
    }
  }
  if (next?.from && next.to) {
    const days = dayDiff(next.to, next.from);
    if ((max > 0 && days > max) || (min > 1 && days < min)) {
      next = { from: date, to: undefined };
    }
  }
  return next;
}

function weekNumberOf(date: Date, weekStartsOn: number, iso: boolean) {
  if (iso) {
    const thursday = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 3 - ((date.getDay() + 6) % 7),
    );
    const firstThursday = new Date(thursday.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        (dayDiff(thursday, firstThursday) - 3 + ((firstThursday.getDay() + 6) % 7)) /
          7,
      )
    );
  }
  // The week holding January 1 is week 1, as date-fns getWeek counts it.
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - ((date.getDay() - weekStartsOn + 7) % 7),
  );
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  const january = new Date(end.getFullYear(), 0, 1);
  const firstStart = new Date(
    january.getFullYear(),
    0,
    1 - ((january.getDay() - weekStartsOn + 7) % 7),
  );
  return Math.floor(dayDiff(start, firstStart) / 7) + 1;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  labels,
  components,
  modifiers: customModifiers,
  modifiersClassNames,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  startMonth,
  endMonth,
  numberOfMonths = 1,
  pagedNavigation,
  fixedWeeks,
  weekStartsOn: weekStartsOnProp,
  ISOWeek,
  showWeekNumber,
  hideNavigation,
  disableNavigation,
  disabled,
  today: todayProp,
  autoFocus,
  footer,
  animate: _animate,
  style,
  id,
  title,
  lang,
  dir,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...selection
}: CalendarProps) {
  const { mode, required, selected, onSelect, min, max, excludeDisabled, resetOnSelect } =
    selection as AnyMode;
  const [controller] = React.useState(createCalendarController);
  const localeCode = locale?.code ?? "en-US";
  const weekStartsOn = ISOWeek
    ? 1
    : (weekStartsOnProp ?? locale?.options?.weekStartsOn ?? 0);
  const today = todayProp ?? new Date();

  const classes: Partial<Record<ClassNameKey, string>> = {
    root: "w-fit",
    months: "relative flex flex-col gap-4 md:flex-row",
    month: "flex w-full flex-col gap-4",
    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
    button_previous: cn(
      buttonVariants({ variant: buttonVariant }),
      "size-(--cell-size) rounded-(--cell-radius) p-0 select-none aria-disabled:opacity-50",
    ),
    button_next: cn(
      buttonVariants({ variant: buttonVariant }),
      "size-(--cell-size) rounded-(--cell-radius) p-0 select-none aria-disabled:opacity-50",
    ),
    month_caption:
      "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
    dropdowns:
      "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
    dropdown_root: "cn-calendar-dropdown-root relative rounded-(--cell-radius)",
    dropdown: "absolute inset-0 bg-popover opacity-0",
    caption_label: cn(
      "font-medium select-none",
      captionLayout === "label"
        ? "cn-calendar-caption text-sm"
        : "cn-calendar-caption-label flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
    ),
    month_grid: "w-full border-collapse",
    weekdays: "flex",
    weekday:
      "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
    week: "mt-2 flex w-full",
    week_number_header: "w-(--cell-size) shrink-0 select-none",
    week_number:
      "flex w-(--cell-size) shrink-0 items-center justify-center p-0 text-[0.8rem] text-muted-foreground select-none",
    // The day cell itself takes focus here (a gridcell, with no inner button),
    // so it rises above its neighbours and draws no outline of its own.
    day: cn(
      "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center outline-none select-none has-focus-visible:z-30 focus-visible:z-30 [&:last-child[data-selected=true]>[data-slot=calendar-day-button]]:rounded-r-(--cell-radius)",
      showWeekNumber
        ? "[&:nth-child(2)[data-selected=true]>[data-slot=calendar-day-button]]:rounded-l-(--cell-radius)"
        : "[&:first-child[data-selected=true]>[data-slot=calendar-day-button]]:rounded-l-(--cell-radius)",
    ),
    range_start:
      "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
    range_middle: "rounded-none",
    range_end:
      "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
    today:
      "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
    outside: "text-muted-foreground aria-selected:text-muted-foreground",
    disabled: "text-muted-foreground opacity-50",
    hidden: "invisible",
    ...classNames,
  };

  const format = {
    caption: (month: Date) =>
      formatters?.formatCaption?.(month) ??
      new Intl.DateTimeFormat(localeCode, { month: "long", year: "numeric" }).format(
        month,
      ),
    day: (date: Date) => formatters?.formatDay?.(date) ?? String(date.getDate()),
    monthDropdown: (month: Date) =>
      formatters?.formatMonthDropdown?.(month) ??
      month.toLocaleString(locale?.code, { month: "short" }),
    yearDropdown: (year: Date) =>
      formatters?.formatYearDropdown?.(year) ?? String(year.getFullYear()),
    // react-day-picker's two-letter weekday ("Su"), from the locale's name.
    weekday: (weekday: Date) =>
      formatters?.formatWeekdayName?.(weekday) ??
      new Intl.DateTimeFormat(localeCode, { weekday: "short" })
        .format(weekday)
        .slice(0, 2),
    weekNumber: (week: number) =>
      formatters?.formatWeekNumber?.(week) ?? (week < 10 ? `0${week}` : `${week}`),
  };

  // react-day-picker's navigation bounds, which a year dropdown widens to a
  // hundred years back without them.
  const hasYearDropdown =
    captionLayout === "dropdown" || captionLayout === "dropdown-years";
  const navStart = startMonth
    ? new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)
    : hasYearDropdown
      ? new Date(today.getFullYear() - 100, 0, 1)
      : undefined;
  const navEnd = endMonth
    ? new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0)
    : hasYearDropdown
      ? new Date(today.getFullYear(), 11, 31)
      : undefined;

  const clampMonth = (month: Date) => {
    let first = new Date(month.getFullYear(), month.getMonth(), 1);
    if (navEnd) {
      const last = addMonths(navEnd, 1 - numberOfMonths);
      if (first > last) first = last;
    }
    if (navStart && first < navStart) first = navStart;
    return first;
  };

  const [internalMonth, setInternalMonth] = React.useState(() =>
    toMonth(clampMonth(monthProp ?? defaultMonth ?? today)),
  );
  const month = monthProp ? toMonth(monthProp) : internalMonth;
  const firstMonth = fromISO(month);

  const goToMonth = (next: Date) => {
    if (disableNavigation) return;
    const clamped = clampMonth(next);
    setInternalMonth(toMonth(clamped));
    onMonthChange?.(clamped);
  };

  // react-day-picker is controlled by `selected` whenever onSelect is set.
  const [internalSelected, setInternalSelected] = React.useState(selected);
  const current = onSelect ? selected : internalSelected;
  const commit = (
    next: Date | Date[] | DateRange | undefined,
    trigger: Date,
    event: Event | undefined,
  ) => {
    if (!onSelect) setInternalSelected(next);
    onSelect?.(next, trigger, modifiersOf(trigger), event);
  };

  const range = mode === "range" ? (current as DateRange | undefined) : undefined;
  const isSelected = (date: Date) => {
    if (!current) return false;
    if (mode === "single") return sameDay(current as Date, date);
    if (mode === "multiple") return (current as Date[]).some((day) => sameDay(day, date));
    if (mode === "range") return rangeIncludes(current as DateRange, date);
    return false;
  };

  function modifiersOf(date: Date, state?: CalendarDayState): Modifiers {
    const result: Modifiers = {
      today: sameDay(date, today),
      outside: state?.outside ?? false,
      disabled: state ? state.disabled : matches(date, disabled),
      hidden: false,
      focused: false,
      selected: isSelected(date),
      range_start: !!(range?.from && range.to && sameDay(date, range.from)),
      range_end: !!(range?.from && range.to && sameDay(date, range.to)),
      range_middle: !!range && rangeIncludes(range, date, true),
    };
    for (const [name, matcher] of Object.entries(customModifiers ?? {})) {
      result[name] = matches(date, matcher);
    }
    return result;
  }

  const pressedAgain = (_date: Date, modifiers: Modifiers) =>
    mode === "single" && !!required && modifiers.selected && !modifiers.disabled;

  let value: CalendarValue = null;
  if (mode === "single" && current) value = toISO(current as Date);
  if (mode === "multiple") value = ((current as Date[] | undefined) ?? []).map(toISO);
  if (mode === "range" && range?.from) {
    value = [toISO(range.from), toISO(range.to ?? range.from)];
  }

  const onValueChange = (next: CalendarValue, details: { event?: Event }) => {
    if (mode === "single") {
      const date = typeof next === "string" ? fromISO(next) : undefined;
      const trigger = date ?? (current as Date | undefined);
      if (trigger) commit(date, trigger, details.event);
    }
    if (mode === "multiple") {
      const before = ((current as Date[] | undefined) ?? []).map(toISO);
      const after = Array.isArray(next) ? next : [];
      const iso =
        after.find((day) => !before.includes(day)) ??
        before.find((day) => !after.includes(day));
      if (!iso) return;
      const trigger = fromISO(iso);
      const days = (current as Date[] | undefined) ?? [];
      // react-day-picker's useMulti rules for min, max and required.
      if (before.includes(iso)) {
        if (days.length === min) return;
        if (required && days.length === 1) return;
        commit(
          days.filter((day) => !sameDay(day, trigger)),
          trigger,
          details.event,
        );
      } else {
        commit(days.length === max ? [trigger] : [...days, trigger], trigger, details.event);
      }
    }
  };

  // A range press reaches UI SDK as the start of a new range. It is taken
  // over here and applied with react-day-picker's rules instead.
  const onAnchorChange = (
    anchor: string | null,
    details: { cancel: () => void; event?: Event },
  ) => {
    if (mode !== "range" || anchor === null) return;
    details.cancel();
    const trigger = fromISO(anchor);
    const hasFullRange = !!range?.from && !!range.to;
    let next: DateRange | undefined;
    if (resetOnSelect && (hasFullRange || !range?.from)) {
      next =
        !required &&
        hasFullRange &&
        sameDay(range?.from, range?.to) &&
        sameDay(trigger, range?.from)
          ? undefined
          : { from: trigger, to: undefined };
    } else {
      next = addToRange(trigger, range, min, max, required);
    }
    if (excludeDisabled && disabled && next?.from && next.to) {
      for (
        let day = new Date(next.from);
        dayDiff(next.to, day) >= 0;
        day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
      ) {
        if (matches(day, disabled)) {
          next = { from: trigger, to: undefined };
          break;
        }
      }
    }
    commit(next, trigger, details.event);
  };

  React.useEffect(() => {
    if (autoFocus) controller.focus();
  }, [autoFocus, controller]);

  const DayButton = components?.DayButton ?? CalendarDayButton;
  const unavailable =
    disabled === undefined || disabled === false
      ? undefined
      : (iso: string) => matches(fromISO(iso), disabled);

  const monthOptions = (displayed: Date) =>
    Array.from({ length: 12 }, (_, index) => {
      const option = new Date(displayed.getFullYear(), index, 1);
      return {
        value: index,
        label: format.monthDropdown(option),
        disabled:
          (!!navStart && option < navStart) ||
          (!!navEnd && option > new Date(navEnd.getFullYear(), navEnd.getMonth(), 1)),
      };
    });
  const yearOptions = () => {
    if (!navStart || !navEnd) return [];
    const years = [];
    for (let year = navStart.getFullYear(); year <= navEnd.getFullYear(); year++) {
      years.push({ value: year, label: format.yearDropdown(new Date(year, 0, 1)) });
    }
    return years;
  };

  const caption = (displayed: Date, offset: number) => {
    if (captionLayout === "label") {
      return (
        <span className={classes.caption_label} role="status" aria-live="polite">
          {format.caption(displayed)}
        </span>
      );
    }
    const showMonths = captionLayout !== "dropdown-years";
    const showYears = captionLayout !== "dropdown-months";
    const dropdown = (
      kind: "months" | "years",
      label: string,
      selectedValue: number,
      options: { value: number; label: string; disabled?: boolean }[],
      onChange: (value: number) => void,
    ) => (
      <span
        className={classes.dropdown_root}
        data-disabled={disableNavigation || undefined}
      >
        <select
          aria-label={label}
          className={cn(
            classes.dropdown,
            kind === "months" ? classes.months_dropdown : classes.years_dropdown,
          )}
          disabled={disableNavigation}
          value={selectedValue}
          onChange={(event) => onChange(Number(event.target.value))}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={classes.caption_label} aria-hidden="true">
          {options.find((option) => option.value === selectedValue)?.label}
          <ChevronDownIcon className={cn("size-4", classes.chevron)} />
        </span>
      </span>
    );
    return (
      <div className={classes.dropdowns}>
        {showMonths
          ? dropdown(
              "months",
              labels?.labelMonthDropdown?.() ?? "Choose the Month",
              displayed.getMonth(),
              monthOptions(displayed),
              (index) =>
                goToMonth(new Date(displayed.getFullYear(), index - offset, 1)),
            )
          : <span>{format.monthDropdown(displayed)}</span>}
        {showYears
          ? dropdown(
              "years",
              labels?.labelYearDropdown?.() ?? "Choose the Year",
              displayed.getFullYear(),
              yearOptions(),
              (year) => goToMonth(new Date(year, displayed.getMonth() - offset, 1)),
            )
          : <span>{format.yearDropdown(displayed)}</span>}
        <span className="sr-only" role="status" aria-live="polite">
          {format.caption(displayed)}
        </span>
      </div>
    );
  };

  const grid = (state: CalendarGridState, displayed: Date) => (
    <>
      <thead>
        <tr className={classes.weekdays}>
          {showWeekNumber && (
            <th
              data-slot="calendar-week-number-header"
              aria-label={labels?.labelWeekNumberHeader?.() ?? "Week Number"}
              className={classes.week_number_header}
              scope="col"
            />
          )}
          {state.weekdays.map((weekday, index) => (
            <CalendarWeekdayPrimitive
              key={weekday}
              index={index}
              className={classes.weekday}
            >
              {format.weekday(new Date(2026, 5, 7 + weekday))}
            </CalendarWeekdayPrimitive>
          ))}
        </tr>
      </thead>
      <tbody className={classes.weeks}>
        {state.weeks.map((week) => {
          const weekNumber = weekNumberOf(fromISO(week[0].date), weekStartsOn, !!ISOWeek);
          return (
            <tr key={week[0].date} className={classes.week}>
              {showWeekNumber && (
                <th
                  data-slot="calendar-week-number"
                  aria-label={labels?.labelWeekNumber?.(weekNumber) ?? `Week ${weekNumber}`}
                  className={classes.week_number}
                  scope="row"
                >
                  <div className="flex size-(--cell-size) items-center justify-center text-center">
                    {format.weekNumber(weekNumber)}
                  </div>
                </th>
              )}
              {week.map((cell) =>
                // react-day-picker also hides outside days past its
                // navigation bounds (startMonth/endMonth).
                cell.hidden ||
                (cell.outside &&
                  ((navStart && fromISO(cell.date) < navStart) ||
                    (navEnd && fromISO(cell.date) > navEnd))) ? (
                  <td
                    key={cell.date}
                    className={cn(classes.day, classes.hidden)}
                    data-day={cell.date}
                    data-hidden="true"
                  />
                ) : (
                  <CalendarDayPrimitive
                    key={cell.date}
                    value={cell.date}
                    render={(partProps, dayState) => {
                      const date = fromISO(dayState.date);
                      const modifiers = modifiersOf(date, dayState);
                      return (
                        <td
                          {...partProps}
                          // UI SDK leaves another month's days out of the tab
                          // order but still lets a press select them.
                          tabIndex={partProps.tabIndex ?? -1}
                          // react-day-picker calls onSelect when a required
                          // single date is pressed again; UI SDK reports
                          // changes only.
                          onClick={(event: React.MouseEvent<HTMLTableCellElement>) => {
                            partProps.onClick?.(event);
                            if (pressedAgain(date, modifiers)) commit(date, date, event.nativeEvent);
                          }}
                          onKeyDown={(event: React.KeyboardEvent<HTMLTableCellElement>) => {
                            partProps.onKeyDown?.(event);
                            if ((event.key === "Enter" || event.key === " ") && pressedAgain(date, modifiers)) {
                              commit(date, date, event.nativeEvent);
                            }
                          }}
                          className={cn(
                            classes.day,
                            ...DAY_FLAGS.filter((flag) => modifiers[flag]).map(
                              (flag) => classes[flag],
                            ),
                            ...Object.keys(modifiersClassNames ?? {})
                              .filter((name) => modifiers[name])
                              .map((name) => modifiersClassNames?.[name]),
                          )}
                          aria-label={
                            labels?.labelDayButton?.(date, modifiers) ??
                            partProps["aria-label"]
                          }
                          data-day={dayState.date}
                          data-selected={modifiers.selected || undefined}
                          data-disabled={modifiers.disabled || undefined}
                          data-outside={modifiers.outside || undefined}
                          data-today={modifiers.today || undefined}
                        >
                          <DayButton
                            day={{ date, displayMonth: displayed, outside: dayState.outside }}
                            modifiers={modifiers}
                            locale={locale}
                            className={classes.day_button}
                          >
                            {format.day(date)}
                          </DayButton>
                        </td>
                      );
                    }}
                  />
                ),
              )}
            </tr>
          );
        })}
      </tbody>
    </>
  );

  return (
    <CalendarPrimitive
      controller={controller}
      mode={mode ?? "single"}
      readOnly={mode === undefined}
      value={value}
      onValueChange={onValueChange}
      onAnchorChange={onAnchorChange}
      deselectable={mode === "single" ? !required : undefined}
      allowUnavailable
      month={month}
      onMonthChange={(next, details) => {
        if (disableNavigation) {
          details.cancel();
          return;
        }
        goToMonth(fromISO(next));
      }}
      min={navStart ? toISO(navStart) : undefined}
      max={navEnd ? toISO(navEnd) : undefined}
      unavailable={unavailable}
      months={numberOfMonths}
      pageBy={pagedNavigation ? "page" : "month"}
      weekStartsOn={weekStartsOn}
      fixedWeeks={fixedWeeks}
      showOutsideDays={showOutsideDays}
      today={todayProp ? toISO(todayProp) : undefined}
      locale={localeCode}
      id={id}
      title={title}
      lang={lang}
      dir={dir}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      style={style}
      className={cn(
        classes.root,
        "group/calendar bg-background p-2 [--cell-radius:max(0px,--theme(--radius-md))] [--cell-size:var(--control-h,2.125rem)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        className,
      )}
    >
      <div className={classes.months}>
        {!hideNavigation && (
          <nav className={classes.nav} aria-label={labels?.labelNav?.() ?? "Navigation bar"}>
            <CalendarPreviousPrimitive
              className={classes.button_previous}
              aria-label={labels?.labelPrevious?.(undefined) ?? "Go to the Previous Month"}
              disabled={disableNavigation || undefined}
            >
              <ChevronLeftIcon className={cn("cn-rtl-flip size-4", classes.chevron)} />
            </CalendarPreviousPrimitive>
            <CalendarNextPrimitive
              className={classes.button_next}
              aria-label={labels?.labelNext?.(undefined) ?? "Go to the Next Month"}
              disabled={disableNavigation || undefined}
            >
              <ChevronRightIcon className={cn("cn-rtl-flip size-4", classes.chevron)} />
            </CalendarNextPrimitive>
          </nav>
        )}
        {Array.from({ length: numberOfMonths }, (_, offset) => {
          const displayed = addMonths(firstMonth, offset);
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: the slot is the identity; keying by month would remount a focused dropdown on every change
            <div key={offset} className={classes.month}>
              <div className={classes.month_caption}>{caption(displayed, offset)}</div>
              <CalendarGridPrimitive offset={offset} className={classes.month_grid}>
                {(state) => grid(state, displayed)}
              </CalendarGridPrimitive>
            </div>
          );
        })}
      </div>
      {footer && (
        <div className={classes.footer} role="status" aria-live="polite">
          {footer}
        </div>
      )}
    </CalendarPrimitive>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: CalendarDayButtonProps) {
  return (
    <span
      data-slot="calendar-day-button"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-disabled={modifiers.disabled || undefined}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 rounded-(--cell-radius) border-0 text-[length:var(--control-text,0.8125rem)] leading-none font-normal tabular-nums shadow-none group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        // The focusable day is the cell around this element.
        "group-focus-visible/day:z-10 group-focus-visible/day:border-ring group-focus-visible/day:ring-[3px] group-focus-visible/day:ring-ring/50 data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
export type { DateRange, Matcher, Modifiers };
