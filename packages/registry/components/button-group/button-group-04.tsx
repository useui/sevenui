"use client";

import {
  CalendarClock,
  Check,
  ChevronDown,
  Send,
  Timer,
  Undo2,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/base/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

const modes = [
  {
    value: "now",
    icon: Send,
    action: "Send now",
    hint: "Delivered to 2,418 subscribers immediately.",
    done: "Sent",
    confirmation: "Campaign sent to 2,418 subscribers.",
  },
  {
    value: "morning",
    icon: CalendarClock,
    action: "Send tomorrow",
    hint: "Scheduled for Friday at 8:00 AM, recipient time zone.",
    done: "Scheduled",
    confirmation: "Scheduled for Friday at 8:00 AM.",
  },
  {
    value: "optimal",
    icon: Timer,
    action: "Send at best time",
    hint: "Each subscriber gets it when they usually open email.",
    done: "Scheduled",
    confirmation: "Scheduled for each subscriber's best time.",
  },
];

export default function ButtonGroup04() {
  const [mode, setMode] = React.useState("now");
  const [sent, setSent] = React.useState(false);
  const current = modes.find((m) => m.value === mode) ?? modes[0];

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-2">
      <ButtonGroup aria-label="Send campaign">
        <Button
          disabled={sent}
          onClick={() => setSent(true)}
          className="disabled:opacity-100"
        >
          {sent ? (
            <Check aria-hidden="true" data-icon="inline-start" />
          ) : (
            <current.icon aria-hidden="true" data-icon="inline-start" />
          )}
          {sent ? current.done : current.action}
        </Button>
        <ButtonGroupSeparator className="bg-primary-foreground/25" />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                size="icon"
                aria-label="Choose when to send"
                disabled={sent}
                className="disabled:opacity-100"
              >
                <ChevronDown aria-hidden="true" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Delivery</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={mode}
                onValueChange={(value) => setMode(value as string)}
              >
                {modes.map((m) => (
                  <DropdownMenuRadioItem
                    key={m.value}
                    value={m.value}
                    closeOnClick
                  >
                    <m.icon aria-hidden="true" />
                    {m.action}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <div className="flex min-h-6 items-center gap-2">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {sent ? current.confirmation : current.hint}
        </p>
        {sent ? (
          <Button variant="ghost" size="xs" onClick={() => setSent(false)}>
            <Undo2 aria-hidden="true" data-icon="inline-start" />
            Undo
          </Button>
        ) : null}
      </div>
    </div>
  );
}
