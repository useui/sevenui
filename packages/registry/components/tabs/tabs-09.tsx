"use client";

import { Check } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const transcript = [
  { speaker: "Priya", time: "02:14", line: "Let's ship the new onboarding to 20% of signups first." },
  { speaker: "Daniel", time: "02:41", line: "Agreed. I'll watch activation for a full week before widening it." },
];

const actionItems = [
  { task: "Set up the 20% rollout flag", owner: "Daniel", done: true },
  { task: "Draft the activation dashboard", owner: "Priya", done: false },
  { task: "Book the rollout review for Oct 2", owner: "Sam", done: false },
];

const folderTab =
  "relative -mb-px h-9 flex-none rounded-t-lg rounded-b-none border border-b-0 border-transparent bg-muted px-3 data-active:z-10 data-active:border-border data-active:bg-card data-active:shadow-none dark:data-active:border-border dark:data-active:bg-card";

export default function Tabs09() {
  return (
    <Tabs defaultValue="summary" className="w-full max-w-md gap-0">
      <TabsList className="gap-1 rounded-none bg-transparent p-0 group-data-[orientation=horizontal]/tabs:h-auto">
        <TabsTrigger value="summary" className={folderTab}>
          Summary
        </TabsTrigger>
        <TabsTrigger value="transcript" className={folderTab}>
          Transcript
        </TabsTrigger>
        <TabsTrigger value="actions" className={folderTab}>
          Action items
        </TabsTrigger>
      </TabsList>
      <div className="rounded-b-xl rounded-tr-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
        <TabsContent value="summary" className="space-y-2">
          <h3 className="font-medium">Onboarding rollout sync</h3>
          <p className="text-muted-foreground">
            The team agreed to a staged rollout: 20% of new signups get the
            redesigned onboarding this week, with a go/no-go review once a full
            week of activation data is in.
          </p>
        </TabsContent>
        <TabsContent value="transcript">
          <ol className="space-y-3">
            {transcript.map((entry) => (
              <li key={entry.time} className="grid grid-cols-[auto_1fr] gap-x-3">
                <span className="pt-0.5 text-xs text-muted-foreground tabular-nums">
                  {entry.time}
                </span>
                <p>
                  <span className="font-medium">{entry.speaker}: </span>
                  <span className="text-muted-foreground">{entry.line}</span>
                </p>
              </li>
            ))}
          </ol>
        </TabsContent>
        <TabsContent value="actions">
          <ul className="space-y-2">
            {actionItems.map((item) => (
              <li key={item.task} className="flex items-start gap-2">
                <span
                  className={
                    item.done
                      ? "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : "mt-0.5 size-4 shrink-0 rounded-full border border-border"
                  }
                >
                  {item.done && <Check className="size-3" aria-hidden="true" />}
                </span>
                <span className="flex-1">
                  <span className={item.done ? "text-muted-foreground line-through" : ""}>
                    {item.task}
                  </span>
                  <span className="sr-only">{item.done ? " (done)" : " (open)"}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.owner}
                </span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </div>
    </Tabs>
  );
}
