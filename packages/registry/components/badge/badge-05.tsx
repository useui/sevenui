"use client";

import { BadgeCheck } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";

const sizes = [
  {
    name: "Small",
    hint: "Table cells, 16px",
    className:
      "h-4 gap-0.5 px-1.5 text-[10px] has-data-[icon=inline-start]:pl-1 [&>svg]:size-2.5!",
    radius: "rounded-sm",
  },
  {
    name: "Default",
    hint: "Lists and cards, 20px",
    className: "",
    radius: "rounded-md",
  },
  {
    name: "Large",
    hint: "Headers and hero rows, 24px",
    className:
      "h-6 gap-1.5 px-2.5 text-sm has-data-[icon=inline-start]:pl-2 [&>svg]:size-3.5!",
    radius: "rounded-md",
  },
];

export default function Badge05() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      {sizes.map((size) => (
        <section
          key={size.name}
          aria-label={`${size.name} badges`}
          className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:items-center"
        >
          <div>
            <p className="text-sm font-medium">{size.name}</p>
            <p className="text-xs text-muted-foreground">{size.hint}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={size.className}>Beta</Badge>
            <Badge
              variant="secondary"
              className={`${size.className} ${size.radius}`}
            >
              Enterprise
            </Badge>
            <Badge variant="outline" className={size.className}>
              <BadgeCheck aria-hidden="true" data-icon="inline-start" />
              Verified
            </Badge>
            <Badge
              variant="secondary"
              className={`${size.className} ${size.radius} tabular-nums`}
            >
              1,284
            </Badge>
          </div>
        </section>
      ))}
    </div>
  );
}
