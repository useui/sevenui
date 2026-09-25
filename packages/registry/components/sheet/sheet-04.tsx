"use client";

import { SparklesIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { ScrollArea } from "@/registry/base/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";

const releases = [
  {
    version: "4.8.0",
    date: "Sep 22, 2026",
    tag: "Feature",
    notes: [
      "Saved views now sync across every workspace you belong to.",
      "Bulk edit supports due dates, labels and assignees at once.",
      "New keyboard shortcut to duplicate the current issue.",
    ],
  },
  {
    version: "4.7.2",
    date: "Sep 15, 2026",
    tag: "Fix",
    notes: [
      "Fixed timeline bars drifting by one day across daylight saving changes.",
      "CSV exports keep the column order you set in the table.",
    ],
  },
  {
    version: "4.7.0",
    date: "Sep 8, 2026",
    tag: "Feature",
    notes: [
      "Recurring issues can repeat on business days only.",
      "Project updates can mention teams, not just people.",
      "Search results show which field matched your query.",
    ],
  },
  {
    version: "4.6.1",
    date: "Aug 29, 2026",
    tag: "Fix",
    notes: [
      "Notification emails respect your quiet hours again.",
      "Attachments over 25 MB show a clear size error instead of failing.",
    ],
  },
  {
    version: "4.6.0",
    date: "Aug 18, 2026",
    tag: "Feature",
    notes: [
      "Cycles can roll unfinished work into the next cycle automatically.",
      "Roadmap view supports grouping by initiative.",
      "Dark mode contrast improved across charts and badges.",
    ],
  },
];

export default function Sheet04() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" className="gap-2">
            <SparklesIcon aria-hidden="true" />
            What&apos;s new
          </Button>
        }
      />
      <SheetContent className="gap-0">
        <SheetHeader className="border-b pr-12">
          <SheetTitle>What&apos;s new</SheetTitle>
          <SheetDescription>
            Release notes from the last five updates.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <ol className="grid gap-6 p-4">
            {releases.map((release) => (
              <li key={release.version} className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium tabular-nums">
                    v{release.version}
                  </h3>
                  <Badge
                    variant={release.tag === "Fix" ? "outline" : "secondary"}
                  >
                    {release.tag}
                  </Badge>
                  <time className="ml-auto text-muted-foreground text-xs">
                    {release.date}
                  </time>
                </div>
                <ul className="grid list-disc gap-1.5 pl-4 text-muted-foreground marker:text-border">
                  {release.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </ScrollArea>
        <SheetFooter className="flex-row items-center justify-between border-t">
          <Button
            variant="link"
            className="px-0"
            nativeButton={false}
            render={<a href="#changelog">Full changelog</a>}
          />
          <SheetClose render={<Button>Got it</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
