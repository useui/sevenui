"use client";

import * as React from "react";
import { GitMerge } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/base/ui/dialog";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

type Choice = "mine" | "theirs";

// Each version is split into unchanged text and the words that differ.
const versions: {
  value: Choice;
  author: string;
  initials: string;
  meta: string;
  before: string;
  change: string;
  after: string;
}[] = [
  {
    value: "mine",
    author: "Your version",
    initials: "MC",
    meta: "Unsaved, edited just now",
    before: "Start free for 14 days. ",
    change: "No credit card needed",
    after: ", cancel from settings in one click.",
  },
  {
    value: "theirs",
    author: "Jonas Weber",
    initials: "JW",
    meta: "Saved 2 minutes ago",
    before: "Start free for 14 days. ",
    change: "Card required, billed after the trial",
    after: ", cancel from settings in one click.",
  },
];

export default function Dialog01() {
  const [open, setOpen] = React.useState(false);
  const [choice, setChoice] = React.useState<Choice>("mine");
  const [published, setPublished] = React.useState(versions[1]);
  const [resolved, setResolved] = React.useState(false);

  const resolve = () => {
    const picked = versions.find((version) => version.value === choice);
    if (picked) setPublished(picked);
    setResolved(true);
    setOpen(false);
  };

  return (
    <div className="w-full max-w-sm rounded-xl border bg-card text-card-foreground">
      <div className="grid gap-1.5 p-4">
        <h3 className="text-sm font-medium">Pricing page, hero subtitle</h3>
        <p className="text-sm text-muted-foreground">
          {published.before}
          {published.change}
          {published.after}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {resolved
            ? `Saved ${published.value === "mine" ? "your version" : "Jonas's version"}.`
            : "You have unsaved edits."}
        </p>
        <Button
          size="sm"
          disabled={resolved}
          onClick={() => {
            setChoice("mine");
            setOpen(true);
          }}
        >
          Save
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge aria-hidden="true" className="size-4" />
              Someone else changed this text
            </DialogTitle>
            <DialogDescription>
              Jonas saved a new version while you were editing. Pick the one
              to keep. The other stays in version history.
            </DialogDescription>
          </DialogHeader>

          <RadioGroup
            aria-label="Version to keep"
            value={choice}
            onValueChange={(value) => setChoice(value as Choice)}
            className="grid gap-2 sm:grid-cols-2"
          >
            {versions.map((version) => (
              <Label
                key={version.value}
                className="cursor-pointer flex-col items-stretch gap-3 rounded-lg border p-3 leading-normal font-normal transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:border-primary has-data-checked:bg-primary/5"
              >
                <span className="flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarFallback>{version.initials}</AvatarFallback>
                  </Avatar>
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">
                      {version.author}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {version.meta}
                    </span>
                  </span>
                  <RadioGroupItem value={version.value} />
                </span>
                <span className="text-sm text-muted-foreground">
                  {version.before}
                  <mark className="rounded-sm bg-warning/20 px-0.5 text-foreground">
                    {version.change}
                  </mark>
                  {version.after}
                </span>
              </Label>
            ))}
          </RadioGroup>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline">Keep editing</Button>}
            />
            <Button onClick={resolve}>
              {choice === "mine" ? "Overwrite with mine" : "Use Jonas's version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
