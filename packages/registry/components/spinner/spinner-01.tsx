"use client";

import { Spinner } from "@/registry/base/ui/spinner";

const sizes = [
  { name: "xs", className: "size-3", usage: "Badges, table cells" },
  { name: "sm", className: "size-3.5", usage: "Small buttons" },
  { name: "md", className: "size-4", usage: "Buttons, inputs" },
  { name: "lg", className: "size-6", usage: "Cards, panels" },
  { name: "xl", className: "size-8", usage: "Full-page loads" },
];

export default function Spinner01() {
  return (
    <ul className="grid w-full max-w-md grid-cols-5 gap-2">
      {sizes.map((size) => (
        <li
          key={size.name}
          className="flex flex-col items-center gap-3 text-center"
        >
          <div className="flex size-12 items-center justify-center">
            <Spinner
              aria-label={`Loading, ${size.name} size`}
              className={size.className}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-medium">{size.name}</span>
            <span className="text-[0.7rem] leading-tight text-balance text-muted-foreground">
              {size.usage}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
