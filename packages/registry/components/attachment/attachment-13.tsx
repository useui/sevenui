"use client";

import * as React from "react";
import {
  ClockIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PresentationIcon,
  VideoIcon,
  VideoOffIcon,
} from "lucide-react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";

const attendees = [
  { initials: "MR", name: "Maya Reyes" },
  { initials: "JT", name: "Jonas Tan" },
  { initials: "AK", name: "Amara Kofi" },
];

const files = [
  {
    name: "q4-planning-agenda.docx",
    meta: "Edited by Maya · 2h ago",
    icon: FileTextIcon,
  },
  {
    name: "roadmap-review.key",
    meta: "24 slides · 8.1 MB",
    icon: PresentationIcon,
  },
  {
    name: "headcount-model.xlsx",
    meta: "View only · 312 KB",
    icon: FileSpreadsheetIcon,
  },
];

const rsvpOptions = ["Yes", "Maybe", "No"] as const;

export default function Attachment13() {
  const [rsvp, setRsvp] = React.useState<(typeof rsvpOptions)[number]>("Yes");
  const [openedFile, setOpenedFile] = React.useState<string | null>(null);
  const [inCall, setInCall] = React.useState(false);

  return (
    <article
      aria-labelledby="attachment-13-title"
      className="w-full max-w-sm overflow-hidden rounded-2xl border bg-card text-card-foreground"
    >
      <header className="flex gap-4 p-4">
        <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted py-1.5">
          <span className="text-xs text-muted-foreground">Oct</span>
          <span className="text-lg leading-tight font-semibold tabular-nums">14</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="attachment-13-title" className="font-medium">
            Q4 planning review
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ClockIcon aria-hidden="true" className="size-3.5 shrink-0" />
            Tue, 10:00 – 11:30 AM
          </p>
          <div className="mt-3 flex items-center gap-2">
            <AvatarGroup className="-space-x-1">
              {attendees.map((person) => (
                <Avatar key={person.initials}>
                  <AvatarFallback aria-label={person.name} className="text-xs">{person.initials}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount className="text-xs">+4</AvatarGroupCount>
            </AvatarGroup>
            <span className="text-xs text-muted-foreground">7 guests</span>
          </div>
        </div>
      </header>
      <div className="border-t px-4 py-3">
        <h4 id="attachment-13-files" className="text-xs font-medium text-muted-foreground">
          Read before the meeting
        </h4>
        <ul aria-labelledby="attachment-13-files" className="mt-2 flex flex-col gap-1.5">
          {files.map((file) => {
            const Icon = file.icon;
            const opened = openedFile === file.name;
            return (
              <li key={file.name}>
                <Attachment size="sm" className="w-full">
                  <AttachmentMedia>
                    <Icon aria-hidden="true" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{file.name}</AttachmentTitle>
                    <AttachmentDescription>
                      {opened ? "Opened in viewer" : file.meta}
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentTrigger
                    aria-label={`Open ${file.name}`}
                    className="rounded-2xl focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setOpenedFile(file.name)}
                  />
                </Attachment>
              </li>
            );
          })}
        </ul>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3">
        <fieldset className="flex items-center gap-1">
          <legend className="sr-only">Going?</legend>
          <span aria-hidden="true" className="mr-1 text-xs text-muted-foreground">
            Going?
          </span>
          {rsvpOptions.map((option) => (
            <Button
              key={option}
              size="xs"
              variant={rsvp === option ? "secondary" : "ghost"}
              aria-pressed={rsvp === option}
              onClick={() => setRsvp(option)}
            >
              {option}
            </Button>
          ))}
        </fieldset>
        <Button
          size="sm"
          variant={inCall ? "outline" : "default"}
          onClick={() => setInCall((current) => !current)}
        >
          {inCall ? (
            <VideoOffIcon aria-hidden="true" />
          ) : (
            <VideoIcon aria-hidden="true" />
          )}
          {inCall ? "Leave call" : "Join call"}
        </Button>
      </footer>
    </article>
  );
}
