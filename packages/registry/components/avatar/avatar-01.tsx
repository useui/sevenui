"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/registry/base/ui/avatar";

const sizes = [
  { label: "sm", px: 24, size: "sm" as const },
  { label: "default", px: 32, size: "default" as const },
  { label: "lg", px: 40, size: "lg" as const },
  {
    label: "xl",
    px: 48,
    size: "lg" as const,
    className: "data-[size=lg]:size-12",
    text: "text-base",
  },
  {
    label: "2xl",
    px: 64,
    size: "lg" as const,
    className: "data-[size=lg]:size-16",
    text: "text-lg",
  },
];

export default function Avatar01() {
  return (
    <ul
      aria-label="Avatar sizes"
      className="flex w-full max-w-md flex-wrap items-end justify-center gap-x-5 gap-y-6 sm:justify-between"
    >
      {sizes.map((item) => (
        <li key={item.label} className="flex flex-col items-center gap-3">
          <Avatar size={item.size} className={item.className}>
            <AvatarImage src="/placeholder.svg" alt="Maya Lindqvist" />
            <AvatarFallback className={item.text}>ML</AvatarFallback>
          </Avatar>
          <Avatar size={item.size} className={item.className}>
            <AvatarFallback className={item.text}>ML</AvatarFallback>
          </Avatar>
          <div className="flex min-w-12 flex-col items-center gap-0.5 self-stretch border-t border-border pt-2">
            <span className="text-xs font-medium">{item.label}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {item.px}px
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
