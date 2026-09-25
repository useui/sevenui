"use client";

import * as React from "react";
import { ArrowLeftIcon, CheckIcon, UserPlusIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/base/ui/sheet";
import { Textarea } from "@/registry/base/ui/textarea";

const steps = ["Invite", "Role", "Review"];

const roles = [
  {
    value: "admin",
    label: "Admin",
    description: "Manage billing, members and every project.",
  },
  {
    value: "member",
    label: "Member",
    description: "Create and edit projects they are added to.",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access, can leave comments.",
  },
];

function parseEmails(value: string) {
  const emails = value
    .split(/[\s,]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
  return Array.from(new Set(emails));
}

export default function Sheet07() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [emails, setEmails] = React.useState(
    "sam.lee@northwind.com, ava.brooks@northwind.com",
  );
  const [role, setRole] = React.useState("member");
  const [sent, setSent] = React.useState(false);

  const list = parseEmails(emails);
  const invalid = list.filter(
    (email) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
  );
  const canContinue = step !== 0 || (list.length > 0 && invalid.length === 0);
  const roleLabel = roles.find((item) => item.value === role)?.label;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setStep(0);
      setSent(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button className="gap-2">
            <UserPlusIcon aria-hidden="true" />
            Invite teammates
          </Button>
        }
      />
      <SheetContent className="gap-0 overflow-hidden">
        <SheetHeader className="gap-3">
          <div className="grid gap-0.5 pr-8">
            <SheetTitle>Invite teammates</SheetTitle>
            <SheetDescription>
              {sent
                ? "Invitations are on their way."
                : `Step ${step + 1} of ${steps.length}: ${steps[step]}`}
            </SheetDescription>
          </div>
          <ol className="grid grid-cols-3 gap-1.5" aria-label="Progress">
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={index === step && !sent ? "step" : undefined}
                className={cn(
                  "h-1 rounded-full bg-muted transition-colors duration-300",
                  (index <= step || sent) && "bg-primary",
                )}
              >
                <span className="sr-only">{label}</span>
              </li>
            ))}
          </ol>
        </SheetHeader>

        {sent ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckIcon aria-hidden="true" className="size-6" />
            </span>
            <p className="font-medium">
              {list.length} {list.length === 1 ? "invite" : "invites"} sent
            </p>
            <p className="text-muted-foreground">
              They&apos;ll join as {roleLabel?.toLowerCase()}s once they accept.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            <div
              className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${step * 100}%)` }}
            >
              <section
                inert={step !== 0}
                aria-hidden={step !== 0}
                className="grid w-full shrink-0 content-start gap-2 px-4"
              >
                <Label htmlFor="sheet-07-emails">Email addresses</Label>
                <Textarea
                  id="sheet-07-emails"
                  rows={4}
                  value={emails}
                  aria-invalid={invalid.length > 0}
                  aria-describedby="sheet-07-emails-hint"
                  onChange={(event) => setEmails(event.target.value)}
                />
                <p
                  id="sheet-07-emails-hint"
                  className={cn(
                    "text-xs",
                    invalid.length > 0
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {invalid.length > 0
                    ? `Check ${invalid[0]}, it doesn't look like an email.`
                    : "Separate addresses with commas or new lines."}
                </p>
              </section>

              <section
                inert={step !== 1}
                aria-hidden={step !== 1}
                className="w-full shrink-0 px-4"
              >
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as string)}
                  aria-label="Workspace role"
                  className="gap-2"
                >
                  {roles.map((item) => (
                    <Label
                      key={item.value}
                      htmlFor={`sheet-07-role-${item.value}`}
                      className="flex items-start gap-3 rounded-lg border p-3 font-normal has-data-checked:border-primary has-data-checked:bg-accent/50"
                    >
                      <RadioGroupItem
                        id={`sheet-07-role-${item.value}`}
                        value={item.value}
                        className="mt-0.5"
                      />
                      <span className="grid gap-0.5">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground text-xs">
                          {item.description}
                        </span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </section>

              <section
                inert={step !== 2}
                aria-hidden={step !== 2}
                className="grid w-full shrink-0 content-start gap-3 px-4"
              >
                <dl className="grid gap-3 rounded-lg border p-3">
                  <div className="grid gap-1">
                    <dt className="text-muted-foreground text-xs">
                      Recipients
                    </dt>
                    <dd className="grid gap-0.5">
                      {list.map((email) => (
                        <span key={email} className="truncate">
                          {email}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-muted-foreground text-xs">Role</dt>
                    <dd>{roleLabel}</dd>
                  </div>
                </dl>
                <p className="text-muted-foreground text-xs">
                  Invitations expire after 7 days.
                </p>
              </section>
            </div>
          </div>
        )}

        <SheetFooter className="flex-row border-t">
          {sent ? (
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="gap-1.5"
                disabled={step === 0}
                onClick={() => setStep((current) => current - 1)}
              >
                <ArrowLeftIcon aria-hidden="true" />
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!canContinue}
                onClick={() =>
                  step === steps.length - 1
                    ? setSent(true)
                    : setStep((current) => current + 1)
                }
              >
                {step === steps.length - 1
                  ? `Send ${list.length} ${list.length === 1 ? "invite" : "invites"}`
                  : "Continue"}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
