"use client";

import * as React from "react";
import { CheckIcon, CopyIcon, FileTextIcon, Link2Icon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/registry/base/ui/popover";

const shareUrl = "https://files.northwind.app/s/q3-board-deck-7fk2";

const people = [
  { name: "Priya Raman", initials: "PR", role: "Owner" },
  { name: "Daniel Okafor", initials: "DO", role: "Can edit" },
  { name: "Hannah Lindqvist", initials: "HL", role: "Can view" },
];

export default function Popover08() {
  const [access, setAccess] = React.useState("team");
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <FileTextIcon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">Q3 board deck.pdf</p>
        <p className="truncate text-muted-foreground text-xs">
          4.2 MB · Edited 2 hours ago
        </p>
      </div>
      <Popover>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm">
              <Link2Icon aria-hidden="true" />
              Share
            </Button>
          }
        />
        <PopoverContent align="end" className="w-80 gap-4 p-4">
          <PopoverHeader>
            <PopoverTitle>Share “Q3 board deck”</PopoverTitle>
            <PopoverDescription>
              {access === "restricted"
                ? "Only the people listed below can open this file."
                : access === "team"
                  ? "Anyone at Northwind with the link can view."
                  : "Anyone on the internet with the link can view."}
            </PopoverDescription>
          </PopoverHeader>
          <div className="grid gap-1.5">
            <label
              htmlFor="popover-08-access"
              className="font-medium text-muted-foreground text-xs"
            >
              General access
            </label>
            <NativeSelect
              id="popover-08-access"
              size="sm"
              className="w-full"
              value={access}
              onChange={(event) => setAccess(event.target.value)}
            >
              <NativeSelectOption value="restricted">
                Restricted
              </NativeSelectOption>
              <NativeSelectOption value="team">
                Northwind workspace
              </NativeSelectOption>
              <NativeSelectOption value="public">
                Anyone with the link
              </NativeSelectOption>
            </NativeSelect>
          </div>
          <ul className="grid gap-2.5" aria-label="People with access">
            {people.map((person) => (
              <li key={person.name} className="flex items-center gap-2.5">
                <Avatar size="sm">
                  <AvatarFallback>{person.initials}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {person.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {person.role}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Input
              readOnly
              value={shareUrl}
              aria-label="Share link"
              className="h-8 min-w-0 flex-1 font-mono text-xs"
              onFocus={(event) => event.currentTarget.select()}
            />
            <Button
              size="sm"
              className="h-8"
              onClick={copyLink}
              disabled={access === "restricted"}
            >
              {copied ? (
                <CheckIcon aria-hidden="true" />
              ) : (
                <CopyIcon aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <span className="sr-only" aria-live="polite">
            {copied ? "Link copied to clipboard" : ""}
          </span>
        </PopoverContent>
      </Popover>
    </div>
  );
}
