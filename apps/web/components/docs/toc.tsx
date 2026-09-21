"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
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

export function DocsTocProvider({
  children,
  headingsByRoute,
}: {
  children: ReactNode;
  headingsByRoute: Record<string, Heading[]>;
}) {
  const pathname = usePathname();
  const headings = headingsByRoute[pathname] ?? [];
  const activeId = useActiveHeading(headings.map((heading) => heading.id));
  return <TocContext.Provider value={{ activeId, headings }}>{children}</TocContext.Provider>;
}

function indent(depth: Heading["depth"]): { paddingInlineStart: string } {
  return { paddingInlineStart: `${(depth - 2) * 0.75}rem` };
}

function ariaCurrent(isActive: boolean): "location" | undefined {
  return isActive ? "location" : undefined;
}

export function DocsTocMobile() {
  const { activeId, headings } = useToc();
  if (headings.length === 0) return null;

  return (
    <details className="group mx-auto mb-6 max-w-content rounded-lg border border-border xl:hidden">
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
      <p className="mb-3 font-semibold text-foreground text-sm">On this page</p>
      <ul className="m-0 list-none p-0">
        {headings.map((heading) => (
          <li key={heading.id} style={indent(heading.depth)}>
            <a
              aria-current={ariaCurrent(heading.id === activeId)}
              className="block py-1.5 text-muted-foreground transition-colors hover:text-foreground aria-[current=location]:font-medium aria-[current=location]:text-foreground"
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
