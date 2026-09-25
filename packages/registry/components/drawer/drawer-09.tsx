"use client";

import * as React from "react";
import {
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  GlobeIcon,
  LockIcon,
  Share2Icon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { Separator } from "@/registry/base/ui/separator";

const shareUrl = "https://files.acme.co/s/q3-board-memo";

const people = [
  { name: "Priya Raman", email: "priya@acme.co", role: "Owner" },
  { name: "Daniel Osei", email: "daniel@acme.co", role: "Can edit" },
  { name: "Lena Fischer", email: "lena@acme.co", role: "Can view" },
];

const accessOptions = [
  {
    value: "restricted",
    label: "Restricted",
    description: "Only people listed below can open it.",
    icon: LockIcon,
  },
  {
    value: "link",
    label: "Anyone at Acme with the link",
    description: "Colleagues can view without asking.",
    icon: GlobeIcon,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Drawer09() {
  const [access, setAccess] = React.useState("restricted");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(shareUrl);
    } catch {
      // Clipboard can be blocked in sandboxed previews; still confirm intent.
    }
    setCopied(true);
  }

  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border bg-card p-3 text-card-foreground">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileTextIcon aria-hidden="true" className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Q3 board memo.pdf</p>
        <p className="truncate text-xs text-muted-foreground">
          2.4 MB · Edited 2h ago
        </p>
      </div>
      <Drawer>
        <DrawerTrigger
          render={
            <Button variant="outline" size="sm">
              <Share2Icon aria-hidden="true" data-icon="inline-start" />
              Share
            </Button>
          }
        />
        <DrawerContent>
          <div className="mx-auto flex min-h-0 w-full max-w-md flex-col">
            <DrawerHeader>
              <DrawerTitle>Share “Q3 board memo.pdf”</DrawerTitle>
              <DrawerDescription>
                Anyone you add gets an email with a link to the file.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-4">
              <InputGroup>
                <InputGroupInput
                  readOnly
                  value={shareUrl}
                  aria-label="Share link"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={copied ? "Link copied" : "Copy link"}
                    onClick={copyLink}
                  >
                    {copied ? (
                      <CheckIcon aria-hidden="true" />
                    ) : (
                      <CopyIcon aria-hidden="true" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <section
                aria-labelledby="drawer-09-access"
                className="grid gap-2"
              >
                <h3 id="drawer-09-access" className="text-sm font-medium">
                  General access
                </h3>
                <RadioGroup
                  aria-labelledby="drawer-09-access"
                  value={access}
                  onValueChange={(value) => setAccess(value as string)}
                  className="gap-2"
                >
                  {accessOptions.map((option) => (
                    <label
                      key={option.value}
                      htmlFor={`drawer-09-${option.value}`}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-data-checked:border-ring has-data-checked:bg-muted/50"
                    >
                      <option.icon
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      />
                      <span className="grid flex-1 gap-0.5">
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </span>
                      <RadioGroupItem
                        id={`drawer-09-${option.value}`}
                        value={option.value}
                        className="mt-0.5"
                      />
                    </label>
                  ))}
                </RadioGroup>
              </section>

              <Separator />

              <section
                aria-labelledby="drawer-09-people"
                className="grid gap-3"
              >
                <h3 id="drawer-09-people" className="text-sm font-medium">
                  People with access
                </h3>
                <ul className="grid gap-3">
                  {people.map((person) => (
                    <li key={person.email} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials(person.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {person.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {person.email}
                        </p>
                      </div>
                      <Badge
                        variant={
                          person.role === "Owner" ? "secondary" : "outline"
                        }
                      >
                        {person.role}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            <DrawerFooter>
              <DrawerClose render={<Button size="lg">Done</Button>} />
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
