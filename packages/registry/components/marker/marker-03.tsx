"use client";

import * as React from "react";
import { CircleDotIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/registry/base/ui/marker";

const earlier = [
  { author: "Nadia", text: "Staging deploy is green." },
  { author: "Owen", text: "I'll start the smoke tests." },
];

const unread = [
  { author: "Owen", text: "Checkout flow fails on Safari 17." },
  { author: "Nadia", text: "Reproduced it — the payment iframe is blocked." },
  { author: "Owen", text: "Rolling back the CSP change now." },
];

export default function Marker03() {
  const [hasUnread, setHasUnread] = React.useState(true);

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {earlier.map((message) => (
          <li key={message.text} className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {message.author}
            </span>{" "}
            {message.text}
          </li>
        ))}
      </ul>
      {hasUnread ? (
        <Marker
          variant="border"
          role="status"
          className="border-primary/40 text-primary"
        >
          <MarkerIcon>
            <CircleDotIcon />
          </MarkerIcon>
          <MarkerContent className="flex-1 font-medium">
            {unread.length} new since 2:14 PM
          </MarkerContent>
          <Button
            variant="ghost"
            size="xs"
            className="-my-1 text-primary hover:text-primary"
            onClick={() => setHasUnread(false)}
          >
            Mark as read
          </Button>
        </Marker>
      ) : null}
      <ul className="flex flex-col gap-2">
        {unread.map((message) => (
          <li
            key={message.text}
            className="text-sm text-muted-foreground"
          >
            <span className="font-medium text-foreground">
              {message.author}
            </span>{" "}
            {message.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
