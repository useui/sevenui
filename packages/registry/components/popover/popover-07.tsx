"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock3Icon,
  LanguagesIcon,
  Rows3Icon,
  Settings2Icon,
} from "lucide-react";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

type SettingKey = "language" | "timezone" | "density";

const settings: {
  key: SettingKey;
  label: string;
  icon: typeof LanguagesIcon;
  options: { value: string; label: string; hint?: string }[];
}[] = [
  {
    key: "language",
    label: "Language",
    icon: LanguagesIcon,
    options: [
      { value: "en-US", label: "English (US)" },
      { value: "en-GB", label: "English (UK)" },
      { value: "de-DE", label: "Deutsch" },
      { value: "pt-PT", label: "Português" },
    ],
  },
  {
    key: "timezone",
    label: "Time zone",
    icon: Clock3Icon,
    options: [
      { value: "Europe/Lisbon", label: "Lisbon", hint: "UTC+1" },
      { value: "Europe/Berlin", label: "Berlin", hint: "UTC+2" },
      { value: "America/New_York", label: "New York", hint: "UTC−4" },
      { value: "Asia/Tokyo", label: "Tokyo", hint: "UTC+9" },
    ],
  },
  {
    key: "density",
    label: "Density",
    icon: Rows3Icon,
    options: [
      { value: "compact", label: "Compact", hint: "More rows on screen" },
      { value: "comfortable", label: "Comfortable", hint: "Default spacing" },
      { value: "spacious", label: "Spacious", hint: "Larger touch targets" },
    ],
  },
];

const viewMotion =
  "animate-in fade-in-0 duration-200 ease-out motion-reduce:animate-none";

export default function Popover07() {
  const [view, setView] = React.useState<SettingKey | null>(null);
  const [direction, setDirection] = React.useState<"forward" | "back">("forward");
  const [values, setValues] = React.useState<Record<SettingKey, string>>({
    language: "en-US",
    timezone: "Europe/Lisbon",
    density: "comfortable",
  });

  const panelRef = React.useRef<HTMLDivElement>(null);
  const returnFocusTo = React.useRef<SettingKey | null>(null);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    // Moving between views unmounts the focused control, so place focus on
    // the checked radio (forward) or the row that opened the subview (back).
    const target = view
      ? panel.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')
      : panel.querySelector<HTMLElement>(
          `[data-setting="${returnFocusTo.current}"]`,
        );
    if (!view) {
      target?.focus();
      return;
    }
    // Wait a frame so the radio group has registered its items; focusing
    // earlier leaves arrow-key navigation starting from the wrong radio.
    const frame = requestAnimationFrame(() => target?.focus());
    return () => cancelAnimationFrame(frame);
  }, [view]);

  const active = settings.find((setting) => setting.key === view);

  function labelFor(key: SettingKey) {
    const setting = settings.find((item) => item.key === key);
    return setting?.options.find((option) => option.value === values[key])?.label;
  }

  function goTo(next: SettingKey | null) {
    if (next) returnFocusTo.current = next;
    setDirection(next ? "forward" : "back");
    setView(next);
  }

  return (
    <Popover
      onOpenChange={(open) => {
        // Always reopen on the overview.
        if (!open) {
          returnFocusTo.current = null;
          setView(null);
        }
      }}
    >
      <PopoverTrigger render={<Button variant="outline" />}>
        <Settings2Icon aria-hidden="true" />
        Display preferences
      </PopoverTrigger>
      <PopoverContent
        ref={panelRef}
        className="w-72 max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0"
      >
        {active ? (
          <div
            key={active.key}
            className={cn(viewMotion, "slide-in-from-right-4 flex flex-col")}
          >
            <div className="flex items-center gap-1 border-b border-border p-1.5">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Back to display preferences"
                onClick={() => goTo(null)}
              >
                <ChevronLeftIcon aria-hidden="true" />
              </Button>
              <PopoverTitle id="popover-07-subtitle">{active.label}</PopoverTitle>
            </div>
            <RadioGroup
              aria-labelledby="popover-07-subtitle"
              value={values[active.key]}
              onValueChange={(value) =>
                setValues((current) => ({
                  ...current,
                  [active.key]: value as string,
                }))
              }
              className="gap-0 p-1.5"
            >
              {active.options.map((option) => (
                <Label
                  key={option.value}
                  className="cursor-pointer justify-between rounded-md px-2.5 py-2 font-normal hover:bg-muted"
                >
                  <span className="flex items-center gap-2.5">
                    <RadioGroupItem value={option.value} />
                    {option.label}
                  </span>
                  {option.hint ? (
                    <span className="text-xs text-muted-foreground">{option.hint}</span>
                  ) : null}
                </Label>
              ))}
            </RadioGroup>
          </div>
        ) : (
          <div
            key="overview"
            className={cn(
              viewMotion,
              direction === "back" && "slide-in-from-left-4",
              "flex flex-col",
            )}
          >
            <div className="border-b border-border px-4 py-3">
              <PopoverTitle>Display preferences</PopoverTitle>
            </div>
            <ul className="flex flex-col p-1.5">
              {settings.map((setting) => (
                <li key={setting.key}>
                  <button
                    type="button"
                    data-setting={setting.key}
                    onClick={() => goTo(setting.key)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <setting.icon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="flex-1">{setting.label}</span>
                    <span className="max-w-28 truncate text-muted-foreground">
                      {labelFor(setting.key)}
                    </span>
                    <ChevronRightIcon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
