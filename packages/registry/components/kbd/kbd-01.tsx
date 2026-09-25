"use client";

import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

const sizes = [
  {
    label: "Compact",
    usage: "Dense tables and menu rows",
    className: "h-4 min-w-4 rounded-[3px] px-0.5 text-[0.625rem]",
  },
  {
    label: "Default",
    usage: "Tooltips, buttons and inline copy",
    className: "",
  },
  {
    label: "Large",
    usage: "Onboarding tips and empty states",
    className: "h-7 min-w-7 rounded-md px-1.5 text-sm",
  },
  {
    label: "Display",
    usage: "Shortcut cheat sheets and hero callouts",
    className: "h-10 min-w-10 rounded-lg px-2.5 text-lg",
  },
];

export default function Kbd01() {
  return (
    <dl className="flex w-full max-w-md flex-col divide-y divide-border rounded-xl border bg-card text-card-foreground">
      {sizes.map((size) => (
        <div
          key={size.label}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-sm font-medium">{size.label}</dt>
            <dd className="text-xs text-muted-foreground">{size.usage}</dd>
          </div>
          <dd className="shrink-0">
            <span className="sr-only">Command K</span>
            <KbdGroup aria-hidden="true">
              <Kbd className={size.className}>⌘</Kbd>
              <Kbd className={size.className}>K</Kbd>
            </KbdGroup>
          </dd>
        </div>
      ))}
    </dl>
  );
}
