"use client";

import {
  ArrowBigUpIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronUpIcon,
  CommandIcon,
  CornerDownLeftIcon,
  DeleteIcon,
  OptionIcon,
} from "lucide-react";

import { Kbd } from "@/registry/base/ui/kbd";

const keys = [
  { name: "Command", icon: CommandIcon },
  { name: "Shift", icon: ArrowBigUpIcon },
  { name: "Option", icon: OptionIcon },
  { name: "Control", icon: ChevronUpIcon },
  { name: "Return", icon: CornerDownLeftIcon },
  { name: "Delete", icon: DeleteIcon },
  { name: "Arrow up", icon: ArrowUpIcon },
  { name: "Arrow down", icon: ArrowDownIcon },
];

export default function Kbd03() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <section aria-labelledby="icon-only-label" className="flex flex-col gap-3">
        <h3
          id="icon-only-label"
          className="text-xs font-medium text-muted-foreground"
        >
          Icon only
        </h3>
        <div className="flex flex-wrap gap-2">
          {keys.map(({ name, icon: Icon }) => (
            <Kbd key={name} className="size-7">
              <Icon aria-hidden="true" className="size-3.5" />
              <span className="sr-only">{name}</span>
            </Kbd>
          ))}
        </div>
      </section>
      <section aria-labelledby="icon-label-label" className="flex flex-col gap-3">
        <h3
          id="icon-label-label"
          className="text-xs font-medium text-muted-foreground"
        >
          Icon with label
        </h3>
        <div className="flex flex-wrap gap-2">
          {keys.slice(0, 6).map(({ name, icon: Icon }) => (
            <Kbd key={name} className="h-7 gap-1.5 px-2">
              <Icon aria-hidden="true" className="size-3.5" />
              {name}
            </Kbd>
          ))}
        </div>
      </section>
    </div>
  );
}
