"use client";

import * as React from "react";
import { GitBranch, MessageSquareText, Sparkles, Timer } from "lucide-react";

import { AspectRatio } from "@/registry/base/ui/aspect-ratio";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";

const highlights = [
  {
    icon: GitBranch,
    text: "Every pull request gets its own live URL.",
  },
  {
    icon: MessageSquareText,
    text: "Reviewers leave comments pinned to the page.",
  },
  {
    icon: Timer,
    text: "Previews spin up in under 20 seconds.",
  },
];

export default function Dialog07() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="outline">
              <Sparkles aria-hidden="true" data-icon="inline-start" />
              What's new
            </Button>
          }
        />
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-md [&>[data-slot=dialog-close]]:bg-background/80 [&>[data-slot=dialog-close]]:backdrop-blur-sm">
          <AspectRatio ratio={16 / 9} className="border-b bg-muted">
            <img
              src="/placeholder.svg"
              alt="A pull request with a preview link next to the running app"
              className="size-full object-cover"
            />
          </AspectRatio>
          <div className="grid gap-4 p-5">
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-lg">Branch previews</DialogTitle>
                <Badge variant="secondary">New in v4.2</Badge>
              </div>
              <DialogDescription>
                Share work in progress without merging. Each branch deploys to a
                private preview your team can review.
              </DialogDescription>
            </DialogHeader>
            <ul className="grid gap-2.5 text-sm">
              {highlights.map((item) => (
                <li key={item.text} className="flex items-start gap-2.5">
                  <item.icon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter className="m-0">
            <DialogClose render={<Button variant="ghost">Maybe later</Button>} />
            <DialogClose
              render={
                <Button onClick={() => setEnabled(true)}>
                  Try branch previews
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {enabled
          ? "Branch previews are on for every new pull request."
          : "Branch previews are off."}
      </p>
    </div>
  );
}
