"use client";

import {
  ArchiveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MailOpenIcon,
  Trash2Icon,
  UndoIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const messages = [
  {
    from: "Priya Raman",
    subject: "Q3 vendor contract — final redlines",
    preview:
      "Legal signed off on sections 4 and 7. The only open item is the renewal window.",
  },
  {
    from: "Stripe",
    subject: "Your payout of $4,812.40 is on its way",
    preview: "Funds should arrive in your account ending 6021 by Thursday.",
  },
  {
    from: "Marcus Lee",
    subject: "Offsite agenda draft",
    preview: "I pushed the design review to day two so we have time to prep.",
  },
];

const snoozeOptions = ["Later today", "Tomorrow morning", "Next Monday"];

export default function ButtonGroup09() {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const message = messages[index];

  return (
    <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 p-2"
      >
        <div className="flex items-center gap-2">
          <ButtonGroup aria-label="Organize">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Archive"
              onClick={() => setStatus("Archived")}
            >
              <ArchiveIcon aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Mark as unread"
              onClick={() => setStatus("Marked as unread")}
            >
              <MailOpenIcon aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Delete"
              onClick={() => setStatus("Moved to trash")}
            >
              <Trash2Icon aria-hidden="true" />
            </Button>
          </ButtonGroup>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  <ClockIcon data-icon="inline-start" aria-hidden="true" />
                  Snooze
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Snooze until</DropdownMenuLabel>
                {snoozeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setStatus(`Snoozed until ${option.toLowerCase()}`)}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ButtonGroup aria-label="Navigate messages">
          <ButtonGroupText className="bg-background px-2 text-xs text-muted-foreground tabular-nums">
            {index + 1} of {messages.length}
          </ButtonGroupText>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Newer message"
            disabled={index === 0}
            onClick={() => {
              setIndex((i) => i - 1);
              setStatus(null);
            }}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Older message"
            disabled={index === messages.length - 1}
            onClick={() => {
              setIndex((i) => i + 1);
              setStatus(null);
            }}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <span className="text-xs text-muted-foreground">{message.from}</span>
        <span className="text-sm font-medium">{message.subject}</span>
        <p className="text-sm text-muted-foreground">{message.preview}</p>
      </div>
      <div
        aria-live="polite"
        className="flex min-h-10 items-center justify-between gap-2 border-t px-4 py-1.5 text-xs text-muted-foreground"
      >
        {status ? (
          <>
            <span>{status}</span>
            <Button variant="ghost" size="xs" onClick={() => setStatus(null)}>
              <UndoIcon data-icon="inline-start" aria-hidden="true" />
              Undo
            </Button>
          </>
        ) : (
          <span>Received today at 9:42 AM</span>
        )}
      </div>
    </div>
  );
}
