"use client";

import * as React from "react";
import { Bookmark, BookmarkCheck, Clock } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

export default function Card04() {
  const [saved, setSaved] = React.useState(false);

  return (
    <Card className="w-full max-w-sm">
      {/* An <img> as the first child drops the top padding and inherits the card's top radius. */}
      <img
        src="/placeholder.svg"
        alt="Wireframes for a three-step onboarding flow pinned to a whiteboard"
        className="aspect-video w-full bg-muted object-cover"
      />
      <CardHeader>
        <CardTitle className="text-balance">
          How we cut onboarding drop-off by a third
        </CardTitle>
        <CardDescription>
          Fewer fields, deferred verification, and a checklist that survives a
          page refresh.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <Badge variant="secondary">Case study</Badge>
        <span className="flex items-center gap-1">
          <Clock aria-hidden="true" className="size-3.5" />
          7 min read
        </span>
        <span aria-hidden="true">·</span>
        <span>By Hannah Lee, Sep 18</span>
      </CardContent>
      <CardFooter className="gap-2">
        <Button className="flex-1">Read the study</Button>
        <Button
          variant={saved ? "secondary" : "outline"}
          aria-pressed={saved}
          onClick={() => setSaved((value) => !value)}
        >
          {saved ? (
            <BookmarkCheck aria-hidden="true" data-icon="inline-start" />
          ) : (
            <Bookmark aria-hidden="true" data-icon="inline-start" />
          )}
          {saved ? "Saved" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
