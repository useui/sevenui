"use client";

import { Bookmark, Clock, Eye, MessageSquare } from "lucide-react";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { Separator } from "@/registry/base/ui/separator";

const meta = [
  { icon: null, label: "Sep 18, 2026" },
  { icon: Clock, label: "9 min read" },
  { icon: Eye, label: "4.2k views" },
  { icon: MessageSquare, label: "38 comments" },
];

export default function Separator13() {
  const [saved, setSaved] = React.useState(false);

  return (
    <article
      aria-labelledby="separator-13-heading"
      className="w-full max-w-lg rounded-xl border bg-card p-5 text-card-foreground"
    >
      <Badge variant="secondary">Engineering</Badge>
      <h3
        id="separator-13-heading"
        className="mt-3 text-lg leading-snug font-semibold text-balance"
      >
        How we cut cold starts by 60% by moving session checks to the edge
      </h3>

      {/*
        Each item carries its own leading separator. The list is pulled left
        by gap + 1px inside a clipping wrapper, so whichever item starts a
        line hides its separator and wrapped lines never begin with a rule.
      */}
      <div className="mt-3 overflow-hidden">
        <ul className="-ml-[calc(0.75rem+1px)] flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-3">
            <Separator
              orientation="vertical"
              className="h-4 data-[orientation=vertical]:self-center"
            />
            <span className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback>NO</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">Nadia Osei</span>
            </span>
          </li>
          {meta.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <Separator
                orientation="vertical"
                className="h-4 data-[orientation=vertical]:self-center"
              />
              <span className="flex items-center gap-1.5 whitespace-nowrap tabular-nums">
                {item.icon ? (
                  <item.icon aria-hidden="true" className="size-3.5" />
                ) : null}
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-pretty text-muted-foreground">
        Every request used to wait on a round trip to the auth service in{" "}
        <span className="whitespace-nowrap">us-east-1</span>. Verifying signed session tokens in the edge runtime removed
        that hop for 94% of traffic, and taught us where caching still hurts.
      </p>

      <Separator className="my-4" />

      <div className="flex items-center justify-between gap-3">
        <a
          href="#read-article"
          className="rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Read article
        </a>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={saved}
          onClick={() => setSaved((value) => !value)}
        >
          <Bookmark
            aria-hidden="true"
            data-icon="inline-start"
            className={saved ? "fill-current" : undefined}
          />
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </article>
  );
}
