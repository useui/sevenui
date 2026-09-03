"use client";

import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/registry/base/lib/utils";
import { buttonVariants } from "@/registry/base/ui/button";

function CalendarChevron({
  className,
  style,
  orientation = "left",
}: {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  disabled?: boolean;
  orientation?: "up" | "down" | "left" | "right";
}) {
  const paths = {
    up: "m18 15-6-6-6 6",
    down: "m6 9 6 6 6-6",
    left: "m15 18-6-6 6-6",
    right: "m9 18 6-6-6-6",
  } as const;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-4", className)}
      style={style}
    >
      <path d={paths[orientation]} />
    </svg>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  buttonVariant = "ghost",
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-background p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-8 p-0 select-none aria-disabled:pointer-events-none aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-8 p-0 select-none aria-disabled:pointer-events-none aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-8 w-full items-center justify-center px-8",
          defaultClassNames.month_caption,
        ),
        caption_label: cn(
          "text-sm font-medium select-none",
          defaultClassNames.caption_label,
        ),
        dropdowns: cn(
          "flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          "relative rounded-md border border-input has-focus:ring-2 has-focus:ring-ring/50",
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative h-8 w-8 rounded-md p-0 text-center text-sm select-none",
          "data-[selected]:bg-primary data-[selected]:text-primary-foreground",
          "data-[today]:bg-accent data-[today]:text-accent-foreground data-[selected]:data-[today]:bg-primary data-[selected]:data-[today]:text-primary-foreground",
          "data-[outside]:text-muted-foreground data-[disabled]:text-muted-foreground data-[disabled]:opacity-50",
          "[&:not([data-selected],[data-disabled])]:hover:bg-accent",
          "focus-within:relative focus-within:z-20",
          defaultClassNames.day,
        ),
        day_button: cn(
          "flex size-8 items-center justify-center rounded-md font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none",
          defaultClassNames.day_button,
        ),
        range_start: cn("rounded-r-none", defaultClassNames.range_start),
        range_middle: cn(
          "rounded-none !bg-accent !text-foreground",
          defaultClassNames.range_middle,
        ),
        range_end: cn("rounded-l-none", defaultClassNames.range_end),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
      }}
      {...props}
    />
  );
}

export { Calendar };
