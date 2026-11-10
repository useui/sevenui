"use client";

import { ChevronDown, List } from "lucide-react";
import { createContext, useContext, type ReactNode } from "react";
import type { Heading } from "../../lib/docs/headings";
import { useActiveHeading } from "./use-active-heading";

type TocContextValue = {
  activeId: string | null;
  headings: Heading[];
};

const TocContext = createContext<TocContextValue | null>(null);

function useToc(): TocContextValue {
  const context = useContext(TocContext);
  if (!context) {
    throw new Error("DocsTocMobile/DocsTocDesktop must be used within a DocsTocProvider");
  }
  return context;
}

export function DocsTocProvider({ children, headings }: { children: ReactNode; headings: Heading[] }) {
  const activeId = useActiveHeading(headings.map((heading) => heading.id));
  return <TocContext.Provider value={{ activeId, headings }}>{children}</TocContext.Provider>;
}

function indent(depth: Heading["depth"]): { paddingInlineStart: string } {
  return { paddingInlineStart: `${(depth - 2) * 0.75}rem` };
}

function ariaCurrent(isActive: boolean): "location" | undefined {
  return isActive ? "location" : undefined;
}

export function DocsTocMobile({ className = "mt-6 max-w-docs" }: { className?: string }) {
  const { activeId, headings } = useToc();
  if (headings.length === 0) return null;

  return (
    <details className={`group rounded-lg border border-border xl:hidden ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-medium text-foreground text-sm [&::-webkit-details-marker]:hidden">
        <span>On this page</span>
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground transition-transform group-open:rotate-180"
          size={16}
        />
      </summary>
      <ul className="m-0 list-none border-border border-t p-2">
        {headings.map((heading) => (
          <li key={heading.id} style={indent(heading.depth)}>
            <a
              aria-current={ariaCurrent(heading.id === activeId)}
              className="block rounded-md px-2 py-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground aria-[current=location]:font-medium aria-[current=location]:text-foreground"
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function DocsTocDesktop() {
  const { activeId, headings } = useToc();
  if (headings.length === 0) return null;

  return (
    <>
      <p className="m-0 flex items-center gap-2 font-medium text-foreground text-sm">
        <List aria-hidden="true" className="text-muted-foreground" size={15} />
        On this page
      </p>
      {/* A rail on the left; the active entry draws a 2px bar over it. */}
      <ul className="m-0 mt-3 list-none border-border border-s p-0">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              aria-current={ariaCurrent(heading.id === activeId)}
              className="relative block py-1.5 pe-1 font-medium text-docs-tertiary transition-colors before:absolute before:-start-px before:inset-y-0 before:w-0.5 before:bg-transparent hover:text-foreground aria-[current=location]:text-foreground aria-[current=location]:before:bg-foreground"
              href={`#${heading.id}`}
              style={{ paddingInlineStart: `${1 + (heading.depth - 2) * 0.75}rem` }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
