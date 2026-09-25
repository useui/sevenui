"use client";

import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";

const hidden = [
  {
    author: "Jonas Weber",
    initials: "JW",
    time: "Mon 10:12",
    body: "The export sheet still shows the old CSV presets.",
  },
  {
    author: "Maya Patel",
    initials: "MP",
    time: "Mon 11:40",
    body: "Confirmed. It reads from the cached schema, not the new one.",
  },
  {
    author: "Ava Thompson",
    initials: "AT",
    time: "Tue 09:05",
    body: "Two customers reported the same thing through support.",
  },
];

const first = {
  author: "Leo Martins",
  initials: "LM",
  time: "Mon 09:48",
  body: "Opening this to track the export preset regression from 3.1.",
};

const latest = {
  author: "Maya Patel",
  initials: "MP",
  time: "Today 14:20",
  body: "Fix is merged and the cache now invalidates on deploy. Closing.",
};

type Reply = typeof first;

function Comment({
  reply,
  ref,
}: {
  reply: Reply;
  ref?: React.Ref<HTMLLIElement>;
}) {
  return (
    <li
      ref={ref}
      tabIndex={ref ? -1 : undefined}
      className="flex gap-3 rounded-md py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Avatar size="sm" className="mt-0.5">
        <AvatarFallback>{reply.initials}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm">
          <span className="font-medium">{reply.author}</span>{" "}
          <span className="text-xs text-muted-foreground">{reply.time}</span>
        </p>
        <p className="text-sm text-pretty text-muted-foreground">
          {reply.body}
        </p>
      </div>
    </li>
  );
}

export default function Separator06() {
  const [expanded, setExpanded] = React.useState(false);
  const listId = React.useId();
  const revealedRef = React.useRef<HTMLLIElement>(null);
  const expandRef = React.useRef<HTMLButtonElement>(null);
  const toggledRef = React.useRef(false);

  // Each trigger unmounts when pressed, so hand focus to what replaces it:
  // the first revealed reply on expand, the expand button on collapse.
  React.useEffect(() => {
    if (!toggledRef.current) return;
    if (expanded) revealedRef.current?.focus();
    else expandRef.current?.focus();
  }, [expanded]);

  const toggle = (next: boolean) => {
    toggledRef.current = true;
    setExpanded(next);
  };

  return (
    <div className="w-full max-w-md rounded-xl border bg-card px-4 py-1 text-card-foreground">
      <ul id={listId} aria-label="Issue comments">
        <Comment reply={first} />
        {expanded ? (
          hidden.map((reply, index) => (
            <Comment
              key={reply.time}
              reply={reply}
              ref={index === 0 ? revealedRef : undefined}
            />
          ))
        ) : (
          <li className="flex items-center gap-2 py-1">
            <Separator className="flex-1" />
            <Button
              ref={expandRef}
              variant="outline"
              size="xs"
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => toggle(true)}
              className="rounded-full"
            >
              <ChevronsUpDown aria-hidden="true" />
              Show {hidden.length} earlier replies
            </Button>
            <Separator className="flex-1" />
          </li>
        )}
        <Comment reply={latest} />
      </ul>
      {expanded && (
        <>
          <Separator />
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="xs"
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => toggle(false)}
            >
              Collapse replies
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
