"use client";

import { useId } from "react";
import { SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { Kbd } from "@/registry/base/ui/kbd";
import { Label } from "@/registry/base/ui/label";

// One field, three densities: a table toolbar, a form, and a hero search.
const sizes = [
  {
    key: "compact",
    label: "Filter invoices",
    size: "28px",
    placeholder: "Invoice number or customer",
    group: "h-7 rounded-md",
    input: "h-full text-xs md:text-xs",
    icon: "size-3.5",
    shortcut: null,
  },
  {
    key: "default",
    label: "Search documentation",
    size: "32px",
    placeholder: "Guides, primitives, API",
    group: "",
    input: "h-full",
    icon: "size-4",
    shortcut: "/",
  },
  {
    key: "comfortable",
    label: "Search everything",
    size: "44px",
    placeholder: "Projects, people, and files",
    group: "h-11 rounded-xl",
    input: "h-full text-base md:text-base",
    icon: "size-5",
    shortcut: "⌘K",
  },
] as const;

export default function InputGroup02() {
  const id = useId();

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {sizes.map((size) => {
        const inputId = `${id}-${size.key}`;
        return (
          <div key={size.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor={inputId}>{size.label}</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {size.size}
              </span>
            </div>
            <InputGroup className={size.group}>
              <InputGroupAddon className={size.key === "comfortable" ? "pl-3" : undefined}>
                <SearchIcon aria-hidden="true" className={size.icon} />
              </InputGroupAddon>
              <InputGroupInput
                id={inputId}
                type="search"
                placeholder={size.placeholder}
                className={size.input}
              />
              {size.shortcut ? (
                <InputGroupAddon
                  align="inline-end"
                  className={size.key === "comfortable" ? "pr-3" : undefined}
                >
                  <Kbd>{size.shortcut}</Kbd>
                </InputGroupAddon>
              ) : null}
            </InputGroup>
          </div>
        );
      })}
    </div>
  );
}
