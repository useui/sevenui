"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

const repository = "acme/storefront";

const impact = [
  { label: "Branches", value: "18" },
  { label: "Open issues", value: "342" },
  { label: "Releases", value: "57" },
];

export default function AlertDialog04() {
  const [value, setValue] = useState("");
  const confirmed = value.trim() === repository;

  return (
    <AlertDialog
      onOpenChange={(open) => {
        if (!open) setValue("");
      }}
    >
      <AlertDialogTrigger
        render={<Button variant="destructive">Delete repository</Button>}
      />
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {repository}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the repository, its wiki, and all
            collaborator access. Forks are not affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <dl className="grid grid-cols-3 divide-x rounded-lg border bg-muted/40">
          {impact.map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5 px-3 py-2">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="text-sm font-medium tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-2">
          <Label htmlFor="alert-dialog-04-confirm" className="font-normal">
            <span>
              Type <span className="font-mono font-medium">{repository}</span>{" "}
              to confirm
            </span>
          </Label>
          <Input
            id="alert-dialog-04-confirm"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder={repository}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={!confirmed}>
            Delete repository
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
