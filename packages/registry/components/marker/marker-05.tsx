"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { ArrowDownIcon, ChevronRightIcon, MessagesSquareIcon } from "lucide-react";

import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

const hiddenReplies = [
  { author: "Theo", text: "Can we keep the old export as a fallback?" },
  { author: "Iris", text: "Yes, behind a flag until the next release." },
  { author: "Theo", text: "Works for me. I'll update the changelog." },
];

const interactive =
  "w-full cursor-pointer rounded-md px-2 py-1.5 no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

export default function Marker05() {
  const [expanded, setExpanded] = React.useState(false);
  const listId = React.useId();
  const latestId = `${listId}-latest`;
  const latestRef = React.useRef<HTMLLIElement>(null);

  function jumpToLatest(event: React.MouseEvent) {
    event.preventDefault();
    // The latest reply lives in the collapsed list, so reveal it first.
    flushSync(() => setExpanded(true));
    latestRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    latestRef.current?.focus({ preventScroll: true });
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <p className="px-2 text-sm">
        <span className="font-medium">Iris</span>{" "}
        <span className="text-muted-foreground">
          Shipping the CSV export redesign on Thursday.
        </span>
      </p>
      <Marker
        render={<button type="button" />}
        aria-expanded={expanded}
        aria-controls={listId}
        className={interactive}
        onClick={() => setExpanded((value) => !value)}
      >
        <MarkerIcon>
          <ChevronRightIcon
            className={
              expanded
                ? "rotate-90 transition-transform"
                : "transition-transform"
            }
          />
        </MarkerIcon>
        <MarkerContent>
          {expanded
            ? "Hide replies"
            : `Show ${hiddenReplies.length} earlier replies`}
        </MarkerContent>
      </Marker>
      <ul id={listId} hidden={!expanded} className="flex flex-col gap-2 pr-2 pl-8">
        {hiddenReplies.map((reply, index) => {
          const latest = index === hiddenReplies.length - 1;
          return (
          <li
            key={reply.text}
            id={latest ? latestId : undefined}
            ref={latest ? latestRef : undefined}
            tabIndex={latest ? -1 : undefined}
            className="-mx-2 rounded-md px-2 text-sm outline-none transition-colors focus:bg-muted"
          >
            <span className="font-medium">{reply.author}</span>{" "}
            <span className="text-muted-foreground">{reply.text}</span>
          </li>
          );
        })}
      </ul>
      <Marker render={<a href={`#${latestId}`} />}
        className={interactive}
        onClick={jumpToLatest}
      >
        <MarkerIcon>
          <MessagesSquareIcon />
        </MarkerIcon>
        <MarkerContent className="flex-1">
          Jump to latest reply from Theo
        </MarkerContent>
        <ArrowDownIcon aria-hidden="true" className="shrink-0" />
      </Marker>
    </div>
  );
}
