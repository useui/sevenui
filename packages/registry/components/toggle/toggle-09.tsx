"use client";

import { ALargeSmallIcon, BaselineIcon, TypeIcon } from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import { Toggle } from "@/registry/base/ui/toggle";

type Preference = "large" | "spacing" | "serif";

const preferences: {
  key: Preference;
  label: string;
  icon: typeof TypeIcon;
}[] = [
  { key: "large", label: "Larger text", icon: ALargeSmallIcon },
  { key: "spacing", label: "Relaxed spacing", icon: BaselineIcon },
  { key: "serif", label: "Serif", icon: TypeIcon },
];

export default function Toggle09() {
  const [prefs, setPrefs] = React.useState<Record<Preference, boolean>>({
    large: false,
    spacing: true,
    serif: false,
  });
  const headingId = React.useId();

  function set(key: Preference, pressed: boolean) {
    setPrefs((current) => ({ ...current, [key]: pressed }));
  }

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col gap-2 border-b p-3">
        <span
          id={headingId}
          className="text-xs font-medium text-muted-foreground"
        >
          Reading preferences
        </span>
        <fieldset
          aria-labelledby={headingId}
          className="flex min-w-0 flex-wrap gap-1.5"
        >
          {preferences.map((preference) => {
            const Icon = preference.icon;
            return (
              <Toggle
                key={preference.key}
                variant="outline"
                size="sm"
                pressed={prefs[preference.key]}
                onPressedChange={(pressed) => set(preference.key, pressed)}
                className="aria-pressed:border-foreground/20"
              >
                <Icon aria-hidden="true" data-icon="inline-start" />
                {preference.label}
              </Toggle>
            );
          })}
        </fieldset>
      </div>
      <article
        className={cn(
          "flex flex-col gap-2 p-4 transition-[font-size,line-height,letter-spacing] duration-200 ease-out motion-reduce:transition-none",
          prefs.serif && "font-serif",
        )}
      >
        <h3
          className={cn(
            "font-semibold text-balance",
            prefs.large ? "text-xl" : "text-base",
          )}
        >
          Why small teams ship faster
        </h3>
        <p
          className={cn(
            "text-muted-foreground",
            prefs.large ? "text-base" : "text-sm",
            prefs.spacing ? "leading-7 tracking-wide" : "leading-normal",
          )}
        >
          Every new person on a project adds another line of communication.
          Past six or seven people, coordination starts to cost more than the
          extra hands save, so the best teams keep the core group small and
          lean on clear written decisions.
        </p>
        <p className="text-xs text-muted-foreground">
          6 min read · Field notes
        </p>
      </article>
    </div>
  );
}
