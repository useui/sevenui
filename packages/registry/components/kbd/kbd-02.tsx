"use client";

import { Kbd, KbdGroup } from "@/registry/base/ui/kbd";

const styles = [
  {
    label: "Subtle",
    description: "The default muted fill.",
    className: "",
  },
  {
    label: "Outline",
    description: "A hairline border on a transparent face.",
    className: "border border-border bg-transparent text-foreground",
  },
  {
    label: "Keycap",
    description: "A raised face with a thicker bottom edge.",
    className:
      "h-6 min-w-6 rounded-md border border-b-[3px] border-border bg-background px-1.5 text-foreground shadow-xs",
  },
  {
    label: "Solid",
    description: "High emphasis for the primary action.",
    className: "bg-primary text-primary-foreground",
  },
  {
    label: "Ghost",
    description: "Text only, for the quietest hint.",
    className: "min-w-0 bg-transparent px-0 text-muted-foreground",
  },
];

export default function Kbd02() {
  return (
    <ul className="grid w-full max-w-md grid-cols-1 gap-3 min-[360px]:grid-cols-2">
      {styles.map((style, index) => (
        <li
          key={style.label}
          className={
            index === styles.length - 1
              ? "overflow-hidden rounded-lg border bg-card text-card-foreground min-[360px]:col-span-2"
              : "overflow-hidden rounded-lg border bg-card text-card-foreground"
          }
        >
          <div className="flex h-16 items-center justify-center border-b bg-background">
            <span className="sr-only">Shift Command P</span>
            <KbdGroup aria-hidden="true">
              <Kbd className={style.className}>⇧</Kbd>
              <Kbd className={style.className}>⌘</Kbd>
              <Kbd className={style.className}>P</Kbd>
            </KbdGroup>
          </div>
          <div className="flex flex-col gap-0.5 px-3 py-2.5">
            <span className="text-sm font-medium">{style.label}</span>
            <span className="text-xs text-muted-foreground">
              {style.description}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
